
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GameState, Buff, BuildingDef, Task, GridItem, LifeRPGData, TownEvent, Enemy, DailyStats, Quest, Skill } from './types';
import { AVAILABLE_BUFFS, getLevelFromXp, getXpForLevel, SKILL_DECAY_RATES, BUILDINGS, HABIT_DEFINITIONS, QUEST_DEFINITIONS } from './constants';
import { parseVault } from './services/markdownService';
import { saveGameData, loadGameData } from './services/persistenceService';
import Dashboard from './components/Dashboard';
import TaskList from './components/TaskList';
import Settings from './components/Settings';
import HomeBase from './components/HomeBase';
import FocusTimer from './components/FocusTimer';
import LootPopup from './components/LootPopup';
import HistoryCalendar from './components/HistoryCalendar'; 
import QuestLog from './components/QuestLog';

// Props passed from main.ts
interface AppProps {
    app: any; // Obsidian App
    plugin: any; // LifeRPGPlugin
}

enum Tab {
  DASHBOARD = 'DASHBOARD',
  TASKS = 'TASKS', 
  BASE = 'BASE',
  FOCUS = 'FOCUS',
  HISTORY = 'HISTORY',
  SETTINGS = 'SETTINGS',
  STORY = 'STORY'
}

const NAV_ITEMS = [
    { tab: Tab.DASHBOARD, label: 'Dashboard', img: 'https://oldschool.runescape.wiki/images/Compass.png' },
    { tab: Tab.FOCUS, label: 'Training', img: 'https://oldschool.runescape.wiki/images/Stats_icon.png' },
    { tab: Tab.BASE, label: 'Home Base', img: 'https://oldschool.runescape.wiki/images/Construction_icon.png' },
    { tab: Tab.STORY, label: 'Quest Journal', img: 'https://oldschool.runescape.wiki/images/Quest_point_icon.png' },
    { tab: Tab.TASKS, label: 'Daily Log', img: 'https://oldschool.runescape.wiki/images/Skills_icon.png' },
    { tab: Tab.HISTORY, label: 'Chronicle', img: 'https://oldschool.runescape.wiki/images/Achievement_Diaries_icon.png' },
    { tab: Tab.SETTINGS, label: 'Settings', img: 'https://oldschool.runescape.wiki/images/Settings_icon.png' }
];

const POMODORO_DEFAULT = 25 * 60;

// Simple Audio Synthesizer
const playTone = (type: 'start' | 'pause' | 'complete', enabled: boolean) => {
    if (!enabled) return;
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    if (type === 'start') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1000, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    } else if (type === 'pause') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(300, now + 0.15);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
    } else if (type === 'complete') {
        const notes = [440, 554, 659, 880];
        notes.forEach((freq, i) => {
             const o = ctx.createOscillator();
             const g = ctx.createGain();
             o.connect(g);
             g.connect(ctx.destination);
             o.type = 'square'; 
             o.frequency.value = freq;
             const startTime = now + (i * 0.15);
             g.gain.setValueAtTime(0, startTime);
             g.gain.linearRampToValueAtTime(0.05, startTime + 0.05);
             g.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
             o.start(startTime);
             o.stop(startTime + 0.4);
        });
    }
};

// --- Combat Level Calculator ---
export const calculateCombatLevel = (skills: Skill[]): { level: number, class: string } => {
    const getLevel = (id: string) => skills.find(s => s.id === id)?.level || 1;
    
    const hp = getLevel('hitpoints');
    const social = getLevel('social');
    const strength = getLevel('strength');
    const tech = getLevel('dungeoneering'); 
    const intellect = getLevel('knowledge'); 

    const lifeSkillIds = ['cooking', 'farming', 'crafting', 'scout', 'writing', 'art', 'music', 'language', 'research'];
    const lifeLevels = lifeSkillIds.map(id => getLevel(id));
    const lifeScore = Math.floor((lifeLevels.reduce((a, b) => a + b, 0) / Math.max(1, lifeLevels.length)));

    const base = (hp + social + Math.floor(lifeScore / 2)) / 4;

    const melee = strength * 2; 
    const mage = 1.5 * tech;
    const range = 1.5 * intellect;

    const maxOffense = Math.max(melee, mage, range);
    
    const level = base + (0.325 * maxOffense);

    let archetype = 'Adventurer';
    if (maxOffense === melee) archetype = 'Warrior';
    else if (maxOffense === mage) archetype = 'Mage';
    else if (maxOffense === range) archetype = 'Ranger';

    return { level: Math.floor(level), class: archetype };
};

