
import React from 'react';
import { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  title: string;
  isHabitList?: boolean;
  iconUrl?: string; // Optional custom icon for the header
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onToggleTask, title, isHabitList = false, iconUrl }) => {
  
  return (
    <div className="bg-[#362f2b] border-2 border-[#5d5447] shadow-[2px_2px_0px_#1a1816] mb-6 relative">
      {/* OSRS Corner Screws */}
      <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-[#5d5447] rounded-full shadow-inner opacity-80"></div>
      <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#5d5447] rounded-full shadow-inner opacity-80"></div>
      <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-[#5d5447] rounded-full shadow-inner opacity-80"></div>
      <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-[#5d5447] rounded-full shadow-inner opacity-80"></div>

      {/* Header */}
      <div className="bg-[#2b2522] p-2 border-b border-[#5d5447] flex justify-between items-center">
        <h3 className="text-[#ff981f] font-bold text-lg tracking-wide flex items-center gap-2 drop-shadow-[1px_1px_0_#000]">
            {iconUrl ? (
                <img src={iconUrl} alt="icon" className="w-5 h-5 object-contain" />
            ) : (
                <i className={`fa-solid ${isHabitList ? 'fa-book-journal-whills' : 'fa-scroll'} text-[#dcdcdc]`}></i>
            )}
            {title}
        </h3>
        <span className="text-xs text-[#ffff00] font-mono font-bold bg-[#1a1816] px-2 py-0.5 rounded border border-[#5d5447]">
            {tasks.filter(t => t.completed).length} / {tasks.length}
        </span>
      </div>

      {/* List Container */}
      <div className="p-1 bg-[#2b2522]">
        <div className="flex flex-col gap-[1px] max-h-[400px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#5d5447] scrollbar-track-[#1a1816]">
        {tasks.map((task) => {
            const isHabit = task.isHabit;
            const progress = isHabit && task.targetValue ? Math.min(100, (task.currentValue || 0) / task.targetValue * 100) : (task.completed ? 100 : 0);
            
            // OSRS Quest Text Colors
            // Red = Not Started, Yellow = In Progress, Green = Completed
            let statusColor = '#ff0000'; 
            if (task.completed) statusColor = '#00ff00';
            else if (isHabit && (task.currentValue || 0) > 0) statusColor = '#ffff00';

            return (
              <div 
                key={task.id} 
                className={`
                    flex items-center p-2 transition-all duration-75 relative group select-none
                    hover:bg-[#3e352f] cursor-pointer
                    border-b border-[#3e352f] last:border-0
                `}
                onClick={() => {
                   // Toggling here updates the GAME state (XP gain/completion visual)
                   // It does not write back to the markdown file.
                   if (!isHabit) onToggleTask(task.id);
                }}
              >
                {/* Icon Marker */}
                <div className="mr-3 flex-shrink-0 w-6 flex justify-center">
                    {isHabit ? (
                         <div className="relative">
                            <i className="fa-solid fa-circle text-[8px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30"></i>
                            <i className={`fa-solid ${task.completed ? 'fa-check' : 'fa-rotate'} text-xs drop-shadow-md`} style={{ color: statusColor }}></i>
                         </div>
                    ) : (
                        <i className="fa-solid fa-star text-xs drop-shadow-md" style={{ color: statusColor }}></i>
                    )}
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex justify-between items-start">
                      <div className="flex-1">
                          <p 
                            className="text-sm font-bold truncate drop-shadow-sm leading-tight"
                            style={{ color: statusColor }}
                            title={task.description}
                          >
                            {task.description}
                          </p>
                          {/* Subtext info */}
                          <div className="flex items-center gap-2 mt-0.5">
                             <span className="text-[10px] text-[#9a9a9a]">
                                {task.skillTag}
                             </span>
                             {task.xpReward > 0 && (
                                 <span className="text-[10px] text-[#ffff00] flex items-center gap-1">
                                    <img src="https://i.imgur.com/81j18dD.png" className="w-3 h-3 inline" alt="gp" /> 
                                    {task.xpReward}
                                 </span>
                             )}
                          </div>
                      </div>

                      {/* Habit Counter */}
                      {isHabit && (
                          <div className="text-right pl-2">
                              <span className={`text-xs font-mono font-bold ${task.completed ? 'text-[#00ff00]' : 'text-[#dcdcdc]'}`}>
                                 {task.currentValue}/{task.targetValue}
                              </span>
                          </div>
                      )}
                  </div>

                  {/* Habit Progress Bar (Only if active and incomplete) */}
                  {isHabit && task.targetValue && !task.completed && (task.currentValue || 0) > 0 && (
                      <div className="w-full bg-[#1a1816] h-1 mt-1 rounded-full overflow-hidden border border-[#5d5447]/30">
                          <div 
                            className="h-full bg-[#ffff00]" 
                            style={{ width: `${progress}%` }}
                          ></div>
                      </div>
                  )}
                </div>
              </div>
            );
        })}
        {tasks.length === 0 && (
            <div className="p-4 text-center text-[#9a9a9a] text-xs italic">
                - No entries found in Daily Note -
            </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default TaskList;
