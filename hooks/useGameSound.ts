
import useSound from 'use-sound';
import { useCallback } from 'react';

// FreeSound Previews (Creative Commons 0 or Sampling Plus - usually safe for prototypes)
const SOUNDS = {
    CHIME: 'https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3', // Task Complete
    COIN: 'https://cdn.freesound.org/previews/341/341695_5858296-lq.mp3',  // Purchase
    GONG: 'https://cdn.freesound.org/previews/56/56364_94921-lq.mp3',      // Level Up / Milestone
};

export const useGameSound = (enabled: boolean) => {
    const [playChime] = useSound(SOUNDS.CHIME, { volume: 0.5 });
    const [playCoin] = useSound(SOUNDS.COIN, { volume: 0.5 });
    const [playGong] = useSound(SOUNDS.GONG, { volume: 0.4 });

    const play = useCallback((sound: 'chime' | 'coin' | 'gong') => {
        if (!enabled) return;

        switch (sound) {
            case 'chime':
                playChime();
                break;
            case 'coin':
                playCoin();
                break;
            case 'gong':
                playGong();
                break;
        }
    }, [enabled, playChime, playCoin, playGong]);

    return { play };
};
