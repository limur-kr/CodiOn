import React, { useState } from 'react';
import { ArrowLeft, Tag, Calendar, Layers, Droplets, Info } from 'lucide-react';
import { ClothingItem, CategoryLabels } from '../types';
import Button from './Button';

interface ItemDetailProps {
  item: ClothingItem;
  onBack: () => void;
}

const ItemDetail: React.FC<ItemDetailProps> = ({ item, onBack }) => {
  const [showCareModal, setShowCareModal] = useState(false);

  return (
    <div className="relative h-full flex flex-col animate-in fade-in zoom-in-95 duration-300">
      
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={onBack} className="mr-4">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-2xl font-bold text-[#7C73E6]">아이템 상세 정보</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        {/* Left: Image */}
        <div className="relative group cursor-pointer" onClick={() => setShowCareModal(true)}>
          <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-lg border border-[#C4C1E0] bg-white">
            <img src={item.imageUrl} alt={item.category} className="w-full h-full object-cover" />
            
            {/* Overlay hint */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
               <div className="opacity-0 group-hover:opacity-100 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-[#7C73E6] text-sm font-medium shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                 관리 가이드 보기
               </div>
            </div>
          </div>
        </div>

        {/* Right: Info */}
        <div className="space-y-8">
          
          <div className="bg-[#FAFAFA] p-6 rounded-2xl border border-[#C4C1E0] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[#7C73E6]">{item.color} {CategoryLabels[item.category] || item.category}</h3>
              <span className="px-3 py-1 bg-[#F8F7E9] text-[#7C73E6] rounded-full text-xs font-semibold border border-[#C4C1E0]">
                착용 횟수: {item.wearCount}회
              </span>
            </div>

            <div className="space-y-4">
               <div className="flex items-center text-sm">
                 <Layers className="w-4 h-4 mr-3 text-[#C4C1E0]" />
                 <span className="text-gray-500 w-24">소재</span>
                 <span className="font-medium text-[#7C73E6]">{item.material || '정보 없음'}</span>
               </div>
               <div className="flex items-center text-sm">
                 <Tag className="w-4 h-4 mr-3 text-[#C4C1E0]" />
                 <span className="text-gray-500 w-24">계절</span>
                 <div className="flex gap-2">
                    {item.season.map(s => (
                      <span key={s} className="text-[#7C73E6] font-medium">{s}</span>
                    ))}
                 </div>
               </div>
               <div className="flex items-center text-sm">
                 <Calendar className="w-4 h-4 mr-3 text-[#C4C1E0]" />
                 <span className="text-gray-500 w-24">등록일</span>
                 <span className="font-medium text-[#7C73E6]">
                    {item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : '최근'}
                 </span>
               </div>
            </div>
          </div>

          <div className="space-y-4">
             <h4 className="font-semibold text-[#7C73E6]">내가 선택한 조합</h4>
             {/* Placeholder for future outfit history */}
             <div className="flex gap-3 overflow-x-auto pb-2">
                <div className="w-20 h-20 rounded-lg bg-[#C4C1E0]/20 border border-[#C4C1E0] flex items-center justify-center shrink-0">
                  <span className="text-xs text-[#7C73E6]">코디 1</span>
                </div>
                <div className="w-20 h-20 rounded-lg bg-[#C4C1E0]/20 border border-[#C4C1E0] flex items-center justify-center shrink-0">
                  <span className="text-xs text-[#7C73E6]">코디 2</span>
                </div>
             </div>
          </div>

          <div className="bg-[#7C73E6]/5 p-4 rounded-xl border border-[#7C73E6]/20 flex gap-3">
             <Info className="w-5 h-5 text-[#7C73E6] shrink-0" />
             <p className="text-sm text-[#7C73E6]">
               Tip: 이 아이템은 밝은 색상의 하의와 매치하면 산뜻한 룩을 연출할 수 있습니다.
             </p>
          </div>

        </div>
      </div>

      {/* Care Guide Modal */}
      {showCareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowCareModal(false)}></div>
          <div className="bg-white rounded-3xl p-8 max-w-md w-full relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowCareModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-[#F8F7E9] rounded-full transition-colors text-[#C4C1E0] hover:text-[#7C73E6]"
            >
              <ArrowLeft className="w-5 h-5 rotate-180" /> {/* Using arrow as close for simplicity */}
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#F8F7E9] rounded-full flex items-center justify-center mx-auto mb-4">
                <Droplets className="w-8 h-8 text-[#7C73E6]" />
              </div>
              <h3 className="text-xl font-bold text-[#7C73E6]">관리 & 보관 가이드</h3>
              <p className="text-sm text-gray-400 mt-1">{item.color} {item.category} 관리법</p>
            </div>

            <div className="space-y-4">
              <div className="bg-[#FAFAFA] p-4 rounded-xl border border-[#C4C1E0]">
                <h4 className="font-semibold text-[#7C73E6] text-sm mb-2">세탁 방법</h4>
                <p className="text-gray-600 text-sm">{item.careInstructions || "표준 세탁. 라벨을 확인하세요."}</p>
              </div>
              
              <div className="bg-[#FAFAFA] p-4 rounded-xl border border-[#C4C1E0]">
                <h4 className="font-semibold text-[#7C73E6] text-sm mb-2">보관 권장사항</h4>
                <p className="text-gray-600 text-sm">
                  {item.category === 'Top' || item.category === 'Dress' 
                    ? "옷걸이에 걸어서 형태를 유지하세요." 
                    : "잘 접어서 서늘하고 건조한 곳에 보관하세요."}
                </p>
              </div>
            </div>
            
            <Button className="w-full mt-6" onClick={() => setShowCareModal(false)}>
              확인
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetail;