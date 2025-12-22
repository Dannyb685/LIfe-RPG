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
        <h2 className="text-3xl font-serif italic text-sanctuary-ink mb-2">The Shrine</h2>
        <div className="text-sanctuary-inkLight italic font-serif">"Adjust your path as the seasons change."</div>
      </div>

      <div className="bg-white/40 p-8 rounded-xl border border-sanctuary-border shadow-soft space-y-8 backdrop-blur-sm">

        {/* THEME SELECTOR */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <i className="fas fa-palette text-sanctuary-inkLight"></i>
              <label className="text-xs font-bold uppercase tracking-widest text-sanctuary-inkLight">Garden Theme</label>
            </div>
            <div className="flex bg-white rounded-lg p-1 border border-sanctuary-border">
              <button
                onClick={() => setLocalThemeMode('SMART')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${localThemeMode === 'SMART' ? 'bg-sanctuary-green text-white shadow-sm' : 'text-sanctuary-inkLight'}`}
              >
                SMART
              </button>
              <button
                onClick={() => setLocalThemeMode('MANUAL')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${localThemeMode === 'MANUAL' ? 'bg-sanctuary-green text-white shadow-sm' : 'text-sanctuary-inkLight'}`}
              >
                MANUAL
              </button>
            </div>
          </div>

          {localThemeMode === 'SMART' && (
            <div className="p-4 bg-white/50 rounded-lg border border-sanctuary-border text-sm text-sanctuary-inkLight italic flex items-center justify-center gap-2">
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
                    ? 'bg-sanctuary-green/10 border-sanctuary-green'
                    : 'bg-white/50 border-sanctuary-border hover:border-sanctuary-inkLight'}`}
                >
                  <div className={`w-8 h-8 rounded-md bg-cover bg-center shrink-0`} style={{ backgroundImage: `url("${assetBasePath}/${theme.file}")` }}></div>
                  <div className="min-w-0">
                    <div className={`text-xs font-bold truncate ${localManualThemeId === theme.id ? 'text-sanctuary-green' : 'text-sanctuary-ink'}`}>{theme.name}</div>
                    <div className="text-[10px] text-sanctuary-inkLight uppercase tracking-wider">{theme.style}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <hr className="border-sanctuary-border" />

        {/* Sound Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white text-sanctuary-inkLight flex items-center justify-center border border-sanctuary-border">
              <i className={`fas ${localSound ? 'fa-volume-high' : 'fa-volume-xmark'}`}></i>
            </div>
            <div>
              <div className="font-bold text-sanctuary-ink">Sound Effects</div>
              <div className="text-xs text-sanctuary-inkLight">Enable ambient sounds and alerts</div>
            </div>
          </div>
          <button
            onClick={() => setLocalSound(!localSound)}
            className={`w-12 h-6 rounded-full transition-colors relative ${localSound ? 'bg-sanctuary-green' : 'bg-sanctuary-border'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${localSound ? 'left-7' : 'left-1'}`}></div>
          </button>
        </div>

        <hr className="border-sanctuary-border" />

        {/* VAULT MAPPINGS SECTION */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="text-xs font-bold uppercase tracking-widest text-sanctuary-inkLight">Vault Connections</label>
            <div className="text-xs text-sanctuary-inkLight italic">Map folders/tags to Skills</div>
          </div>

          <div className="space-y-2 mb-4">
            {localMappings.map(m => (
              <div key={m.id} className="flex items-center justify-between bg-white/60 p-3 rounded-lg border border-sanctuary-border">
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${m.type === 'TAG' ? 'bg-sanctuary-ink/10 text-sanctuary-ink' : 'bg-sanctuary-gold/10 text-sanctuary-gold'}`}>
                    {m.type}
                  </span>
                  <span className="font-mono text-sm text-sanctuary-ink">{m.pattern}</span>
                  <i className="fas fa-arrow-right text-sanctuary-inkLight text-xs"></i>
                  <span className="font-bold text-sanctuary-ink text-sm capitalize">{m.skillId}</span>
                </div>
                <button onClick={() => removeMapping(m.id)} className="text-sanctuary-inkLight hover:text-sanctuary-red">
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            ))}
          </div>

          {/* Add New Form */}
          <div className="flex gap-2 p-2 bg-white/50 rounded-lg border border-sanctuary-border">
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as 'TAG' | 'FOLDER')}
              className="bg-transparent border text-xs font-bold border-sanctuary-border rounded px-2 py-1 outline-none text-sanctuary-ink focus:border-sanctuary-green"
            >
              <option value="TAG">TAG (#)</option>
              <option value="FOLDER">FOLDER (/)</option>
            </select>
            <input
              type="text"
              placeholder={newType === 'TAG' ? "#gym" : "Journal/Daily"}
              value={newPattern}
              onChange={(e) => setNewPattern(e.target.value)}
              className="flex-1 bg-transparent border border-sanctuary-border rounded px-3 py-1 text-sm outline-none text-sanctuary-ink focus:border-sanctuary-green placeholder:text-sanctuary-inkLight/50"
            />
            <select
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              className="bg-transparent border text-xs border-sanctuary-border rounded px-2 py-1 outline-none text-sanctuary-ink capitalize focus:border-sanctuary-green"
            >
              {Object.values(SKILL_DEFINITIONS).map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <button
              onClick={addMapping}
              className="w-8 h-8 rounded bg-sanctuary-green text-white flex items-center justify-center hover:opacity-90"
            >
              <i className="fas fa-plus"></i>
            </button>
          </div>
        </div>

        <hr className="border-sanctuary-border" />

        {/* PERFORMANCE / DEBOUNCE DELAY */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-sanctuary-inkLight mb-2">Performance Delay</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="500"
              max="10000"
              step="500"
              value={localDebounce}
              onChange={(e) => setLocalDebounce(Number(e.target.value))}
              className="flex-1 h-2 bg-sanctuary-border rounded-lg appearance-none cursor-pointer accent-sanctuary-green"
            />
            <div className="w-20 text-center font-mono font-bold text-sanctuary-ink text-sm border border-sanctuary-border rounded px-2 py-1 bg-white">
              {(localDebounce / 1000).toFixed(1)}s
            </div>
          </div>
          <p className="text-xs text-sanctuary-inkLight mt-2">Adjust wait time after typing before updating stats. (Default: 2.0s)</p>
        </div>

        <hr className="border-sanctuary-border" />

        {/* Default XP */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-sanctuary-inkLight mb-2">Default Task XP</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="50"
              value={localXp}
              onChange={(e) => setLocalXp(Number(e.target.value))}
              className="flex-1 h-2 bg-sanctuary-border rounded-lg appearance-none cursor-pointer accent-sanctuary-green"
            />
            <div className="w-12 text-center font-mono font-bold text-sanctuary-ink text-lg border border-sanctuary-border rounded px-2 py-1 bg-white">
              {localXp}
            </div>
          </div>
          <p className="text-xs text-sanctuary-inkLight mt-2">XP awarded for generic checked checkboxes.</p>
        </div>

        <hr className="border-sanctuary-border" />

        {/* DATA REVIEW QUEUE */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-sanctuary-inkLight mb-4">Data Review Queue</label>
          <ReviewQueue
            unknownSources={filteredUnknowns}
            onMap={handleMapSource}
            onIgnore={handleIgnoreSource}
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full py-4 bg-sanctuary-ink text-white rounded-lg font-bold uppercase tracking-widest hover:bg-sanctuary-inkLight transition-all active:scale-[0.98]"
        >
          {showSaved ? (
            <span className="flex items-center justify-center gap-2 text-white/90">
              <i className="fas fa-check"></i> Changes Saved
            </span>
          ) : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
};

export default Settings;
