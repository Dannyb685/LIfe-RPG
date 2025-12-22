
import React from 'react';
import { DailyStats } from '../types';

interface HistoryCalendarProps {
  stats: DailyStats[];
  onDayClick?: (date: string) => void;
}

const HistoryCalendar: React.FC<HistoryCalendarProps> = ({ stats, onDayClick }) => {
  // Generate last 365 days (approx 52 weeks)
  // Align start date to Sunday for proper grid alignment
  const today = new Date();
  const daysToGenerate = 365;
  const endDate = new Date(today);
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - daysToGenerate);

  // Adjust start date to previous Sunday
  while (startDate.getDay() !== 0) { // 0 = Sunday
    startDate.setDate(startDate.getDate() - 1);
  }

  const allDays = [];
  const current = new Date(startDate);
  // Compare timestamps to be safe
  while (current <= endDate) {
    allDays.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const getIntensity = (xp: number) => {
    if (xp === 0) return 'bg-stone-100/50';
    if (xp < 50) return 'bg-emerald-100';
    if (xp < 100) return 'bg-emerald-300';
    if (xp < 200) return 'bg-emerald-500';
    return 'bg-emerald-700 shadow-sm';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-8 w-full overflow-x-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-light text-stone-700 flex items-center gap-2">
          <i className="fa-solid fa-calendar-days text-stone-400"></i>
          Chronicle of Growth
        </h2>
        <div className="text-xs font-mono text-stone-400 uppercase tracking-widest">
          Last 12 Months
        </div>
      </div>

      {/* HEATMAP GRID */}
      {/* 7 rows (days), Auto columns (weeks). grid-flow-col fills columns first (top to bottom) */}
      <div className="grid grid-rows-7 grid-flow-col gap-1 w-max mx-auto">
        {allDays.map(dateObj => {
          const dateStr = dateObj.toISOString().split('T')[0];
          const stat = stats.find(s => s.date === dateStr);
          const xp = stat?.totalXp || 0;

          return (
            <div
              key={dateStr}
              className="relative group cursor-pointer"
              onClick={() => onDayClick && onDayClick(dateStr)}
            >
              <div
                className={`w-3 h-3 rounded-[2px] ${getIntensity(xp)} transition-colors duration-300 hover:ring-2 hover:ring-stone-300`}
              ></div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-stone-800 text-white p-2 rounded text-xs z-50 hidden group-hover:block pointer-events-none shadow-lg">
                <div className="font-bold">{dateStr}</div>
                <div>{xp.toLocaleString()} XP</div>
                {stat?.primarySkill && (
                  <div className="text-stone-400 italic">{stat.primarySkill}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end items-center gap-2 text-[10px] text-stone-400 font-mono uppercase tracking-widest">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-[2px] bg-stone-100/50"></div>
          <div className="w-3 h-3 rounded-[2px] bg-emerald-100"></div>
          <div className="w-3 h-3 rounded-[2px] bg-emerald-300"></div>
          <div className="w-3 h-3 rounded-[2px] bg-emerald-500"></div>
          <div className="w-3 h-3 rounded-[2px] bg-emerald-700"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

export default HistoryCalendar;
