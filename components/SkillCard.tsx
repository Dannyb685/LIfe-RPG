
import React from 'react';
import { Skill } from '../types';

interface SkillCardProps {
  skill: Skill;
}

const SkillCard: React.FC<SkillCardProps> = ({ skill }) => {
  // Mastery Logic
  const isMastered = skill.level >= 99;

  return (
    <div className={`bg-[#362f2b] border-2 rounded-sm p-3 flex items-center gap-4 relative overflow-hidden group hover:brightness-110 transition-all cursor-default shadow-osrs ${isMastered ? 'border-[#ffff00]' : 'border-[#5d5447]'}`}>
      {/* Background Texture Overlay */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] pointer-events-none"></div>

      {/* Mastery Glow */}
      {isMastered && (
          <div className="absolute inset-0 bg-yellow-500/10 pointer-events-none animate-pulse"></div>
      )}

      {/* Large Level Indicator (Right Side) */}
      <div className="absolute right-2 top-0 bottom-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity">
        <span className="text-8xl font-black text-white">{skill.level}</span>
      </div>

      {/* Icon */}
      <div className={`w-14 h-14 rounded-full bg-[#1a1816] border-2 flex items-center justify-center text-2xl shadow-inner z-10 relative
          ${isMastered ? 'border-[#ffff00] text-[#ffff00] drop-shadow-[0_0_5px_rgba(255,255,0,0.8)]' : `${skill.color} border-[#5d5447]`}`}>
        <i className={`fa-solid ${skill.icon}`}></i>
        
        {/* Level Badge Overlay */}
        <div className={`absolute -bottom-2 -right-2 border rounded text-xs font-bold px-1.5 py-0.5 shadow-md
            ${isMastered ? 'bg-[#ffff00] text-black border-black' : 'bg-[#1a1816] border-[#5d5447] text-[#ff981f]'}`}>
            {isMastered ? '99' : 'Lvl'}
        </div>
      </div>

      {/* Info Column */}
      <div className="flex-1 z-10 flex flex-col justify-center h-full">
        <div className="flex justify-between items-end mb-1">
          <h3 className={`font-bold text-lg uppercase tracking-wider drop-shadow-md flex items-center gap-2 ${isMastered ? 'text-[#ffff00]' : 'text-[#dcdcdc]'}`}>
              {skill.name}
              {/* Skill Cape Icon */}
              {isMastered && <span title="Skill Cape Unlocked!" className="text-xl">👘</span>}
          </h3>
          <span className={`${isMastered ? 'text-[#00ff00]' : 'text-[#ffff00]'} font-bold text-2xl drop-shadow-[1px_1px_0_#000]`}>
              {skill.level}
          </span>
        </div>
        
        {/* OSRS Style Progress Bar */}
        <div className="w-full h-4 bg-[#1a1816] border border-[#5d5447] relative">
          <div 
            className={`h-full ${isMastered ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' : 'bg-gradient-to-b from-[#00ff00] to-[#008800]'}`}
            style={{ width: `${Math.min(100, (skill.currentXp / skill.xpForNextLevel) * 100)}%` }}
          />
        </div>
        
        {/* Stats or Perk */}
        <div className="flex justify-between text-[10px] font-mono text-[#9a9a9a] mt-1 relative">
            {isMastered && skill.perk ? (
                <div className="w-full text-center text-[#00ff00] font-bold animate-pulse">
                    PERK: {skill.perk}
                </div>
            ) : (
                <>
                    <span>{skill.currentXp.toLocaleString()} XP</span>
                    <span>Next: {skill.xpForNextLevel.toLocaleString()}</span>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default SkillCard;
