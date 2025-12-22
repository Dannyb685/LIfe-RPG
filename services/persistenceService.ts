
import { LifeRPGData, GameState } from '../types';
import { HABIT_DEFINITIONS } from '../constants';

const DATA_FILE_PATH = 'life-rpg-data.json';

// Default state if no save file exists - Sanitized for the Sanctuary Audit
const DEFAULT_DATA: LifeRPGData = {
    baseLayout: [
        { x: 12, y: 12, buildingId: 'house_cottage', id: 'starter_house' },
    ],
    activeBuffs: [],
    history: {},
    settings: {
        defaultXp: 10,
        soundEnabled: true,
        themeMode: 'SMART',
        manualThemeId: 'classic',
        habits: HABIT_DEFINITIONS,
        vaultMappings: [],
        customMappings: {},
        debounceDelay: 2000
    }
};

/**
 * Saves the current game state to life-rpg-data.json in the Vault Root.
 */
export const saveGameData = async (plugin: any, data: Partial<LifeRPGData>) => {
    try {
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
            settings: { ...DEFAULT_DATA.settings, ...(data.settings || {}) }
        };
    } catch (e) {
        console.error("LifeRPG: Failed to load game data", e);
        return DEFAULT_DATA;
    }
};
