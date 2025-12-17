import React from 'react';
import { DailyLog } from '../types';
import { CloudSun, Sun, CloudRain, CheckCircle } from 'lucide-react';

interface CalendarViewProps {
  logs: DailyLog[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ logs }) => {
  // Mock generation of a calendar month grid
  const daysInMonth = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    // Simple mock logic: first few days of current month
    const dateStr = `2024-10-${day.toString().padStart(2, '0')}`;
    const log = logs.find(l => l.date === dateStr);
    return { day, log };
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-bold text-[#7C73E6]">스타일 히스토리</h1>
           <p className="text-[#C4C1E0] mt-2 text-lg">2024년 10월</p>
        </div>
      </header>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#C4C1E0]">
        {/* Days of week */}
        <div className="grid grid-cols-7 mb-4 text-center">
            {['일', '월', '화', '수', '목', '금', '토'].map(d => (
                <div key={d} className="text-xs font-bold text-[#C4C1E0] uppercase">{d}</div>
            ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
            {daysInMonth.map(({ day, log }) => (
                <div 
                    key={day} 
                    className={`aspect-square rounded-xl border p-2 flex flex-col justify-between transition-colors
                        ${log 
                            ? 'bg-[#F8F7E9] border-[#7C73E6] cursor-pointer hover:bg-[#EBE9F5]' 
                            : 'bg-white border-[#F8F7E9] text-gray-300'
                        }
                    `}
                >
                    <span className={`text-sm font-bold ${log ? 'text-[#7C73E6]' : 'text-gray-300'}`}>{day}</span>
                    
                    {log && (
                        <div className="flex flex-col items-center">
                            {/* Weather Icon */}
                             <Sun className="w-4 h-4 text-orange-400 mb-1" />
                            {/* Outfit Tiny Preview */}
                            <div className="flex -space-x-2">
                                <div className="w-6 h-6 rounded-full border border-white bg-gray-200 overflow-hidden">
                                    <img src={log.outfit.top.imageUrl} alt="top" className="w-full h-full object-cover" />
                                </div>
                                <div className="w-6 h-6 rounded-full border border-white bg-gray-200 overflow-hidden">
                                    <img src={log.outfit.bottom.imageUrl} alt="btm" className="w-full h-full object-cover" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;