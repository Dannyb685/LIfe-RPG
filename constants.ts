
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
export const SKILL_DEFINITIONS: Record<string, SkillDef> = {
    // Physical & Health
    Strength: { id: 'strength', name: 'Strength', icon: 'fa-gavel', color: 'text-red-600', description: 'Physical power and lifting.', perk: 'Unlimited Power: 2x Damage in Raids' },
    Hitpoints: { id: 'hitpoints', name: 'Hitpoints', icon: 'fa-heart', color: 'text-red-500', description: 'Health, hygiene, and self-maintenance.', perk: 'Immortal Vitality: Decay reduced by 50%' },
    Defense: { id: 'defense', name: 'Defense', icon: 'fa-shield-halved', color: 'text-blue-600', description: 'Self-defense and safety.', perk: 'Iron Skin: Town buildings resist damage' },

    // Tech & Craft
    Dungeoneering: { id: 'dungeoneering', name: 'Dungeoneering', icon: 'fa-dungeon', color: 'text-slate-500', description: 'Coding and Obsidian architecture.', perk: 'Master Architect: Free building repairs' },
    Crafting: { id: 'crafting', name: 'Crafting', icon: 'fa-hammer', color: 'text-amber-700', description: 'Household maintenance and repairs.', perk: 'Efficiency: Crafting tasks give +20% XP' },

    // Companion & Nature
    Scout: { id: 'scout', name: 'Scout', icon: 'fa-paw', color: 'text-orange-500', description: 'Dog training, care, and bonding.', perk: 'Perfect obedience, happiness, and health' },
    Farming: { id: 'farming', name: 'Farming', icon: 'fa-leaf', color: 'text-lime-500', description: 'Gardening and plant care.', perk: 'Green Thumb: Harvests yield 2x Gold' },
    Cooking: { id: 'cooking', name: 'Cooking', icon: 'fa-utensils', color: 'text-yellow-500', description: 'Nutrition and meal prep.', perk: 'Master Chef: Meals never burn' },

    // Intellect
    Knowledge: { id: 'knowledge', name: 'Knowledge', icon: 'fa-book-skull', color: 'text-blue-400', description: 'Clinical practice and study.', perk: 'Forbidden Knowledge: +10% Global XP' },
    Research: { id: 'research', name: 'Research', icon: 'fa-flask', color: 'text-cyan-400', description: 'Deep dives and questioning (Herblore).', perk: 'Potion Master: Buffs last 2x longer' },

    // Social & Creative
    Social: { id: 'social', name: 'Social', icon: 'fa-users', color: 'text-purple-400', description: 'Connection and communication.', perk: 'Charisma: Shop prices reduced by 20%' },
    Writing: { id: 'writing', name: 'Writing', icon: 'fa-scroll', color: 'text-zinc-400', description: 'Journaling and reflection.', perk: 'Loremaster: Daily Log gives bonus XP' },
    Art: { id: 'art', name: 'Art', icon: 'fa-palette', color: 'text-pink-400', description: 'Visual arts.', perk: 'Visionary: Unlocks custom aesthetics' },
    Music: { id: 'music', name: 'Music', icon: 'fa-music', color: 'text-teal-400', description: 'Instrument practice.', perk: 'Virtuoso: Bard aura boosts morale' },
    Language: { id: 'language', name: 'Language', icon: 'fa-language', color: 'text-indigo-400', description: 'Linguistics.', perk: 'Polyglot: Unlock foreign trade routes' },
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
        id: 'path_dirt',
        name: 'Dirt Path',
        icon: 'fa-shoe-prints',
        color: 'text-amber-700',
        description: 'Infrastructure. A worn dirt track. Connects buildings and keeps boots (mostly) clean.',
    },
    {
        id: 'wood_wall',
        name: 'Barricade',
        icon: 'fa-bars',
        color: 'text-amber-800',
        description: 'Defense. A crude fence of sharpened stakes. Keeps out stray goblins and neighbors.',
        unlockLevel: 5
    },
    {
        id: 'stone_wall',
        name: 'Stone Wall',
        icon: 'fa-cubes',
        color: 'text-stone-500',
        description: 'Defense. Solid limestone blocks reinforced with granite. A proper fortification.',
        unlockLevel: 10
    },
    {
        id: 'shrub',
        name: 'Berry Bush',
        icon: 'fa-seedling',
        color: 'text-green-500',
        description: 'Nature. Redberries. Tasty, but watch out for thorns. Adds greenery.',
    },
    {
        id: 'well',
        name: 'Town Well',
        icon: 'fa-bucket',
        color: 'text-blue-400',
        description: 'Utility. "Fresh water, free for all!" Essential for farming and hydration.',
        unlockLevel: 3
    },
    {
        id: 'market_stall',
        name: 'Market Stall',
        icon: 'fa-mask',
        color: 'text-red-400',
        description: 'Economy. "Silk! Furs! Spices!" A bustling hub that generates steady tax gold.',
        unlockLevel: 8
    },
    {
        id: 'training_dummy',
        name: 'Combat Dummy',
        icon: 'fa-user-ninja',
        color: 'text-yellow-700',
        description: 'Training. Filled with hay. Useful for hitting higher numbers. Increases town readiness.',
        unlockLevel: 4
    },
    {
        id: 'furnace',
        name: 'Smelter',
        icon: 'fa-fire-burner',
        color: 'text-orange-500',
        description: 'Industry. The heart of smithing. Smelts ores day and night. High economic output.',
        unlockLevel: 15
    },
    {
        id: 'archery_target',
        name: 'Archery Range',
        icon: 'fa-bullseye',
        color: 'text-white',
        description: 'Training. "Aim for the center!" Improves accuracy of local defenders.',
        unlockLevel: 6
    },
    {
        id: 'flower_red',
        name: 'Red Flower',
        icon: 'fa-spa',
        color: 'text-red-400',
        description: 'Farming. A vibrant red blossom. "Examine Red Flower: It is a pretty flower."',
    },
    {
        id: 'tree_pine',
        name: 'Pine Tree',
        icon: 'fa-tree',
        color: 'text-emerald-700',
        description: 'Nature. An evergreen pine. Provides shade and the scent of sap.',
    },
    {
        id: 'bank_booth',
        name: 'Bank Booth',
        icon: 'fa-sack-dollar',
        color: 'text-yellow-300',
        description: 'Economy. "You can rely on us." The safest place in Gielinor. Boosts Gold storage.',
        unlockLevel: 20
    },
    {
        id: 'altar_guthix',
        name: 'Altar of Balance',
        icon: 'fa-place-of-worship',
        color: 'text-teal-400',
        description: 'Prayer. A shrine to Guthix. Promotes balance and harmony in the settlement.',
        unlockLevel: 25
    },
    {
        id: 'house_cottage',
        name: 'Cottage',
        icon: 'fa-house',
        color: 'text-amber-200',
        description: 'Housing. A cozy wooden home. "Home sweet home." Supports population growth.',
    },
    {
        id: 'house_manor',
        name: 'Manor',
        icon: 'fa-house-chimney',
        color: 'text-purple-300',
        description: 'Housing. A stately home for the town elite. Generates high tax revenue.',
        unlockLevel: 30
    },
    {
        id: 'watchtower',
        name: 'Watchtower',
        icon: 'fa-eye',
        color: 'text-stone-300',
        description: 'Defense. "Scanning horizon..." Provides early warning against raids. High Def bonus.',
        unlockLevel: 12
    },
    {
        id: 'blacksmith',
        name: 'Blacksmith',
        icon: 'fa-hammer',
        color: 'text-gray-400',
        description: 'Industry. The clanging of hammers never stops. Repairs gear and arms the guard.',
        unlockLevel: 10
    },
    {
        id: 'castle_keep',
        name: 'Town Hall',
        icon: 'fa-chess-king',
        color: 'text-gray-200',
        description: 'Administration. The seat of power. Massive boost to Tax Value and authority.',
        unlockLevel: 50
    },

    // Troops
    {
        id: 'guard_varrock',
        name: 'Varrock Guard',
        icon: 'fa-shield-halved',
        color: 'text-gray-400',
        description: 'Troop. Equipped with bronze weaponry. "What is it now?" Basic melee defense.',
        unlockLevel: 5
    },
    {
        id: 'guard_dog',
        name: 'Guard Dog',
        icon: 'fa-paw',
        color: 'text-emerald-500',
        description: 'Troop. A loyal hound trained by Scouts to sniff out danger. High defense and sharp bites.',
        unlockLevel: 10
    },
    {
        id: 'ranger_elf',
        name: 'Elf Ranger',
        icon: 'fa-bullseye',
        color: 'text-green-400',
        description: 'Troop. A scout from Lletya wielding a crystal bow. High accuracy ranged support.',
        unlockLevel: 20
    },
    {
        id: 'knight_white',
        name: 'White Knight',
        icon: 'fa-hand-fist',
        color: 'text-white',
        description: 'Troop. Falador\'s finest. "We serve Saradomin." High defense and melee damage.',
        unlockLevel: 30
    },
    {
        id: 'dragon_green_baby',
        name: 'Baby Green Dragon',
        icon: 'fa-dragon',
        color: 'text-green-600',
        description: 'Troop. A fierce hatchling. "Roar!" Deals massive magic damage with dragonfire.',
        unlockLevel: 45
    },

    // Utility Units
    {
        id: 'gnome_firemaker',
        name: 'Gnome Firemaker',
        icon: 'fa-fire',
        color: 'text-red-500',
        description: 'Utility. "Burn with me!" Automatically extinguishes fires that start during Decay events.',
        unlockLevel: 15
    },
    {
        id: 'estate_agent',
        name: 'Estate Agent',
        icon: 'fa-hammer',
        color: 'text-yellow-500',
        description: 'Utility. "Location, location!" Automatically repairs damaged buildings for free.',
        unlockLevel: 20
    },

    // Event Items (Hidden from build menu)
    { id: 'meteor', name: 'Meteorite', icon: 'fa-meteor', color: 'text-orange-600', description: 'Fallen from the sky. Contains rare ore. Mine it!', unlockLevel: 99 },
    { id: 'treasure_chest', name: 'Buried Treasure', icon: 'fa-toolbox', color: 'text-yellow-500', description: 'An old casket surfaced by the rain. Open it!', unlockLevel: 99 },
];
