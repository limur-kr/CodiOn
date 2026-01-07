# train_resnet.py
'''Train Resnet on fibre with PyTorch.'''
import torch
import torch.nn as nn
import torch.optim as optim
import torch.nn.functional as F
import torch.backends.cudnn as cudnn
import numpy as np
import matplotlib.pyplot as plt

import torchvision
import torchvision.transforms as transforms
from torchvision.datasets import ImageFolder
import torchvision.datasets as datasets
import torchvision.models as models

import os
import argparse
from PIL import Image, ImageFile
import time

# 🌟 [tqdm 라이브러리 추가] 🌟
from tqdm import tqdm

ImageFile.LOAD_TRUNCATED_IMAGES = True

# -------------------- [라벨 9가지(8+Other) 설정 / 최종 정리] --------------------

NEW_NUM_CLASSES = 9

# 새로운 9개 클래스 이름 (0~8번)
NEW_CLASS_NAMES = [
    'Cotton',          # 0
    'Polyester',       # 1
    'Nylon',           # 2
    'Viscose/Rayon',   # 3
    'Acrylic',         # 4
    'Wool',            # 5
    'Lyocell/Modal',   # 6
    'Flax/Linen',      # 7
    'Other'            # 8 (나머지 모든 소재)
]

# 주요 소재 매핑 테이블 (나머지는 함수에서 자동으로 8번으로 처리함)
SPECIFIC_MAPPING = {
    7: 0,             # cotton -> Cotton
    22: 1,            # polyester -> Polyester
    21: 2,            # nylon -> Nylon
    30: 3, 29: 3,     # viscose_rayon, acetate -> Viscose/Rayon
    1: 4,             # acrylic -> Acrylic
    31: 5,            # wool -> Wool
    17: 6, 19: 6, 8: 6, # lyocell, modal, cupro -> Lyocell/Modal
    10: 7             # flax_linen -> Flax/Linen
}


def remap_dataset_labels(dataset):
    """ImageFolder 데이터셋의 라벨을 9개(8개 주요 + Other)로 변경합니다."""
    print(f"Original classes: {len(dataset.classes)}. Starting remap to 9 classes...")

    new_samples = []
    # 데이터셋의 모든 샘플을 순회하며 라벨 변경
    for path, old_target in dataset.samples:
        # 전역 변수 SPECIFIC_MAPPING을 직접 사용
        # 매핑 테이블에 있으면 해당 번호, 없으면 무조건 8번(Other)으로 할당
        new_target = SPECIFIC_MAPPING.get(old_target, 8)
        new_samples.append((path, new_target))

    # 데이터셋 정보 업데이트
    dataset.samples = new_samples
    dataset.targets = [s[1] for s in dataset.samples]
    dataset.classes = NEW_CLASS_NAMES

    # # 디버깅용 출력
    # max_idx = max(dataset.targets) if dataset.targets else 0
    # print(f"Remapping complete. Total samples: {len(dataset.samples)}. Max Label Index: {max_idx}")



# -------------------- [수정된 코드 블록: CustomDataset] --------------------
# Windows MAX_PATH 제한을 우회하기 위한 CustomImageFolder
WINDOWS_MAX_PATH = 259


class CustomImageFolder(ImageFolder):
    def __init__(self, root, transform=None, target_transform=None, loader=None, is_valid_file=None):
        super().__init__(root, transform=transform, target_transform=target_transform, loader=loader,
                         is_valid_file=is_valid_file)

    def make_dataset(self, directory, class_to_idx, extensions=None, is_valid_file=None, allow_empty=False):
        instances = []
        directory = os.path.expanduser(directory)

        if class_to_idx is None:
            _, class_to_idx = self.find_classes(directory)

        if is_valid_file is None:
            if extensions is not None:
                def is_valid_file(x):
                    return x.lower().endswith(extensions)
            else:
                from torchvision.datasets.folder import IMG_EXTENSIONS
                def is_valid_file(x):
                    return x.lower().endswith(IMG_EXTENSIONS)

        for target_class in sorted(class_to_idx.keys()):
            class_index = class_to_idx[target_class]
            target_dir = os.path.join(directory, target_class)

            for root, _, fnames in sorted(os.walk(target_dir, followlinks=True)):
                for fname in sorted(fnames):
                    path = os.path.join(root, fname)

                    if len(path) >= WINDOWS_MAX_PATH:
                        print(f"[Excluded] Path length exceeds {WINDOWS_MAX_PATH} limit: {path}")
                        continue

                    if is_valid_file(path):
                        instances.append((path, class_index))

        return instances


