import React from 'react';
import { BUILDINGS } from '../constants';
import { BuildingDef } from '../types';
import { motion } from 'framer-motion';

interface MarketProps {
    ki: number;
    onBuy: (buildingId: string) => void;
}

const Market: React.FC<MarketProps> = ({ ki, onBuy }) => {
    // Filter out hidden items
    const purchaseableItems = BUILDINGS.filter(b => !b.hidden);

    return (
        <div className="max-w-5xl mx-auto pb-12">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-light text-stone-800 mb-2">Sanctuary Market</h2>
                <div className="text-stone-400 italic font-serif mb-4">"Invest in your environment, and it will invest in you."</div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full border border-amber-100 text-amber-800 font-bold font-mono">
                    <img src="https://i.imgur.com/81j18dD.png" className="w-4 h-4" alt="Ki" />
                    {ki.toLocaleString()} Ki
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {purchaseableItems.map((item) => {
                    const canAfford = ki >= item.cost;

                    return (
                        <motion.div
                            key={item.id}
                            whileHover={{ scale: 1.02 }}
                            className={`group relative bg-white border border-stone-200 rounded-xl p-6 transition-all shadow-sm hover:shadow-md ${!canAfford ? 'opacity-70 grayscale-[0.5]' : ''}`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-stone-50 text-2xl ${item.color}`}>
                                    <i className={`fa-solid ${item.icon}`}></i>
                                </div>
                                <div className="text-xs font-bold uppercase tracking-widest text-stone-300">
                                    {item.taxValue > 0 ? `+${item.taxValue} Tax` : 'Decor'}
                                </div>
                            </div>

                            <h3 className="font-bold text-stone-800 mb-1">{item.name}</h3>
                            <p className="text-xs text-stone-500 mb-6 h-8 line-clamp-2 leading-relaxed">
                                {item.description}
                            </p>

                            <button
                                onClick={() => canAfford && onBuy(item.id)}
                                disabled={!canAfford}
                                className={`w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2
                                    ${canAfford
                                        ? 'bg-stone-900 text-white hover:bg-stone-700 active:scale-95'
                                        : 'bg-stone-100 text-stone-400 cursor-not-allowed'}`}
                            >
                                <span>{item.cost} Ki</span>
                            </button>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default Market;
