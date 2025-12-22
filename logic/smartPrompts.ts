import { GameState, HabitDefinition } from '../types';
import { HABIT_DEFINITIONS } from '../constants';

export interface SmartPrompt {
    id: string;
    text: string;
    icon: string;
    action: 'NAVIGATE' | 'REMINDER';
    color: string;
}

export const getSmartPrompt = (gameState: GameState): SmartPrompt | null => {
    const hour = new Date().getHours();

    // 1. Morning Routine (5AM - 10AM)
    if (hour >= 5 && hour < 10) {
        // Check if "Brush Teeth" is done
        // We look for tasks in gameState.tasks with description matching?
        // Actually, habits are parsed from Markdown. We don't have a direct "isDone" map in GameState for today's specific habits unless we parse the "Daily" file content.
        // However, gameState.tasks contains checkboxed items from the parsed files.
        // Let's assume a generic morning prompt for now.
        return {
            id: 'morning_meditate',
            text: "The morning air is crisp. Have you meditated yet?",
            icon: 'fa-sun',
            action: 'REMINDER',
            color: 'text-orange-400'
        };
    }

    // 2. Deep Work (10AM - 2PM)
    if (hour >= 10 && hour < 14) {
        return {
            id: 'deep_work',
            text: "Peak focus time. Tackle your hardest task.",
            icon: 'fa-brain',
            action: 'REMINDER',
            color: 'text-blue-500'
        };
    }

    // 3. Afternoon Slump / Movement (2PM - 5PM)
    if (hour >= 14 && hour < 17) {
        return {
            id: 'movement',
            text: "Energy dipping? Take a walk or stretch.",
            icon: 'fa-person-walking',
            action: 'REMINDER',
            color: 'text-emerald-500'
        };
    }

    // 4. Evening Wind Down (8PM - 10PM)
    if (hour >= 20 && hour < 22) {
        return {
            id: 'reflection',
            text: "Review your day. Log your victories.",
            icon: 'fa-pen-fancy',
            action: 'REMINDER',
            color: 'text-purple-400'
        };
    }

    // Default: Zen Quote or nothing
    return null;
};
