
import { App, TFile, CachedMetadata } from "obsidian";
import { SKILL_DEFINITIONS, HABIT_DEFINITIONS } from "../constants";
import { GameState, Skill, Task } from "../types";

/**
 * The Enhanced "Event Processor".
 * Parses Markdown files for habit data using a centralized Skill Tree Registry.
 */
export const parseVault = async (app: App, files: TFile[], defaultXp: number = 5, customMappings: Record<string, any> = {}): Promise<GameState> => {
    const skills: Skill[] = initializeSkills();
    const tasks: Task[] = [];
    const skillXpMap: Record<string, number> = {};
    const dailyReflections: Record<string, number> = {};
    const unknownSources: Record<string, number> = {};

    // Initialize skill map
    skills.forEach(s => skillXpMap[s.id] = 0);

    for (const file of files) {
        // Skip files that are not daily notes or relevant logs
        const isDailyNote = file.basename.match(/^\d{4}-\d{2}-\d{2}$/) || file.path.includes('Daily');
        if (!isDailyNote) continue;

        const cache = app.metadataCache.getFileCache(file);

        // 1. Process Frontmatter (Legacy 2019-2020)
        // Uses cache for speed if available
        if (cache?.frontmatter) {
            processFrontmatter(cache.frontmatter, skillXpMap, unknownSources, customMappings);
        }

        // 2. Process Inline Fields (Modern 2023-2025)
        // Requires reading file content. 
        // We do this serially for now to avoid freezing the main thread with too many IO ops,
        // though Promise.all could be faster for small batches.
        await parseFileContent(app, file, skillXpMap, unknownSources, customMappings, tasks);
    }

    // Calculate Levels
    skills.forEach(skill => {
        const xp = skillXpMap[skill.id] || 0;
        skill.currentXp = xp;
        skill.level = Math.floor(Math.sqrt(Math.max(0, xp)));
        skill.xpForNextLevel = Math.pow(skill.level + 1, 2);
    });

    return {
        skills,
        lastUpdate: Date.now(),
        tasks,
        activeBuffs: [],
        baseLayout: [],
        dailyReflections,
        unknownSources
    };
};

export const parseFileContent = async (app: App, file: TFile, skillXpMap: Record<string, number>, unknownSources: Record<string, number>, customMappings: Record<string, any>, tasks: Task[]) => {
    const content = await app.vault.read(file);

    // Regex for [key:: value]
    const inlineRegex = /\[(.*?)::(.*?)\]/g;
    let match;
    while ((match = inlineRegex.exec(content)) !== null) {
        const key = match[1].trim();
        const value = match[2].trim();
        processSource(key, value, skillXpMap, unknownSources, customMappings);
    }

    // --- NEW: Writing XP (Creativity/Writing) ---
    // 1 XP per 100 characters
    const charCount = content.length;
    const writingXp = Math.floor(charCount / 100);
    if (writingXp > 0) {
        // Find writing skill ID
        const writingId = Object.values(SKILL_DEFINITIONS).find(s => s.name === 'Expression')?.id || 'writing';
        skillXpMap[writingId] = (skillXpMap[writingId] || 0) + writingXp;
    }

    // --- NEW: Tag-based XP ---
    // Scan for all tags in the file and award bonus XP
    // Simplified Tag Mapping logic using SKILL_DEFINITIONS categories if possible
    const tagRegex = /#([a-zA-Z0-9_\-]+)/g;
    const uniqueTags = new Set<string>();
    let tagMatch;
    while ((tagMatch = tagRegex.exec(content)) !== null) {
        uniqueTags.add(tagMatch[1].toLowerCase());
    }

    // Fallback Tag Logic (Since we removed TAG_MAPPING import)
    uniqueTags.forEach(tag => {
        if (tag === 'pro') skillXpMap['strength'] = (skillXpMap['strength'] || 0) + 10;
        // ... add more if needed or rely on custom mappings
    });


    // We also need to process Frontmatter again here if we want to be safe, 
    // but the cache handled it above.

    // Regex for Tasks: - [ ] or - [x]
    const taskRegex = /^\s*-\s*\[([ xX])\]\s*(.*)$/gm;
    let taskMatch;
    while ((taskMatch = taskRegex.exec(content)) !== null) {
        const completed = taskMatch[1].toLowerCase() === 'x';
        const description = taskMatch[2].trim();

        // Basic Metadata Extraction from description (e.g. #habit)
        const isHabit = description.toLowerCase().includes('#habit');
        const skillTagMatch = description.match(/#(\w+)/);
        const skillTag = skillTagMatch ? skillTagMatch[1] : undefined;

        // Create Task Object
        // We use a simple hash of filename + index for ID to be consistent across reloads without persistence
        const id = `${file.basename}-${taskMatch.index}`;

        tasks.push({
            id,
            description,
            completed,
            xpReward: completed ? 10 : 0, // Dynamic later
            skillTag: skillTag || 'general',
            filename: file.basename,
            isHabit
        });
    }
};

const processFrontmatter = (frontmatter: any, skillXpMap: Record<string, number>, unknownSources: Record<string, number>, customMappings: Record<string, any>) => {
    for (const key in frontmatter) {
        processSource(key, frontmatter[key], skillXpMap, unknownSources, customMappings);
    }
};

const processSource = (sourceKey: string, value: any, skillXpMap: Record<string, number>, unknownSources: Record<string, number>, customMappings: Record<string, any>) => {
    // Skip internal keys
    if (['tags', 'cssclasses', 'date', 'aliases', 'position'].includes(sourceKey.toLowerCase())) return;

    // Check Custom Mappings FIRST, then Hardcoded from constants
    // For now, we try to match key to HABIT_DEFINITIONS
    const habitDef = HABIT_DEFINITIONS.find(h => h.key === sourceKey);

    // const config = customMappings[sourceKey] || SOURCE_MAPPING[sourceKey];

    if (!habitDef && !customMappings[sourceKey]) {
        // Track unknown source frequency
        unknownSources[sourceKey] = (unknownSources[sourceKey] || 0) + 1;
        return;
    }

    const config = customMappings[sourceKey] ? {
        skillId: customMappings[sourceKey].skillId,
        xpPerUnit: customMappings[sourceKey].xpPerUnit,
        type: customMappings[sourceKey].type || 'COUNT'
    } : {
        skillId: habitDef!.skillId,
        xpPerUnit: habitDef!.xpPerUnit,
        type: habitDef!.isBinary ? 'COMPLETION' : 'COUNT'
    };

    const numValue = parseFloat(value);
    if (isNaN(numValue)) return; // Only dealing with numeric habits for now

    let xpGain = 0;
    switch (config.type) {
        case 'COUNT':
        case 'DURATION':
            xpGain = numValue * config.xpPerUnit;
            break;
        case 'RATING':
            xpGain = numValue * config.xpPerUnit; // e.g. Rating 4.5 * 100 = 450xp
            break;
        case 'COMPLETION':
            // If key exists and has value, give fixed reward. 
            // Could check 'Completed' string but here we assume presence = done or numValue > 0
            xpGain = config.xpPerUnit;
            break;
    }

    if (xpGain > 0) {
        skillXpMap[config.skillId] = (skillXpMap[config.skillId] || 0) + xpGain;
    }
};

const initializeSkills = (): Skill[] => {
    return Object.values(SKILL_DEFINITIONS).map(def => ({
        id: def.id,
        name: def.name,
        level: 1,
        currentXp: 0,
        xpForNextLevel: 100,
        icon: def.icon,
        color: def.color,
        perk: def.perk
    }));
};

