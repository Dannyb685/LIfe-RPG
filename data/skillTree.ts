export interface SkillDefinition {
    id: string;
    name: string;
    description: string;
    color: string;
    icon: string;
    perk?: string;
}

export interface SourceConfig {
    skillId: string;
    xpPerUnit: number; // e.g. 5 XP per minute, or 100 XP per checkmark
    type: 'COUNT' | 'DURATION' | 'COMPLETION' | 'RATING';
}

export const SKILL_TREE: Record<string, SkillDefinition> = {
    'INTELLECT': { id: 'INTELLECT', name: 'Intellect', description: 'Knowledge, Logic, Memory', color: '#3b82f6', icon: 'fa-brain' },
    'VITALITY': { id: 'VITALITY', name: 'Vitality', description: 'Health, Fitness, Energy', color: '#ef4444', icon: 'fa-heart' },
    'CREATIVITY': { id: 'CREATIVITY', name: 'Creativity', description: 'Art, Writing, Expression', color: '#a855f7', icon: 'fa-palette' },
    'DISCIPLINE': { id: 'DISCIPLINE', name: 'Discipline', description: 'Focus, Consistency, Willpower', color: '#f59e0b', icon: 'fa-fist-raised' },
    'CONNECTION': { id: 'CONNECTION', name: 'Connection', description: 'Social, Empathy, Nature', color: '#10b981', icon: 'fa-hand-holding-heart' },
};

export const SOURCE_MAPPING: Record<string, SourceConfig> = {
    // Legacy (2019-2020)
    'Anki Reviews': { skillId: 'INTELLECT', xpPerUnit: 1, type: 'COUNT' },
    'Practice Q\'s': { skillId: 'INTELLECT', xpPerUnit: 5, type: 'COUNT' },
    'Focused study time (minutes)': { skillId: 'INTELLECT', xpPerUnit: 2, type: 'DURATION' }, // 120xp/hr
    'Work Quality': { skillId: 'DISCIPLINE', xpPerUnit: 50, type: 'RATING' }, // Multiplier? Assuming 1-5 scale

    // Modern (2023-2025)
    'LoveLifeDrawing': { skillId: 'CREATIVITY', xpPerUnit: 100, type: 'COMPLETION' },
    'Brachman': { skillId: 'INTELLECT', xpPerUnit: 100, type: 'COMPLETION' },
    'MKSAP': { skillId: 'INTELLECT', xpPerUnit: 50, type: 'COMPLETION' },
};
