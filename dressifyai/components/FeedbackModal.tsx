import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import Button from './Button';

interface FeedbackModalProps {
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  outfitDate: string;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose, onSubmit, outfitDate }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    onSubmit(rating, comment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-[#F8F7E9] rounded-full transition-colors text-[#C4C1E0] hover:text-[#7C73E6]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-4">
          <h3 className="text-xl font-bold text-[#7C73E6]">오늘의 코디는 어땠나요?</h3>
          <p className="text-sm text-gray-500">{outfitDate}의 착용감을 평가해주세요.</p>
          
          <div className="flex justify-center gap-2 py-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110 focus:outline-none"
              >
                <Star 
                  className={`w-8 h-8 ${rating >= star ? 'fill-[#FFA500] text-[#FFA500]' : 'text-[#C4C1E0]'}`} 
                />
              </button>
            ))}
          </div>

          <textarea
            placeholder="의견을 남겨주세요 (예: 너무 더웠음, 레이어링이 좋았음...)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full p-3 rounded-xl border border-[#C4C1E0] text-sm focus:ring-2 focus:ring-[#7C73E6] focus:border-transparent resize-none"
            rows={3}
          />

          <Button onClick={handleSubmit} disabled={rating === 0} className="w-full">
            피드백 제출
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;