const App: React.FC<AppProps> = ({ app, plugin }) => {
  // State
  const [rawFiles, setRawFiles] = useState<Record<string, string> | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [persistentData, setPersistentData] = useState<LifeRPGData | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'info' | 'decay'} | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [buffs, setBuffs] = useState<Buff[]>(AVAILABLE_BUFFS);
  
  const [lootEvent, setLootEvent] = useState<{visible: boolean, amount: number, message: string, icon: string} | null>(null);
  const [activeEvent, setActiveEvent] = useState<TownEvent | null>(null);
  const [combatLevel, setCombatLevel] = useState({ level: 3, class: 'Adventurer' });

  // Settings
  const [defaultXpReward, setDefaultXpReward] = useState<number>(5);
  const [goldMultiplier, setGoldMultiplier] = useState<number>(1);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Timer
  const [timerActive, setTimerActive] = useState(false);
  const [timerMode, setTimerMode] = useState<'POMODORO' | 'STOPWATCH'>('POMODORO');
  const [timerSeconds, setTimerSeconds] = useState(POMODORO_DEFAULT);
  const [timerSkillId, setTimerSkillId] = useState<string>('');
  
  const initialLoadComplete = useRef(false);

  // --- 1. INITIAL LOAD & FILE WATCHING ---
  useEffect(() => {
      const loadAllData = async () => {
          const data = await loadGameData(plugin);
          setPersistentData(data);
          
          setDefaultXpReward(data.settings.defaultXp);
          setGoldMultiplier(data.settings.goldMultiplier);
          setSoundEnabled(data.settings.soundEnabled);
          
          if (data.activeBuffs) {
            setBuffs(prev => prev.map(b => ({ ...b, active: data.activeBuffs.includes(b.id) })));
          }

          await refreshFiles();
          initialLoadComplete.current = true;
      };

      loadAllData();

      const onModify = app.vault.on('modify', async (file: any) => {
          if (file.path && (file.path.endsWith('.md') || file.path === 'QUESTS.md')) {
             await refreshFiles();
          }
      });
      
      const onCreate = app.vault.on('create', () => refreshFiles());
      const onDelete = app.vault.on('delete', () => refreshFiles());

      return () => {
          app.vault.offref(onModify);
          app.vault.offref(onCreate);
          app.vault.offref(onDelete);
      };
  }, [app, plugin]);

  const refreshFiles = async () => {
      const files = app.vault.getMarkdownFiles();
      const fileData: Record<string, string> = {};
      const statsMap: Record<string, DailyStats> = {};

      await Promise.all(files.map(async (file: any) => {
          const content = await app.vault.read(file);
          fileData[file.path] = content;
          
          const dateMatch = file.name.match(/(\d{4}-\d{2}-\d{2})/);
          if (dateMatch) {
              const date = dateMatch[1];
              const xpMatches = content.match(/\+(\d+)\s*XP/g);
              let xp = 0;
              if (xpMatches) {
                  xp = xpMatches.reduce((acc: number, m: string) => acc + parseInt(m.match(/\d+/)[0]), 0);
              }
              const habitMatches = content.match(/([a-zA-Z_]+)::\s*(\d+)/g);
              if (habitMatches) {
                  habitMatches.forEach((h: string) => {
                      const parts = h.split('::');
                      if (parseInt(parts[1]) > 0) xp += 10; 
                  });
              }

              if (xp > 0) {
                  statsMap[date] = { date, totalXp: xp, tasksCompleted: 0, primarySkill: 'General' };
              }
          }
      }));
      
      setRawFiles(fileData);
      setDailyStats(Object.values(statsMap).sort((a,b) => a.date.localeCompare(b.date)));
  };

  // --- 2. GAME LOGIC & PARSING ---
  useEffect(() => {
      if (!rawFiles || !persistentData) return;

      const data = parseVault(rawFiles, defaultXpReward);
      
      if (!timerSkillId && data.skills.length > 0) {
          setTimerSkillId(data.skills[0].id);
      }

      const cb = calculateCombatLevel(data.skills);
      setCombatLevel(cb);

      const now = Date.now();
      let decayDebt = { ...persistentData.decayDebt };
      let skillUpdateMap = { ...persistentData.skillUpdateMap };
      let totalDecayedXp = 0;
      let decayMessageParts: string[] = [];

      data.skills.forEach(skill => {
          if (!skillUpdateMap[skill.name]) skillUpdateMap[skill.name] = now;
          const lastTime = skillUpdateMap[skill.name];
          const hoursPassed = (now - lastTime) / (1000 * 60 * 60);

          if (hoursPassed > 1) {
              const rate = SKILL_DECAY_RATES[skill.name] ?? SKILL_DECAY_RATES['Default'];
              const loss = Math.floor(rate * hoursPassed);
              if (loss > 0) {
                  const currentTotal = skill.currentXp;
                  const currentDebt = decayDebt[skill.name] || 0;
                  const potentialDebt = currentDebt + loss;
                  decayDebt[skill.name] = Math.min(potentialDebt, currentTotal);
                  totalDecayedXp += loss;
                  if (loss > 5) decayMessageParts.push(`${skill.name} -${loss}`);
                  skillUpdateMap[skill.name] = now;
              }
          }
      });

      let adjustedTotalXp = 0;
      const adjustedSkills = data.skills.map(skill => {
          const debt = decayDebt[skill.name] || 0;
          const newXp = Math.max(0, skill.currentXp - debt);
          const newLevel = getLevelFromXp(newXp);
          const newNextLevel = getXpForLevel(newLevel + 1);
          adjustedTotalXp += newXp;
          return { ...skill, currentXp: newXp, level: newLevel, xpForNextLevel: newNextLevel };
      });

      let currentGold = persistentData.gold;
      const isDefaultLayout = persistentData.baseLayout.length <= 3 && persistentData.baseLayout.some(i => i.id === 'starter_house');
      
      if (currentGold === 0 && adjustedTotalXp > 50 && isDefaultLayout) {
          currentGold = adjustedTotalXp;
      }

      const sourceQuests = data.quests.length > 0 ? data.quests : QUEST_DEFINITIONS;
      const mergedQuests: Quest[] = sourceQuests.map(def => {
          const saved = persistentData.quests && persistentData.quests[def.id];
          if (def.status === 'COMPLETED') return def;
          if (saved) return { ...def, status: saved.status };
          return def;
      });

      setGameState({
          ...data,
          skills: adjustedSkills,
          totalXp: adjustedTotalXp,
          gold: currentGold, 
          baseLayout: persistentData.baseLayout.length > 0 ? persistentData.baseLayout : data.baseLayout,
          quests: mergedQuests
      });

      if (totalDecayedXp > 0 && initialLoadComplete.current) {
         const msg = decayMessageParts.length > 2 
            ? `Entropy set in... You lost ${totalDecayedXp} XP.`
            : `Atrophy: ${decayMessageParts.join(', ')} XP`;
         if (decayMessageParts.length > 0) setTimeout(() => showNotification(msg, 'decay'), 1000);
         saveGameData(plugin, { decayDebt, skillUpdateMap });
      }

  }, [rawFiles, persistentData, defaultXpReward]);

  // --- 3. AUTO-SAVE & SYNC ---
  useEffect(() => {
      if (!gameState || !initialLoadComplete.current) return;
      
      const questMap: Record<string, Quest> = {};
      gameState.quests.forEach(q => {
          if (q.status !== 'NOT_STARTED') {
              questMap[q.id] = q;
          }
      });

      const saveData = {
          gold: gameState.gold,
          baseLayout: gameState.baseLayout,
          activeBuffs: buffs.filter(b => b.active).map(b => b.id),
          quests: questMap
      };
      
      saveGameData(plugin, saveData);
      setPersistentData(prev => prev ? { ...prev, ...saveData } : null);
  }, [gameState?.gold, gameState?.baseLayout, gameState?.quests, buffs]);

  // --- 4. GLOBAL GAME LOOP ---
  useEffect(() => {
    if (!gameState) return;
    const interval = setInterval(() => {
        const now = Date.now();
        if (activeEvent && activeEvent.expiresAt && now > activeEvent.expiresAt) {
            if (activeEvent.type === 'RAID') {
                 const loss = Math.floor(gameState.gold * 0.1);
                 handleDeductGold(loss);
                 showNotification(`Defenses failed! Raiders stole ${loss} gold.`, 'decay');
            }
            setActiveEvent(null);
            return;
        }
        if (!activeEvent && Math.random() < 0.02 && gameState.baseLayout.length > 3) {
             const rand = Math.random();
             let enemyType: any = 'GOBLIN';
             if (rand > 0.90) enemyType = 'DRAGON';
             else if (rand > 0.70) enemyType = 'BANDIT';
             
             let xpReq = 150; // Increased requirement to account for troop dps
             let duration = 1000 * 60 * 60 * 2; 
             if (enemyType === 'DRAGON') { xpReq = 500; duration = 1000 * 60 * 60 * 4; }
             
             const newEnemy: Enemy = {
                  id: `enemy-${Date.now()}`,
                  name: enemyType,
                  level: 5, hp: 100, maxHp: 100, type: enemyType, drops: 100, attack: 5, defense: 5
             };
             
             setActiveEvent({ 
                 message: `Approaching Threat: ${newEnemy.name}!`, 
                 type: 'RAID', 
                 active: true, 
                 enemyData: newEnemy,
                 requiredXp: xpReq,
                 currentXp: 0,
                 expiresAt: Date.now() + duration
             });
             playTone('start', soundEnabled);
        }

    }, 10000); 
    return () => clearInterval(interval);
  }, [gameState, activeEvent]);

  // --- HANDLERS ---
  const injectDailyTemplate = async () => {
      const activeFile = app.workspace.getActiveFile();
      if (!activeFile) {
          showNotification("No active file to insert template into.", "info");
          return;
      }
      let template = `\n\n## Daily Habits\n`;
      HABIT_DEFINITIONS.forEach(h => { template += `${h.key}:: 0\n`; });
      template += `\n## Tasks\n- [ ] Task 1 (+10 XP) #General\n`;
      try {
          await app.vault.process(activeFile, (data: string) => data + template);
          showNotification("Template inserted!", "success");
      } catch (e) {
          console.error("Failed to insert template", e);
      }
  };

  const contributeToDefense = (xpAmount: number) => {
      setActiveEvent(prev => {
          if (prev && prev.type === 'RAID' && prev.requiredXp) {
              const newCurrent = (prev.currentXp || 0) + xpAmount;
              if (newCurrent >= prev.requiredXp) {
                   const reward = prev.enemyData ? prev.enemyData.drops : 50;
                   handleLootDrop(reward, "Threat Neutralized!");
                   playTone('complete', soundEnabled);
                   return null;
              } else {
                   return { ...prev, currentXp: newCurrent };
              }
          }
          return prev;
      });
  };

  const handleBuild = (x: number, y: number, building: BuildingDef) => {
      if (!gameState) return;
      if (gameState.gold < building.cost) { 
          showNotification(`Not enough gold! Need ${building.cost}gp`, 'info'); 
          return; 
      }
      setGameState(prev => {
          if (!prev) return null;
          if (prev.baseLayout.some(i => i.x === x && i.y === y)) return prev;
          return { ...prev, gold: prev.gold - building.cost, baseLayout: [...prev.baseLayout, { x, y, buildingId: building.id, id: `build-${Date.now()}` }] };
      });
      playTone('start', soundEnabled);
  };

  const handleUpdateBuilding = (x: number, y: number, changes: Partial<GridItem>) => {
      if (!gameState) return;
      setGameState(prev => {
          if (!prev) return null;
          return { ...prev, baseLayout: prev.baseLayout.map(item => (item.x === x && item.y === y) ? { ...item, ...changes } : item) };
      });
  };

  const handleRemoveBuilding = (x: number, y: number) => {
    if (!gameState) return;
    setGameState(prev => {
        if (!prev) return null;
        return { ...prev, baseLayout: prev.baseLayout.filter(i => !(i.x === x && i.y === y)) };
    });
  };

  const handleCollectTaxes = (amount: number) => {
     if (!gameState) return;
     setGameState(prev => {
         if (!prev) return null;
         return { ...prev, gold: prev.gold + amount }
     });
     showNotification(`Collected ${amount} gold!`, 'success');
  };

  const handleDeductGold = (amount: number) => {
      if (!gameState) return;
      setGameState(prev => {
          if (!prev) return null;
          return { ...prev, gold: Math.max(0, prev.gold - amount) };
      });
  };

  const handleLootDrop = (amount: number, message: string) => {
      if (!gameState) return;
      const finalAmount = Math.floor(amount * goldMultiplier);
      setGameState(prev => {
          if (!prev) return null;
          return { ...prev, gold: prev.gold + finalAmount }
      });
      setLootEvent({ visible: true, amount: finalAmount, message: message, icon: amount >= 500 ? 'fa-gem' : 'fa-coins' });
      setTimeout(() => setLootEvent(null), 3500);
  };

  const handleToggleBuff = (buffId: string) => {
    setBuffs(prev => prev.map(b => b.id === buffId ? { ...b, active: !b.active } : b));
  };

  const handleSaveSettings = (newXp: number, newGoldMult: number, newSound: boolean) => {
    setDefaultXpReward(newXp);
    setGoldMultiplier(newGoldMult);
    setSoundEnabled(newSound);
    saveGameData(plugin, { settings: { defaultXp: newXp, goldMultiplier: newGoldMult, soundEnabled: newSound } });
    showNotification('Settings saved.', 'success');
  };

  const handleSessionComplete = async (seconds: number, skillId: string, mode: 'POMODORO' | 'STOPWATCH') => {
      const minutes = seconds / 60;
      let baseXP = minutes * 2;
      let bonusMultiplier = 1;
      if (minutes >= 20) bonusMultiplier = 1.2;
      const totalXpReward = Math.floor(baseXP * bonusMultiplier);
      const goldReward = Math.floor(totalXpReward * goldMultiplier);
      const skillName = gameState?.skills.find(s => s.id === skillId)?.name || 'General';
      setGameState(prev => prev ? { ...prev, gold: prev.gold + goldReward } : null);
      contributeToDefense(totalXpReward);

      if (plugin && plugin.app && plugin.app.vault) {
          try {
              const today = new Date().toISOString().split('T')[0];
              let targetFile = plugin.app.vault.getAbstractFileByPath(`${today}.md`);
              if (!targetFile) targetFile = plugin.app.vault.getAbstractFileByPath(`Daily Notes/${today}.md`);
              if (!targetFile) targetFile = plugin.app.workspace.getActiveFile();
              if (targetFile) {
                  const logLine = `\n- [x] 🍅 Session: ${skillName} (+${totalXpReward} XP, +${goldReward}gp) #TimeTracking`;
                  await plugin.app.vault.process(targetFile, (data: string) => data + logLine);
                  showNotification(`Logged to ${targetFile.name}`, 'success');
              }
          } catch (e) { console.error("Failed to sync timer", e); }
      }
      showNotification(`Session Ended: +${goldReward} Gold`, 'success');
  };
  
  const handleToggleTimer = () => {
      if (timerActive) { playTone('pause', soundEnabled); setTimerActive(false); } 
      else { playTone('start', soundEnabled); setTimerActive(true); }
  };
  const handleStopTimer = () => {
      setTimerActive(false);
      const duration = timerMode === 'POMODORO' ? POMODORO_DEFAULT - timerSeconds : timerSeconds;
      if (duration > 5) { handleSessionComplete(duration, timerSkillId, timerMode); playTone('complete', soundEnabled); }
      if (timerMode === 'POMODORO') setTimerSeconds(POMODORO_DEFAULT); else setTimerSeconds(0);
  };
  const handleTimerModeChange = (mode: 'POMODORO' | 'STOPWATCH') => {
      setTimerActive(false); setTimerMode(mode);
      if (mode === 'POMODORO') setTimerSeconds(POMODORO_DEFAULT); else setTimerSeconds(0);
  };

  const handleToggleTask = (taskId: string) => {
      if (!gameState) return;
      const task = gameState.tasks.find(t => t.id === taskId);
      if (task && !task.completed) {
          contributeToDefense(task.xpReward || 5);
      }
      setGameState(prev => {
          if (!prev) return null;
          const tasks = prev.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
          return { ...prev, tasks };
      });
  };

  const handleStartQuest = (questId: string) => {
      if (!gameState) return;
      setGameState(prev => {
          if (!prev) return null;
          return { ...prev, quests: prev.quests.map(q => q.id === questId ? { ...q, status: 'IN_PROGRESS' } : q) };
      });
      playTone('start', soundEnabled);
  };

  const handleToggleQuestStep = (questId: string, stepId: string) => {
      if (!gameState) return;
      setGameState(prev => {
          if (!prev) return null;
          const quests = prev.quests.map(q => {
              if (q.id !== questId) return q;
              return { ...q, steps: q.steps.map(s => s.id === stepId ? { ...s, completed: !s.completed } : s) };
          });
          return { ...prev, quests };
      });
  };

  const handleCompleteQuest = (questId: string) => {
      if (!gameState) return;
      const quest = gameState.quests.find(q => q.id === questId);
      if (!quest) return;
      let totalGold = 0;
      let rewardText = "Quest Complete! ";
      const newSkills = [...gameState.skills];
      quest.rewards.forEach(r => {
          if (r.gold) totalGold += r.gold;
          if (r.xp > 0 && r.skill) {
              const sIndex = newSkills.findIndex(s => s.id === r.skill);
              if (sIndex > -1) {
                  const s = newSkills[sIndex];
                  s.currentXp += r.xp;
                  s.level = getLevelFromXp(s.currentXp);
                  s.xpForNextLevel = getXpForLevel(s.level + 1);
              }
          }
          if (r.item) rewardText += `Unlocked: ${r.item}. `;
      });
      setGameState(prev => prev ? { ...prev, skills: newSkills, gold: prev.gold + totalGold, quests: prev.quests.map(q => q.id === questId ? { ...q, status: 'COMPLETED' } : q) } : null);
      playTone('complete', soundEnabled);
      handleLootDrop(totalGold, quest.name);
      showNotification(rewardText, 'success');
  };

  const showNotification = (message: string, type: 'success' | 'info' | 'decay') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4500);
  };
  
  const handleNavigateToTasks = (tag: string) => { setActiveTab(Tab.TASKS); setSearchTerm(tag); };

  if (!gameState) {
      return (
          <div className="h-screen w-full flex flex-col items-center justify-center bg-[#1a1a1a] text-[#ff981f]">
               <i className="fa-solid fa-spinner fa-spin text-4xl mb-4"></i>
               <p className="font-fantasy tracking-widest animate-pulse">Reading Vault Runes...</p>
          </div>
      );
  }

  return (
    <div className="h-full bg-wood-black font-pixel flex flex-col md:flex-row overflow-hidden">
      {lootEvent && <LootPopup amount={lootEvent.amount} message={lootEvent.message} icon={lootEvent.icon} />}
      
      <nav className="w-16 md:w-64 bg-wood-pattern border-r-4 border-wood-black flex flex-col items-center md:items-stretch z-20 shadow-xl">
         <div className="p-4 bg-black/20 text-center border-b-2 border-[#5d5447]">
             <h1 className="hidden md:block text-2xl font-bold text-[#ff981f] font-fantasy drop-shadow-md">Life RPG</h1>
             <i className="md:hidden fa-solid fa-dragon text-[#ff981f] text-2xl"></i>
         </div>
         <div className="flex-1 overflow-y-auto">
             {NAV_ITEMS.map(item => (
                 <button 
                    key={item.tab}
                    onClick={() => setActiveTab(item.tab)}
                    className={`w-full p-4 flex items-center gap-4 transition-all hover:bg-white/5 relative
                        ${activeTab === item.tab ? 'bg-wood-dark text-[#ffff00] border-l-4 border-[#ffff00]' : 'text-[#dcdcdc]'}`}
                 >
                     <img src={item.img} className="w-6 h-6 object-contain" style={{ imageRendering: 'pixelated' }} />
                     <span className="hidden md:block font-bold drop-shadow-sm">{item.label}</span>
                     {item.tab === Tab.TASKS && gameState.tasks.filter(t => !t.completed).length > 0 && (
                         <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                     )}
                 </button>
             ))}
         </div>
         
         <div className="p-4 border-t border-[#5d5447]">
             <button 
                onClick={injectDailyTemplate}
                className="w-full bg-[#3e3226] border-2 border-[#5d5447] text-[#dcdcdc] text-xs py-2 hover:bg-[#4a3f35] active:translate-y-1"
             >
                 <i className="fa-solid fa-plus mr-2"></i> Insert Template
             </button>
         </div>
      </nav>

      <main className="flex-1 relative bg-parchment-pattern overflow-hidden flex flex-col">
         <div className="bg-wood-pattern p-2 border-b-2 border-wood-black flex justify-between items-center shadow-md z-10">
             <div className="text-[#dcdcdc] font-mono text-xs flex gap-4">
                 <span className="flex items-center gap-2">
                     <i className="fa-solid fa-khanda text-red-500"></i>
                     <span className="text-white font-bold">{combatLevel.level}</span>
                     <span className="text-[#9a9a9a]">({combatLevel.class})</span>
                 </span>
                 <span><i className="fa-solid fa-coins text-[#ffff00]"></i> {gameState.gold.toLocaleString()}</span>
                 <span>Total Lvl {Math.floor(gameState.totalXp / 1000)}</span>
             </div>
             {activeTab !== Tab.SETTINGS && activeTab !== Tab.BASE && (
                 <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-[#1a1816] border border-[#5d5447] text-white px-2 py-1 text-xs rounded font-pixel w-32 focus:w-48 transition-all"
                 />
             )}
         </div>

         <div className="flex-1 overflow-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-wood-light">
             {activeTab === Tab.DASHBOARD && <Dashboard gameState={gameState} searchTerm={searchTerm} buffs={buffs} onToggleBuff={handleToggleBuff} combatLevel={combatLevel} />}
             {activeTab === Tab.BASE && (
                <div className="h-full w-full border-4 border-wood-black rounded shadow-2xl overflow-hidden relative">
                    <HomeBase 
                        gameState={gameState} 
                        activeEvent={activeEvent} 
                        onEventComplete={() => setActiveEvent(null)}
                        onBuild={handleBuild} 
                        onRemove={handleRemoveBuilding} 
                        onUpdateBuilding={handleUpdateBuilding}
                        onCollectTaxes={handleCollectTaxes}
                        onLootDrop={handleLootDrop}
                        onDeductGold={handleDeductGold}
                        onNavigateToTasks={handleNavigateToTasks}
                        onContributeDefense={contributeToDefense}
                    />
                </div>
             )}
             {activeTab === Tab.STORY && (
                 <QuestLog 
                    quests={gameState.quests} 
                    skills={gameState.skills} 
                    onStartQuest={handleStartQuest}
                    onToggleStep={handleToggleQuestStep}
                    onCompleteQuest={handleCompleteQuest}
                 />
             )}
             {activeTab === Tab.TASKS && (
                 <div className="max-w-4xl mx-auto">
                     <TaskList title="Daily Habits" tasks={gameState.tasks.filter(t => t.isHabit && !t.completed)} onToggleTask={handleToggleTask} isHabitList />
                     <TaskList title="Daily Tasks" tasks={gameState.tasks.filter(t => !t.isHabit && !t.completed)} onToggleTask={handleToggleTask} />
                 </div>
             )}
             {activeTab === Tab.FOCUS && (
                 <div className="flex items-center justify-center h-full">
                     <FocusTimer skills={gameState.skills} isActive={timerActive} mode={timerMode} seconds={timerSeconds} selectedSkillId={timerSkillId} onToggle={handleToggleTimer} onStop={handleStopTimer} onModeChange={handleTimerModeChange} onSkillChange={setTimerSkillId} />
                 </div>
             )}
             {activeTab === Tab.HISTORY && <HistoryCalendar stats={dailyStats} />}
             {activeTab === Tab.SETTINGS && (
                 <Settings defaultXp={defaultXpReward} goldMultiplier={goldMultiplier} soundEnabled={soundEnabled} onSave={handleSaveSettings} />
             )}
         </div>
      </main>

      {notification && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-sm border-2 shadow-xl z-[200] animate-bounce-in bg-wood-pattern ${
            notification.type === 'success' ? 'border-[#00ff00] text-[#00ff00]' : 
            notification.type === 'decay' ? 'border-red-600 text-red-500' : 'border-[#5555ff] text-[#5555ff]'
        }`}>
            <span className="font-bold font-pixel text-xl drop-shadow-md">{notification.message}</span>
        </div>
      )}
    </div>
  );
};

export default App;
