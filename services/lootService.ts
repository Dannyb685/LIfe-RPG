import { InventoryItem, Task, GameState } from '../types';

// --- ITEM DATABASE ---
export const ITEMS_DB: Record<string, InventoryItem> = {
    // Resources
    'herb_green': { id: 'herb_green', name: 'Grimy Guam', type: 'RESOURCE', description: 'A common herb. Needs cleaning.', icon: 'fa-leaf', color: 'text-green-500', stackable: true, value: 5 },
    'herb_red': { id: 'herb_red', name: 'Grimy Avantoe', type: 'RESOURCE', description: 'A rare herb.', icon: 'fa-cannabis', color: 'text-red-500', stackable: true, value: 15 },
    'ore_copper': { id: 'ore_copper', name: 'Copper Ore', type: 'RESOURCE', description: 'Basic metal.', icon: 'fa-cube', color: 'text-orange-700', stackable: true, value: 5 },
    'ore_iron': { id: 'ore_iron', name: 'Iron Ore', type: 'RESOURCE', description: 'Stronger metal.', icon: 'fa-mountain', color: 'text-stone-600', stackable: true, value: 15 },
    'geode': { id: 'geode', name: 'Geode', type: 'MISC', description: 'A hollow rock. Crack it open!', icon: 'fa-gem', color: 'text-purple-400', stackable: true, value: 50 },

    // Consumables
    'potion_energy': {
        id: 'potion_energy',
        name: 'Energy Potion',
        type: 'CONSUMABLE',
        description: 'Restores 20% Energy (Visual).',
        icon: 'fa-flask',
        color: 'text-yellow-400',
        stackable: true,
        value: 20
    }
};

// --- DROP TABLES ---
// Simple logic: 10% base chance on any task completion.
// Adjust based on skill?

export const checkLootTable = (task: Task, gameState: GameState): InventoryItem | null => {
    const roll = Math.random();

    // 10% Chance for Global Loot
    if (roll < 0.10) {
        // Sub-table
        const subRoll = Math.random();
        if (subRoll < 0.5) return ITEMS_DB['herb_green']; // Common
        if (subRoll < 0.8) return ITEMS_DB['ore_copper']; // Common
        if (subRoll < 0.95) return ITEMS_DB['ore_iron']; // Uncommon
        return ITEMS_DB['geode']; // Rare (5%)
    }

    // Skill Specific Loot?
    // e.g. "Mining" task -> Higher ore chance.
    // For now, keep it simple global pool.

    return null;
};
