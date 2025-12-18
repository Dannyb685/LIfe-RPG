
import React, { useMemo } from 'react';
import { GameState, Buff } from '../types';
import SkillCard from './SkillCard';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface DashboardProps {
  gameState: GameState;
  searchTerm: string;
  buffs: Buff[];
  onToggleBuff: (id: string) => void;
  combatLevel?: { level: number, class: string }; // New Prop
}

const Dashboard: React.FC<DashboardProps> = ({ gameState, searchTerm, buffs, onToggleBuff, combatLevel }) => {
  
  // Stats derived from full state (unfiltered)
  const totalLevels = useMemo(() => 
    gameState.skills.reduce((acc, skill) => acc + skill.level, 0), 
    [gameState.skills]
  );

  // Filter skills for display
  const visibleSkills = useMemo(() => {
    if (!searchTerm) return gameState.skills;
    const lowerTerm = searchTerm.toLowerCase();
    return gameState.skills.filter(skill => 
        skill.name.toLowerCase().includes(lowerTerm)
    );
  }, [gameState.skills, searchTerm]);

  const chartData = useMemo(() => 
    visibleSkills.map(s => ({
        name: s.name,
        xp: s.currentXp,
        color: s.color.replace('text-', 'bg-').replace('-500', '-600').replace('-400', '-500')
    })),
  [visibleSkills]);

  const activeMultiplier = buffs.filter(b => b.active).reduce((acc, b) => acc * b.multiplier, 1);

  return (
    <div className="space-y-8 pb-10">
      
      {/* Hero Stats (Always Global) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Combat Level Badge (New) */}
        <div className="bg-[#3e3226] p-4 rounded-sm border-2 border-[#cc2222] shadow-osrs flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-red-900/10 pointer-events-none"></div>
            <div className="relative z-10">
                <div className="text-[#cc2222] text-xs uppercase tracking-widest mb-1 drop-shadow-text font-bold">Combat Level</div>
                <div className="flex items-center justify-center gap-2">
                    <i className="fa-solid fa-khanda text-2xl text-white"></i>
                    <span className="text-5xl font-black text-white drop-shadow-text-lg">{combatLevel?.level || 3}</span>
                </div>
                <div className="text-[#dcdcdc] text-xs uppercase font-mono mt-1 opacity-80">{combatLevel?.class || 'Adventurer'}</div>
            </div>
            {/* Corner rivets */}
            <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-[#8b7355] rounded-full shadow-inner"></div>
            <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#8b7355] rounded-full shadow-inner"></div>
            <div className="absolute bottom-1 left-1 w-1.5 h-1.5 bg-[#8b7355] rounded-full shadow-inner"></div>
            <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-[#8b7355] rounded-full shadow-inner"></div>
        </div>

        <div className="bg-wood-pattern p-6 rounded-sm border-2 border-osrs-border shadow-osrs flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
            <div className="relative z-10">
                <div className="text-[#dcdcdc] text-sm uppercase tracking-widest mb-1 drop-shadow-text">Total Level</div>
                <div className="text-5xl font-black text-white drop-shadow-text-lg">{totalLevels}</div>
            </div>
        </div>
        
        <div className="bg-wood-pattern p-6 rounded-sm border-2 border-osrs-border shadow-osrs flex flex-col items-center justify-center text-center relative overflow-hidden">
             <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
             <div className="relative z-10">
                <div className="text-[#dcdcdc] text-sm uppercase tracking-widest mb-1 drop-shadow-text">Total XP</div>
                <div className="text-4xl font-bold text-osrs-gold font-mono drop-shadow-text-lg">{gameState.totalXp.toLocaleString()}</div>
            </div>
        </div>
        
        <div className="bg-wood-pattern p-6 rounded-sm border-2 border-osrs-border shadow-osrs flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
            <div className="relative z-10">
                <div className="text-[#dcdcdc] text-sm uppercase tracking-widest mb-1 drop-shadow-text">Tasks Done</div>
                <div className="text-4xl font-bold text-green-500 drop-shadow-text-lg">
                    {gameState.tasks.filter(t => t.completed).length} / {gameState.tasks.length}
                </div>
            </div>
        </div>
      </div>

      {/* Active Buffs Section */}
      <div className="bg-wood-dark rounded-sm border-2 border-osrs-border p-6 shadow-[2px_2px_0_rgba(0,0,0,0.5)]">
        <div className="flex justify-between items-center mb-4 border-b border-[#5d5447] pb-2">
            <h2 className="text-xl font-bold text-[#ff981f] flex items-center gap-2 drop-shadow-text">
                <i className="fa-solid fa-bolt"></i> Active Boosts
            </h2>
            <div className="bg-wood-black px-3 py-1 rounded border border-[#5d5447] text-xs font-mono text-[#9a9a9a]">
                Current Multiplier: <span className="text-[#00ff00] font-bold">x{activeMultiplier.toFixed(2)}</span>
            </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {buffs.map(buff => (
                <div 
                    key={buff.id}
                    onClick={() => onToggleBuff(buff.id)}
                    className={`flex items-center gap-4 p-3 rounded-sm border-2 cursor-pointer transition-all duration-200 select-none relative overflow-hidden ${
                        buff.active 
                        ? 'bg-wood-pattern border-[#ffff00] shadow-[inset_0_0_10px_rgba(255,255,0,0.2)]' 
                        : 'bg-[#2b2522] border-[#4a3f35] opacity-70 hover:opacity-100 hover:border-[#8b7355]'
                    }`}
                >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 shadow-inner ${
                         buff.active ? `${buff.color} border-[#ffff00] bg-wood-black` : 'text-gray-500 border-[#5d5447] bg-[#1a1816]'
                    }`}>
                        <i className={`fa-solid ${buff.icon}`}></i>
                    </div>
                    <div>
                        <div className={`font-bold text-sm drop-shadow-md ${buff.active ? 'text-white' : 'text-[#9a9a9a]'}`}>{buff.name}</div>
                        <div className="text-xs text-[#00ff00] font-mono">{buff.description}</div>
                    </div>
                    {buff.active && (
                         <div className="ml-auto">
                            <i className="fa-solid fa-check-circle text-[#ffff00] drop-shadow-md"></i>
                         </div>
                    )}
                </div>
            ))}
        </div>
      </div>

      {/* Skills Grid */}
      <div>
        <h2 className="text-2xl font-bold text-wood-dark mb-4 border-b-2 border-wood-dark pb-2 flex justify-between items-end">
            <span><i className="fa-solid fa-shield-halved mr-2"></i> Skills Overview</span>
            {searchTerm && <span className="text-xs text-wood-light font-bold font-sans">Showing {visibleSkills.length} results</span>}
        </h2>
        {visibleSkills.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleSkills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
            ))}
            </div>
        ) : (
            <div className="text-wood-light italic py-8 text-center bg-wood-pattern/10 rounded border-2 border-dashed border-wood-dark">
                No skills match your search.
            </div>
        )}
      </div>

       {/* Simple XP Visualization */}
       <div className="bg-[#2b2522] border-2 border-osrs-border rounded-sm p-6 shadow-osrs">
            <h2 className="text-xl font-bold text-[#ff981f] mb-4 drop-shadow-text">XP Distribution {searchTerm && '(Filtered)'}</h2>
            <div className="h-64 w-full bg-[#1a1816] border border-[#5d5447] p-2 shadow-inner">
                {visibleSkills.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <XAxis dataKey="name" stroke="#9a9a9a" fontSize={10} tickLine={false} axisLine={false} interval={0} />
                            <YAxis stroke="#9a9a9a" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#3e3226', borderColor: '#5d5447', color: '#dcdcdc', fontFamily: 'monospace' }}
                                cursor={{fill: 'rgba(255,255,255,0.05)'}}
                            />
                            <Bar dataKey="xp" radius={[2, 2, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#ff981f' : '#00ff00'} stroke="#000" strokeWidth={1} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-[#5d5447]">
                        No data to display
                    </div>
                )}
            </div>
       </div>
    </div>
  );
};

export default Dashboard;
