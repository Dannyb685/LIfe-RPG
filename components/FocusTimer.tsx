
import React, { useState, useEffect } from 'react';
import { Skill } from '../types';
import PixelAvatar, { ActionType } from './PixelAvatar';

interface FocusTimerProps {
  skills: Skill[];
  // State from Parent
  isActive: boolean;
  mode: 'POMODORO' | 'STOPWATCH';
  seconds: number;
  selectedSkillId: string;
  // Handlers from Parent
  onToggle: () => void;
  onStop: () => void;
  onModeChange: (mode: 'POMODORO' | 'STOPWATCH') => void;
  onSkillChange: (skillId: string) => void;
}

const POMODORO_DEFAULT = 25 * 60; // 25 minutes

const FocusTimer: React.FC<FocusTimerProps> = ({ 
    skills, 
    isActive, 
    mode, 
    seconds, 
    selectedSkillId, 
    onToggle, 
    onStop, 
    onModeChange, 
    onSkillChange 
}) => {
  const [showReward, setShowReward] = useState(false);

  // Note: Victory Reward animation logic is visual only, triggered when timer completes in App.
  // We can infer completion if Pomodoro resets, but for simplicity in this stateless version, 
  // we rely on the App notification. We can add a local effect if we want a specific visual pop here later.

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const selectedSkill = skills.find(s => s.id === selectedSkillId);

  // Determine Avatar Action based on Skill
  const getAvatarAction = (skillName: string | undefined): ActionType => {
      if (!isActive) return 'IDLE';
      if (!skillName) return 'IDLE';
      
      const s = skillName.toLowerCase();
      
      if (s.includes('cooking') || s.includes('food') || s.includes('chef')) return 'COOKING';
      if (s.includes('crafting') || s.includes('smithing') || s.includes('hammer')) return 'CRAFTING';
      if (s.includes('instrument') || s.includes('music') || s.includes('guitar') || s.includes('piano')) return 'MUSIC';
      if (s.includes('language') || s.includes('social') || s.includes('speech')) return 'LANGUAGE';
      if (s.includes('endurance') || s.includes('run') || s.includes('cardio') || s.includes('agility')) return 'RUNNING';
      if (s.includes('art') || s.includes('design') || s.includes('draw')) return 'ART';
      if (s.includes('household') || s.includes('clean') || s.includes('chore')) return 'HOUSEHOLD';
      if (s.includes('scout') || s.includes('search') || s.includes('look')) return 'SCOUT';

      if (s.includes('strength') || s.includes('fitness') || s.includes('exercise')) return 'LIFTING';
      if (s.includes('attack') || s.includes('defense') || s.includes('combat')) return 'COMBAT';
      if (s.includes('knowledge') || s.includes('reading') || s.includes('study') || s.includes('research')) return 'READING';
      if (s.includes('magic') || s.includes('tech') || s.includes('dev')) return 'MAGIC';
      if (s.includes('animal') || s.includes('nature')) return 'DOG_TRAINING';
      if (s.includes('garden') || s.includes('farm')) return 'FARMING';
      if (s.includes('woodcut') || s.includes('construction')) return 'WOODCUTTING';
      
      return 'WOODCUTTING'; 
  };

  return (
    <div className="max-w-md w-full mx-auto bg-osrs-panel border-2 border-osrs-border rounded-sm p-1 shadow-osrs flex flex-col items-center gap-4 relative">
        
        {/* Header / Mode Switcher */}
        <div className="flex bg-[#1a1816] p-1 w-full border-b border-osrs-border">
            <button 
                className={`flex-1 py-1 text-sm font-bold transition-all ${mode === 'POMODORO' ? 'text-osrs-orange underline' : 'text-gray-500 hover:text-gray-300'}`}
                onClick={() => onModeChange('POMODORO')}
            >
                Pomodoro
            </button>
            <button 
                className={`flex-1 py-1 text-sm font-bold transition-all ${mode === 'STOPWATCH' ? 'text-osrs-orange underline' : 'text-gray-500 hover:text-gray-300'}`}
                onClick={() => onModeChange('STOPWATCH')}
            >
                Stopwatch
            </button>
        </div>

        {/* Character Viewport (The "Screen") */}
        <div className="relative w-full h-48 bg-[#2d6e32] border-2 border-[#1a1816] shadow-osrs-inset overflow-hidden flex items-end justify-center pb-4">
             {/* Simple Background Elements */}
             <div className="absolute top-0 w-full h-1/2 bg-[#87ceeb]"></div> {/* Sky */}
             <div className="absolute top-1/2 w-full h-1/2 bg-[#2d6e32]"></div> {/* Grass */}
             
             {/* Pixel Avatar Component */}
             <div className="z-10 transform scale-150 mb-2">
                 <PixelAvatar action={getAvatarAction(selectedSkill?.name)} />
             </div>

             {/* Floating Text if Active */}
             {isActive && (
                 <div className="absolute top-4 text-center">
                    <div className="text-white font-bold drop-shadow-[1px_1px_0_#000] text-xs bg-red-600 px-1 rounded opacity-80 animate-bounce">
                        Training {selectedSkill?.name}...
                    </div>
                 </div>
             )}
        </div>

        {/* Timer Display */}
        <div className="flex flex-col items-center justify-center w-full bg-[#372e29] border border-osrs-border p-4 shadow-inner">
            <div className={`text-4xl font-mono font-bold tracking-widest ${isActive ? 'text-osrs-gold drop-shadow-md' : 'text-[#888]'}`}>
                {formatTime(seconds)}
            </div>
            
            {/* Skill Selector */}
            <div className="mt-2 w-full max-w-xs">
                <select 
                    value={selectedSkillId}
                    onChange={(e) => onSkillChange(e.target.value)}
                    className="w-full bg-[#1a1816] border border-[#5d5447] text-osrs-orange text-sm py-1 px-2 focus:outline-none text-center"
                    disabled={isActive}
                >
                    {skills.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>
            </div>
        </div>

        {/* Action Controls (OSRS Buttons) */}
        <div className="flex gap-4 w-full px-4 pb-4">
            <button 
                onClick={onToggle}
                className={`flex-1 py-2 font-bold text-sm border-2 shadow-[2px_2px_0_#000] active:translate-y-1 active:shadow-none
                    ${isActive 
                        ? 'bg-[#5d5447] border-[#362f2b] text-[#dcdcdc] hover:brightness-110' 
                        : 'bg-[#701414] border-[#4a0d0d] text-white hover:brightness-110'
                    }`}
            >
                {isActive ? 'Pause' : 'Start Action'}
            </button>

            {(isActive || (mode === 'STOPWATCH' && seconds > 0) || (mode === 'POMODORO' && seconds < POMODORO_DEFAULT)) && (
                <button 
                    onClick={onStop}
                    className="w-16 font-bold text-sm bg-[#1e1e1e] border-2 border-[#5d5447] text-[#00ff00] hover:text-white shadow-[2px_2px_0_#000] active:translate-y-1 active:shadow-none flex items-center justify-center"
                    title="Finish & Claim XP"
                >
                    <i className="fa-solid fa-flag"></i>
                </button>
            )}
        </div>
    </div>
  );
};

export default FocusTimer;
