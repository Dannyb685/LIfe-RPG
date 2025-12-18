
import { Buff, BuildingDef, HabitDefinition, Quest, SkillDef } from './types';

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
    Strength:      { id: 'strength',      name: 'Strength',      icon: 'fa-gavel',          color: 'text-red-600',    description: 'Physical power and lifting.', perk: 'Unlimited Power: 2x Damage in Raids' },
    Hitpoints:     { id: 'hitpoints',     name: 'Hitpoints',     icon: 'fa-heart',          color: 'text-red-500',    description: 'Health, hygiene, and self-maintenance.', perk: 'Immortal Vitality: Decay reduced by 50%' },
    Defense:       { id: 'defense',       name: 'Defense',       icon: 'fa-shield-halved',  color: 'text-blue-600',   description: 'Self-defense and safety.', perk: 'Iron Skin: Town buildings resist damage' },
    
    // Tech & Craft
    Dungeoneering: { id: 'dungeoneering', name: 'Dungeoneering', icon: 'fa-dungeon',        color: 'text-slate-500',  description: 'Coding and Obsidian architecture.', perk: 'Master Architect: Free building repairs' },
    Crafting:      { id: 'crafting',      name: 'Crafting',      icon: 'fa-hammer',         color: 'text-amber-700',  description: 'Household maintenance and repairs.', perk: 'Efficiency: Crafting tasks give +20% XP' },
    
    // Companion & Nature
    Scout:         { id: 'scout',         name: 'Scout',         icon: 'fa-paw',            color: 'text-orange-500', description: 'Dog training, care, and bonding.', perk: 'Perfect obedience, happiness, and health' },
    Farming:       { id: 'farming',       name: 'Farming',       icon: 'fa-leaf',           color: 'text-lime-500',   description: 'Gardening and plant care.', perk: 'Green Thumb: Harvests yield 2x Gold' },
    Cooking:       { id: 'cooking',       name: 'Cooking',       icon: 'fa-utensils',       color: 'text-yellow-500', description: 'Nutrition and meal prep.', perk: 'Master Chef: Meals never burn' },
    
    // Intellect
    Knowledge:     { id: 'knowledge',     name: 'Knowledge',     icon: 'fa-book-skull',     color: 'text-blue-400',   description: 'Clinical practice and study.', perk: 'Forbidden Knowledge: +10% Global XP' },
    Research:      { id: 'research',      name: 'Research',      icon: 'fa-flask',          color: 'text-cyan-400',   description: 'Deep dives and questioning (Herblore).', perk: 'Potion Master: Buffs last 2x longer' },
    
    // Social & Creative
    Social:        { id: 'social',        name: 'Social',        icon: 'fa-users',          color: 'text-purple-400', description: 'Connection and communication.', perk: 'Charisma: Shop prices reduced by 20%' },
    Writing:       { id: 'writing',       name: 'Writing',       icon: 'fa-scroll',         color: 'text-zinc-400',   description: 'Journaling and reflection.', perk: 'Loremaster: Daily Log gives bonus XP' },
    Art:           { id: 'art',           name: 'Art',           icon: 'fa-palette',        color: 'text-pink-400',   description: 'Visual arts.', perk: 'Visionary: Unlocks custom aesthetics' },
    Music:         { id: 'music',         name: 'Music',         icon: 'fa-music',          color: 'text-teal-400',   description: 'Instrument practice.', perk: 'Virtuoso: Bard aura boosts morale' },
    Language:      { id: 'language',      name: 'Language',      icon: 'fa-language',       color: 'text-indigo-400', description: 'Linguistics.', perk: 'Polyglot: Unlock foreign trade routes' },
};

