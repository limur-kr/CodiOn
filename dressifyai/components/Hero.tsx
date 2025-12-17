import React from 'react';
import { ArrowRight, CloudSun, Scan, Shirt, ShieldCheck } from 'lucide-react';
import Button from './Button';

interface HeroProps {
  onGetStarted: () => void;
}

const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  return (
    <div className="relative overflow-hidden bg-white">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 hidden md:block w-96 h-96 rounded-full bg-indigo-50 blur-3xl opacity-50 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 hidden md:block w-96 h-96 rounded-full bg-teal-50 blur-3xl opacity-50 pointer-events-none"></div>

      {/* Main Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center lg:text-left lg:grid lg:grid-cols-2 lg:gap-12 items-center">
          
          <div className="space-y-8">
            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              내 옷장의 미래: <br/>
              <span className="text-indigo-600">AI 기반 날씨 맞춤 코디</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0">
              "오늘 뭐 입지?" 고민은 이제 그만. DressifyAI가 당신의 옷장 속 아이템, 날씨, 그리고 스타일을 분석하여 완벽한 하루를 위한 코디를 제안합니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" onClick={onGetStarted}>
                시작하기 - 내 옷장 스캔
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg">
                데모 보기
              </Button>
            </div>
          </div>

          <div className="mt-12 lg:mt-0 relative">
            <div className="bg-slate-100 rounded-3xl p-6 shadow-2xl border border-slate-200 relative z-10">
                <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 flex items-center gap-4">
                   <div className="bg-orange-100 p-3 rounded-full">
                     <CloudSun className="text-orange-500 h-6 w-6" />
                   </div>
                   <div>
                     <p className="text-xs text-slate-500 font-semibold">서울, 대한민국</p>
                     <p className="text-lg font-bold text-slate-800">22°C • 맑음</p>
                   </div>
                </div>
                <img 
                  src="https://picsum.photos/600/400?random=1" 
                  alt="App Mockup" 
                  className="rounded-xl w-full object-cover h-64 shadow-inner"
                />
                <div className="mt-4 flex gap-2">
                   <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 w-3/4"></div>
                   </div>
                </div>
                <div className="mt-2 text-xs text-slate-500 flex justify-between">
                   <span>AI 매칭 점수</span>
                   <span className="font-bold text-indigo-600">98% 일치</span>
                </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-10 -right-10 bg-white p-4 rounded-xl shadow-xl animate-bounce duration-[3000ms]">
              <Shirt className="h-8 w-8 text-indigo-600" />
            </div>
          </div>

        </div>
      </div>

      {/* How It Works */}
      <div className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">핵심 기능</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              단 3단계로 완성되는 스타일링
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                <Scan className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">1. 스캔 & 태그</h3>
              <p className="text-slate-600">
                옷 사진을 찍기만 하세요. AI가 카테고리, 색상, 소재를 즉시 분석하여 자동 태깅합니다.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-6">
                <CloudSun className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">2. 분석 & 추천</h3>
              <p className="text-slate-600">
                기온, 습도, 자외선 지수 등 날씨 데이터를 종합하여 가장 쾌적하고 멋진 코디를 제안합니다.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center mb-6">
                <ShieldCheck className="h-6 w-6 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">3. 관리 & 최적화</h3>
              <p className="text-slate-600">
                계절 변화에 따른 옷장 관리 팁과 세탁 방법을 제공하여 옷을 더 오래, 새것처럼 관리하세요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;