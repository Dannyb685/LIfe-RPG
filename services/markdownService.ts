
import { GameState, Skill, Task, LogEntry, GridItem, Quest } from '../types';
import { SKILL_ICONS, SKILL_COLORS, HABIT_DEFINITIONS, getLevelFromXp, getXpForLevel, SKILL_DEFINITIONS, SKILL_ID_TO_NAME } from '../constants';

// Helper to extract YAML frontmatter
const extractFrontmatter = (content: string): Record<string, any> => {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  
  const yaml = match[1];
  const result: Record<string, any> = {};
  
  yaml.split('\n').forEach(line => {
    const parts = line.split(':');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join(':').trim();
      // Basic number/string parsing
      if (!isNaN(Number(val)) && val !== '') {
        result[key] = Number(val);
      } else {
        result[key] = val.replace(/^["'](.*)["']$/, '$1'); // Remove quotes
      }
    }
  });
  return result;
};

// New Helper to extract Dataview Inline Fields (Key:: Value)
const extractInlineFields = (content: string): Record<string, any> => {
    const result: Record<string, any> = {};
    // Regex matches "Key:: Value" at the start of a line or after whitespace
    const regex = /^\s*([a-zA-Z0-9_]+)::\s*(.+)$/gm;
    
    let match;
    while ((match = regex.exec(content)) !== null) {
        const key = match[1].trim();
        const val = match[2].trim();
        // Basic number parsing
        if (!isNaN(Number(val)) && val !== '') {
            result[key] = Number(val);
        } else {
            result[key] = val;
        }
    }
    return result;
};

// Guess a skill reward based on quest name keywords
const inferQuestRewardSkill = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes('cook') || n.includes('recipe') || n.includes('food')) return 'cooking';
    if (n.includes('dragon') || n.includes('slayer') || n.includes('fight')) return 'strength';
    if (n.includes('treasure') || n.includes('scout') || n.includes('travel')) return 'scout';
    if (n.includes('favour') || n.includes('social') || n.includes('email')) return 'social';
    if (n.includes('code') || n.includes('tech')) return 'dungeoneering';
    return 'hitpoints'; // Default
};

