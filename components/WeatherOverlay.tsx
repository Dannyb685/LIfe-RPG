import React from 'react';
import { motion } from 'framer-motion';

// Simple CSS-based particle system for "Zen" atmosphere
// We use a few fixed petals for performance and simplicity

const PETALS = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 5,
    duration: 10 + Math.random() * 10
}));

const WeatherOverlay: React.FC = () => {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {PETALS.map((petal) => (
                <motion.div
                    key={petal.id}
                    initial={{ y: -20, opacity: 0, x: 0 }}
                    animate={{
                        y: ['0vh', '100vh'],
                        opacity: [0, 0.8, 0],
                        x: [0, 20, -20, 0],
                        rotate: [0, 180, 360]
                    }}
                    transition={{
                        duration: petal.duration,
                        repeat: Infinity,
                        delay: petal.delay,
                        ease: "linear"
                    }}
                    style={{ left: petal.left }}
                    className="absolute w-3 h-3 bg-pink-200/40 rounded-full blur-[1px]"
                />
            ))}
        </div>
    );
};

export default WeatherOverlay;