// 2. Map Frontmatter Keys to Skills (23 Keys)
export const HABIT_DEFINITIONS: HabitDefinition[] = [
    // HITPOINTS (Health)
    { key: 'Brush_Teeth',      skillId: 'hitpoints',     xpPerUnit: 10,  unit: 'times', target: 2, label: 'Brush Teeth', icon: 'fa-tooth' },
    { key: 'Groom',            skillId: 'hitpoints',     xpPerUnit: 10,  unit: 'session', target: 1, label: 'Grooming', icon: 'fa-user-tie' },
    { key: 'Meditation',       skillId: 'hitpoints',     xpPerUnit: 2,   unit: 'mins', target: 10, label: 'Meditation', icon: 'fa-om' },

    // SCOUT (Dog)
    { key: 'Dog_Training',     skillId: 'scout',         xpPerUnit: 15,  unit: 'mins', target: 15, label: 'Dog Training', icon: 'fa-paw' },
    { key: 'Dog_Walk',         skillId: 'scout',         xpPerUnit: 10,  unit: 'km', target: 2, label: 'Dog Walk', icon: 'fa-person-walking' },
    { key: 'Dog_Groom',        skillId: 'scout',         xpPerUnit: 25,  unit: 'session', target: 1, label: 'Dog Grooming', icon: 'fa-scissors' },
    // SPECIAL LOGIC: Scout_Tongue is binary
    { key: 'Scout_Tongue',     skillId: 'scout',         xpPerUnit: 15,  unit: 'bonus', target: 1, label: 'Scout Tongue Check', icon: 'fa-check', isBinary: true }, 

    // DUNGEONEERING (Tech)
    { key: 'Coding',           skillId: 'dungeoneering', xpPerUnit: 2,   unit: 'mins', target: 30, label: 'Coding', icon: 'fa-code' },
    { key: 'Obsidian',         skillId: 'dungeoneering', xpPerUnit: 5,   unit: 'actions', target: 5, label: 'Vault Maint.', icon: 'fa-file-code' },

    // PHYSICAL & DEFENSE
    { key: 'Exercise',         skillId: 'strength',      xpPerUnit: 2,   unit: 'mins', target: 30, label: 'Workout', icon: 'fa-dumbbell' },
    { key: 'Self_Defense',     skillId: 'defense',       xpPerUnit: 5,   unit: 'mins', target: 15, label: 'Defense Drill', icon: 'fa-shield-halved' },

    // INTELLECT & RESEARCH
    { key: 'Clinical',         skillId: 'knowledge',     xpPerUnit: 50,  unit: 'shift', target: 1, label: 'Clinical Work', icon: 'fa-user-doctor' },
    { key: 'Study',            skillId: 'knowledge',     xpPerUnit: 1,   unit: 'mins', target: 30, label: 'Study', icon: 'fa-book-open' },
    { key: 'Questions',        skillId: 'research',      xpPerUnit: 10,  unit: 'count', target: 3, label: 'Research Qs', icon: 'fa-question' },

    // SOCIAL
    { key: 'Call_loved_one',   skillId: 'social',        xpPerUnit: 50,  unit: 'call', target: 1, label: 'Call Family', icon: 'fa-phone' },
    { key: 'Emails',           skillId: 'social',        xpPerUnit: 5,   unit: 'email', target: 5, label: 'Emails', icon: 'fa-envelope' },

    // LIFE SKILLS
    { key: 'Cooking_Prep',     skillId: 'cooking',       xpPerUnit: 20,  unit: 'meal', target: 1, label: 'Meal Prep', icon: 'fa-utensils' },
    { key: 'Gardening',        skillId: 'farming',       xpPerUnit: 2,   unit: 'mins', target: 15, label: 'Gardening', icon: 'fa-leaf' },
    { key: 'Household',        skillId: 'crafting',      xpPerUnit: 15,  unit: 'chore', target: 3, label: 'Chores', icon: 'fa-broom' },

    // CREATIVITY
    { key: 'Journaling',       skillId: 'writing',       xpPerUnit: 20,  unit: 'entry', target: 1, label: 'Journaling', icon: 'fa-pen-fancy' },
    { key: 'Art',              skillId: 'art',           xpPerUnit: 2,   unit: 'mins', target: 30, label: 'Art', icon: 'fa-palette' },
    { key: 'Learn_instrument', skillId: 'music',         xpPerUnit: 2,   unit: 'mins', target: 15, label: 'Music', icon: 'fa-music' },
    { key: 'Learn_language',   skillId: 'language',      xpPerUnit: 2,   unit: 'mins', target: 15, label: 'Language', icon: 'fa-language' },
];

