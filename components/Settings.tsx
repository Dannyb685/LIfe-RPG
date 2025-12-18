
import React from 'react';

interface SettingsProps {
  defaultXp: number;
  goldMultiplier: number;
  soundEnabled: boolean;
  onSave: (newDefaultXp: number, newGoldMult: number, newSound: boolean) => void;
}

const Settings: React.FC<SettingsProps> = ({ defaultXp, goldMultiplier, soundEnabled, onSave }) => {
  const [xp, setXp] = React.useState(defaultXp);
  const [goldMult, setGoldMult] = React.useState(goldMultiplier);
  const [sound, setSound] = React.useState(soundEnabled);
  const [showGrid, setShowGrid] = React.useState(true); // New local setting simulation (would pass up in real app)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(xp, goldMult, sound);
  };

  return (
    <div className="max-w-2xl mx-auto bg-wood-pattern border-4 border-wood-black rounded-sm p-8 shadow-[8px_8px_0_rgba(0,0,0,0.5)] relative">
      {/* Decorative Screws */}
      <div className="absolute top-2 left-2 w-2 h-2 bg-[#8b7355] rounded-full shadow-inner border border-black/30"></div>
      <div className="absolute top-2 right-2 w-2 h-2 bg-[#8b7355] rounded-full shadow-inner border border-black/30"></div>
      <div className="absolute bottom-2 left-2 w-2 h-2 bg-[#8b7355] rounded-full shadow-inner border border-black/30"></div>
      <div className="absolute bottom-2 right-2 w-2 h-2 bg-[#8b7355] rounded-full shadow-inner border border-black/30"></div>

      <h2 className="text-2xl font-bold text-[#ff981f] mb-6 border-b-2 border-[#5d5447] pb-2 drop-shadow-text">
        <i className="fa-solid fa-cog mr-2"></i> Game Settings
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Default XP */}
        <div className="bg-[#2b2522] p-4 border border-[#5d5447] shadow-inner">
          <label className="block text-[#dcdcdc] text-sm font-bold mb-2 uppercase tracking-wide">
            Default Task XP Reward
          </label>
          <p className="text-[#9a9a9a] text-xs mb-3 font-mono">
            How much XP should a task award if no specific XP value is defined in the markdown (e.g., "(+10 XP)")?
          </p>
          <div className="flex items-center gap-3">
            <input 
              type="number" 
              min="1" 
              max="1000"
              value={xp}
              onChange={(e) => setXp(parseInt(e.target.value) || 0)}
              className="bg-[#1a1816] border-2 border-[#5d5447] text-[#00ff00] font-mono font-bold rounded px-3 py-2 w-24 focus:border-[#ff981f] focus:outline-none shadow-osrs-inset"
            />
            <span className="text-[#ff981f] font-bold text-sm">XP per task</span>
          </div>
        </div>

        {/* Gold Multiplier */}
        <div className="bg-[#2b2522] p-4 border border-[#5d5447] shadow-inner">
          <label className="block text-[#dcdcdc] text-sm font-bold mb-2 uppercase tracking-wide">
            Gold Multiplier
          </label>
          <p className="text-[#9a9a9a] text-xs mb-3 font-mono">
            Increase the amount of Gold earned per XP gained.
          </p>
          <div className="flex items-center gap-3">
            <input 
              type="number" 
              min="0.1" 
              max="10"
              step="0.1"
              value={goldMult}
              onChange={(e) => setGoldMult(parseFloat(e.target.value) || 1)}
              className="bg-[#1a1816] border-2 border-[#5d5447] text-[#00ff00] font-mono font-bold rounded px-3 py-2 w-24 focus:border-[#ff981f] focus:outline-none shadow-osrs-inset"
            />
            <span className="text-[#ff981f] font-bold text-sm">x Gold</span>
          </div>
        </div>

        {/* Sound Toggle */}
        <div className="bg-[#2b2522] p-4 border border-[#5d5447] shadow-inner flex items-center gap-4">
           <div 
                className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors border-2 ${sound ? 'bg-green-800 border-green-600' : 'bg-red-900 border-red-700'}`} 
                onClick={() => setSound(!sound)}
            >
              <div className={`w-5 h-5 rounded-full bg-[#dcdcdc] shadow-md transition-transform border border-black ${sound ? 'translate-x-6' : 'translate-x-0'}`}></div>
           </div>
           <div>
               <label className="block text-[#dcdcdc] text-sm font-bold uppercase tracking-wide">Sound Effects</label>
               <p className="text-[#9a9a9a] text-xs font-mono">Enable sounds for Focus Timer.</p>
           </div>
        </div>

        {/* Building Grid (Visual Preference) */}
        <div className="bg-[#2b2522] p-4 border border-[#5d5447] shadow-inner flex items-center gap-4 opacity-70 hover:opacity-100 transition-opacity">
           <div 
                className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors border-2 ${showGrid ? 'bg-blue-800 border-blue-600' : 'bg-gray-800 border-gray-600'}`} 
                onClick={() => setShowGrid(!showGrid)}
            >
              <div className={`w-5 h-5 rounded-full bg-[#dcdcdc] shadow-md transition-transform border border-black ${showGrid ? 'translate-x-6' : 'translate-x-0'}`}></div>
           </div>
           <div>
               <label className="block text-[#dcdcdc] text-sm font-bold uppercase tracking-wide">Show Construction Grid</label>
               <p className="text-[#9a9a9a] text-xs font-mono">Highlights tile borders in Home Base (Currently Visual Only).</p>
           </div>
        </div>

        <div className="pt-4 border-t border-[#5d5447] flex justify-end">
            <button 
                type="submit"
                className="bg-[#3e3226] border-2 border-[#5d5447] hover:bg-[#4a3f35] hover:border-[#ff981f] text-white font-bold py-3 px-8 rounded shadow-[2px_2px_0_#000] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
            >
                <i className="fa-solid fa-save text-[#00ff00]"></i> 
                <span>Save Changes</span>
            </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
