import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DialogueOverlayProps {
    isOpen: boolean;
    speakerName: string;
    text: string;
    onClose: () => void;
    onNext?: () => void;
}

const DialogueOverlay: React.FC<DialogueOverlayProps> = ({ isOpen, speakerName, text, onClose, onNext }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 flex items-end justify-center pointer-events-none pb-12"
                >
                    {/* Backdrop Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-auto" onClick={onClose}></div>

                    {/* Dialogue Box */}
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="relative w-full max-w-2xl mx-4 bg-white/95 backdrop-blur-md border-2 border-stone-800 rounded-xl p-6 shadow-2xl pointer-events-auto"
                    >
                        <div className="absolute -top-6 left-6 bg-stone-800 text-white px-4 py-1 rounded-t-lg font-bold tracking-widest uppercase text-sm border-t-2 border-l-2 border-r-2 border-stone-800">
                            {speakerName}
                        </div>

                        <p className="text-xl font-serif text-stone-900 leading-relaxed mb-4">
                            "{text}"
                        </p>

                        <div className="flex justify-end gap-4">
                            <button onClick={onClose} className="text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-stone-600 transition-colors">
                                Dismiss
                            </button>
                            <button onClick={onNext || onClose} className="text-xs font-bold uppercase tracking-widest bg-stone-800 text-white px-4 py-2 rounded hover:bg-stone-900 transition-colors animate-pulse">
                                Next <i className="fa-solid fa-caret-right ml-1"></i>
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DialogueOverlay;