# ---------------------------------------------------------------------------------

# train_resnet.py (클래스 정의 섹션 추가 3차 모델링 251217)

class EarlyStopping:
    """Validation Loss가 개선되지 않으면 학습을 조기 종료합니다."""
    def __init__(self, patience=40, verbose=False, delta=0):
        self.patience = patience    # 참을성: 오차가 개선되지 않아도 지켜볼 에폭
        self.verbose = verbose
        self.counter = 0
        self.best_score = None
        self.early_stop = False
        self.val_loss_min = np.inf
        self.delta = delta

    def __call__(self, val_loss):
        score = -val_loss
        if self.best_score is None:
            self.best_score = score
        elif score < self.best_score + self.delta:
            self.counter += 1
            if self.verbose:
                print(f'EarlyStopping counter: {self.counter} out of {self.patience}')
            if self.counter >= self.patience:
                self.early_stop = True
        else:
            self.best_score = score
            self.counter = 0


# define input args
parser = argparse.ArgumentParser(description='PyTorch ResNet Training')
parser.add_argument('--lr', default=0.01, type=float, help='learning rate')
parser.add_argument('--resume', '-r', action='store_true',
                    help='resume from checkpoint')
parser.add_argument('--data', default='fibre', type=str,
                    help='dataset selection')
parser.add_argument('--batch_size', default=128, type=int,
                    help='batch size')
parser.add_argument('--num_classes', default=9, type=int,
                    help='number of classes')
parser.add_argument('--num_workers', default=2, type=int,
                    help='number of workers')
parser.add_argument('--data_parent_dir', default='../data', type=str,
                    help='parent directory of data')

# 모델예측[251215 추가]
parser.add_argument('--predict_path', type=str, default=None,
                    help='path to a single image for prediction')

args = parser.parse_args()

DATA = args.data
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
data_path = os.path.join(base_dir, 'data', DATA)

train_data = os.path.join(data_path, 'train')
test_data = os.path.join(data_path, 'test')

device = 'cuda' if torch.cuda.is_available() else 'cpu'
best_acc = 0
start_epoch = 0

# [251215 추가] 학습 기록 저장 리스트 초기화
history = []

# Data
print('==> Preparing data..')

data_transform = transforms.Compose([
    transforms.RandomResizedCrop(224),
    transforms.RandomHorizontalFlip(),
    # --- [강화된 증강법 추가 3차 모델링 251217] ---
    transforms.RandomRotation(15),           # ±15도 무작위 회전
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2), # 밝기, 대비 변화
    # --------------------------
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225])
])

test_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225])
])

print(f"Train data path: {train_data}")
print(f"Test data path: {test_data}")

train_set = CustomImageFolder(root=train_data, transform=data_transform, loader=datasets.folder.pil_loader)
test_set = CustomImageFolder(root=test_data, transform=test_transform, loader=datasets.folder.pil_loader)

# ⭐⭐ 라벨 재맵핑 함수 호출 (추가된 부분) ⭐⭐
remap_dataset_labels(train_set)
remap_dataset_labels(test_set)
# -----------------------------------------------

train_loader = torch.utils.data.DataLoader(
    train_set, batch_size=args.batch_size, shuffle=True, num_workers=args.num_workers)

test_loader = torch.utils.data.DataLoader(
    test_set, batch_size=args.batch_size, shuffle=False, num_workers=args.num_workers)