// Parser logic
export const parseVault = (files: Record<string, string>, defaultXp: number = 5): GameState => {
  const skills: Skill[] = [];
  let tasks: Task[] = [];
  const logs: LogEntry[] = [];
  const quests: Quest[] = [];
  let totalXp = 0;
  
  // Track skill XP mainly from the habit calculations + loaded skill files
  const skillXpMap: Record<string, number> = {};

  // Initialize ALL skills from definitions
  Object.values(SKILL_DEFINITIONS).forEach(def => {
      skills.push({
          id: def.id,
          name: def.name,
          level: 1,
          currentXp: 0,
          xpForNextLevel: 100, // Placeholder, updated later
          icon: def.icon,
          color: def.color,
          perk: def.perk // Copy perk from definition
      });
      // Ensure key exists in map (using Name as key for consistency)
      skillXpMap[def.name] = 0;
  });

  Object.entries(files).forEach(([filename, content]) => {
    const frontmatter = extractFrontmatter(content);
    const inlineFields = extractInlineFields(content);
    
    // Merge frontmatter and inline fields (inline fields take precedence if duplicates exist)
    const combinedMetadata = { ...frontmatter, ...inlineFields };

    // 0. Parse QUESTS.md
    if (filename === 'QUESTS.md' || filename.endsWith('/QUESTS.md')) {
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
            // Regex: Quest Name: [ ] Description
            // e.g. "Recipe for Disaster: [ ] Meal prep 4 weeks in a row."
            const questMatch = line.match(/^([^:]+):\s*\[([ xX])\]\s*(.*)$/);
            if (questMatch) {
                const name = questMatch[1].trim();
                const isCompleted = questMatch[2].toLowerCase() === 'x';
                const description = questMatch[3].trim();
                const id = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
                
                const inferredSkill = inferQuestRewardSkill(name);
                
                quests.push({
                    id: id,
                    name: name,
                    description: description,
                    difficulty: 'EXPERIENCED', // Default difficulty
                    status: isCompleted ? 'COMPLETED' : 'IN_PROGRESS', // Auto-start if in file
                    steps: [
                        { id: `${id}_step_1`, description: description, completed: isCompleted }
                    ],
                    rewards: [
                        { xp: 5000, skill: inferredSkill },
                        { gold: 2000, xp: 0, skill: '' },
                        { item: "Mystery Reward", xp: 0, skill: '' }
                    ]
                });
            }
        });
    }

    // 1. Parse Explicit Skill Files (Base stats override)
    if (filename.includes('Skills/') || frontmatter.tags?.includes('skill')) {
      const skillName = frontmatter.skill_name || filename.split('/').pop()?.replace('.md', '') || 'Unknown';
      const currentXp = Number(frontmatter.current_xp) || 0;
      
      skillXpMap[skillName] = (skillXpMap[skillName] || 0) + currentXp;
      
      // We already initialized the skill, but we ensure it's in the map. 
      // Level recalculation happens at the end.
    }

    // 2. Parse Daily Notes (Habits & Tasks)
    const isDailyNote = filename.includes('Daily/') || frontmatter.tags?.includes('#Daily');
    
    if (isDailyNote) {
        // A. Parse Habits using the Combined Metadata (supports YAML and :: syntax)
        HABIT_DEFINITIONS.forEach(habit => {
            // Check if key exists; if not, treat as 0
            const rawValue = combinedMetadata[habit.key];
            const value = rawValue !== undefined && rawValue !== '' ? Number(rawValue) : 0;
            
            // If value exists in metadata, we process it (even if 0, to show incomplete task)
            if (combinedMetadata.hasOwnProperty(habit.key) || value >= 0) {
                const target = habit.target || 1;
                const isComplete = value >= target;
                
                // XP Logic: Binary vs Linear
                let xpEarned = 0;
                if (habit.isBinary) {
                    // Binary: If value > 0, you get the flat rate (xpPerUnit)
                    xpEarned = value > 0 ? habit.xpPerUnit : 0;
                } else {
                    // Linear: Value * Rate
                    xpEarned = Math.floor(value * habit.xpPerUnit);
                }

                // Map lowercase ID (e.g. 'scout') to Capitalized Name (e.g. 'Scout')
                const skillName = SKILL_ID_TO_NAME[habit.skillId] || habit.skillId;

                // Add to total XP for that skill
                if (xpEarned > 0) {
                     skillXpMap[skillName] = (skillXpMap[skillName] || 0) + xpEarned;
                     totalXp += xpEarned;
                }
                
                // Only push task if it was explicitly present in file OR we want to show all possible habits
                // For now, we strictly follow if it was in metadata to avoid cluttering old notes,
                // BUT for the current "Game" feel, users often want to see what they missed.
                // However, the prompt implies reading from what is there.
                if (combinedMetadata.hasOwnProperty(habit.key)) {
                    tasks.push({
                        id: `habit-${filename}-${habit.key}`,
                        description: habit.label || habit.key,
                        xpReward: xpEarned > 0 ? xpEarned : (habit.isBinary ? habit.xpPerUnit : target * habit.xpPerUnit), 
                        skillTag: skillName,
                        completed: isComplete,
                        filename: filename,
                        isHabit: true,
                        currentValue: value,
                        targetValue: target,
                        unit: habit.unit
                    });
                }
            }
        });

        // B. Parse Standard Checkboxes in Daily Note (Side Quests)
        const lines = content.split('\n');
        lines.forEach((line, index) => {
            const checkboxMatch = line.match(/^\s*-\s*\[([ xX])\]/);
            if (checkboxMatch) {
                const isCompleted = checkboxMatch[1].toLowerCase() === 'x';
                const xpMatch = line.match(/\(\+(\d+)\s*XP\)/i);
                const xpReward = xpMatch ? parseInt(xpMatch[1], 10) : defaultXp;
                const allTags = [...line.matchAll(/#([a-zA-Z0-9_\-:]+)/g)].map(m => m[1]);
                const buffsRewarded = allTags.filter(t => t.startsWith('buff:')).map(t => t.replace('buff:', ''));
                
                // Try to find a skill tag that matches one of our skills (case insensitive check)
                let skillTag = allTags.find(t => !t.startsWith('buff:') && t !== 'Daily') || 'General';
                
                // Normalize skill tag to proper Name if found in definitions
                const foundSkill = Object.values(SKILL_DEFINITIONS).find(s => s.name.toLowerCase() === skillTag.toLowerCase() || s.id === skillTag.toLowerCase());
                if (foundSkill) skillTag = foundSkill.name;

                let description = line
                    .replace(/^\s*-\s*\[([ xX])\]/, '')
                    .replace(/\(\+(\d+)\s*XP\)/i, '')
                    .replace(/#([a-zA-Z0-9_\-:]+)/g, '')
                    .trim();

                if (description) {
                    tasks.push({
                        id: `${filename}-${index}`,
                        description,
                        xpReward,
                        skillTag,
                        completed: isCompleted,
                        filename,
                        buffsRewarded
                    });
                    
                    if (isCompleted) {
                        totalXp += xpReward;
                        skillXpMap[skillTag] = (skillXpMap[skillTag] || 0) + xpReward;
                    }
                }
            }
        });
    }
  });

  // Re-sync Skill objects with calculated totals from Habits/Tasks + Apply XP Curve
  skills.forEach(skill => {
      // Get the aggregated XP or default to what was in the file if nothing else added
      const finalXp = skillXpMap[skill.name] || skill.currentXp;
      
      skill.currentXp = finalXp;
      skill.level = getLevelFromXp(finalXp);
      skill.xpForNextLevel = getXpForLevel(skill.level + 1);
  });
  
  totalXp = skills.reduce((acc, s) => acc + s.currentXp, 0);
  const gold = totalXp;

  // Center coordinates for 24x24 grid (center is ~12)
  const baseLayout: GridItem[] = [
     { x: 12, y: 12, buildingId: 'house_cottage', id: 'starter_house' },
     { x: 11, y: 12, buildingId: 'path_dirt', id: 'p1' },
     { x: 13, y: 12, buildingId: 'tree_pine', id: 't1' },
  ];

  return { skills, tasks, logs, totalXp, gold, baseLayout, quests };
};
