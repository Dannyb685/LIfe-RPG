
import { Buff, BuildingDef, HabitDefinition, SkillDef } from './types';

// OSRS XP Curve Implementation
export const getXpForLevel = (level: number): number => {
    let total = 0;
    for (let i = 1; i < level; i++) {
        total += Math.floor(i + 300 * Math.pow(2, i / 7.0));
    }
    return Math.floor(total / 4);
};

export const getLevelFromXp = (xp: number): number => {
    // Cap at 126 (virtual level limit often used in private servers/post-99)
    for (let i = 1; i < 126; i++) {
        if (getXpForLevel(i + 1) > xp) {
            return i;
        }
    }
    return 126;
};

// 1. Define the 15 Core Skills with OSRS Icons & Perks
// 1. Define the 15 Core Skills with Sanctuary Themes
export const SKILL_DEFINITIONS: Record<string, SkillDef> = {
    // Physical & Health (Earth)
    Strength: { id: 'strength', name: 'Vitality', icon: 'fa-mountain', color: 'text-sanctuary-ink', description: 'Physical capacity and energy.', perk: 'Vigor: Energy to pursue the path' },
    Hitpoints: { id: 'hitpoints', name: 'Wellness', icon: 'fa-heart', color: 'text-sanctuary-red', description: 'Care for the vessel.', perk: 'Harmony: Balance of body and mind' },
    Defense: { id: 'defense', name: 'Resilience', icon: 'fa-shield-heart', color: 'text-sanctuary-green', description: 'Boundaries and emotional safety.', perk: 'Stability: Inner calm in chaos' },

    // Tech & Craft (Wind/Void)
    Dungeoneering: { id: 'dungeoneering', name: 'Architecture', icon: 'fa-cubes', color: 'text-sanctuary-inkLight', description: 'Structure of the digital mind.', perk: 'Foundation: Obsidian vault clarity' },
    Crafting: { id: 'crafting', name: 'Craft', icon: 'fa-hammer', color: 'text-sanctuary-gold', description: 'Creating with hands and heart.', perk: 'Maker: Joy of creation' },

    // Companion & Nature (Water/Earth)
    Scout: { id: 'scout', name: 'Companionship', icon: 'fa-paw', color: 'text-sanctuary-ink', description: 'Bond with animal guides.', perk: 'Loyalty: Unspoken connection' },
    Farming: { id: 'farming', name: 'Cultivation', icon: 'fa-leaf', color: 'text-sanctuary-green', description: 'Nurturing life and growth.', perk: 'Growth: Patience yields fruit' },
    Cooking: { id: 'cooking', name: 'Nourishment', icon: 'fa-bowl-food', color: 'text-sanctuary-red', description: 'Preparing sustenance.', perk: 'Savor: Presence in daily acts' },

    // Intellect (Wind)
    Knowledge: { id: 'knowledge', name: 'Wisdom', icon: 'fa-book-open', color: 'text-sanctuary-inkLight', description: 'Deep understanding.', perk: 'Insight: Clarity of thought' },
    Research: { id: 'research', name: 'Inquiry', icon: 'fa-magnifying-glass', color: 'text-sanctuary-ink', description: 'Seeking truth.', perk: 'Discovery: New perspectives' },

    // Social & Creative (Water/Fire)
    Social: { id: 'social', name: 'Connection', icon: 'fa-users', color: 'text-sanctuary-red', description: 'Bridges between souls.', perk: 'Empathy: Understanding others' },
    Writing: { id: 'writing', name: 'Expression', icon: 'fa-pen-nib', color: 'text-sanctuary-ink', description: 'manifesting thoughts into form.', perk: 'Voice: Clarity of self' },
    Art: { id: 'art', name: 'Aesthetics', icon: 'fa-palette', color: 'text-sanctuary-red', description: 'Perception of beauty.', perk: 'Vision: Seeing the sublime' },
    Music: { id: 'music', name: 'Harmony', icon: 'fa-music', color: 'text-sanctuary-green', description: 'Rhythm of life.', perk: 'Resonance: Tuning the mind' },
    Language: { id: 'language', name: 'Understanding', icon: 'fa-language', color: 'text-sanctuary-gold', description: 'Decoding meaning.', perk: 'Bridge: Crossing barriers' },
};