# Model
print('==> Building model..')
#net = get_resnet18(args.num_classes)
net = models.resnet34(weights=models.ResNet34_Weights.IMAGENET1K_V1)
num_ftrs = net.fc.in_features
# --- [Dropout 추가 및 분류기 수정 3차 모델링 추가 251217] ---
net.fc = nn.Sequential(
    nn.Dropout(p=0.2),           # 20% 확률로 뉴런을 끔 (과적합 방지 핵심)
    nn.Linear(num_ftrs, args.num_classes)
)
# -----------------------------------
net = net.to(device)

if device == 'cuda':
    # net = torch.nn.DataParallel(net)
    cudnn.benchmark = True

if args.resume:
    # Load checkpoint.
    print('==> Resuming from checkpoint..')
    assert os.path.isdir('checkpoint'), 'Error: no checkpoint directory found!'
    # 경고 무시 관련 메시지는 이전에 나왔으므로 생략합니다.
    checkpoint = torch.load('./checkpoint/latest_best.pth')
    net.load_state_dict(checkpoint['net'])
    best_acc = checkpoint['acc']
    start_epoch = checkpoint['epoch']

criterion = nn.CrossEntropyLoss()
# SGD에서 AdamW로 변경
#optimizer = optim.SGD(net.parameters(), lr=args.lr,momentum=0.9, weight_decay=5e-4)

# AdamW의 학습률은 SGD보다 훨씬 작은 1e-3 (0.001) 정도에서 시작하는 것이 일반적입니다.
ADAMW_LR = 1e-3 # AdamW에 적합한 학습률 (0.01보다 훨씬 작습니다.)
ADAMW_WEIGHT_DECAY = 1e-2 # AdamW의 일반적인 Weight Decay 값
optimizer = optim.AdamW(net.parameters(), lr=ADAMW_LR, weight_decay=ADAMW_WEIGHT_DECAY)
scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=200)


def topk(output, target, ks=(1,)):
    """Computes the precision@k for the specified values of k"""
    max_k = max(ks)
    batch_size = target.size(0)

    _, pred = output.topk(max_k, 1, True, True)
    pred = pred.t()
    correct = pred.eq(target.view(1, -1).expand_as(pred))

    res = []
    for k in ks:
        correct_k = correct[:k].reshape(-1).float().sum(0)
        res.append(correct_k.mul_(100.0 / batch_size))
    return res


# Training
def train(epoch):
    print('\nEpoch: %d' % epoch)
    model = net
    model.train()
    train_loss = 0
    correct = 0
    total = 0

    # 🌟 [tqdm 적용] 🌟
    # train_loader를 tqdm으로 감싸고 설명을 추가합니다.
    train_bar = tqdm(train_loader, desc=f'Epoch {epoch} (Train)', unit='batch')

    for batch_idx, (inputs, targets) in enumerate(train_bar):

        try:
            inputs, targets = inputs.to(device), targets.to(device)
        except Exception as e:
            print(f"\n[Skipped] Batch {batch_idx + 1} due to device or data error: {e}")
            continue

        optimizer.zero_grad()
        outputs = model(inputs)
        loss = criterion(outputs, targets)
        loss.backward()
        optimizer.step()

        train_loss += loss.item()
        _, predicted = outputs.max(1)
        total += targets.size(0)
        correct += predicted.eq(targets).sum().item()

        # 🌟 [tqdm.set_postfix를 사용하여 진행률 바에 정보 표시] 🌟
        avg_loss = train_loss / (batch_idx + 1)
        acc_percent = 100. * correct / total

        train_bar.set_postfix(Loss=f'{avg_loss:.3f}', Acc=f'{acc_percent:.3f}% ({correct}/{total})')

    return avg_loss, acc_percent

    # 기존 progress_bar 호출 구문은 삭제합니다.


