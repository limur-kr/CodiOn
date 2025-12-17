import React, { useState } from 'react';
import { Sparkles, Check } from 'lucide-react';
import { ClothingItem, WeatherData, DailyLog } from '../types';
import Button from './Button';
import { generateOutfitSuggestion } from '../services/aiService';
import FeedbackModal from './FeedbackModal';

interface OutfitRecommenderProps {
  weather: WeatherData | null;
  closetItems: ClothingItem[];
  onItemClick: (item: ClothingItem) => void;
  onConfirmOutfit: (log: DailyLog) => void;
}

const OutfitRecommender: React.FC<OutfitRecommenderProps> = ({ weather, closetItems, onItemClick, onConfirmOutfit }) => {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<{
    top: ClothingItem;
    bottom: ClothingItem;
    outerwear?: ClothingItem;
    reasoning: string;
    styleName: string;
  } | null>(null);
  
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleGenerate = async () => {
    if (!weather || closetItems.length === 0) return;
    setLoading(true);
    setIsConfirmed(false);
    setSuggestion(null);

    try {
      const result = await generateOutfitSuggestion(weather, closetItems);
      
      const top = closetItems.find(i => i.id === result.topId);
      const bottom = closetItems.find(i => i.id === result.bottomId);
      const outerwear = result.outerwearId ? closetItems.find(i => i.id === result.outerwearId) : undefined;

      if (top && bottom) {
        setSuggestion({
            top,
            bottom,
            outerwear,
            reasoning: result.reasoning,
            styleName: result.styleName
        });
      } else {
          alert("옷장에서 일치하는 아이템을 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error("Error generating outfit", error);
      alert("코디를 생성할 수 없습니다. API 키를 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!suggestion || !weather) return;
    setIsConfirmed(true);
    
    const log: DailyLog = {
        date: new Date().toISOString().split('T')[0],
        weather: weather,
        outfit: {
            top: suggestion.top,
            bottom: suggestion.bottom,
            outerwear: suggestion.outerwear
        }
    };
    onConfirmOutfit(log);
    
    // Simulate delay before asking for feedback (e.g., immediate for demo purposes)
    setTimeout(() => {
        setShowFeedback(true);
    }, 1500);
  };

  if (!weather) return null;

  return (
    <div className="bg-[#FAFAFA] rounded-3xl shadow-md border border-[#C4C1E0] p-8 relative overflow-hidden min-h-[500px]">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#7C73E6] opacity-5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 relative z-10">
        <div>
          <h2 className="text-2xl font-bold text-[#7C73E6] flex items-center">
            <Sparkles className="w-6 h-6 mr-3 text-[#FFA500]" />
            {isConfirmed ? '오늘의 선택' : '오늘의 추천 코디'}
          </h2>
          <p className="text-[#C4C1E0] text-sm mt-1">{weather.temperature}°C 날씨와 당신의 스타일에 맞췄습니다.</p>
        </div>
        <div className="mt-4 md:mt-0">
          {!isConfirmed && (
             <Button onClick={handleGenerate} isLoading={loading} disabled={closetItems.length === 0} size="lg">
                {suggestion ? '다른 코디 보기' : '코디 생성하기'}
             </Button>
          )}
        </div>
      </div>

      {!suggestion && !loading && (
        <div className="text-center py-16 bg-[#F8F7E9] rounded-2xl border border-dashed border-[#C4C1E0]">
          <p className="text-[#7C73E6] font-medium mb-2 text-lg">멋진 하루를 준비하세요!</p>
          <p className="text-sm text-[#C4C1E0]">
             {closetItems.length < 2 
               ? "최소 2개 이상의 옷을 등록해야 코디를 추천받을 수 있습니다." 
               : "'코디 생성하기' 버튼을 눌러 AI 추천을 받아보세요."}
          </p>
        </div>
      )}

      {loading && (
        <div className="space-y-6 animate-pulse">
           <div className="h-8 bg-[#EBE9F5] rounded w-1/3 mx-auto"></div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-64 bg-[#EBE9F5] rounded-2xl"></div>
              <div className="h-64 bg-[#EBE9F5] rounded-2xl"></div>
              <div className="h-64 bg-[#EBE9F5] rounded-2xl"></div>
           </div>
           <div className="h-24 bg-[#EBE9F5] rounded-2xl"></div>
        </div>
      )}

      {/* Suggestion Mode */}
      {suggestion && !loading && !isConfirmed && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center">
            <span className="inline-block px-4 py-2 bg-[#7C73E6] text-white rounded-full text-sm font-bold shadow-lg transform -rotate-1">
              ✨ {suggestion.styleName}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {/* Top Card */}
             <div className="space-y-2">
                 <span className="text-xs font-bold text-[#C4C1E0] uppercase tracking-wider block text-center">상의 (Top)</span>
                 <div className="w-full h-64 rounded-2xl overflow-hidden shadow-lg border border-[#C4C1E0] bg-white cursor-pointer hover:-translate-y-1 transition-transform" onClick={() => onItemClick(suggestion.top)}>
                    <img src={suggestion.top.imageUrl} alt="Top" className="w-full h-full object-cover" />
                 </div>
                 <p className="text-center text-sm font-bold text-[#7C73E6]">{suggestion.top.category}</p>
             </div>

             {/* Bottom Card */}
             <div className="space-y-2">
                 <span className="text-xs font-bold text-[#C4C1E0] uppercase tracking-wider block text-center">하의 (Bottom)</span>
                 <div className="w-full h-64 rounded-2xl overflow-hidden shadow-lg border border-[#C4C1E0] bg-white cursor-pointer hover:-translate-y-1 transition-transform" onClick={() => onItemClick(suggestion.bottom)}>
                    <img src={suggestion.bottom.imageUrl} alt="Bottom" className="w-full h-full object-cover" />
                 </div>
                 <p className="text-center text-sm font-bold text-[#7C73E6]">{suggestion.bottom.category}</p>
             </div>

             {/* Outerwear Card (Conditional) */}
             <div className="space-y-2 opacity-100 transition-opacity">
                 <span className="text-xs font-bold text-[#C4C1E0] uppercase tracking-wider block text-center">아우터 (Outer)</span>
                 {suggestion.outerwear ? (
                    <div className="w-full h-64 rounded-2xl overflow-hidden shadow-lg border border-[#C4C1E0] bg-white cursor-pointer hover:-translate-y-1 transition-transform" onClick={() => onItemClick(suggestion.outerwear!)}>
                        <img src={suggestion.outerwear.imageUrl} alt="Outerwear" className="w-full h-full object-cover" />
                    </div>
                 ) : (
                    <div className="w-full h-64 rounded-2xl border-2 border-dashed border-[#C4C1E0] flex items-center justify-center bg-[#F8F7E9]">
                        <p className="text-sm text-[#C4C1E0] text-center px-4">이 날씨엔 아우터가 필요 없어요.</p>
                    </div>
                 )}
                 <p className="text-center text-sm font-bold text-[#7C73E6]">{suggestion.outerwear ? suggestion.outerwear.category : '미착용'}</p>
             </div>
          </div>

          <div className="bg-[#F8F7E9] p-6 rounded-2xl border border-[#C4C1E0] relative">
            <div className="absolute top-0 left-6 -mt-3 bg-[#C4C1E0] text-white text-xs px-2 py-1 rounded font-bold uppercase">추천 이유</div>
            <p className="text-[#7C73E6] text-md leading-relaxed mt-2 font-medium">
              "{suggestion.reasoning}"
            </p>
          </div>

          <div className="flex justify-center">
             <Button size="lg" onClick={handleConfirm} className="w-full md:w-1/3">
                <Check className="w-5 h-5 mr-2" />
                코디 확정하기
             </Button>
          </div>
        </div>
      )}

      {/* Confirmed / Selected View (Combined) */}
      {isConfirmed && suggestion && (
          <div className="flex flex-col items-center animate-in zoom-in-95 duration-500 py-8">
             <div className="relative w-full max-w-sm">
                
                {/* Visual Stack */}
                <div className="flex flex-col items-center -space-y-4">
                    {/* Top */}
                    <div className="z-30 w-48 h-48 rounded-2xl shadow-xl overflow-hidden border-4 border-white transform hover:scale-105 transition-transform bg-white">
                        <img src={suggestion.top.imageUrl} alt="Top" className="w-full h-full object-cover" />
                    </div>
                    {/* Bottom */}
                    <div className="z-20 w-48 h-64 rounded-2xl shadow-xl overflow-hidden border-4 border-white bg-white">
                        <img src={suggestion.bottom.imageUrl} alt="Bottom" className="w-full h-full object-cover" />
                    </div>
                </div>

                {/* Outerwear Floating on side */}
                {suggestion.outerwear && (
                    <div className="absolute top-10 -right-4 md:-right-16 z-40 w-32 h-40 rounded-xl shadow-2xl overflow-hidden border-4 border-white rotate-6 bg-white">
                        <img src={suggestion.outerwear.imageUrl} alt="Outer" className="w-full h-full object-cover" />
                    </div>
                )}
             </div>

             <div className="mt-8 text-center space-y-2">
                 <h3 className="text-xl font-bold text-[#7C73E6]">멋진 스타일이네요!</h3>
                 <p className="text-[#C4C1E0]">캘린더에 코디가 기록되었습니다.</p>
             </div>
          </div>
      )}

      {showFeedback && (
        <FeedbackModal 
            onClose={() => setShowFeedback(false)} 
            onSubmit={(rating, comment) => console.log('Feedback:', rating, comment)}
            outfitDate="오늘"
        />
      )}

    </div>
  );
};

export default OutfitRecommender;