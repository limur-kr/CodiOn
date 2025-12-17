# train_resnet.py

'''Train Resnet on Cifar10 with PyTorch.'''
import torch
import torch.nn as nn
import torch.optim as optim
import torch.nn.functional as F
import torch.backends.cudnn as cudnn

import torchvision
import torchvision.transforms as transforms
from torchvision.datasets import ImageFolder
import torchvision.datasets as datasets
import torchvision.models as models

import os
import argparse
from PIL import Image, ImageFile
import time

# 🚩 수정: ResNet 모델은 패키지 구조에 따라 import 합니다.
from resnet_model.resnet import get_resnet18
from utils import progress_bar
from os.path import abspath

ImageFile.LOAD_TRUNCATED_IMAGES = True

# -------------------- [수정된 코드 블록: CustomDataset] --------------------
# Windows MAX_PATH 제한을 우회하기 위한 CustomImageFolder
WINDOWS_MAX_PATH = 259  # Windows의 기본 경로 길이 제한

class CustomImageFolder(ImageFolder):
    def __init__(self, root, transform=None, target_transform=None, loader=None, is_valid_file=None):
        # ImageFolder의 __init__을 호출합니다.
        super().__init__(root, transform=transform, target_transform=target_transform, loader=loader, is_valid_file=is_valid_file)

    # 🚩 수정: make_dataset 오버라이드 (allow_empty 인자 추가 및 is_valid_file 처리 개선)
    def make_dataset(self, directory, class_to_idx, extensions=None, is_valid_file=None, allow_empty=False):
        instances = []
        directory = os.path.expanduser(directory)

        # ImageFolder의 find_classes 함수를 사용해 클래스 목록을 가져옵니다.
        if class_to_idx is None:
            _, class_to_idx = self.find_classes(directory)

        # 🚩 수정: 유효성 검사 함수 설정
        # self.is_valid_file이 아직 생성되지 않았을 수 있으므로, 인자로 받은 값을 우선 사용합니다.
        if is_valid_file is None:
            if extensions is not None:
                def is_valid_file(x):
                    return x.lower().endswith(extensions)
            else:
                # 만약 둘 다 없다면 기본 이미지 확장자를 사용 (안전 장치)
                from torchvision.datasets.folder import IMG_EXTENSIONS
                def is_valid_file(x):
                    return x.lower().endswith(IMG_EXTENSIONS)

        # 모든 클래스 폴더를 탐색하며 파일을 수집합니다.
        for target_class in sorted(class_to_idx.keys()):
            class_index = class_to_idx[target_class]
            target_dir = os.path.join(directory, target_class)

            for root, _, fnames in sorted(os.walk(target_dir, followlinks=True)):
                for fname in sorted(fnames):
                    path = os.path.join(root, fname)

                    # 🚩 핵심 로직: 경로 길이가 제한을 초과하는지 확인하고 건너뜁니다.
                    if len(path) >= WINDOWS_MAX_PATH:
                        print(f"[Excluded] Path length exceeds {WINDOWS_MAX_PATH} limit: {path}")
                        continue  # 이 파일은 samples 목록에 추가하지 않고 건너뜁니다.

                    # 확장자 필터링 (수정된 is_valid_file 사용)
                    if is_valid_file(path):
                        instances.append((path, class_index))

        return instances
# ---------------------------------------------------------------------------------


# define input args
parser = argparse.ArgumentParser(description='PyTorch ResNet Training')
parser.add_argument('--lr', default=0.01, type=float, help='learning rate')
parser.add_argument('--resume', '-r', action='store_true',
                    help='resume from checkpoint')
parser.add_argument('--data', default='cifar10', type=str,
                    help='dataset selection')
parser.add_argument('--batch_size', default=128, type=int,
                    help='batch size')
parser.add_argument('--num_classes', default=10, type=int,
                    help='number of classes')
parser.add_argument('--num_workers', default=2, type=int,
                    help='number of workers')
# use current path as data_parent_dir
parser.add_argument('--data_parent_dir', default='../data', type=str,
                    help='parent directory of data')

args = parser.parse_args()

DATA = args.data
# 🚩 수정: 경로 설정 로직을 절대 경로 기반으로 변경하여 Windows 호환성을 확보합니다.
base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
data_path = os.path.join(base_dir, 'data', DATA)

train_data = os.path.join(data_path, 'train')
test_data = os.path.join(data_path, 'test')

device = 'cuda' if torch.cuda.is_available() else 'cpu'
best_acc = 0  # best test accuracy
start_epoch = 0  # start from epoch 0 or last checkpoint epoch

