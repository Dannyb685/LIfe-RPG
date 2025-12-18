
export interface SkillDef {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  perk?: string; // Level 99 Reward Description
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
  skillTag: string; // e.g., "Strength", "Household"
  completed: boolean;
  filename: string; // Origin file
  buffsRewarded?: string[]; // IDs of buffs to toggle upon completion
  // New fields for habit tracking
  isHabit?: boolean;
  currentValue?: number;
  targetValue?: number;
  unit?: string; // 'mins', 'count', etc.
}

export interface LogEntry {
  date: string;
  message: string;
  xpGained: number;
  skill: string;
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
  isDamaged?: boolean; // For entropy/decay mechanics
  effect?: 'FIRE'; // Status effects
}

export interface BuildingDef {
  id: string;
  name: string;
  cost: number;
  icon: string;
  color: string;
  description: string;
  scale?: number; // Optional scaling for larger items
  hidden?: boolean; // If true, not shown in construction menu
  upgradeTo?: string; // ID of the building this can upgrade into
  taxValue?: number; // Gold generated per tax cycle
  defenseValue?: number; // Passive defense bonus to player
  combatStats?: {
      damage: number;
      type: 'MELEE' | 'RANGED' | 'MAGIC' | 'SUPPORT';
      range?: number;
  };
}

export interface HabitDefinition {
    key: string;         // The yaml key e.g., "Brush_Teeth"
    skillId: string;     // e.g., "scout" (matches SkillDef.id)
    xpPerUnit: number;   // XP given per unit
    unit: string;        // 'mins', 'times'
    label?: string;      // Display name (Optional, defaults to key)
    target?: number;     // Value required to count as "done" (Optional, defaults to 1)
    icon?: string;       // Optional icon
    isBinary?: boolean;  // If true, any value > 0 gives flat XP reward (xpPerUnit)
}

export interface Enemy {
    id: string;
    name: string;
    level: number;
    hp: number;
    maxHp: number;
    type: 'GOBLIN' | 'THIEF' | 'BANDIT' | 'BANDIT_LEADER' | 'DRAGON';
    drops: number; // Gold amount
    attack: number; // Damage dealt to player/town
    defense: number; // Damage reduction
}

export interface TownEvent {
    message: string;
    type: 'RAID' | 'DECAY' | 'METEOR' | 'DISCOVERY' | 'INFO';
    targetX?: number;
    targetY?: number;
    active?: boolean;
    enemyData?: Enemy;
    // New Passive Defense Fields
    expiresAt?: number; // Timestamp when event fails
    requiredXp?: number; // XP needed to resolve
    currentXp?: number; // XP contributed so far
}

// --- QUEST SYSTEM TYPES ---
export type QuestDifficulty = 'NOVICE' | 'INTERMEDIATE' | 'EXPERIENCED' | 'MASTER' | 'GRANDMASTER';

export interface QuestStep {
    id: string;
    description: string;
    completed: boolean;
}

export interface QuestReward {
    xp: number;
    skill: string; // Skill ID
    gold?: number;
    item?: string; // Text description of item/unlock
}

export interface Quest {
    id: string;
    name: string;
    difficulty: QuestDifficulty;
    description: string;
    steps: QuestStep[];
    rewards: QuestReward[];
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    prereqQuestId?: string; // ID of quest that must be completed first
}

export interface LifeRPGData {
    gold: number;
    baseLayout: GridItem[];
    activeBuffs: string[]; // IDs of active buffs
    decayDebt: Record<string, number>;
    skillUpdateMap: Record<string, number>;
    // New: Quest Progress
    quests: Record<string, Quest>; // Keyed by Quest ID
    settings: {
        defaultXp: number;
        goldMultiplier: number;
        soundEnabled: boolean;
    }
}

export interface GameState {
  skills: Skill[];
  tasks: Task[];
  logs: LogEntry[];
  totalXp: number;
  gold: number;
  baseLayout: GridItem[];
  quests: Quest[]; // Array for easy mapping
}

export interface DailyStats {
    date: string;
    totalXp: number;
    tasksCompleted: number;
    primarySkill: string;
}
