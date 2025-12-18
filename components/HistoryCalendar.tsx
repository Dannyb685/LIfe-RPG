
import React from 'react';
import { DailyStats } from '../types';

interface HistoryCalendarProps {
  stats: DailyStats[];
}

const HistoryCalendar: React.FC<HistoryCalendarProps> = ({ stats }) => {
  // Generate last 30 days
  const days = Array.from({ length: 35 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (34 - i));
    return d.toISOString().split('T')[0];
  });

  const getIntensity = (xp: number) => {
    if (xp === 0) return 'bg-[#2b2522]';
    if (xp < 100) return 'bg-green-900';
    if (xp < 300) return 'bg-green-700';
    if (xp < 600) return 'bg-green-500';
    return 'bg-[#00ff00] shadow-[0_0_5px_#00ff00]';
  };

  return (
    <div className="bg-[#362f2b] border-2 border-[#5d5447] p-6 shadow-osrs">
      <h2 className="text-xl font-bold text-[#ff981f] mb-4 border-b border-[#5d5447] pb-2 flex items-center gap-2">
        <i className="fa-solid fa-calendar-days"></i> Calendar of Glory
      </h2>
      
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-[#9a9a9a] uppercase">{d}</div>
        ))}
        
        {days.map(date => {
            const stat = stats.find(s => s.date === date);
            const xp = stat?.totalXp || 0;
            
            return (
                <div key={date} className="aspect-square relative group">
                    <div 
                        className={`w-full h-full border border-[#1a1816] ${getIntensity(xp)} transition-all hover:scale-110`}
                    ></div>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-black border border-[#ffff00] p-2 text-xs z-50 hidden group-hover:block pointer-events-none">
                        <div className="text-[#ffff00] font-bold">{date}</div>
                        <div className="text-white">{xp} XP</div>
                        {stat?.primarySkill && (
                            <div className="text-[#9a9a9a] italic">{stat.primarySkill}</div>
                        )}
                    </div>
                </div>
            );
        })}
      </div>
      
      <div className="mt-4 flex justify-between items-center text-xs text-[#9a9a9a] font-mono">
          <div>Last 35 Days</div>
          <div className="flex gap-1 items-center">
              <span>Less</span>
              <div className="w-3 h-3 bg-[#2b2522] border border-[#1a1816]"></div>
              <div className="w-3 h-3 bg-green-900 border border-[#1a1816]"></div>
              <div className="w-3 h-3 bg-green-500 border border-[#1a1816]"></div>
              <div className="w-3 h-3 bg-[#00ff00] border border-[#1a1816]"></div>
              <span>More</span>
          </div>
      </div>
    </div>
  );
};

export default HistoryCalendar;