// 2. Map Frontmatter Keys to Skills
export const HABIT_DEFINITIONS: HabitDefinition[] = [
    // HITPOINTS (Health)
    { key: 'Brush_Teeth', skillId: 'hitpoints', xpPerUnit: 10, unit: 'times', target: 2, label: 'Brush Teeth', icon: 'fa-tooth' },
    { key: 'Groom', skillId: 'hitpoints', xpPerUnit: 10, unit: 'session', target: 1, label: 'Grooming', icon: 'fa-user-tie', isBinary: true },
    { key: 'Meditation', skillId: 'hitpoints', xpPerUnit: 2, unit: 'mins', target: 20, label: 'Meditation', icon: 'fa-om' },

    // SCOUT (Dog)
    { key: 'Dog_Training', skillId: 'scout', xpPerUnit: 5, unit: 'mins', target: 15, label: 'Dog Training', icon: 'fa-paw' },
    { key: 'Dog_Walk', skillId: 'scout', xpPerUnit: 10, unit: 'km', target: 2, label: 'Dog Walk', icon: 'fa-person-walking' },
    { key: 'Dog_Groom', skillId: 'scout', xpPerUnit: 25, unit: 'session', target: 1, label: 'Dog Grooming', icon: 'fa-scissors', isBinary: true },
    { key: 'Scout_Tongue', skillId: 'scout', xpPerUnit: 15, unit: 'bonus', target: 1, label: 'Scout Tongue Check', icon: 'fa-check', isBinary: true },

    // DUNGEONEERING (Tech)
    { key: 'Coding', skillId: 'dungeoneering', xpPerUnit: 2, unit: 'mins', target: 60, label: 'Coding', icon: 'fa-code' },
    { key: 'Obsidian', skillId: 'dungeoneering', xpPerUnit: 5, unit: 'actions', target: 5, label: 'Vault Maint.', icon: 'fa-file-code' },

    // PHYSICAL & DEFENSE
    { key: 'Exercise', skillId: 'strength', xpPerUnit: 2, unit: 'mins', target: 60, label: 'Workout', icon: 'fa-dumbbell' },
    { key: 'Self_Defense', skillId: 'defense', xpPerUnit: 5, unit: 'mins', target: 15, label: 'Defense Drill', icon: 'fa-shield-halved' },

    // INTELLECT & RESEARCH
    // Clinical -> Knowledge
    { key: 'Clinical', skillId: 'knowledge', xpPerUnit: 50, unit: 'shift', target: 1, label: 'Clinical Work', icon: 'fa-user-doctor' },
    // Study -> Knowledge (Mins)
    { key: 'Study', skillId: 'knowledge', xpPerUnit: 1, unit: 'mins', target: 60, label: 'Study', icon: 'fa-book-open' },
    // Questions -> Knowledge (Practice Qs count)
    { key: 'Questions', skillId: 'knowledge', xpPerUnit: 5, unit: 'qs', target: 10, label: 'Practice Qs', icon: 'fa-question' },
    // Research -> Research (Mins) [NEW]
    { key: 'Research', skillId: 'research', xpPerUnit: 2, unit: 'mins', target: 60, label: 'Research Proj.', icon: 'fa-flask' },

    // SOCIAL
    { key: 'Call_loved_one', skillId: 'social', xpPerUnit: 50, unit: 'call', target: 1, label: 'Call Family', icon: 'fa-phone', isBinary: true }, // Usually 1 call?
    { key: 'Emails', skillId: 'social', xpPerUnit: 5, unit: 'email', target: 5, label: 'Emails', icon: 'fa-envelope' },
    // MSM -> Social (Nonprofit Clinic) [UPDATED]
    { key: 'MSM', skillId: 'social', xpPerUnit: 50, unit: 'shift', target: 1, label: 'Street Clinic', icon: 'fa-hand-holding-medical' },
    // Mood -> Social (Tracking, no XP or minimal?)
    { key: 'Mood', skillId: 'social', xpPerUnit: 0, unit: 'rating', target: 0, label: 'Mood Log', icon: 'fa-face-smile' },

    // LIFE SKILLS
    { key: 'Cooking_Prep', skillId: 'cooking', xpPerUnit: 20, unit: 'meal', target: 1, label: 'Meal Prep', icon: 'fa-utensils' },
    { key: 'Gardening', skillId: 'farming', xpPerUnit: 2, unit: 'mins', target: 15, label: 'Gardening', icon: 'fa-leaf' },
    { key: 'Household', skillId: 'crafting', xpPerUnit: 15, unit: 'chore', target: 3, label: 'Chores', icon: 'fa-broom' },
    // Work Quality -> Crafting (Rating)
    { key: 'Work Quality', skillId: 'crafting', xpPerUnit: 10, unit: 'rating', target: 5, label: 'Quality', icon: 'fa-star' },

    // CREATIVITY
    { key: 'Journaling', skillId: 'writing', xpPerUnit: 20, unit: 'entry', target: 1, label: 'Journaling', icon: 'fa-pen-fancy', isBinary: true },
    { key: 'Art', skillId: 'art', xpPerUnit: 2, unit: 'mins', target: 30, label: 'Art', icon: 'fa-palette' },
    { key: 'Learn_instrument', skillId: 'music', xpPerUnit: 2, unit: 'mins', target: 15, label: 'Music', icon: 'fa-music' },
    { key: 'Learn_language', skillId: 'language', xpPerUnit: 2, unit: 'mins', target: 15, label: 'Language', icon: 'fa-language' },
    { key: 'Reflection', skillId: 'writing', xpPerUnit: 10, unit: 'entry', target: 1, label: 'Reflection', icon: 'fa-pen-nib', isBinary: true },

    // LEGACY / EXTRA
    { key: 'Anki Reviews', skillId: 'knowledge', xpPerUnit: 0.5, unit: 'cards', target: 50, label: 'Anki', icon: 'fa-layer-group' },
    { key: 'Clerkship Hours', skillId: 'social', xpPerUnit: 20, unit: 'hours', target: 8, label: 'Clerkship', icon: 'fa-user-nurse' },
];

