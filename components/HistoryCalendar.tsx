
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
    if (xp === 0) return 'bg-sanctuary-ink/5';
    if (xp < 50) return 'bg-sanctuary-green/20';
    if (xp < 100) return 'bg-sanctuary-green/40';
    if (xp < 200) return 'bg-sanctuary-green/70';
    return 'bg-sanctuary-green shadow-sm';
  };

  return (
    <div className="bg-white/60 rounded-xl shadow-soft border border-sanctuary-border p-8 w-full overflow-x-auto backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-light font-serif italic text-sanctuary-ink flex items-center gap-2">
          <i className="fa-solid fa-calendar-days text-sanctuary-inkLight"></i>
          Chronicle of Growth
        </h2>
        <div className="text-xs font-mono text-sanctuary-inkLight uppercase tracking-widest">
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
                className={`w-3 h-3 rounded-[1px] ${getIntensity(xp)} transition-colors duration-300 hover:ring-1 hover:ring-sanctuary-gold`}
              ></div>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-sanctuary-ink text-white p-2 rounded text-xs z-50 hidden group-hover:block pointer-events-none shadow-lg font-sans">
                <div className="font-bold">{dateStr}</div>
                <div>{xp.toLocaleString()} XP</div>
                {stat?.primarySkill && (
                  <div className="text-sanctuary-border italic">{stat.primarySkill}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end items-center gap-2 text-[10px] text-sanctuary-inkLight font-mono uppercase tracking-widest">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-[1px] bg-sanctuary-ink/5"></div>
          <div className="w-3 h-3 rounded-[1px] bg-sanctuary-green/20"></div>
          <div className="w-3 h-3 rounded-[1px] bg-sanctuary-green/40"></div>
          <div className="w-3 h-3 rounded-[1px] bg-sanctuary-green/70"></div>
          <div className="w-3 h-3 rounded-[1px] bg-sanctuary-green"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

export default HistoryCalendar;
