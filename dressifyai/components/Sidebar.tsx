import React from 'react';
import { Home, Shirt, PlusCircle, Clock, CloudSun, Sun, CloudRain, Wind, BarChart2, Calendar, Sparkles } from 'lucide-react';
import { ClothingItem, WeatherData, WeatherCondition } from '../types';

interface SidebarProps {
  weather: WeatherData | null;
  recentItems: ClothingItem[];
  activeView: string;
  onNavigate: (view: 'dashboard' | 'closet' | 'upload' | 'analytics' | 'calendar' | 'integration') => void;
  onItemClick: (item: ClothingItem) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ weather, recentItems, activeView, onNavigate, onItemClick }) => {
  
  const getIcon = (condition?: WeatherCondition) => {
    switch (condition) {
      case WeatherCondition.RAINY: return <CloudRain className="w-8 h-8 text-[#7C73E6]" />;
      case WeatherCondition.CLOUDY: return <CloudSun className="w-8 h-8 text-[#7C73E6]" />;
      case WeatherCondition.SUNNY: return <Sun className="w-8 h-8 text-[#FFA500]" />; // Keep sun orange for contrast
      case WeatherCondition.WINDY: return <Wind className="w-8 h-8 text-[#7C73E6]" />;
      default: return <Sun className="w-8 h-8 text-[#7C73E6]" />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: '홈', icon: Home },
    { id: 'analytics', label: '대시보드', icon: BarChart2 },
    { id: 'calendar', label: '캘린더', icon: Calendar },
    { id: 'closet', label: '내 옷장', icon: Shirt },
    { id: 'upload', label: '옷 등록하기', icon: PlusCircle },
    { id: 'integration', label: 'AI 연동', icon: Sparkles },
  ];

  return (
    <div className="hidden md:flex flex-col w-72 h-screen bg-[#F8F7E9] border-r border-[#C4C1E0] fixed left-0 top-0 overflow-y-auto z-20">
      {/* Brand */}
      <div className="p-8">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#7C73E6] to-[#5e54c5]">
          DressifyAI
        </h1>
      </div>

      {/* Weather Widget */}
      <div className="px-6 mb-8">
        <div className="bg-[#FAFAFA] rounded-xl p-4 shadow-sm border border-[#C4C1E0]">
          {weather ? (
            <div className="flex items-center gap-4">
              <div className="bg-[#F8F7E9] p-2 rounded-lg">
                {getIcon(weather.condition)}
              </div>
              <div>
                <p className="text-xs font-semibold text-[#C4C1E0] uppercase tracking-wide">{weather.location.split(',')[0]}</p>
                <p className="text-xl font-bold text-[#7C73E6]">{weather.temperature}°C</p>
                <p className="text-xs text-[#7C73E6] opacity-80">{weather.condition}</p>
              </div>
            </div>
          ) : (
            <div className="animate-pulse h-16 bg-[#F8F7E9] rounded"></div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-4 space-y-2 mb-8">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id as any)}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
              activeView === item.id 
                ? 'bg-[#7C73E6] text-white shadow-md' 
                : 'text-[#7C73E6] hover:bg-[#EBE9F5]'
            }`}
          >
            <item.icon className={`w-5 h-5 mr-3 ${activeView === item.id ? 'text-white' : 'text-[#7C73E6]'}`} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Recently Added */}
      <div className="px-6 mt-auto mb-8">
        <div className="flex items-center gap-2 mb-4 text-[#7C73E6]">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-semibold">최근 등록된 옷</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {recentItems.length > 0 ? (
            recentItems.slice(0, 6).map((item) => (
              <div 
                key={item.id} 
                className="aspect-square rounded-lg overflow-hidden border border-[#C4C1E0] cursor-pointer hover:opacity-80 transition-opacity bg-white"
                onClick={() => onItemClick(item)}
              >
                <img src={item.imageUrl} alt={item.category} className="w-full h-full object-cover" />
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-4 bg-[#FAFAFA] rounded-lg border border-dashed border-[#C4C1E0]">
              <span className="text-xs text-[#C4C1E0]">없음</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;