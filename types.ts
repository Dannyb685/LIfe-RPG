
export interface SkillDef {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  perk?: string;
}

export interface Skill {
  id: string;
  name: string;
  level: number;
  currentXp: number;
  xpForNextLevel: number;
  icon: string;
  color: string;
  perk?: string;
}

export interface Task {
  id: string;
  description: string;
  xpReward: number;
  skillTag: string;
  completed: boolean;
  filename: string;
  isHabit?: boolean;
  currentValue?: number;
  targetValue?: number;
  unit?: string;
}

export interface Buff {
  id: string;
  name: string;
  multiplier: number;
  description: string;
  icon: string;
  color: string;
  active: boolean;
}

export interface GridItem {
  x: number;
  y: number;
  buildingId: string;
  id: string;
}

export type BaseLayoutItem = GridItem;

export type ActionType =
  | 'IDLE' | 'COMBAT' | 'MAGIC' | 'WOODCUTTING' | 'LIFTING'
  | 'READING' | 'DOG_TRAINING' | 'FARMING' | 'COOKING' | 'CRAFTING'
  | 'MUSIC' | 'RUNNING' | 'LANGUAGE' | 'ART' | 'HOUSEHOLD'
  | 'SCOUT' | 'MEDITATE' | 'WRITE' | 'CODE' | 'TEA' | 'GARDEN'
  | 'DOG' | 'CAT' | 'SPIRIT' | 'XP' | 'FLOW' | 'FOCUS'
  | 'WALK' | 'SIT' | 'SLEEP'; // Keeping previous ones just in case

export interface BuildingDef {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface HabitDefinition {
  key: string;
  skillId: string;
  xpPerUnit: number;
  unit: string;
  label?: string;
  target?: number;
  icon?: string;
  isBinary?: boolean;
}

export interface VaultMapping {
  id: string;
  type: 'TAG' | 'FOLDER';
  pattern: string;
  skillId: string;
  xpPerWord?: number;
  xpPerCheck?: number;
}

export interface DailyStats {
  date: string;
  totalXp: number;
  skills: Record<string, number>;
  primarySkill?: string;
}

export interface LifeRPGData {
  baseLayout: GridItem[];
  activeBuffs: string[];
  history: Record<string, DailyStats>;
  settings: {
    defaultXp: number;
    soundEnabled: boolean;
    themeMode: 'MANUAL' | 'SMART' | 'RANDOM';
    manualThemeId: string;
    habits: HabitDefinition[];
    vaultMappings: VaultMapping[];
    customMappings?: Record<string, { skillId: string, xpPerUnit: number, type: 'COUNT' | 'DURATION' | 'COMPLETION' | 'RATING' }>;
    debounceDelay?: number;
  }
}

export interface GameState {
  skills: Skill[];
  lastUpdate: number;
  tasks: Task[];
  activeBuffs: string[];
  baseLayout: GridItem[];
  dailyReflections?: Record<string, number>;
  unknownSources?: Record<string, number>; // Key: "Scout Tongue", Value: Count
}

export interface StoryChapter {
  id: string;
  title: string;
  minLevel: number;
  content: string;
  unlocked: boolean;
}
