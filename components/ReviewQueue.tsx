import React from 'react';

interface ReviewQueueProps {
    unknownSources: Record<string, number>;
    onMap: (sourceKey: string, skillId: string, xp: number) => void;
    onIgnore: (sourceKey: string) => void;
}

const ReviewQueue: React.FC<ReviewQueueProps> = ({ unknownSources, onMap, onIgnore }) => {
    const entries = Object.entries(unknownSources || {}).sort((a, b) => b[1] - a[1]);
    const [mappingKey, setMappingKey] = React.useState<string | null>(null);
    const [selectedSkill, setSelectedSkill] = React.useState('INTELLECT');
    const [xpAmount, setXpAmount] = React.useState(10);

    const handleSaveMapping = () => {
        if (mappingKey) {
            onMap(mappingKey, selectedSkill, xpAmount);
            setMappingKey(null);
        }
    };

    if (entries.length === 0) {
        return (
            <div className="p-4 bg-[var(--background-modifier-success)]/10 border border-[var(--background-modifier-success)] rounded-lg text-sm text-[var(--text-success)]">
                <i className="fa-solid fa-check-circle mr-2"></i>
                All data sources are mapped correctly.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-serif italic">Unmapped Data ({entries.length})</h3>
                <span className="text-xs text-[var(--text-muted)]">Found in your Daily Notes</span>
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {entries.map(([key, count]) => (
                    <div key={key} className="flex flex-col gap-2 p-3 bg-[var(--background-primary)] rounded-lg border border-[var(--background-modifier-border)]">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="font-bold text-[var(--text-normal)]">{key}</div>
                                <div className="text-xs text-[var(--text-muted)]">Found {count} times</div>
                            </div>
                            <div className="flex gap-2">
                                {mappingKey === key ? (
                                    <button onClick={() => setMappingKey(null)} className="text-[var(--text-muted)] hover:text-[var(--text-normal)]">
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>
                                ) : (
                                    <>
                                        <button onClick={() => setMappingKey(key)} className="px-3 py-1 text-xs bg-[var(--interactive-accent)] text-white rounded hover:opacity-90 transition-opacity">
                                            Map
                                        </button>
                                        <button onClick={() => onIgnore(key)} className="px-3 py-1 text-xs bg-[var(--background-modifier-error)]/20 text-[var(--text-error)] rounded hover:bg-[var(--background-modifier-error)]/30 transition-colors">
                                            Ignore
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Inline Mapping Form */}
                        {mappingKey === key && (
                            <div className="flex items-center gap-2 mt-2 bg-[var(--background-secondary)] p-2 rounded animate-fade-in">
                                <i className="fa-solid fa-arrow-right text-[var(--text-muted)]"></i>
                                <select
                                    value={selectedSkill}
                                    onChange={(e) => setSelectedSkill(e.target.value)}
                                    className="bg-[var(--background-primary)] text-xs border border-[var(--background-modifier-border)] rounded px-2 py-1"
                                >
                                    <option value="INTELLECT">Intellect</option>
                                    <option value="VITALITY">Vitality</option>
                                    <option value="CREATIVITY">Creativity</option>
                                    <option value="DISCIPLINE">Discipline</option>
                                    <option value="CONNECTION">Connection</option>
                                </select>
                                <input
                                    type="number"
                                    value={xpAmount}
                                    onChange={(e) => setXpAmount(Number(e.target.value))}
                                    className="w-16 bg-[var(--background-primary)] text-xs border border-[var(--background-modifier-border)] rounded px-2 py-1"
                                />
                                <span className="text-[10px] text-[var(--text-muted)] uppercase">XP</span>
                                <button
                                    onClick={handleSaveMapping}
                                    className="ml-auto px-3 py-1 text-xs font-bold text-[var(--interactive-accent)] hover:bg-[var(--interactive-accent)]/10 rounded"
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