def test(epoch):
    global best_acc
    global history
    model = net
    model.eval()
    test_loss = 0
    correct = 0
    total = 0

    # 🌟 [tqdm 적용] 🌟
    # test_loader를 tqdm으로 감쌉니다. leave=False는 완료 후 표시줄을 제거합니다.
    with torch.no_grad():
        test_bar = tqdm(test_loader, desc=f'Epoch {epoch} (Test) ', unit='batch', leave=False)
        for batch_idx, (inputs, targets) in enumerate(test_bar):
            inputs, targets = inputs.to(device), targets.to(device)
            outputs = model(inputs)
            loss = criterion(outputs, targets)

            test_loss += loss.item()
            _, predicted = outputs.max(1)
            total += targets.size(0)
            correct += predicted.eq(targets).sum().item()

            # 🌟 [tqdm.set_postfix를 사용하여 진행률 바에 정보 표시] 🌟
            avg_loss = test_loss / (batch_idx + 1)
            acc_percent = 100. * correct / total

            test_bar.set_postfix(Loss=f'{avg_loss:.3f}', Acc=f'{acc_percent:.3f}% ({correct}/{total})')

        # 기존 progress_bar 호출 구문은 삭제합니다.

    # Save checkpoint.
    acc = 100. * correct / total

    if acc > best_acc:
        print('Saving..')
        state = {
            'net': model.state_dict(),
            'acc': acc,
            'epoch': epoch,
        }
        if not os.path.isdir('checkpoint'):
            os.mkdir('checkpoint')

        # 🌟 [수정]: 파일명에 정확도와 에폭을 포함하여 저장합니다.
        filename = f'ckpt_epoch_{epoch}_acc_{acc:.2f}.pth'
        torch.save(state, os.path.join('./checkpoint', filename))

        # 🌟 [추가]: 기존의 최고 모델 파일명을 덮어쓰는 'latest_best.pth'를 추가로 저장할 수도 있습니다.
        torch.save(state, './checkpoint/latest_best.pth')
        best_acc = acc

        # 🌟 [추가] test 결과 반환
    return test_loss / len(test_loader), acc

# -------------------- [단일 이미지 예측 함수 추가 / 251215 추가] --------------------

def predict_single_image(image_path, model, transform, class_names):
    """단일 이미지를 로드, 예측하고 결과를 출력합니다."""
    print(f"\n==> Predicting image: {image_path}")

    # 1. 이미지 로드
    try:
        img = Image.open(image_path).convert('RGB')
    except FileNotFoundError:
        print(f"[Error] Image file not found at: {image_path}")
        return
    except Exception as e:
        print(f"[Error] Could not load image: {e}")
        return

    # 2. 이미지 전처리
    input_tensor = transform(img)
    # 배치 차원 추가 (C, H, W) -> (1, C, H, W)
    input_batch = input_tensor.unsqueeze(0)

    # 3. 모델 로드 (최고 성능 모델)
    checkpoint_path = './checkpoint/latest_best.pth'
    if not os.path.exists(checkpoint_path):
        print("[Error] Checkpoint not found. Please train the model first or check the path.")
        return

    checkpoint = torch.load(checkpoint_path, map_location=device)
    model.load_state_dict(checkpoint['net'])
    model.eval()
    print(f"Model loaded from epoch {checkpoint['epoch']} with best accuracy {checkpoint['acc']:.2f}%.")

    # 4. 예측 수행
    with torch.no_grad():
        input_batch = input_batch.to(device)
        output = model(input_batch)

    # 5. 결과 해석
    probabilities = F.softmax(output, dim=1)
    top_p, top_class_idx = probabilities.topk(5, dim=1)

    predicted_class_idx = top_class_idx[0, 0].item()
    predicted_class_name = class_names[predicted_class_idx]
    confidence = top_p[0, 0].item() * 100

    print(f"\n[Prediction Result]")
    print(f"Predicted Class: {predicted_class_name}")
    print(f"Confidence: {confidence:.2f}%")
    print("\nTop 5 Predictions:")
    for i in range(5):
        class_name = class_names[top_class_idx[0, i].item()]
        prob = top_p[0, i].item() * 100
        print(f"  {i+1}. {class_name} ({prob:.2f}%)")