// --- ZEN / 5 RINGS CONFIGURATION ---
export const RINGS = {
    EARTH: { id: 'EARTH', name: 'Chi (Earth)', description: 'Stability & Health', color: 'text-stone-600', skills: ['hitpoints', 'defense', 'crafting', 'farming', 'cooking'] },
    WATER: { id: 'WATER', name: 'Sui (Water)', description: 'Flexibility & Flow', color: 'text-blue-500', skills: ['social', 'music', 'language', 'scout'] },
    FIRE: { id: 'FIRE', name: 'Ka (Fire)', description: 'Energy & Action', color: 'text-red-500', skills: ['strength', 'scout'] }, // Scout is movement too
    WIND: { id: 'WIND', name: 'Fu (Wind)', description: 'Intellect & Growth', color: 'text-emerald-600', skills: ['knowledge', 'dungeoneering', 'research'] },
    VOID: { id: 'VOID', name: 'Ku (Void)', description: 'Spirit & Create', color: 'text-slate-900', skills: ['writing', 'art', 'research'] } // Research fits both
};

// Helper Maps for Compatibility
export const SKILL_ICONS: Record<string, string> = Object.values(SKILL_DEFINITIONS).reduce((acc, s) => ({ ...acc, [s.name]: s.icon }), {});
export const SKILL_COLORS: Record<string, string> = Object.values(SKILL_DEFINITIONS).reduce((acc, s) => ({ ...acc, [s.name]: s.color }), {});
export const SKILL_ID_TO_NAME: Record<string, string> = Object.values(SKILL_DEFINITIONS).reduce((acc, s) => ({ ...acc, [s.id]: s.name }), {});

// Decay Rates (XP lost per hour of inactivity)
export const SKILL_DECAY_RATES: Record<string, number> = {
    // High Decay (Physical & Routine - "Use it or lose it")
    Strength: 10,      // Atrophy is rapid
    Hitpoints: 5,      // Hygiene needs daily maintenance
    Scout: 5,          // Dogs need daily walks
    Farming: 5,        // Plants need daily water

    // Medium Decay (Social & Practice)
    Social: 4,         // Relationships cool off
    Music: 3,          // Muscle memory fades
    Language: 3,       // Fluency drops
    Defense: 3,        // Situational awareness fades
    Cooking: 2,        // Recipes get rusty
    Crafting: 2,       // Mechanics get rusty

    // Low Decay (Intellectual & Knowledge - "Like riding a bike")
    Art: 1,
    Writing: 1,
    Dungeoneering: 0.5, // Tech skills stick well
    Research: 0.2,      // Curiosity is innate
    Knowledge: 0.1,     // Deep knowledge is very persistent

    Default: 1
};

// --- GARDEN ASSETS ---
export interface ThemeDef {
    id: string;
    name: string;
    file: string;
    style: 'SEASONAL' | 'WEATHER' | 'BIOME';
}

