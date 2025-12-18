
import { LifeRPGData } from '../types';

const DATA_FILE_PATH = 'life-rpg-data.json';

// Default state if no save file exists
const DEFAULT_DATA: LifeRPGData = {
    gold: 0,
    baseLayout: [
        { x: 12, y: 12, buildingId: 'house_cottage', id: 'starter_house' },
        { x: 11, y: 12, buildingId: 'path_dirt', id: 'p1' },
        { x: 13, y: 12, buildingId: 'tree_pine', id: 't1' },
    ],
    activeBuffs: [],
    decayDebt: {},
    skillUpdateMap: {},
    quests: {}, // Initialize empty quests map
    settings: {
        defaultXp: 5,
        goldMultiplier: 1,
        soundEnabled: true
    }
};

/**
 * Saves the current game state to life-rpg-data.json in the Vault Root.
 */
export const saveGameData = async (plugin: any, data: Partial<LifeRPGData>) => {
    try {
        // Load existing data first to merge (prevent overwriting unrelated fields if partial)
        const current = await loadGameData(plugin);
        const merged = { ...current, ...data };
        
        await plugin.app.vault.adapter.write(DATA_FILE_PATH, JSON.stringify(merged, null, 2));
    } catch (e) {
        console.error("LifeRPG: Failed to save game data", e);
    }
};

/**
 * Loads game state from life-rpg-data.json. Returns defaults if missing.
 */
export const loadGameData = async (plugin: any): Promise<LifeRPGData> => {
    try {
        const exists = await plugin.app.vault.adapter.exists(DATA_FILE_PATH);
        if (!exists) {
            return DEFAULT_DATA;
        }

        const content = await plugin.app.vault.adapter.read(DATA_FILE_PATH);
        const data = JSON.parse(content);
        
        // Merge with defaults to ensure new fields are present
        return { 
            ...DEFAULT_DATA, 
            ...data, 
            quests: { ...DEFAULT_DATA.quests, ...(data.quests || {}) }, // Merge quests safely
            settings: { ...DEFAULT_DATA.settings, ...(data.settings || {}) } 
        };
    } catch (e) {
        console.error("LifeRPG: Failed to load game data", e);
        return DEFAULT_DATA;
    }
};
