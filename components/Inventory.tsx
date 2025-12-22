import React from 'react';
import { InventorySlot, InventoryItem } from '../types';
import { ITEMS_DB } from '../services/lootService';

interface InventoryProps {
    slots: InventorySlot[];
    onUseItem: (slotIndex: number) => void;
}

const Inventory: React.FC<InventoryProps> = ({ slots, onUseItem }) => {
    // Helper to get item data
    const getItem = (id: string | null): InventoryItem | null => {
        if (!id) return null;
        return ITEMS_DB[id] || null;
    };

    return (
        <div className="bg-stone-100 p-4 rounded-xl shadow-inner border border-stone-200">
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="text-xs font-bold uppercase tracking-widest text-stone-500">Backpack</div>
                <div className="text-xs font-mono text-stone-400">{slots.filter(s => s.itemId !== null).length} / {slots.length}</div>
            </div>

            <div className="grid grid-cols-4 gap-2">
                {slots.map((slot, index) => {
                    const item = getItem(slot.itemId);

                    return (
                        <div
                            key={index}
                            onClick={() => item && onUseItem(index)}
                            className={`
                                aspect-square rounded-lg border-2 flex items-center justify-center relative cursor-pointer transition-all
                                ${item
                                    ? 'bg-white border-stone-300 hover:border-amber-400 hover:shadow-md active:scale-95'
                                    : 'bg-stone-200/50 border-stone-200 border-dashed'}
                            `}
                            title={item ? `${item.name}\n${item.description}` : 'Empty Slot'}
                        >
                            {item && (
                                <>
                                    <i className={`fa-solid ${item.icon} text-2xl ${item.color} drop-shadow-sm`}></i>
                                    {item.stackable && slot.quantity > 1 && (
                                        <div className="absolute top-1 right-1 text-[10px] font-bold bg-stone-800 text-white px-1 rounded-full min-w-[16px] text-center">
                                            {slot.quantity}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 text-center text-[10px] text-stone-400 italic">
                Click to inspect or use (Coming Soon)
            </div>
        </div>
    );
};

export default Inventory;
