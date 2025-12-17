import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Check, Tag, Layers, Droplets } from 'lucide-react';
import { ClothingItem, ClothingCategory, CategoryLabels } from '../types';
import Button from './Button';
import { analyzeClothingImage } from '../services/aiService';

interface ClosetManagerProps {
  items: ClothingItem[];
  mode: 'view' | 'upload';
  onAddItem: (item: ClothingItem) => void;
  onRemoveItem: (id: string) => void;
  onItemClick: (item: ClothingItem) => void;
}

const ClosetManager: React.FC<ClosetManagerProps> = ({ items, mode, onAddItem, onRemoveItem, onItemClick }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ClothingCategory | 'ALL'>('ALL');
  
  // Manual overrides for metadata
  const [customMaterial, setCustomMaterial] = useState('');
  const [customCare, setCustomCare] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Convert to Base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setPreview(base64String);
      setAnalyzing(true);
      
      try {
        const result = await analyzeClothingImage(base64String);
        setAnalysisResult(result);
        setCustomMaterial(result.material);
        setCustomCare(result.careInstructions);
      } catch (error) {
        console.error("Failed to analyze", error);
        alert("이미지 분석에 실패했습니다. 다시 시도해주세요.");
        setPreview(null);
      } finally {
        setAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveItem = () => {
    if (!preview || !analysisResult) return;

    const newItem: ClothingItem = {
      id: Date.now().toString(),
      imageUrl: preview,
      category: analysisResult.category as ClothingCategory,
      color: analysisResult.color,
      season: analysisResult.season,
      material: customMaterial || analysisResult.material,
      careInstructions: customCare || analysisResult.careInstructions,
      wearCount: 0,
      purchaseDate: new Date().toISOString(),
      brand: "Unknown"
    };

    onAddItem(newItem);
    setPreview(null);
    setAnalysisResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Filter Logic
  const filteredItems = selectedCategory === 'ALL' 
    ? items 
    : items.filter(item => {
        if (selectedCategory === ClothingCategory.OTHER || selectedCategory === ClothingCategory.ACCESSORY) {
            // Group simple accessories
             return item.category === ClothingCategory.ACCESSORY || item.category === ClothingCategory.SHOES || item.category === ClothingCategory.OTHER;
        }
        return item.category === selectedCategory;
    });
  
  // Custom Filter Categories for UI
  const filterTabs = [
      { id: 'ALL', label: '전체' },
      { id: ClothingCategory.TOP, label: '상의' },
      { id: ClothingCategory.BOTTOM, label: '하의' },
      { id: ClothingCategory.OUTERWEAR, label: '아우터' },
      { id: ClothingCategory.ACCESSORY, label: 'ACC' },
  ];

  if (mode === 'upload') {
      return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-[#7C73E6] mb-6 flex items-center">
                <Camera className="w-6 h-6 mr-3" />
                새 옷 등록하기
            </h2>
            <div className="bg-[#FAFAFA] p-8 rounded-3xl shadow-sm border border-[#C4C1E0]">
                {!preview ? (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#C4C1E0] rounded-2xl p-12 text-center hover:bg-[#F8F7E9] cursor-pointer transition-colors group"
                >
                    <div className="w-16 h-16 bg-[#EBE9F5] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="h-8 w-8 text-[#7C73E6]" />
                    </div>
                    <p className="mt-2 text-lg font-medium text-[#7C73E6]">사진 업로드</p>
                    <p className="text-sm text-[#C4C1E0]">PNG, JPG 지원</p>
                    <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    />
                </div>
                ) : (
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="w-full lg:w-1/3">
                    <img src={preview} alt="Preview" className="rounded-2xl w-full h-80 object-cover shadow-lg border border-[#C4C1E0]" />
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-4 w-full text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                        setPreview(null);
                        setAnalysisResult(null);
                        }}
                    >
                        취소 및 다시 찍기
                    </Button>
                    </div>

                    <div className="flex-1 space-y-6">
                    {analyzing ? (
                        <div className="flex flex-col items-center justify-center h-full py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7C73E6] mb-4"></div>
                        <p className="text-[#7C73E6] font-medium animate-pulse">Gemini AI가 옷을 분석 중입니다...</p>
                        </div>
                    ) : analysisResult ? (
                        <div className="space-y-6">
                        <div className="bg-[#F8F7E9] p-6 rounded-2xl border border-[#C4C1E0]">
                            <h3 className="text-[#7C73E6] font-bold text-lg mb-4 flex items-center">
                            <Tag className="w-5 h-5 mr-2" />
                            AI 분석 결과
                            </h3>
                            <div className="grid grid-cols-2 gap-6 text-sm">
                            <div>
                                <span className="text-[#C4C1E0] block uppercase text-xs font-bold tracking-wider mb-1">카테고리</span>
                                <span className="font-semibold text-[#7C73E6] text-lg">{analysisResult.category}</span>
                            </div>
                            <div>
                                <span className="text-[#C4C1E0] block uppercase text-xs font-bold tracking-wider mb-1">색상</span>
                                <span className="font-semibold text-[#7C73E6] text-lg">{analysisResult.color}</span>
                            </div>
                            <div className="col-span-2">
                                <span className="text-[#C4C1E0] block uppercase text-xs font-bold tracking-wider mb-1">계절</span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                {analysisResult.season.map((s: string) => (
                                    <span key={s} className="px-3 py-1 bg-white rounded-full text-xs border border-[#C4C1E0] text-[#7C73E6] font-medium shadow-sm">{s}</span>
                                ))}
                                </div>
                            </div>
                            </div>
                        </div>

                        {/* Manual Metadata Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-[#7C73E6] uppercase mb-1 flex items-center">
                                <Layers className="w-3 h-3 mr-1" /> 소재 (Material)
                                </label>
                                <input 
                                type="text" 
                                value={customMaterial}
                                onChange={(e) => setCustomMaterial(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-[#C4C1E0] focus:ring-2 focus:ring-[#7C73E6] focus:border-transparent bg-white text-[#7C73E6]"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-[#7C73E6] uppercase mb-1 flex items-center">
                                <Droplets className="w-3 h-3 mr-1" /> 세탁 방법
                                </label>
                                <input 
                                type="text" 
                                value={customCare}
                                onChange={(e) => setCustomCare(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-[#C4C1E0] focus:ring-2 focus:ring-[#7C73E6] focus:border-transparent bg-white text-[#7C73E6]"
                                />
                            </div>
                        </div>

                        <Button onClick={handleSaveItem} className="w-full h-12 text-lg shadow-lg">
                            <Check className="w-5 h-5 mr-2" />
                            내 옷장에 저장
                        </Button>
                        </div>
                    ) : null}
                    </div>
                </div>
                )}
            </div>
        </div>
      );
  }

  // View Mode
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-[#7C73E6] mb-6">내 옷장 ({items.length})</h2>
      
      {/* Category Filter */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id as any)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors
                    ${selectedCategory === tab.id 
                        ? 'bg-[#7C73E6] text-white shadow-md' 
                        : 'bg-white text-[#C4C1E0] border border-[#C4C1E0] hover:bg-[#F8F7E9]'
                    }
                `}
              >
                  {tab.label}
              </button>
          ))}
      </div>

      {/* Gallery Section */}
      <div>
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-[#FAFAFA] rounded-3xl border border-dashed border-[#C4C1E0]">
            <p className="text-[#C4C1E0] text-lg">해당 카테고리에 옷이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredItems.map((item) => (
              <div 
                key={item.id} 
                className="group relative bg-[#FAFAFA] rounded-2xl shadow-sm border border-[#C4C1E0] overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                onClick={() => onItemClick(item)}
              >
                <div className="aspect-[3/4] bg-[#F8F7E9]">
                  <img src={item.imageUrl} alt={item.category} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <p className="font-bold text-[#7C73E6] text-sm truncate">{CategoryLabels[item.category] || item.category}</p>
                  <p className="text-xs text-[#C4C1E0] font-medium">{item.color}</p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveItem(item.id);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClosetManager;