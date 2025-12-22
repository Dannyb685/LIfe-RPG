import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useSound from 'use-sound';

// BEHAVIOR CONFIG
const MOVE_INTERVAL = 4000; // ms between decisions
const SPEED = 50; // pixels per second roughly (used for duration calc)
const BOUNDS = { width: 300, height: 300 }; // Movement area (relative to center or container)

type PetState = 'IDLE' | 'WALK' | 'SLEEP' | 'HAPPY';

const Pet: React.FC = () => {
    // State
    const [state, setState] = useState<PetState>('IDLE');
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [direction, setDirection] = useState<'left' | 'right'>('right');
    const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);

    // Sounds (using simple browser beep logic or placeholder if hook fails)
    // In real app, we'd use useSound(sfx)

    // Decision Loop
    useEffect(() => {
        const interval = setInterval(() => {
            // 10% chance to sleep (if not sleeping)
            // 30% chance to walk
            // 60% chance to idle/stand

            const roll = Math.random();

            if (state === 'SLEEP') {
                // High chance to stay sleeping
                if (roll > 0.2) return;
                setState('IDLE'); // Wake up
                return;
            }

            if (roll < 0.1) {
                setState('SLEEP');
            } else if (roll < 0.5) {
                // WALK
                const newX = (Math.random() - 0.5) * BOUNDS.width;
                const newY = (Math.random() - 0.5) * BOUNDS.height;
                setDirection(newX > pos.x ? 'right' : 'left');
                setPos({ x: newX, y: newY });
                setState('WALK');
            } else {
                setState('IDLE');
            }

        }, MOVE_INTERVAL);

        return () => clearInterval(interval);
    }, [pos, state]);

    // Interaction
    const handlePet = () => {
        setState('HAPPY');
        // Spawn Hearts
        const newHeart = { id: Date.now(), x: 0, y: -40 }; // Relative to pet
        setHearts(prev => [...prev, newHeart]);
        setTimeout(() => {
            setHearts(prev => prev.filter(h => h.id !== newHeart.id));
        }, 1000); // Remove heart after 1s

        // Return to activity after a moment
        setTimeout(() => setState('IDLE'), 1500);
    };

    // Render Logic
    // Using FontAwesome Icon for now, pivoted/rotated for life
    return (
        <div className="absolute top-1/2 left-1/2 pointer-events-none z-10" style={{ perspective: 500 }}>
            {/* Container moves the pet */}
            <motion.div
                animate={{ x: pos.x, y: pos.y }}
                transition={{ duration: state === 'WALK' ? 3 : 0.5, ease: "easeInOut" }}
                className="relative"
            >
                {/* Pet Body */}
                <motion.div
                    className="cursor-pointer pointer-events-auto text-amber-600 drop-shadow-lg"
                    onClick={handlePet}
                    animate={{
                        scaleY: state === 'WALK' ? [1, 0.9, 1] : 1, // Bop while walking
                        rotate: state === 'SLEEP' ? 90 : 0
                    }}
                    transition={{ repeat: Infinity, duration: 0.4 }}
                >
                    <div className={`text-4xl transition-transform duration-300 ${direction === 'left' ? '-scale-x-100' : ''}`}>
                        {state === 'SLEEP' ? (
                            <i className="fa-solid fa-dog opacity-80"></i>
                        ) : state === 'HAPPY' ? (
                            <i className="fa-solid fa-dog text-amber-500 animate-bounce"></i>
                        ) : (
                            <i className="fa-solid fa-dog"></i>
                        )}
                    </div>
                </motion.div>

                {/* Shadow */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-2 bg-black/20 rounded-full blur-[2px]"></div>

                {/* Sleep Zzzs */}
                <AnimatePresence>
                    {state === 'SLEEP' && (
                        <motion.div
                            initial={{ opacity: 0, y: 0 }}
                            animate={{ opacity: 1, y: -20, x: 10 }}
                            exit={{ opacity: 0 }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="absolute -top-4 right-0 font-bold text-blue-400 text-xs"
                        >
                            Zzz...
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Hearts */}
                <AnimatePresence>
                    {hearts.map(h => (
                        <motion.div
                            key={h.id}
                            initial={{ opacity: 1, y: -20, scale: 0.5 }}
                            animate={{ opacity: 0, y: -60, scale: 1.5 }}
                            exit={{ opacity: 0 }}
                            className="absolute left-1/2 -translate-x-1/2 text-red-500 text-xl"
                        >
                            <i className="fa-solid fa-heart"></i>
                        </motion.div>
                    ))}
                </AnimatePresence>

            </motion.div>
        </div>
    );
};

export default Pet;
