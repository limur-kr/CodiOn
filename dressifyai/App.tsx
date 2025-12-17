import React, { useState, useEffect } from 'react';
import Hero from './components/Hero';
import ClosetManager from './components/ClosetManager';
import OutfitRecommender from './components/OutfitRecommender';
import Sidebar from './components/Sidebar';
import ItemDetail from './components/ItemDetail';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import ImageAnalyzer from './components/ImageAnalyzer';
import { ClothingItem, WeatherData, DailyLog } from './types';
import { getCurrentWeather } from './services/weatherService';
import { Menu } from 'lucide-react';

const MOCK_CLOSET: ClothingItem[] = []; 

function App() {
  const [view, setView] = useState<'landing' | 'dashboard' | 'closet' | 'upload' | 'analytics' | 'calendar' | 'integration'>('landing');
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [closetItems, setClosetItems] = useState<ClothingItem[]>(MOCK_CLOSET);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  useEffect(() => {
    if (view !== 'landing') {
      setLoadingWeather(true);
      getCurrentWeather().then(data => {
        setWeather(data);
        setLoadingWeather(false);
      });
    }
  }, [view]);

  const addItem = (item: ClothingItem) => {
    setClosetItems(prev => [item, ...prev]);
    setView('closet');
  };

  const removeItem = (id: string) => {
    setClosetItems(prev => prev.filter(i => i.id !== id));
    if (selectedItem?.id === id) setSelectedItem(null);
  };

  const handleItemClick = (item: ClothingItem) => {
    setSelectedItem(item);
    setShowMobileSidebar(false);
  };

  const handleNavigate = (newView: any) => {
    setView(newView);
    setSelectedItem(null);
    setShowMobileSidebar(false);
  };

  const handleConfirmOutfit = (log: DailyLog) => {
      setDailyLogs(prev => [...prev, log]);
  };

  if (view === 'landing') {
    return (
      <div className="font-poppins bg-[#F8F7E9] text-[#7C73E6]">
        <nav className="sticky top-0 z-50 bg-[#F8F7E9]/90 backdrop-blur-md border-b border-[#C4C1E0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="flex justify-between h-16 items-center">
                <span className="text-2xl font-extrabold text-[#7C73E6]">DressifyAI</span>
                <button onClick={() => setView('dashboard')} className="text-[#7C73E6] font-medium hover:text-[#5e54c5]">
                  로그인
                </button>
             </div>
          </div>
        </nav>
        <Hero onGetStarted={() => setView('upload')} />
        <footer className="bg-white border-t border-[#C4C1E0] py-8 mt-auto">
         <div className="max-w-7xl mx-auto px-4 text-center text-[#C4C1E0] text-sm">
            &copy; {new Date().getFullYear()} DressifyAI.
         </div>
      </footer>
      </div>
    );
  }

  // Dashboard Layout
  return (
    <div className="min-h-screen bg-[#F8F7E9] text-[#7C73E6] flex font-poppins">
      
      {/* Sidebar (Desktop) */}
      <Sidebar 
        weather={weather} 
        recentItems={closetItems} 
        activeView={view} 
        onNavigate={handleNavigate}
        onItemClick={handleItemClick}
      />

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-[#F8F7E9] z-20 border-b border-[#C4C1E0] p-4 flex justify-between items-center">
         <span className="text-xl font-bold text-[#7C73E6]">DressifyAI</span>
         <button onClick={() => setShowMobileSidebar(!showMobileSidebar)}>
            <Menu className="w-6 h-6 text-[#7C73E6]" />
         </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setShowMobileSidebar(false)}>
          <div className="w-64 h-full bg-[#F8F7E9]" onClick={e => e.stopPropagation()}>
            <Sidebar 
              weather={weather} 
              recentItems={closetItems} 
              activeView={view} 
              onNavigate={handleNavigate}
              onItemClick={handleItemClick}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 md:ml-72 p-6 md:p-12 mt-16 md:mt-0 transition-all duration-300">
        <div className="max-w-5xl mx-auto">
          
          {selectedItem ? (
            /* Detailed Item View */
            <ItemDetail item={selectedItem} onBack={() => setSelectedItem(null)} />
          ) : (
            /* Views */
            <>
              {view === 'dashboard' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <header>
                    <h1 className="text-3xl font-bold text-[#7C73E6]">안녕하세요, Alex님</h1>
                    <p className="text-[#C4C1E0] mt-2 text-lg">오늘의 스타일 예보가 기대됩니다.</p>
                  </header>

                  {/* Detailed Weather Block */}
                  {weather && (
                    <div className="bg-[#FAFAFA] p-6 rounded-xl shadow-lg border border-[#C4C1E0]">
                        <h2 className="text-xl font-semibold text-[#7C73E6] mb-4">🌡️ 오늘의 상세 날씨</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="text-center p-2">
                                <p className="font-bold text-4xl text-[#7C73E6] mb-1">{weather.temperature}°C</p>
                                <p className="text-gray-500 text-xs">현재 기온</p>
                            </div>
                            <div className="text-center p-2 bg-[#F8F7E9] rounded-lg">
                                <p className="font-medium text-lg text-[#7C73E6]">{weather.tempHigh}°C / {weather.tempLow}°C</p>
                                <p className="text-gray-400 text-xs mt-1">최고 / 최저</p>
                            </div>
                            <div className="text-center p-2 bg-[#F8F7E9] rounded-lg">
                                <p className="font-medium text-lg text-[#7C73E6]">{weather.precipChance}%</p>
                                <p className="text-gray-400 text-xs mt-1">강수 확률</p>
                            </div>
                            <div className="text-center p-2 bg-[#F8F7E9] rounded-lg">
                                <p className="font-medium text-lg text-[#7C73E6]">{weather.windSpeed} km/h</p>
                                <p className="text-gray-400 text-xs mt-1">풍속</p>
                            </div>
                        </div>
                         <p className="text-sm text-center text-[#7C73E6] mt-4 opacity-80">"{weather.description}"</p>
                    </div>
                  )}

                  <h2 className="text-2xl font-bold text-[#7C73E6] mt-8">✨ 내 옷장 기반 추천 코디</h2>
                  <OutfitRecommender 
                    weather={weather} 
                    closetItems={closetItems} 
                    onItemClick={handleItemClick}
                    onConfirmOutfit={handleConfirmOutfit}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#C4C1E0]">
                        <h3 className="font-bold text-[#7C73E6] mb-2">계절 변화 알림</h3>
                        <p className="text-gray-500 text-sm mb-4">다음 주부터 기온이 떨어집니다. 아우터를 점검하세요.</p>
                        <button className="text-sm text-[#7C73E6] font-medium underline">자세히 보기</button>
                     </div>
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#C4C1E0]">
                        <h3 className="font-bold text-[#7C73E6] mb-2">옷장 건강도</h3>
                        <p className="text-gray-500 text-sm mb-4">이번 달 옷장의 {dailyLogs.length > 0 ? '15' : '0'}%를 착용했습니다.</p>
                        <button className="text-sm text-[#7C73E6] font-medium underline" onClick={() => setView('analytics')}>통계 보기</button>
                     </div>
                  </div>
                </div>
              )}

              {view === 'analytics' && <Dashboard />}
              
              {view === 'calendar' && <CalendarView logs={dailyLogs} />}

              {view === 'integration' && <ImageAnalyzer />}

              {view === 'closet' && (
                <ClosetManager 
                  items={closetItems} 
                  mode="view"
                  onAddItem={addItem} 
                  onRemoveItem={removeItem} 
                  onItemClick={handleItemClick}
                />
              )}

              {view === 'upload' && (
                <ClosetManager 
                  items={closetItems} 
                  mode="upload"
                  onAddItem={addItem} 
                  onRemoveItem={removeItem} 
                  onItemClick={handleItemClick}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;