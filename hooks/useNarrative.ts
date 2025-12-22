
import { StoryChapter } from '../types';

export const CHAPTERS: StoryChapter[] = [
    {
        id: "CH1",
        title: "1. The Awakening",
        minLevel: 1,
        content: "The garden is overgrown with the weeds of procrastination. A single sapling struggles for light.",
        unlocked: false
    },
    {
        id: "CH1_MID",
        title: "The First Step",
        minLevel: 5,
        content: "You have begun to clear the debris. The soil breathes again.",
        unlocked: false
    },
    {
        id: "CH2",
        title: "2. The Restoration",
        minLevel: 11,
        content: "The first blooms appear as your discipline takes root. The air feels cleaner here.",
        unlocked: false
    },
    {
        id: "CH3",
        title: "3. The Flourishing",
        minLevel: 21,
        content: "Life returns to the sanctuary. Birds sing of your consistency.",
        unlocked: false
    }
];

export const useNarrativeEngine = (totalLevel: number) => {
    const currentChapter = [...CHAPTERS].reverse().find(ch => totalLevel >= ch.minLevel) || CHAPTERS[0];
    const nextChapter = CHAPTERS.find(ch => totalLevel < ch.minLevel);

    // Calculate progress to next chapter
    let progress = 0;
    if (nextChapter && currentChapter) {
        const range = nextChapter.minLevel - currentChapter.minLevel;
        const current = totalLevel - currentChapter.minLevel;
        progress = Math.min(100, Math.max(0, (current / range) * 100));
    } else if (!nextChapter) {
        progress = 100; // End game
    }

    return {
        currentChapter,
        nextChapter,
        progressToNext: progress
    };
};
