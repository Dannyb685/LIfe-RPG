import React, { useState } from 'react';
import { LifeRPGData, VaultMapping } from '../types';
import { SKILL_DEFINITIONS, GARDEN_THEMES } from '../constants';
import ReviewQueue from './ReviewQueue';

interface SettingsProps {
  defaultXp: number;
  soundEnabled: boolean;
  themeMode: 'MANUAL' | 'SMART' | 'RANDOM';
  manualThemeId: string;
  vaultMappings: VaultMapping[];
  unknownSources?: Record<string, number>;
  customMappings?: Record<string, any>;
  debounceDelay?: number;
  onSave: (settings: { defaultXp: number, soundEnabled: boolean, themeMode: 'MANUAL' | 'SMART' | 'RANDOM', manualThemeId: string, vaultMappings: VaultMapping[], customMappings: Record<string, any>, debounceDelay: number }) => void;
  assetBasePath: string;
}

const Settings: React.FC<SettingsProps> = ({ defaultXp, soundEnabled, themeMode = 'SMART', manualThemeId = 'classic', vaultMappings = [], customMappings = {}, unknownSources = {}, debounceDelay = 2000, onSave, assetBasePath }) => {
  // ... existing hooks ...
  const [localXp, setLocalXp] = useState(defaultXp);
  const [localSound, setLocalSound] = useState(soundEnabled);
  const [localThemeMode, setLocalThemeMode] = useState<'MANUAL' | 'SMART' | 'RANDOM'>(themeMode);
  const [localManualThemeId, setLocalManualThemeId] = useState(manualThemeId);
  const [localMappings, setLocalMappings] = useState<VaultMapping[]>(vaultMappings);
  const [localCustomMappings, setLocalCustomMappings] = useState<Record<string, any>>(customMappings);
  const [localDebounce, setLocalDebounce] = useState(debounceDelay);
  const [showSaved, setShowSaved] = useState(false);

  // New Mapping Form State
  const [newPattern, setNewPattern] = useState('');
  const [newType, setNewType] = useState<'TAG' | 'FOLDER'>('TAG');
  const [newSkill, setNewSkill] = useState(SKILL_DEFINITIONS[0].id);

  const handleSave = () => {
    onSave({
      defaultXp: localXp,
      soundEnabled: localSound,
      themeMode: localThemeMode,
      manualThemeId: localManualThemeId,
      vaultMappings: localMappings,
      customMappings: localCustomMappings,
      debounceDelay: localDebounce
    });
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  const addMapping = () => {
    // ... same ...
    if (!newPattern) return;
    const mapping: VaultMapping = {
      id: Date.now().toString(),
      type: newType,
      pattern: newPattern,
      skillId: newSkill,
      xpPerWord: 0.1 // Default
    };
    setLocalMappings([...localMappings, mapping]);
    setNewPattern('');
  };

  const removeMapping = (id: string) => {
    setLocalMappings(localMappings.filter(m => m.id !== id));
  };

  const handleMapSource = (sourceKey: string, skillId: string, xp: number) => {
    setLocalCustomMappings({
      ...localCustomMappings,
      [sourceKey]: { skillId, xpPerUnit: xp, type: 'COUNT' } // Defaulting to COUNT for now
    });
  };

  const handleIgnoreSource = (sourceKey: string) => {
    // ... same ...
    setLocalCustomMappings({
      ...localCustomMappings,
      [sourceKey]: { skillId: 'NONE', xpPerUnit: 0, type: 'IGNORE' }
    });
  };

  // Filter out unknown sources that have been locally mapped/ignored already
  const filteredUnknowns = { ...unknownSources };
  Object.keys(localCustomMappings).forEach(k => delete filteredUnknowns[k]);

  return (
    <div className="max-w-xl mx-auto space-y-8 pb-12">
      <div className="text-center">
        <h2 className="text-3xl font-light text-[var(--text-normal)] mb-2">The Shrine</h2>
        <div className="text-[var(--text-muted)] italic font-serif">"Adjust your path as the seasons change."</div>
      </div>

      <div className="bg-[var(--background-primary-alt)] p-8 rounded-xl border border-[var(--background-modifier-border)] shadow-sm space-y-8">

        {/* THEME SELECTOR */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <i className="fas fa-palette text-[var(--text-muted)]"></i>
              <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Garden Theme</label>
            </div>
            <div className="flex bg-[var(--background-modifier-form-field)] rounded-lg p-1">
              <button
                onClick={() => setLocalThemeMode('SMART')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${localThemeMode === 'SMART' ? 'bg-[var(--interactive-accent)] text-white shadow-sm' : 'text-[var(--text-muted)]'}`}
              >
                SMART
              </button>
              <button
                onClick={() => setLocalThemeMode('MANUAL')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${localThemeMode === 'MANUAL' ? 'bg-[var(--interactive-accent)] text-white shadow-sm' : 'text-[var(--text-muted)]'}`}
              >
                MANUAL
              </button>
            </div>
          </div>

          {localThemeMode === 'SMART' && (
            <div className="p-4 bg-[var(--background-secondary)] rounded-lg border border-[var(--background-modifier-border)] text-sm text-[var(--text-muted)] italic flex items-center justify-center gap-2">
              <i className="fas fa-wand-magic-sparkles"></i>
              <span>Theme changes with time of day and season.</span>
            </div>
          )}

          {localThemeMode === 'MANUAL' && (
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {GARDEN_THEMES.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setLocalManualThemeId(theme.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${localManualThemeId === theme.id
                    ? 'bg-[var(--interactive-accent)]/10 border-[var(--interactive-accent)]'
                    : 'bg-[var(--background-secondary)] border-[var(--background-modifier-border)] hover:border-[var(--text-muted)]'}`}
                >
                  <div className={`w-8 h-8 rounded-md bg-cover bg-center shrink-0`} style={{ backgroundImage: `url("${assetBasePath}/${theme.file}")` }}></div>
                  <div className="min-w-0">
                    <div className={`text-xs font-bold truncate ${localManualThemeId === theme.id ? 'text-[var(--interactive-accent)]' : 'text-[var(--text-normal)]'}`}>{theme.name}</div>
                    <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{theme.style}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <hr className="border-[var(--background-modifier-border)]" />

        {/* Sound Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[var(--background-secondary)] text-[var(--text-muted)] flex items-center justify-center">
              <i className={`fas ${localSound ? 'fa-volume-high' : 'fa-volume-xmark'}`}></i>
            </div>
            <div>
              <div className="font-bold text-[var(--text-normal)]">Sound Effects</div>
              <div className="text-xs text-[var(--text-muted)]">Enable ambient sounds and alerts</div>
            </div>
          </div>
          <button
            onClick={() => setLocalSound(!localSound)}
            className={`w-12 h-6 rounded-full transition-colors relative ${localSound ? 'bg-[var(--interactive-accent)]' : 'bg-[var(--background-modifier-border)]'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${localSound ? 'left-7' : 'left-1'}`}></div>
          </button>
        </div>

        <hr className="border-[var(--background-modifier-border)]" />

        {/* VAULT MAPPINGS SECTION */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Vault Connections</label>
            <div className="text-xs text-[var(--text-muted)] italic">Map folders/tags to Skills</div>
          </div>

          <div className="space-y-2 mb-4">
            {localMappings.map(m => (
              <div key={m.id} className="flex items-center justify-between bg-[var(--background-secondary)] p-3 rounded-lg border border-[var(--background-modifier-border)]">
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${m.type === 'TAG' ? 'bg-indigo-100/10 text-indigo-400' : 'bg-amber-100/10 text-amber-400'}`}>
                    {m.type}
                  </span>
                  <span className="font-mono text-sm text-[var(--text-normal)]">{m.pattern}</span>
                  <i className="fas fa-arrow-right text-[var(--text-muted)] text-xs"></i>
                  <span className="font-bold text-[var(--text-normal)] text-sm capitalize">{m.skillId}</span>
                </div>
                <button onClick={() => removeMapping(m.id)} className="text-[var(--text-muted)] hover:text-red-500">
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            ))}
          </div>

          {/* Add New Form */}
          <div className="flex gap-2 p-2 bg-[var(--background-secondary)] rounded-lg">
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as 'TAG' | 'FOLDER')}
              className="bg-[var(--background-primary)] border text-xs font-bold border-[var(--background-modifier-border)] rounded px-2 py-1 outline-none text-[var(--text-normal)]"
            >
              <option value="TAG">TAG (#)</option>
              <option value="FOLDER">FOLDER (/)</option>
            </select>
            <input
              type="text"
              placeholder={newType === 'TAG' ? "#gym" : "Journal/Daily"}
              value={newPattern}
              onChange={(e) => setNewPattern(e.target.value)}
              className="flex-1 bg-[var(--background-primary)] border border-[var(--background-modifier-border)] rounded px-3 py-1 text-sm outline-none text-[var(--text-normal)]"
            />
            <select
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              className="bg-[var(--background-primary)] border text-xs border-[var(--background-modifier-border)] rounded px-2 py-1 outline-none text-[var(--text-normal)] capitalize"
            >
              {Object.values(SKILL_DEFINITIONS).map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <button
              onClick={addMapping}
              className="w-8 h-8 rounded bg-[var(--interactive-accent)] text-white flex items-center justify-center hover:opacity-80"
            >
              <i className="fas fa-plus"></i>
            </button>
          </div>
        </div>

        <hr className="border-[var(--background-modifier-border)]" />

        {/* PERFORMANCE / DEBOUNCE DELAY */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Performance Delay</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="500"
              max="10000"
              step="500"
              value={localDebounce}
              onChange={(e) => setLocalDebounce(Number(e.target.value))}
              className="flex-1 h-2 bg-[var(--background-modifier-border)] rounded-lg appearance-none cursor-pointer accent-[var(--interactive-accent)]"
            />
            <div className="w-20 text-center font-mono font-bold text-[var(--text-normal)] text-sm border border-[var(--background-modifier-border)] rounded px-2 py-1">
              {(localDebounce / 1000).toFixed(1)}s
            </div>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-2">Adjust wait time after typing before updating stats. (Default: 2.0s)</p>
        </div>

        <hr className="border-[var(--background-modifier-border)]" />

        {/* Default XP */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Default Task XP</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="50"
              value={localXp}
              onChange={(e) => setLocalXp(Number(e.target.value))}
              className="flex-1 h-2 bg-[var(--background-modifier-border)] rounded-lg appearance-none cursor-pointer accent-[var(--interactive-accent)]"
            />
            <div className="w-12 text-center font-mono font-bold text-[var(--text-normal)] text-lg border border-[var(--background-modifier-border)] rounded px-2 py-1">
              {localXp}
            </div>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-2">XP awarded for generic checked checkboxes.</p>
        </div>

        <hr className="border-[var(--background-modifier-border)]" />

        {/* DATA REVIEW QUEUE */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">Data Review Queue</label>
          <ReviewQueue
            unknownSources={filteredUnknowns}
            onMap={handleMapSource}
            onIgnore={handleIgnoreSource}
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full py-4 bg-[var(--interactive-accent)] text-white rounded-lg font-bold uppercase tracking-widest hover:opacity-90 transition-all active:scale-[0.98]"
        >
          {showSaved ? (
            <span className="flex items-center justify-center gap-2 text-white/80">
              <i className="fas fa-check"></i> Changes Saved
            </span>
          ) : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
};

export default Settings;