# -------------------------------------------------------------------------

# -------------------- [Loss/Accuracy 시각화 함수 추가] --------------------
def plot_history(history_data, save_path='./training_history.png'):
    """
    학습 이력(Train/Test Loss, Accuracy)을 시각화하고 파일로 저장합니다.
    history_data는 [[epoch, train_loss, train_acc, test_loss, test_acc], ...] 형태입니다.
    """
    if not history_data:
        print("[Plot Error] No history data to plot.")
        return

    # Numpy 배열로 변환 및 데이터 추출
    history_array = np.array(history_data)
    epochs = history_array[:, 0]
    train_losses = history_array[:, 1]
    train_accuracies = history_array[:, 2]
    test_losses = history_array[:, 3]
    test_accuracies = history_array[:, 4]

    plt.figure(figsize=(15, 6)) # 전체 그림 크기 확대

    # 1. Loss 그래프 (Train vs Test)
    plt.subplot(1, 2, 1) # 1행 2열 중 1번째
    plt.plot(epochs, train_losses, label='Train Loss', color='blue')
    plt.plot(epochs, test_losses, label='Validation Loss', color='red', linestyle='--')
    plt.title('Loss over Epochs (Train vs Validation)')
    plt.xlabel('Epoch')
    plt.ylabel('Loss (CrossEntropy)')
    plt.legend()
    plt.grid(True)

    # 2. Accuracy 그래프 (Train vs Test)
    plt.subplot(1, 2, 2) # 1행 2열 중 2번째
    plt.plot(epochs, train_accuracies, label='Train Accuracy', color='green')
    plt.plot(epochs, test_accuracies, label='Validation Accuracy', color='orange', linestyle='--')
    plt.title('Accuracy over Epochs (Train vs Validation)')
    plt.xlabel('Epoch')
    plt.ylabel('Accuracy (%)')
    plt.legend()
    plt.grid(True)

    plt.tight_layout()
    plt.savefig(save_path)
    print(f"\n[Visualization Complete] History saved to: {save_path}")
    plt.show()

# -------------------------------------------------------------------------


# 🌟 [if __name__ == '__main__': 블록으로 훈련 루프 감싸기] 🌟
# Windows에서 num_workers > 0으로 실행할 경우 발생하는 오류를 방지합니다.
if __name__ == '__main__':
    # 예측 인자가 있다면 학습 대신 예측을 수행
    if args.predict_path:
        # ImageFolder의 classes 속성으로 클래스 이름을 가져옵니다.
        class_names = NEW_CLASS_NAMES

        # test_transform을 사용하여 예측을 수행합니다.
        predict_single_image(
            image_path=args.predict_path,
            model=net,
            transform=test_transform,
            class_names=class_names
        )
    else:
        # Early Stopping 초기화 (여기서는 40에폭 동안 개선 없으면 종료)
        early_stopping = EarlyStopping(patience=15, verbose=True)

        # 예측 인자가 없다면 기존대로 학습 루프를 실행
        for epoch in range(start_epoch, start_epoch + 200):
            train_loss, train_acc = train(epoch)
            test_loss, test_acc = test(epoch)
            history.append([epoch, train_loss, train_acc, test_loss, test_acc])
            print(f"Epoch {epoch}: Train Loss = {train_loss:.4f}, Train Acc = {train_acc:.2f}%, "
                  f"Test Loss = {test_loss:.4f}, Test Acc = {test_acc:.2f}%")

            scheduler.step()

            # --- [Early Stopping 체크 추가 3차 모델링 251217 추가] ---
            early_stopping(test_loss)
            if early_stopping.early_stop:
                print("🚩 Early stopping triggered. Training stopped.")
                break
            # ----------------------------------

        # 🌟 [추가] 학습 완료 후 시각화 함수 호출
        print("\n==> Training finished. Generating history plot...")
        plot_history(history)