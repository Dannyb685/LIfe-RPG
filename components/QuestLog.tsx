
import React, { useState } from 'react';
import { Quest, QuestDifficulty, Skill } from '../types';
import { SKILL_DEFINITIONS } from '../constants';

interface QuestLogProps {
  quests: Quest[];
  skills: Skill[];
  onStartQuest: (questId: string) => void;
  onToggleStep: (questId: string, stepId: string) => void;
  onCompleteQuest: (questId: string) => void;
}

const QuestLog: React.FC<QuestLogProps> = ({ quests, skills, onStartQuest, onToggleStep, onCompleteQuest }) => {
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);

  const selectedQuest = quests.find(q => q.id === selectedQuestId);

  // Difficulty Colors
  const getDifficultyColor = (diff: QuestDifficulty) => {
      switch(diff) {
          case 'NOVICE': return 'text-green-500';
          case 'INTERMEDIATE': return 'text-yellow-500';
          case 'EXPERIENCED': return 'text-orange-500';
          case 'MASTER': return 'text-red-500';
          case 'GRANDMASTER': return 'text-purple-500';
          default: return 'text-gray-400';
      }
  };

  const getStatusColor = (status: string) => {
      if (status === 'COMPLETED') return 'text-green-500';
      if (status === 'IN_PROGRESS') return 'text-yellow-400';
      return 'text-red-500';
  };

  const handleComplete = () => {
      if (selectedQuest && selectedQuest.steps.every(s => s.completed)) {
          onCompleteQuest(selectedQuest.id);
      }
  };

  const isPrereqMet = (quest: Quest) => {
      if (!quest.prereqQuestId) return true;
      const prereq = quests.find(q => q.id === quest.prereqQuestId);
      return prereq?.status === 'COMPLETED';
  };

  return (
    <div className="flex flex-col md:flex-row h-full gap-4 max-w-6xl mx-auto pb-10">
        
        {/* LEFT: QUEST LIST */}
        <div className="flex-1 bg-[#362f2b] border-2 border-[#5d5447] shadow-osrs flex flex-col min-h-[400px]">
            {/* Header */}
            <div className="bg-[#2b2522] p-3 border-b border-[#5d5447] flex justify-between items-center">
                <h2 className="text-[#ff981f] font-bold text-lg drop-shadow-[1px_1px_0_#000]">
                    <i className="fa-solid fa-compass mr-2"></i> Quest List
                </h2>
                <div className="text-xs font-mono text-[#9a9a9a]">
                    CP: {quests.filter(q => q.status === 'COMPLETED').length} / {quests.length}
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-wood-light">
                {quests.map(quest => {
                    const met = isPrereqMet(quest);
                    return (
                        <div 
                            key={quest.id}
                            onClick={() => setSelectedQuestId(quest.id)}
                            className={`
                                p-2 mb-1 cursor-pointer font-bold text-sm transition-all select-none border border-transparent hover:bg-[#2b2522]
                                ${selectedQuestId === quest.id ? 'bg-[#1a1816] border-[#5d5447]' : ''}
                                ${!met ? 'opacity-50 grayscale' : ''}
                            `}
                        >
                            <div className="flex items-center justify-between">
                                <span className={`${getStatusColor(quest.status)} drop-shadow-sm`}>
                                    {quest.name}
                                </span>
                                {quest.status === 'COMPLETED' && <i className="fa-solid fa-check text-green-500 text-xs"></i>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* RIGHT: QUEST JOURNAL DETAILS */}
        <div className="flex-[2] bg-parchment-pattern border-4 border-[#3e3226] shadow-2xl relative flex flex-col">
             {/* Corner Screws */}
             <div className="absolute top-2 left-2 w-3 h-3 bg-[#8b7355] rounded-full shadow-inner border border-black/30"></div>
             <div className="absolute top-2 right-2 w-3 h-3 bg-[#8b7355] rounded-full shadow-inner border border-black/30"></div>
             <div className="absolute bottom-2 left-2 w-3 h-3 bg-[#8b7355] rounded-full shadow-inner border border-black/30"></div>
             <div className="absolute bottom-2 right-2 w-3 h-3 bg-[#8b7355] rounded-full shadow-inner border border-black/30"></div>

             {selectedQuest ? (
                 <div className="p-8 h-full overflow-y-auto font-sans text-[#2c241b]">
                     {/* Title */}
                     <div className="text-center border-b-2 border-[#2c241b] pb-4 mb-4">
                         <h1 className="text-3xl font-fantasy font-bold">{selectedQuest.name}</h1>
                         <div className={`font-bold uppercase text-xs mt-1 ${getDifficultyColor(selectedQuest.difficulty)}`}>
                             {selectedQuest.difficulty}
                         </div>
                     </div>

                     {/* Prerequisite Warning */}
                     {!isPrereqMet(selectedQuest) && (
                         <div className="bg-red-900/10 border border-red-800/30 p-2 text-center text-red-800 font-bold mb-4 text-sm">
                             Requires Completion of: {quests.find(q => q.id === selectedQuest.prereqQuestId)?.name}
                         </div>
                     )}

                     {/* Start Button */}
                     {selectedQuest.status === 'NOT_STARTED' && isPrereqMet(selectedQuest) && (
                         <div className="text-center mb-6">
                             <p className="italic mb-4 text-sm px-8">"{selectedQuest.description}"</p>
                             <button 
                                onClick={() => onStartQuest(selectedQuest.id)}
                                className="bg-[#701414] text-white px-6 py-2 font-bold border-2 border-[#4a0d0d] hover:brightness-110 shadow-lg active:translate-y-1"
                             >
                                 Start Quest
                             </button>
                         </div>
                     )}

                     {/* Journal Content */}
                     {selectedQuest.status !== 'NOT_STARTED' && (
                         <div className="space-y-6">
                             <div className="text-sm italic text-center text-[#5c4033] bg-[#00000005] p-3 rounded">
                                 {selectedQuest.description}
                             </div>

                             {/* Steps */}
                             <div>
                                 <h3 className="font-bold border-b border-[#2c241b] mb-2 uppercase text-xs tracking-wider">Objectives</h3>
                                 <div className="space-y-2">
                                     {selectedQuest.steps.map(step => (
                                         <div 
                                            key={step.id}
                                            onClick={() => {
                                                if (selectedQuest.status !== 'COMPLETED') {
                                                    onToggleStep(selectedQuest.id, step.id);
                                                }
                                            }}
                                            className={`
                                                flex items-start gap-3 p-2 rounded cursor-pointer transition-all
                                                ${step.completed ? 'line-through text-gray-500' : 'text-[#2c241b] hover:bg-black/5'}
                                            `}
                                         >
                                             <div className={`w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${step.completed ? 'border-green-600 bg-green-100' : 'border-[#2c241b]'}`}>
                                                 {step.completed && <i className="fa-solid fa-check text-green-700 text-xs"></i>}
                                             </div>
                                             <span>{step.description}</span>
                                         </div>
                                     ))}
                                 </div>
                             </div>

                             {/* Rewards */}
                             <div className="bg-[#00000005] p-4 border border-[#2c241b]/20">
                                 <h3 className="font-bold mb-2 uppercase text-xs tracking-wider text-center">Rewards</h3>
                                 <div className="grid grid-cols-2 gap-2 text-sm">
                                     {selectedQuest.rewards.map((reward, idx) => {
                                         const skillDef = SKILL_DEFINITIONS[Object.keys(SKILL_DEFINITIONS).find(k => SKILL_DEFINITIONS[k].id === reward.skill) || ''];
                                         return (
                                             <div key={idx} className="flex items-center gap-2">
                                                 {reward.skill && skillDef && <i className={`fa-solid ${skillDef.icon} w-4 text-center`}></i>}
                                                 {reward.gold && <i className="fa-solid fa-coins text-yellow-600 w-4 text-center"></i>}
                                                 {reward.item && <i className="fa-solid fa-gift text-purple-600 w-4 text-center"></i>}
                                                 
                                                 <span>
                                                     {reward.xp > 0 && `+${reward.xp} ${skillDef?.name} XP`}
                                                     {reward.gold && `+${reward.gold} Gold`}
                                                     {reward.item}
                                                 </span>
                                             </div>
                                         );
                                     })}
                                 </div>
                             </div>

                             {/* Finish Button */}
                             {selectedQuest.status === 'IN_PROGRESS' && selectedQuest.steps.every(s => s.completed) && (
                                 <div className="text-center pt-4">
                                     <button 
                                        onClick={handleComplete}
                                        className="bg-green-700 text-white px-8 py-3 font-bold border-2 border-green-900 hover:brightness-110 shadow-lg active:translate-y-1 text-lg animate-pulse"
                                     >
                                         COMPLETE QUEST
                                     </button>
                                 </div>
                             )}
                             
                             {selectedQuest.status === 'COMPLETED' && (
                                 <div className="text-center font-bold text-green-700 text-xl font-fantasy border-2 border-green-700 p-2">
                                     QUEST COMPLETE!
                                 </div>
                             )}
                         </div>
                     )}
                 </div>
             ) : (
                 <div className="flex items-center justify-center h-full text-[#5c4033] italic">
                     Select a quest from the list to view details...
                 </div>
             )}
        </div>
    </div>
  );
};

export default QuestLog;
