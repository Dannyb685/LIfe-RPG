import { GameState, Modifier } from '../types';
import { SKILL_DEFINITIONS } from '../constants';

// Define thresholds and rewards
const PERK_DEFINITIONS = [
    {
        skillId: 'strength',
        level: 10,
        name: 'Discipline',
        description: '+10% Ki Gain',
        effect: { type: 'KI_BOOST', value: 1.1 }
    },
    {
        skillId: 'intellect',
        level: 10,
        name: 'Efficiency',
        description: '+10% XP Gain',
        effect: { type: 'XP_BOOST', value: 1.1 }
    },
    {
        skillId: 'spirit',
        level: 10,
        name: 'Inner Peace',
        description: 'Reduce decay by 10%',
        effect: { type: 'DECAY_REDUCTION', value: 0.9 }
    },
    {
        skillId: 'creativity',
        level: 10,
        name: 'Inspiration',
        description: '+10% Ki Gain',
        effect: { type: 'KI_BOOST', value: 1.1 }
    }
] as const;

export const calculatePerks = (gameState: GameState): Modifier[] => {
    const activePerks: Modifier[] = [];

    PERK_DEFINITIONS.forEach(def => {
        const skill = gameState.skills.find(s => s.id === def.skillId);
        if (skill && skill.level >= def.level) {
            activePerks.push({
                id: `perk_${def.skillId}_${def.level}`,
                name: def.name,
                description: def.description,
                effect: def.effect as any, // Type cast for simplicity in initial scaffold
                source: `Lvl ${def.level} ${skill.name}`
            });
        }
    });

    return activePerks;
};

export const applyModifiers = (baseValue: number, modifiers: Modifier[], type: 'XP_BOOST' | 'KI_BOOST' | 'DECAY_REDUCTION'): number => {
    let finalValue = baseValue;

    // Additive or Multiplicative? Let's go multiplicative for RPG scaling
    modifiers.filter(m => m.effect.type === type).forEach(m => {
        finalValue *= m.effect.value;
    });

    return finalValue;
};
