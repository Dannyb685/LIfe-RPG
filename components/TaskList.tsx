
import React from 'react';
import { Task } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskListProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  title: string;
  isHabitList?: boolean;
  iconUrl?: string;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onToggleTask, title, isHabitList = false, iconUrl }) => {
  return (
    <div className="mb-12">
      {/* Header Section - Minimalist */}
      <div className="flex items-center justify-between mb-6 px-4">
        <h3 className="text-sanctuary-ink font-serif italic text-xl flex items-center gap-3">
          {iconUrl ? (
            <img src={iconUrl} alt="icon" className="w-5 h-5 object-contain opacity-40" />
          ) : (
            <i className={`fa-solid ${isHabitList ? 'fa-leaf' : 'fa-feather-pointed'} text-sanctuary-inkLight`}></i>
          )}
          {title}
        </h3>
        <span className="text-[10px] text-sanctuary-inkLight font-bold uppercase tracking-[0.2em] bg-white px-3 py-1 rounded-full border border-sanctuary-border">
          {tasks.filter(t => t.completed).length} / {tasks.length}
        </span>
      </div>

      {/* List Container - Spaced & Clean */}
      <div className="space-y-3">
        <AnimatePresence mode='popLayout'>
          {tasks.map((task) => {
            const isHabit = task.isHabit;
            const progress = isHabit && task.targetValue ? Math.min(100, (task.currentValue || 0) / task.targetValue * 100) : (task.completed ? 100 : 0);

            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, x: -10 }}
                key={task.id}
                onClick={() => {
                  if (!isHabit) onToggleTask(task.id);
                }}
                className={`group relative flex items-center p-4 rounded-2xl border transition-all duration-300 cursor-pointer backdrop-blur-sm
                    ${task.completed
                    ? 'bg-sanctuary-paper/50 border-sanctuary-border/50'
                    : 'bg-white/60 border-sanctuary-border hover:border-sanctuary-inkLight hover:bg-white shadow-soft hover:-translate-y-0.5'}`}
              >
                {/* Minimalist Check Trigger */}
                <div className="mr-6 flex-shrink-0">
                  {isHabit ? (
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors
                        ${task.completed ? 'bg-sanctuary-ink border-sanctuary-ink' : 'border-sanctuary-inkLight/20 bg-white'}`}>
                      <i className={`fa-solid ${task.completed ? 'fa-check text-white' : 'fa-rotate text-sanctuary-inkLight'} text-[10px]`}></i>
                    </div>
                  ) : (
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all
                        ${task.completed
                        ? 'bg-sanctuary-ink border-sanctuary-ink'
                        : 'border-sanctuary-border group-hover:border-sanctuary-inkLight'}`}>
                      {task.completed && <i className="fa-solid fa-check text-white text-[10px]"></i>}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className={`text-sm font-medium transition-colors ${task.completed ? 'text-sanctuary-inkLight line-through decoration-sanctuary-border' : 'text-sanctuary-ink'}`}>
                        {task.description}
                      </p>

                      {/* Metatags */}
                      <div className="flex items-center gap-4 mt-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                        {task.skillTag && (
                          <span className="text-[9px] uppercase tracking-widest font-bold text-sanctuary-inkLight">
                            {task.skillTag}
                          </span>
                        )}
                        {task.xpReward > 0 && !task.completed && (
                          <span className="text-[9px] text-sanctuary-inkLight font-mono">
                            {task.xpReward} XP
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Habit Value */}
                    {isHabit && (
                      <div className="pl-4">
                        <span className={`text-xs font-mono font-medium ${task.completed ? 'text-sanctuary-inkLight' : 'text-sanctuary-ink'}`}>
                          {task.currentValue}<span className="text-sanctuary-inkLight mx-0.5">/</span>{task.targetValue}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Progressive Progress Bar (Minimalist) */}
                  {isHabit && task.targetValue && !task.completed && (task.currentValue || 0) > 0 && (
                    <div className="w-full bg-sanctuary-border h-[3px] mt-3 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-sanctuary-green"
                      ></motion.div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {tasks.length === 0 && (
          <div className="py-16 text-center">
            <i className="fa-solid fa-wind mb-4 text-sanctuary-inkLight/30 text-3xl"></i>
            <p className="text-sanctuary-inkLight text-sm font-serif italic opacity-60">The list is empty. Stillness remains.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