# Data
print('==> Preparing data..')

# data augmentation on train
data_transform = transforms.Compose([
    transforms.RandomResizedCrop(224),
    transforms.RandomHorizontalFlip(),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225])
])

# test set transform
test_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225])
])

print(f"Train data path: {train_data}")
print(f"Test data path: {test_data}")

# pytorch ImageFolder, dataset stores sample and its label;
# slip the ImageFolder data into dataloader
# 🚩 수정: CustomImageFolder 사용 (loader 인자는 제거하고 내부적으로 처리됨)
train_set = CustomImageFolder(root=train_data, transform=data_transform, loader=datasets.folder.pil_loader)
test_set = CustomImageFolder(root=test_data, transform=test_transform, loader=datasets.folder.pil_loader)

train_loader = torch.utils.data.DataLoader(
    train_set, batch_size=args.batch_size, shuffle=True, num_workers=args.num_workers)

test_loader = torch.utils.data.DataLoader(
    test_set, batch_size=args.batch_size, shuffle=False, num_workers=args.num_workers)

# Model
print('==> Building model..')
# use ResNet18
# 🚩 수정: num_classes 인수를 사용
net = get_resnet18(args.num_classes)
net = net.to(device)

if device == 'cuda':
    # net = torch.nn.DataParallel(net)
    cudnn.benchmark = True

if args.resume:
    # Load checkpoint.
    print('==> Resuming from checkpoint..')
    assert os.path.isdir('checkpoint'), 'Error: no checkpoint directory found!'
    checkpoint = torch.load('./checkpoint/ckpt.pth')
    net.load_state_dict(checkpoint['net'])
    best_acc = checkpoint['acc']
    start_epoch = checkpoint['epoch']

criterion = nn.CrossEntropyLoss()
optimizer = optim.SGD(net.parameters(), lr=args.lr,
                      momentum=0.9, weight_decay=5e-4)
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

    # 🚩 수정: 기존 for 루프 사용
    for batch_idx, (inputs, targets) in enumerate(train_loader):

        # 🚩 최종 수정: 데이터 로드 시점의 오류가 아닌, inputs, targets을 device로 옮기는 과정에서 발생하는
        # Device-side 오류를 처리하기 위해 try-except 블록 유지
        try:
            # in pytorch, .to is transfer to (), here is move to device
            inputs, targets = inputs.to(device), targets.to(device)
        except Exception as e:
            # CustomImageFolder에서 이미 경로 오류를 걸렀기 때문에, 이 오류는 다른 종류의 로딩 오류일 가능성이 높습니다.
            print(f"\n[Skipped] Batch {batch_idx + 1} due to device or data error: {e}")
            continue  # 오류 발생 시 다음 배치로 넘어감

        # except for the 1st loop, need to zero the gradient due to there is an auto differentian in . backward
        optimizer.zero_grad()
        # compute output, which is the label
        outputs = model(inputs)
        # use crossEntropyLoss to calculate loss
        loss = criterion(outputs, targets)
        # auto grad calculation
        loss.backward()
        # w = w + wg*lr
        optimizer.step()

        train_loss += loss.item()
        # pick the index of the max output
        _, predicted = outputs.max(1)
        total += targets.size(0)
        correct += predicted.eq(targets).sum().item()
        tops = topk(outputs, targets, (1, 3, 5))

        progress_bar(batch_idx, len(train_loader), 'Loss: %.3f | Acc: %.3f%% (%d/%d)'
                     % (train_loss / (batch_idx + 1), 100. * correct / total, correct, total))


def test(epoch):
    global best_acc
    model = net
    model.eval()
    test_loss = 0
    correct = 0
    total = 0
    with torch.no_grad():
        for batch_idx, (inputs, targets) in enumerate(test_loader):
            inputs, targets = inputs.to(device), targets.to(device)
            outputs = model(inputs)
            loss = criterion(outputs, targets)

            test_loss += loss.item()
            _, predicted = outputs.max(1)
            total += targets.size(0)
            correct += predicted.eq(targets).sum().item()
            tops = topk(outputs, targets, (1, 3, 5))

            progress_bar(batch_idx, len(test_loader), 'Loss: %.3f | Acc: %.3f%% (%d/%d)'
                         % (test_loss / (batch_idx + 1), 100. * correct / total, correct, total))

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
        torch.save(state, './checkpoint/ckpt.pth')
        best_acc = acc


for epoch in range(start_epoch, start_epoch + 200):
    train(epoch)
    test(epoch)
    scheduler.step()