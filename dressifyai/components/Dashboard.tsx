import React from 'react';
import { Users, TrendingUp, PieChart, BarChart } from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold text-[#7C73E6]">커뮤니티 인사이트</h1>
        <p className="text-[#C4C1E0] mt-2 text-lg">플랫폼 통계 및 유저 트렌드</p>
      </header>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: '활성 사용자', value: '12.5K', icon: Users, color: 'bg-indigo-100 text-indigo-600' },
          { label: '일일 코디 수', value: '8.2K', icon: TrendingUp, color: 'bg-green-100 text-green-600' },
          { label: '평균 평점', value: '4.8/5', icon: PieChart, color: 'bg-orange-100 text-orange-600' },
          { label: '등록된 아이템', value: '145K', icon: BarChart, color: 'bg-blue-100 text-blue-600' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-[#C4C1E0]">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-[#7C73E6]">{stat.value}</p>
            <p className="text-xs text-[#C4C1E0] uppercase font-bold tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Gender Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#C4C1E0]">
          <h3 className="font-bold text-[#7C73E6] mb-6">성별 비율</h3>
          <div className="flex items-center justify-center h-48 relative">
            {/* Simple CSS Pie Chart Mockup */}
            <div className="w-32 h-32 rounded-full bg-[conic-gradient(#7C73E6_0deg_216deg,#C4C1E0_216deg_360deg)] relative">
                <div className="absolute inset-0 m-8 bg-white rounded-full flex items-center justify-center">
                    <span className="text-xs text-gray-400">전체</span>
                </div>
            </div>
            <div className="ml-8 space-y-2">
                <div className="flex items-center text-sm">
                    <div className="w-3 h-3 bg-[#7C73E6] rounded-full mr-2"></div>
                    <span className="text-gray-600">여성 (60%)</span>
                </div>
                <div className="flex items-center text-sm">
                    <div className="w-3 h-3 bg-[#C4C1E0] rounded-full mr-2"></div>
                    <span className="text-gray-600">남성 (40%)</span>
                </div>
            </div>
          </div>
        </div>

        {/* Age Distribution (Bar Chart) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#C4C1E0]">
          <h3 className="font-bold text-[#7C73E6] mb-6">연령 분포</h3>
          <div className="flex items-end justify-between h-48 px-4 pb-4 border-b border-[#F8F7E9] gap-4">
            {[
               { label: '18-24', h: 'h-24' },
               { label: '25-34', h: 'h-40' }, // Peak
               { label: '35-44', h: 'h-32' },
               { label: '45+', h: 'h-16' },
            ].map((bar, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1 group">
                   <div className={`w-full ${bar.h} bg-[#7C73E6] opacity-80 group-hover:opacity-100 rounded-t-lg transition-all`}></div>
                   <span className="text-xs text-[#C4C1E0] mt-2">{bar.label}</span>
                </div>
            ))}
          </div>
        </div>

        {/* Traffic Trend (Line Chart visual) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#C4C1E0]">
          <h3 className="font-bold text-[#7C73E6] mb-6">트래픽 (최근 7일)</h3>
          <div className="h-48 flex items-end justify-between relative px-2">
            {/* SVG Line Graph */}
            <svg className="absolute inset-0 w-full h-full p-6" viewBox="0 0 100 50" preserveAspectRatio="none">
               <polyline 
                 fill="none" 
                 stroke="#7C73E6" 
                 strokeWidth="2" 
                 points="0,40 16,30 32,35 48,10 64,20 80,15 100,5" 
               />
               <polygon 
                  fill="#7C73E6" 
                  fillOpacity="0.1" 
                  points="0,40 16,30 32,35 48,10 64,20 80,15 100,5 100,50 0,50"
               />
            </svg>
            <div className="w-full flex justify-between text-xs text-[#C4C1E0] relative z-10 pt-2 border-t border-[#F8F7E9]">
                <span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span><span>일</span>
            </div>
          </div>
        </div>

        {/* Clothing Preference */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#C4C1E0]">
           <h3 className="font-bold text-[#7C73E6] mb-6">인기 카테고리</h3>
           <div className="space-y-4">
              {[
                  { cat: '캐주얼 상의', pct: '45%' },
                  { cat: '청바지', pct: '30%' },
                  { cat: '원피스', pct: '15%' },
                  { cat: '아우터', pct: '10%' }
              ].map((item, idx) => (
                  <div key={idx}>
                      <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">{item.cat}</span>
                          <span className="font-bold text-[#7C73E6]">{item.pct}</span>
                      </div>
                      <div className="w-full bg-[#F8F7E9] rounded-full h-2">
                          <div className="bg-[#7C73E6] h-2 rounded-full" style={{ width: item.pct }}></div>
                      </div>
                  </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;