import React from 'react';
import { SKILL_DEFINITIONS } from '../constants';

interface ReviewQueueProps {
    unknownSources: Record<string, number>;
    onMap: (sourceKey: string, skillId: string, xp: number) => void;
    onIgnore: (sourceKey: string) => void;
}

const ReviewQueue: React.FC<ReviewQueueProps> = ({ unknownSources, onMap, onIgnore }) => {
    const entries = Object.entries(unknownSources || {}).sort((a, b) => b[1] - a[1]);
    const [mappingKey, setMappingKey] = React.useState<string | null>(null);
    const [selectedSkill, setSelectedSkill] = React.useState(Object.values(SKILL_DEFINITIONS)[0].id);
    const [xpAmount, setXpAmount] = React.useState(10);

    const handleSaveMapping = () => {
        if (mappingKey) {
            onMap(mappingKey, selectedSkill, xpAmount);
            setMappingKey(null);
        }
    };

    if (entries.length === 0) {
        return (
            <div className="p-4 bg-sanctuary-green/10 border border-sanctuary-green/30 rounded-lg text-sm text-sanctuary-green">
                <i className="fa-solid fa-check-circle mr-2"></i>
                All data sources are mapped correctly.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-serif italic text-sanctuary-ink">Unmapped Data ({entries.length})</h3>
                <span className="text-xs text-sanctuary-inkLight">Found in your Daily Notes</span>
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {entries.map(([key, count]) => (
                    <div key={key} className="flex flex-col gap-2 p-3 bg-white/50 rounded-lg border border-sanctuary-border hover:border-sanctuary-inkLight/30 transition-colors">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-bold text-sanctuary-ink">{key}</div>
                                <div className="text-xs text-sanctuary-inkLight">Found {count} times</div>
                            </div>
                            <div className="flex gap-2">
                                {mappingKey === key ? (
                                    <button onClick={() => setMappingKey(null)} className="text-sanctuary-inkLight hover:text-sanctuary-red">
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>
                                ) : (
                                    <>
                                        <button onClick={() => setMappingKey(key)} className="px-3 py-1 text-xs bg-sanctuary-green text-white rounded hover:opacity-90 transition-opacity">
                                            Map
                                        </button>
                                        <button onClick={() => onIgnore(key)} className="px-3 py-1 text-xs bg-sanctuary-red/10 text-sanctuary-red rounded hover:bg-sanctuary-red/20 transition-colors">
                                            Ignore
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Inline Mapping Form */}
                        {mappingKey === key && (
                            <div className="flex items-center gap-2 mt-2 bg-white/80 p-2 rounded animate-fade-in border border-sanctuary-border">
                                <i className="fa-solid fa-arrow-right text-sanctuary-inkLight"></i>
                                <select
                                    value={selectedSkill}
                                    onChange={(e) => setSelectedSkill(e.target.value)}
                                    className="bg-transparent text-xs border border-sanctuary-border rounded px-2 py-1 text-sanctuary-ink outline-none focus:border-sanctuary-green"
                                >
                                    {Object.values(SKILL_DEFINITIONS).map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    value={xpAmount}
                                    onChange={(e) => setXpAmount(Number(e.target.value))}
                                    className="w-16 bg-transparent text-xs border border-sanctuary-border rounded px-2 py-1 text-sanctuary-ink outline-none focus:border-sanctuary-green"
                                />
                                <span className="text-[10px] text-sanctuary-inkLight uppercase">XP</span>
                                <button
                                    onClick={handleSaveMapping}
                                    className="ml-auto px-3 py-1 text-xs font-bold text-sanctuary-green hover:bg-sanctuary-green/10 rounded"
                                >
                                    Save
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReviewQueue;
