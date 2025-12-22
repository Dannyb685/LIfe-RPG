// --- SANCTUARY THEME UPDATE ---
// This component is currently standalone but updated to match the Zen aesthetic.

import React, { useState } from 'react';
import { Skill, ActionType } from '../types';
import PixelAvatar from './PixelAvatar';

interface FocusTimerProps {
    skills: Skill[];
    isActive: boolean;
    mode: 'POMODORO' | 'STOPWATCH' | 'MEDITATE';
    seconds: number;
    selectedSkillId: string;
    onToggle: () => void;
    onStop: () => void;
    onModeChange: (mode: 'POMODORO' | 'STOPWATCH' | 'MEDITATE') => void;
    onSkillChange: (skillId: string) => void;
    assetBasePath: string;
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
    onSkillChange,
    assetBasePath
}) => {

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const selectedSkill = skills.find(s => s.id === selectedSkillId);

    // Determine Avatar Action based on Skill (Simplified for Zen)
    const getAvatarAction = (skillName: string | undefined): ActionType => {
        if (!isActive || !skillName) return 'IDLE';

        const s = skillName.toLowerCase();
        if (s.includes('cook')) return 'COOKING';
        if (s.includes('craft')) return 'CRAFTING';
        if (s.includes('music')) return 'MUSIC';
        if (s.includes('write')) return 'WRITE';
        if (s.includes('code')) return 'CODE';
        if (s.includes('garden')) return 'GARDEN';
        if (s.includes('meditate')) return 'MEDITATE';
        if (s.includes('read')) return 'READING';
        if (s.includes('tea')) return 'TEA';

        return 'MEDITATE'; // Default Zen interaction
    };

    return (
        <div className="max-w-md w-full mx-auto bg-white/40 border border-sanctuary-border rounded-xl p-6 shadow-soft flex flex-col items-center gap-6 relative backdrop-blur-sm">

            {/* Header / Mode Switcher */}
            <div className="flex w-full border-b border-sanctuary-border pb-2">
                <button
                    className={`flex-1 py-1 text-sm font-serif italic transition-all ${mode === 'POMODORO' ? 'text-sanctuary-red' : 'text-sanctuary-ink/50 hover:text-sanctuary-ink'}`}
                    onClick={() => onModeChange('POMODORO')}
                >
                    Deep Work
                </button>
                <button
                    className={`flex-1 py-1 text-sm font-serif italic transition-all ${mode === 'STOPWATCH' ? 'text-sanctuary-red' : 'text-sanctuary-ink/50 hover:text-sanctuary-ink'}`}
                    onClick={() => onModeChange('STOPWATCH')}
                >
                    Flow State
                </button>
            </div>

            {/* Character Viewport */}
            <div className="relative w-full h-48 bg-transparent overflow-hidden flex items-end justify-center pb-4 rounded-lg">
                {/* Simple Background Elements */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent"></div>

                {/* Pixel Avatar Component */}
                <div className="z-10 transform scale-125 mb-2 opacity-90">
                    <PixelAvatar action={getAvatarAction(selectedSkill?.name)} assetBasePath={assetBasePath} />
                </div>

                {/* Floating Text if Active */}
                {isActive && (
                    <div className="absolute top-4 text-center">
                        <div className="text-sanctuary-ink font-serif text-xs px-3 py-1 bg-white/60 rounded-full border border-sanctuary-border">
                            Internalizing {selectedSkill?.name}...
                        </div>
                    </div>
                )}
            </div>

            {/* Timer Display */}
            <div className="flex flex-col items-center justify-center w-full">
                <div className={`text-5xl font-sans font-light tracking-tighter ${isActive ? 'text-sanctuary-ink' : 'text-sanctuary-ink/30'}`}>
                    {formatTime(seconds)}
                </div>

                {/* Skill Selector */}
                <div className="mt-4 w-full max-w-xs">
                    <select
                        value={selectedSkillId}
                        onChange={(e) => onSkillChange(e.target.value)}
                        className="w-full bg-transparent border-none text-sanctuary-ink text-center font-serif italic text-lg focus:ring-0 focus:outline-none cursor-pointer"
                        disabled={isActive}
                    >
                        {skills.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Action Controls */}
            <div className="flex gap-4 w-full px-4">
                <button
                    onClick={onToggle}
                    className={`flex-1 py-3 rounded-full font-serif italic text-lg transition-all duration-300
                    ${isActive
                            ? 'bg-transparent border border-sanctuary-ink/20 text-sanctuary-ink hover:bg-sanctuary-ink/5'
                            : 'bg-sanctuary-ink text-sanctuary-paper hover:bg-sanctuary-inkLight shadow-soft'
                        }`}
                >
                    {isActive ? 'Pause Reflection' : 'Begin'}
                </button>

                {(isActive || (mode === 'STOPWATCH' && seconds > 0) || (mode === 'POMODORO' && seconds < POMODORO_DEFAULT)) && (
                    <button
                        onClick={onStop}
                        className="w-12 h-12 rounded-full border border-sanctuary-red/20 text-sanctuary-red hover:bg-sanctuary-red hover:text-white flex items-center justify-center transition-all duration-300"
                        title="Complete Session"
                    >
                        <i className="fa-solid fa-check"></i>
                    </button>
                )}
            </div>
        </div>
    );
};

export default FocusTimer;