// Helper Maps for Compatibility
export const SKILL_ICONS: Record<string, string> = Object.values(SKILL_DEFINITIONS).reduce((acc, s) => ({...acc, [s.name]: s.icon}), {});
export const SKILL_COLORS: Record<string, string> = Object.values(SKILL_DEFINITIONS).reduce((acc, s) => ({...acc, [s.name]: s.color}), {});
export const SKILL_ID_TO_NAME: Record<string, string> = Object.values(SKILL_DEFINITIONS).reduce((acc, s) => ({...acc, [s.id]: s.name}), {});

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

// --- QUESTS DEFINITIONS (Fallback if no QUESTS.md) ---
export const QUEST_DEFINITIONS: Quest[] = [];

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
        cost: 10, 
        icon: 'fa-shoe-prints', 
        color: 'text-amber-700', 
        description: 'Infrastructure. A worn dirt track. Connects buildings and keeps boots (mostly) clean.',
        taxValue: 0
    },
    { 
        id: 'wood_wall', 
        name: 'Barricade', 
        cost: 25, 
        icon: 'fa-bars', 
        color: 'text-amber-800', 
        description: 'Defense. A crude fence of sharpened stakes. Keeps out stray goblins and neighbors.',
        upgradeTo: 'stone_wall',
        taxValue: 5,
        defenseValue: 1
    },
    { 
        id: 'stone_wall', 
        name: 'Stone Wall', 
        cost: 150, 
        icon: 'fa-cubes', 
        color: 'text-stone-500', 
        description: 'Defense. Solid limestone blocks reinforced with granite. A proper fortification.',
        hidden: true,
        combatStats: { damage: 1, type: 'SUPPORT' },
        taxValue: 15,
        defenseValue: 2
    },
    { 
        id: 'shrub', 
        name: 'Berry Bush', 
        cost: 15, 
        icon: 'fa-seedling', 
        color: 'text-green-500', 
        description: 'Nature. Redberries. Tasty, but watch out for thorns. Adds greenery.',
        taxValue: 1
    },
    { 
        id: 'well', 
        name: 'Town Well', 
        cost: 150, 
        icon: 'fa-bucket', 
        color: 'text-blue-400', 
        description: 'Utility. "Fresh water, free for all!" Essential for farming and hydration.', 
        scale: 1.1,
        taxValue: 10
    },
    { 
        id: 'market_stall', 
        name: 'Market Stall', 
        cost: 300, 
        icon: 'fa-mask', 
        color: 'text-red-400', 
        description: 'Economy. "Silk! Furs! Spices!" A bustling hub that generates steady tax gold.', 
        scale: 1.2,
        taxValue: 25
    }, 
    { 
        id: 'training_dummy',
        name: 'Combat Dummy',
        cost: 100, 
        icon: 'fa-user-ninja', 
        color: 'text-yellow-700', 
        description: 'Training. Filled with hay. Useful for hitting higher numbers. Increases town readiness.',
        taxValue: 5,
        defenseValue: 1
    },
    { 
        id: 'furnace', 
        name: 'Smelter', 
        cost: 600, 
        icon: 'fa-fire-burner', 
        color: 'text-orange-500', 
        description: 'Industry. The heart of smithing. Smelts ores day and night. High economic output.', 
        scale: 1.2,
        taxValue: 20
    }, 
    { 
        id: 'archery_target', 
        name: 'Archery Range', 
        cost: 200, 
        icon: 'fa-bullseye', 
        color: 'text-white', 
        description: 'Training. "Aim for the center!" Improves accuracy of local defenders.',
        defenseValue: 2,
        taxValue: 5 
    }, 
    { 
        id: 'flower_red', 
        name: 'Red Flower', 
        cost: 25, 
        icon: 'fa-spa', 
        color: 'text-red-400', 
        description: 'Farming. A vibrant red blossom. "Examine Red Flower: It is a pretty flower."',
        taxValue: 2
    }, 
    { 
        id: 'tree_pine', 
        name: 'Pine Tree', 
        cost: 20, 
        icon: 'fa-tree', 
        color: 'text-emerald-700', 
        description: 'Nature. An evergreen pine. Provides shade and the scent of sap.', 
        scale: 1.2,
        taxValue: 2
    }, 
    { 
        id: 'bank_booth',
        name: 'Bank Booth', 
        cost: 450, 
        icon: 'fa-sack-dollar', 
        color: 'text-yellow-300', 
        description: 'Economy. "You can rely on us." The safest place in Gielinor. Boosts Gold storage.',
        taxValue: 15
    },
    { 
        id: 'altar_guthix',
        name: 'Altar of Balance', 
        cost: 800, 
        icon: 'fa-place-of-worship', 
        color: 'text-teal-400', 
        description: 'Prayer. A shrine to Guthix. Promotes balance and harmony in the settlement.',
        taxValue: 10,
        defenseValue: 1
    },
    { 
        id: 'house_cottage', 
        name: 'Cottage', 
        cost: 500, 
        icon: 'fa-house', 
        color: 'text-amber-200', 
        description: 'Housing. A cozy wooden home. "Home sweet home." Supports population growth.', 
        scale: 1.5,
        upgradeTo: 'house_manor',
        taxValue: 15
    },
    { 
        id: 'house_manor', 
        name: 'Manor', 
        cost: 1500, 
        icon: 'fa-house-chimney', 
        color: 'text-purple-300', 
        description: 'Housing. A stately home for the town elite. Generates high tax revenue.', 
        scale: 1.8,
        hidden: true,
        taxValue: 40
    },
    { 
        id: 'watchtower', 
        name: 'Watchtower', 
        cost: 800, 
        icon: 'fa-eye', 
        color: 'text-stone-300', 
        description: 'Defense. "Scanning horizon..." Provides early warning against raids. High Def bonus.', 
        scale: 1.8,
        upgradeTo: 'fortified_tower',
        taxValue: 10,
        defenseValue: 5 
    },
    { 
        id: 'fortified_tower', 
        name: 'Fortified Tower', 
        cost: 2500, 
        icon: 'fa-chess-rook', 
        color: 'text-slate-200', 
        description: 'Defense. A heavy stone tower with arrow slits. Archers rain fire from above.', 
        scale: 2.0,
        hidden: true,
        combatStats: { damage: 5, type: 'RANGED', range: 5 },
        taxValue: 20,
        defenseValue: 8
    },
    { 
        id: 'blacksmith', 
        name: 'Blacksmith', 
        cost: 1200, 
        icon: 'fa-hammer', 
        color: 'text-gray-400', 
        description: 'Industry. The clanging of hammers never stops. Repairs gear and arms the guard.', 
        scale: 1.3,
        taxValue: 30,
        defenseValue: 2
    }, 
    { 
        id: 'castle_keep', 
        name: 'Town Hall', 
        cost: 5000, 
        icon: 'fa-chess-king', 
        color: 'text-gray-200', 
        description: 'Administration. The seat of power. Massive boost to Tax Value and authority.', 
        scale: 2,
        taxValue: 100,
        defenseValue: 5
    },
    
    // Troops
    { 
        id: 'guard_varrock', 
        name: 'Varrock Guard', 
        cost: 100, 
        icon: 'fa-shield-halved', 
        color: 'text-gray-400', 
        description: 'Troop. Equipped with bronze weaponry. "What is it now?" Basic melee defense.', 
        combatStats: { damage: 2, type: 'MELEE', range: 1 },
        taxValue: -5, 
        defenseValue: 2
    }, 
    { 
        id: 'guard_dog', 
        name: 'Guard Dog', 
        cost: 250, 
        icon: 'fa-paw', 
        color: 'text-emerald-500', 
        description: 'Troop. A loyal hound trained by Scouts to sniff out danger. High defense and sharp bites.', 
        combatStats: { damage: 3, type: 'MELEE', range: 1 },
        taxValue: -5, 
        defenseValue: 6
    },
    { 
        id: 'ranger_elf', 
        name: 'Elf Ranger', 
        cost: 350, 
        icon: 'fa-bullseye', 
        color: 'text-green-400', 
        description: 'Troop. A scout from Lletya wielding a crystal bow. High accuracy ranged support.', 
        combatStats: { damage: 6, type: 'RANGED', range: 4 },
        taxValue: -10, 
        defenseValue: 3
    }, 
    { 
        id: 'knight_white', 
        name: 'White Knight', 
        cost: 1200, 
        icon: 'fa-hand-fist', 
        color: 'text-white', 
        description: 'Troop. Falador\'s finest. "We serve Saradomin." High defense and melee damage.', 
        combatStats: { damage: 15, type: 'MELEE', range: 1 },
        taxValue: -25, 
        defenseValue: 5
    }, 
    { 
        id: 'dragon_green_baby', 
        name: 'Baby Green Dragon', 
        cost: 5000, 
        icon: 'fa-dragon', 
        color: 'text-green-600', 
        description: 'Troop. A fierce hatchling. "Roar!" Deals massive magic damage with dragonfire.', 
        combatStats: { damage: 40, type: 'MAGIC', range: 3 },
        taxValue: -50, 
        defenseValue: 10
    },
    
    // Utility Units
    { 
        id: 'gnome_firemaker', 
        name: 'Gnome Firemaker', 
        cost: 250, 
        icon: 'fa-fire', 
        color: 'text-red-500', 
        description: 'Utility. "Burn with me!" Automatically extinguishes fires that start during Decay events.', 
        combatStats: { damage: 1, type: 'SUPPORT' },
        taxValue: 2
    }, 
    { 
        id: 'estate_agent', 
        name: 'Estate Agent', 
        cost: 400, 
        icon: 'fa-hammer', 
        color: 'text-yellow-500', 
        description: 'Utility. "Location, location!" Automatically repairs damaged buildings for free.', 
        combatStats: { damage: 1, type: 'SUPPORT' },
        taxValue: 5
    }, 

    // Event Items (Hidden from build menu)
    { id: 'meteor', name: 'Meteorite', cost: 0, icon: 'fa-meteor', color: 'text-orange-600', description: 'Fallen from the sky. Contains rare ore. Mine it!', hidden: true, scale: 1.2 }, 
    { id: 'treasure_chest', name: 'Buried Treasure', cost: 0, icon: 'fa-toolbox', color: 'text-yellow-500', description: 'An old casket surfaced by the rain. Open it!', hidden: true },
];

// Mock Data updated to use new skill names
export const MOCK_VAULT_FILES: Record<string, string> = {
  "QUESTS.md": `# Quests
Recipe for Disaster: [ ] Meal prep 4 weeks in a row.
Dragon Slayer: [ ] Submit the NIDA Grant.
Desert Treasure: [ ] Plan/Book the next vacation (Pasadena/Getaway).
One Small Favour: [ ] Clear the entire email inbox.
`,
  "Daily/2023-10-27.md": `---
tags: #Daily
date: 2023-10-27
---
# Daily Log 2023-10-27
[!NOTE]- Habits
Brush_Teeth:: 2
Dog_Training:: 15
Coding:: 30
Exercise:: 45
Call_loved_one:: 1
Study:: 30
`,
  "Skills/Strength.md": `---
tags: skill
skill_name: Strength
level: 5
current_xp: 400
xp_for_next_level: 800
---`,
  "Skills/Scout.md": `---
tags: skill
skill_name: Scout
level: 3
current_xp: 120
xp_for_next_level: 400
---`
};
