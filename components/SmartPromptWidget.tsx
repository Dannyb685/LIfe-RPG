import React, { useState, useEffect } from 'react';
import { GameState } from '../types';
import { getSmartPrompt, SmartPrompt } from '../logic/smartPrompts';

interface SmartPromptWidgetProps {
    gameState: GameState;
}

const SmartPromptWidget: React.FC<SmartPromptWidgetProps> = ({ gameState }) => {
    const [prompt, setPrompt] = useState<SmartPrompt | null>(null);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        setPrompt(getSmartPrompt(gameState));
    }, [gameState]); // Re-check when game state updates (or we could add a timer)

    if (!prompt || !visible) return null;

    return (
        <div className="bg-white border-l-4 border-stone-300 shadow-sm p-4 rounded-r-lg max-w-md mx-auto mb-6 flex items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className={`mt-1 text-xl ${prompt.color}`}>
                <i className={`fa-solid ${prompt.icon}`}></i>
            </div>
            <div className="flex-1">
                <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1">
                    Suggestion
                </div>
                <div className="text-stone-700 font-serif italic text-lg leading-snug">
                    "{prompt.text}"
                </div>
            </div>
            <button
                onClick={() => setVisible(false)}
                className="text-stone-300 hover:text-stone-500 transition-colors"
            >
                <i className="fa-solid fa-xmark"></i>
            </button>
        </div>
    );
};

export default SmartPromptWidget;