export const GARDEN_THEMES: ThemeDef[] = [
    // Standard
    { id: 'classic', name: 'Classic', file: 'zen_garden_bg.png', style: 'BIOME' },

    // Seasons
    { id: 'spring', name: 'Spring Sakura', file: 'zen_garden_spring_sakura_1766252559450.png', style: 'SEASONAL' },
    { id: 'summer', name: 'Summer Bamboo', file: 'zen_garden_summer_bamboo_1766252573754.png', style: 'SEASONAL' },
    { id: 'autumn', name: 'Autumn Maple', file: 'zen_garden_autumn_maple_1766252587887.png', style: 'SEASONAL' },
    { id: 'winter', name: 'Winter Snow', file: 'zen_garden_winter_snow_1766252601992.png', style: 'SEASONAL' },

    // Weather/Time
    { id: 'rain', name: 'Rainy Day', file: 'zen_garden_rainy_1766252624292.png', style: 'WEATHER' },
    { id: 'fog', name: 'Morning Fog', file: 'zen_garden_foggy_1766252637345.png', style: 'WEATHER' },
    { id: 'night', name: 'Starry Night', file: 'zen_garden_starry_night_1766252652840.png', style: 'WEATHER' },
    { id: 'dawn', name: 'Golden Dawn', file: 'zen_garden_dawn_mist_1766252664768.png', style: 'WEATHER' },

    // Biomes
    { id: 'rock', name: 'Dry Rock Garden', file: 'zen_garden_rock_dry_1766252687269.png', style: 'BIOME' },
    { id: 'koi', name: 'Koi Pond', file: 'zen_garden_koi_pond_1766252701499.png', style: 'BIOME' },
    { id: 'tea', name: 'Tea House', file: 'zen_garden_tea_house_1766252715567.png', style: 'BIOME' },
    { id: 'shrine', name: 'Forest Shrine', file: 'zen_garden_forest_shrine_1766252728965.png', style: 'BIOME' },
];

export const inferQuestRewardSkill = (questName: string): string => {
    const lower = questName.toLowerCase();
    if (lower.includes('cook') || lower.includes('recipe')) return 'cooking';
    if (lower.includes('garden') || lower.includes('farm')) return 'farming';
    if (lower.includes('sword') || lower.includes('fight')) return 'strength';
    if (lower.includes('research') || lower.includes('study')) return 'knowledge';
    return 'general';
};

// --- REST OF CONSTANTS ---

export const AVAILABLE_BUFFS: Buff[] = [
    {
        id: 'morning_momentum',
        name: 'Morning Momentum',
        multiplier: 1.15,
        description: '+15% XP (Routine)',
        icon: 'fa-sun',
        color: 'text-orange-400',
        active: false
    },
    {
        id: 'workout_boost',
        name: 'Endorphin Rush',
        multiplier: 1.1,
        description: '+10% XP (Focus)',
        icon: 'fa-heart-pulse',
        color: 'text-red-500',
        active: false
    },
    {
        id: 'potion_focus',
        name: 'Potion of Focus',
        multiplier: 1.2,
        description: '+20% XP Gain',
        icon: 'fa-flask',
        color: 'text-blue-400',
        active: false
    }
];

export const BUILDINGS: BuildingDef[] = [
    {
        id: 'tree_pine',
        name: 'Pine Tree',
        icon: 'fa-tree',
        color: 'text-sanctuary-green',
        description: 'A symbol of longevity and resilience.',
    },
    {
        id: 'stone_lantern',
        name: 'Stone Lantern',
        icon: 'fa-lightbulb',
        color: 'text-sanctuary-inkLight',
        description: 'Illuminates the path of the mind.',
    },
    {
        id: 'rock_garden',
        name: 'Rock Formation',
        icon: 'fa-cubes',
        color: 'text-sanctuary-ink',
        description: 'Stability amidst the chaos.',
    },
    {
        id: 'shrine',
        name: 'Small Shrine',
        icon: 'fa-torii-gate',
        color: 'text-sanctuary-red',
        description: 'A place for quiet reflection.',
    },
    {
        id: 'bonsai',
        name: 'Bonsai',
        icon: 'fa-seedling',
        color: 'text-sanctuary-green',
        description: 'Patience cultured over time.',
    },
    {
        id: 'koi_pond',
        name: 'Koi Pond',
        icon: 'fa-water',
        color: 'text-sanctuary-inkLight',
        description: 'Flowing water clears the thoughts.',
    },
    {
        id: 'tea_set',
        name: 'Tea Set',
        icon: 'fa-mug-hot',
        color: 'text-sanctuary-gold',
        description: 'Ritual brings presence.',
    }
];
