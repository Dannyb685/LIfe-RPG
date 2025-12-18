
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GameState, BuildingDef, GridItem, TownEvent } from '../types';
import { BUILDINGS } from '../constants';
import PixelAvatar from './PixelAvatar';
import PixelEnemy, { EnemyType } from './PixelEnemy';

interface HomeBaseProps {
  gameState: GameState;
  activeEvent: TownEvent | null;
  onBuild: (x: number, y: number, building: BuildingDef) => void;
  onRemove: (x: number, y: number) => void;
  onUpdateBuilding: (x: number, y: number, changes: Partial<GridItem>) => void;
  onCollectTaxes?: (amount: number) => void; 
  onLootDrop?: (amount: number, message: string) => void;
  onDeductGold?: (amount: number) => void;
  onNavigateToTasks?: (skillTag: string) => void;
  onEventComplete?: () => void;
  onContributeDefense?: (amount: number) => void;
}

interface HitSplat {
    id: number;
    damage: number;
    xOffset: number;
    yOffset: number;
}

// --- CONSTANTS ---
const GRID_SIZE = 24;
const TILE_WIDTH = 64;  
const TILE_HEIGHT = 32; 
const BLOCK_HEIGHT = 16; 
const TAX_CYCLE_DURATION = 30000; 

type TerrainType = 'GRASS' | 'WATER' | 'FOREST' | 'MOUNTAIN' | 'SAND' | 'DIRT' | 'SWAMP' | 'SNOW' | 'LAVA';

// --- AUDIO SYNTHESIZER ---
const playCombatSound = (type: 'PLAYER_ATTACK' | 'TROOP_MELEE' | 'TROOP_RANGED' | 'TROOP_MAGIC' | 'ENEMY_HIT' | 'BLOCK') => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        switch (type) {
            case 'PLAYER_ATTACK': 
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(450, now);
                osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);
                gain.gain.setValueAtTime(0.12, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.12);
                osc.start(now); osc.stop(now + 0.12);
                break;
            case 'TROOP_MELEE': 
                osc.type = 'square';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.linearRampToValueAtTime(150, now + 0.1);
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.1);
                osc.start(now); osc.stop(now + 0.1);
                break;
            case 'TROOP_RANGED': 
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(400, now + 0.15);
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.15);
                osc.start(now); osc.stop(now + 0.15);
                break;
            case 'TROOP_MAGIC': 
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1000, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.4);
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.4);
                osc.start(now); osc.stop(now + 0.4);
                break;
            case 'ENEMY_HIT': 
                osc.type = 'square';
                osc.frequency.setValueAtTime(100, now);
                osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.1);
                osc.start(now); osc.stop(now + 0.1);
                break;
            case 'BLOCK': 
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1400, now);
                osc.frequency.exponentialRampToValueAtTime(1000, now + 0.05);
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
                osc.start(now); osc.stop(now + 0.2);
                break;
        }
    } catch (e) {
        console.warn("Audio Context blocked or failed", e);
    }
};

// --- HELPER FUNCTIONS ---
const getIsoCoords = (x: number, y: number) => {
    const isoX = (x - y) * (TILE_WIDTH / 2);
    const isoY = (x + y) * (TILE_HEIGHT / 2);
    return { x: isoX, y: isoY };
};

const getTerrainStyle = (t: TerrainType) => {
    switch(t) {
        case 'GRASS': return { top: '#455b26', side: '#2f4018' };
        case 'FOREST': return { top: '#2d3e18', side: '#1a240d' };
        case 'WATER': return { top: '#356877', side: '#1b363d' };
        case 'SAND': return { top: '#d4b859', side: '#8a7638' };
        case 'DIRT': return { top: '#5d4037', side: '#3e2b25' };
        case 'MOUNTAIN': return { top: '#585858', side: '#2b2b2b' };
        case 'SNOW': return { top: '#e0f0ff', side: '#a3b8cc' };
        case 'SWAMP': return { top: '#2f3a2f', side: '#1a201a' };
        case 'LAVA': return { top: '#8b0000', side: '#330000' };
        default: return { top: '#333', side: '#000' };
    }
};

const HomeBase: React.FC<HomeBaseProps> = ({ 
    gameState, activeEvent, onBuild, onRemove, onUpdateBuilding, 
    onCollectTaxes, onLootDrop, onDeductGold, onContributeDefense
}) => {
  // --- STATE ---
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [buildMode, setBuildMode] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{x: number, y: number} | null>(null);
  const [taxProgress, setTaxProgress] = useState(0);
  const [taxReady, setTaxReady] = useState(false);
  const [zoom] = useState(1.0);
  const [enemyHitAnim, setEnemyHitAnim] = useState(false);
  const [attackingTroops, setAttackingTroops] = useState<Record<string, boolean>>({});
  const [hitSplats, setHitSplats] = useState<HitSplat[]>([]);
  
  // Ref for troop attack timers to maintain sync without excessive re-renders
  const troopTimers = useRef<Record<string, number>>({});

  // --- MEMOIZED TERRAIN GENERATION ---
  const terrainMap = useMemo(() => {
      const map: TerrainType[] = [];
      const noise = (nx: number, ny: number) => Math.sin(nx) * Math.cos(ny);
      const noiseDetail = (nx: number, ny: number) => Math.sin(nx * 3) * Math.sin(ny * 3) * 0.5;

      for (let y = 0; y < GRID_SIZE; y++) {
          for (let x = 0; x < GRID_SIZE; x++) {
              const distFromCenter = Math.sqrt((x - 12) ** 2 + (y - 12) ** 2);
              if (distFromCenter < 4) {
                  map.push('GRASS');
                  continue;
              }
              const elevation = noise(x * 0.15, y * 0.15) + noiseDetail(x * 0.1, y * 0.1) * 0.2;
              const moisture = noise(x * 0.2 + 50, y * 0.2 + 50) + noiseDetail(x * 0.05, y * 0.05) * 0.3;
              let type: TerrainType = 'GRASS';
              const riverPath = Math.sin((x + y) * 0.15) * 4 + 12;
              const riverDist = Math.abs(x - riverPath);
              if (elevation < -0.6) type = 'WATER';
              else if (elevation < 0.5 && riverDist < 1.2) type = 'WATER';
              else if (elevation < 0.5 && riverDist < 2.5) type = 'SAND';
              else if (elevation > 0.85) type = 'SNOW';
              else if (elevation > 0.6) type = 'MOUNTAIN';
              else if (moisture > 0.5) {
                   type = elevation < -0.3 ? 'SWAMP' : 'FOREST';
              } else if (moisture < -0.4) {
                   type = elevation > 0.2 ? 'DIRT' : 'SAND';
              }
              map.push(type);
          }
      }
      return map;
  }, []);

  // --- HELPERS ---
  const getTerrainAt = (x: number, y: number) => terrainMap[y * GRID_SIZE + x] || 'GRASS';
  const getItemAt = (x: number, y: number) => gameState.baseLayout.find(i => i.x === x && i.y === y);
  const isBuildable = (t: TerrainType) => !['WATER', 'MOUNTAIN', 'SNOW', 'LAVA'].includes(t);

  // --- STATS ---
  const activeBuildings = gameState.baseLayout.filter(b => !b.isDamaged && !b.effect && !b.buildingId.startsWith('path'));
  const calculatedTax = activeBuildings.reduce((acc, item) => {
      const def = BUILDINGS.find(b => b.id === item.buildingId);
      return acc + (def?.taxValue ?? 5);
  }, 0);
  
  const townDefenseBonus = gameState.baseLayout.reduce((total, item) => {
      if (item.isDamaged) return total;
      const def = BUILDINGS.find(b => b.id === item.buildingId);
      return total + (def?.defenseValue || 0);
  }, 0);

  // --- EFFECTS ---
  
  // Tax Timer
  useEffect(() => {
      if (taxReady) return;
      const interval = setInterval(() => {
          setTaxProgress(prev => {
              if (prev >= 100) {
                  setTaxReady(true);
                  return 100;
              }
              return prev + (100 / (TAX_CYCLE_DURATION / 1000));
          });
      }, 1000);
      return () => clearInterval(interval);
  }, [taxReady]);

  // COMBAT ENGINE: ENHANCED TROOP AI
  useEffect(() => {
      if (!activeEvent || activeEvent.type !== 'RAID') {
          troopTimers.current = {};
          return;
      }

      const combatInterval = setInterval(() => {
          const now = Date.now();
          let totalDefenseContribution = 0;
          const newAttackingTroops: Record<string, boolean> = {};
          const newSplats: HitSplat[] = [];

          gameState.baseLayout.forEach(item => {
              if (item.isDamaged) return;
              const def = BUILDINGS.find(b => b.id === item.buildingId);
              
              if (def?.combatStats) {
                  // Combat Logic: Speed based on class
                  const attackCooldown = def.combatStats.type === 'MELEE' ? 1800 : (def.combatStats.type === 'MAGIC' ? 3000 : 2400);
                  const lastAttack = troopTimers.current[item.id] || 0;

                  if (now - lastAttack >= attackCooldown) {
                      // Targeting logic: Enemy is at 12, 12
                      const dx = item.x - 12;
                      const dy = item.y - 12;
                      const dist = Math.sqrt(dx*dx + dy*dy);
                      const range = def.combatStats.range || 1;

                      if (dist <= range + 0.5) { // Adding slight buffer for diagonal range
                          // Damage Calculation: Base + Variance
                          const variance = (Math.random() * 0.4) + 0.8; // 0.8 to 1.2 multiplier
                          const damage = Math.max(1, Math.floor(def.combatStats.damage * variance));
                          
                          totalDefenseContribution += damage;
                          newAttackingTroops[item.id] = true;
                          troopTimers.current[item.id] = now;

                          // Sound feedback
                          switch(def.combatStats.type) {
                              case 'MELEE': playCombatSound('TROOP_MELEE'); break;
                              case 'RANGED': playCombatSound('TROOP_RANGED'); break;
                              case 'MAGIC': playCombatSound('TROOP_MAGIC'); break;
                          }

                          // Create Hit Splat
                          newSplats.push({
                              id: Math.random(),
                              damage,
                              xOffset: (Math.random() - 0.5) * 40,
                              yOffset: (Math.random() - 0.5) * 40
                          });
                      }
                  }
              }
          });

          if (totalDefenseContribution > 0 && onContributeDefense) {
              onContributeDefense(totalDefenseContribution);
              setEnemyHitAnim(true);
              setTimeout(() => setEnemyHitAnim(false), 200);
              playCombatSound('ENEMY_HIT');
              
              setHitSplats(prev => [...prev, ...newSplats].slice(-10)); // Keep last 10 splats
              setTimeout(() => {
                  setHitSplats(prev => prev.filter(s => !newSplats.find(ns => ns.id === s.id)));
              }, 800);
          }

          setAttackingTroops(prev => ({ ...prev, ...newAttackingTroops }));
          setTimeout(() => {
              setAttackingTroops(prev => {
                  const updated = { ...prev };
                  Object.keys(newAttackingTroops).forEach(id => delete updated[id]);
                  return updated;
              });
          }, 800);

      }, 200); // High frequency tick for individual troop timers

      return () => clearInterval(combatInterval);
  }, [activeEvent, gameState.baseLayout, onContributeDefense]);

  // --- INTERACTION ---
  const handleTileClick = (x: number, y: number) => {
      if (activeEvent?.type === 'RAID' && x === 12 && y === 12) {
          playCombatSound('PLAYER_ATTACK');
          setEnemyHitAnim(true);
          setTimeout(() => setEnemyHitAnim(false), 200);
          playCombatSound('ENEMY_HIT');
          
          const manualDmg = 5;
          if (onContributeDefense) onContributeDefense(manualDmg); 
          
          setHitSplats(prev => [...prev, {
              id: Math.random(),
              damage: manualDmg,
              xOffset: (Math.random() - 0.5) * 20,
              yOffset: -40
          }]);
          return; 
      }

      const item = getItemAt(x, y);
      const terrain = getTerrainAt(x, y);

      if (buildMode) {
          if (selectedBuildingId) {
              if (item) { playCombatSound('BLOCK'); return; }
              if (!isBuildable(terrain)) { playCombatSound('BLOCK'); return; }
              const def = BUILDINGS.find(b => b.id === selectedBuildingId);
              if (def) onBuild(x, y, def);
          } else {
              if (item) {
                  if (item.isDamaged) {
                      const cost = 10;
                      if (gameState.gold >= cost) {
                          if(onDeductGold) onDeductGold(cost);
                          onUpdateBuilding(x, y, { isDamaged: false });
                      } else {
                          alert("Not enough gold to repair!");
                      }
                  } else {
                      if (window.confirm("Demolish this structure?")) onRemove(x, y);
                  }
              }
          }
      } else {
          if (item && item.effect === 'FIRE') {
             onUpdateBuilding(x, y, { effect: undefined, isDamaged: true });
          }
      }
  };

  // --- RENDER ---
  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-[#0d0d0d] font-pixel">
        
        <div 
            className="flex-1 overflow-auto bg-black relative flex items-center justify-center cursor-move"
            style={{ 
                backgroundImage: 'radial-gradient(#222 1px, transparent 1px)', 
                backgroundSize: '20px 20px' 
            }}
        >
            <div 
                className="relative transition-transform duration-200 ease-out"
                style={{ 
                    width: GRID_SIZE * TILE_WIDTH + 400,
                    height: GRID_SIZE * TILE_HEIGHT + 400,
                    transform: `scale(${zoom}) translateY(100px)`,
                    transformOrigin: 'center center',
                }}
            >
                {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                    const x = i % GRID_SIZE;
                    const y = Math.floor(i / GRID_SIZE);
                    
                    const terrain = getTerrainAt(x, y);
                    const item = getItemAt(x, y);
                    const style = getTerrainStyle(terrain);
                    
                    const { x: isoX, y: isoY } = getIsoCoords(x, y);
                    const zIndex = x + y; 

                    const isRaidTile = activeEvent?.type === 'RAID' && x === 12 && y === 12;
                    const isHovered = hoveredCell?.x === x && hoveredCell?.y === y;
                    
                    const isOccupied = !!item;
                    const isTerrainValid = isBuildable(terrain);
                    const canBuild = !isOccupied && isTerrainValid;

                    return (
                        <div 
                            key={`${x}-${y}`}
                            className="absolute"
                            style={{
                                left: `50%`,
                                marginLeft: isoX, 
                                top: isoY,
                                width: TILE_WIDTH,
                                height: TILE_HEIGHT + BLOCK_HEIGHT,
                                zIndex: zIndex,
                            }}
                        >
                            <div className="relative w-full h-full">
                                <div 
                                    className="absolute bottom-0 left-0 w-full"
                                    style={{
                                        height: '50%',
                                        backgroundColor: style.side,
                                        clipPath: 'polygon(0 0, 50% 25%, 100% 0, 100% 100%, 50% 100%, 0 75%)',
                                        transform: 'translateY(8px)'
                                    }}
                                ></div>

                                <div 
                                    className={`absolute top-0 left-0 w-full h-full transition-all duration-100 ${buildMode ? 'cursor-pointer' : ''}`}
                                    style={{
                                        height: TILE_HEIGHT,
                                        backgroundColor: style.top,
                                        clipPath: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)',
                                        filter: isHovered ? 'brightness(1.2)' : 'none',
                                        backgroundImage: terrain === 'WATER' 
                                            ? 'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%)'
                                            : 'none',
                                        backgroundSize: '10px 10px'
                                    }}
                                    onMouseEnter={() => setHoveredCell({ x, y })}
                                    onClick={(e) => { e.stopPropagation(); handleTileClick(x, y); }}
                                >
                                    {isHovered && buildMode && selectedBuildingId && (
                                        <div className={`w-full h-full flex items-center justify-center opacity-60 ${canBuild ? 'bg-green-500' : 'bg-red-500'}`}>
                                             {canBuild && (
                                                 <div className="opacity-50 transform scale-50 -translate-y-2">
                                                     <i className={`fa-solid ${BUILDINGS.find(b => b.id === selectedBuildingId)?.icon} text-white`}></i>
                                                 </div>
                                             )}
                                             {!canBuild && (
                                                 <div className="animate-pulse">
                                                     <i className="fa-solid fa-ban text-white text-lg drop-shadow-md"></i>
                                                 </div>
                                             )}
                                        </div>
                                    )}
                                    {isHovered && buildMode && !selectedBuildingId && (
                                         <div className={`w-full h-full bg-white opacity-20`}></div>
                                    )}
                                </div>
                            </div>

                            {item && (
                                <div 
                                    className="absolute pointer-events-none flex justify-center items-end"
                                    style={{
                                        bottom: '25%', 
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        width: TILE_WIDTH,
                                        height: TILE_WIDTH,
                                        zIndex: zIndex + 1 
                                    }}
                                >
                                    <div className={`relative transition-all duration-200 ${item.isDamaged ? 'grayscale opacity-80' : ''} ${isHovered ? 'scale-110 drop-shadow-[0_0_5px_rgba(255,255,0,0.5)]' : ''}`}>
                                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-2 bg-black/40 rounded-full blur-[2px]"></div>
                                        
                                        {item.buildingId.startsWith('guard') || item.buildingId.startsWith('ranger') || item.buildingId.startsWith('knight') || item.buildingId.startsWith('dragon') ? (
                                             <div className="scale-75 origin-bottom">
                                                 <PixelAvatar action={attackingTroops[item.id] ? 'COMBAT' : 'IDLE'} />
                                             </div>
                                        ) : (
                                            <i 
                                                className={`fa-solid ${BUILDINGS.find(b => b.id === item.buildingId)?.icon || 'fa-question'} text-4xl drop-shadow-md`}
                                                style={{ color: item.isDamaged ? '#888' : (BUILDINGS.find(b => b.id === item.buildingId)?.color.replace('text-', '') || 'white') }}
                                            ></i>
                                        )}

                                        {item.effect === 'FIRE' && (
                                            <i className="fa-solid fa-fire text-orange-500 absolute -top-4 left-1/2 -translate-x-1/2 animate-bounce text-xl drop-shadow-md"></i>
                                        )}
                                        {item.isDamaged && (
                                            <i className="fa-solid fa-triangle-exclamation text-red-500 absolute -top-4 right-0 animate-pulse text-lg drop-shadow-md"></i>
                                        )}
                                    </div>
                                </div>
                            )}

                            {isRaidTile && !item && activeEvent?.enemyData && (
                                <div 
                                    className="absolute pointer-events-auto cursor-pointer flex justify-center items-end"
                                    style={{
                                        bottom: '25%',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        zIndex: zIndex + 2
                                    }}
                                    onClick={(e) => { e.stopPropagation(); handleTileClick(x, y); }}
                                >
                                    <div className="relative">
                                        <PixelEnemy type={activeEvent.enemyData.type as EnemyType} isHit={enemyHitAnim} />
                                        
                                        {/* Hit Splats Container */}
                                        <div className="absolute inset-0 pointer-events-none">
                                            {hitSplats.map(splat => (
                                                <div 
                                                    key={splat.id}
                                                    className="absolute bg-red-600 text-white font-bold text-xs px-1 rounded shadow-md animate-out fade-out slide-out-to-top-8 duration-700"
                                                    style={{
                                                        left: `calc(50% + ${splat.xOffset}px)`,
                                                        top: `calc(50% + ${splat.yOffset}px)`,
                                                    }}
                                                >
                                                    {splat.damage}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] px-1 rounded font-bold whitespace-nowrap animate-bounce">
                                            {enemyHitAnim ? 'HIT!' : 'CLICK TO ATTACK!'}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>

        <div className="bg-[#3e3226] border-t-4 border-[#231c16] relative z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.5)]">
            <div className="flex justify-between items-center bg-[#2b2522] p-2 border-b-2 border-[#5d5447] text-[#dcdcdc] text-xs">
                <div className="flex gap-4 font-mono">
                    <span className="flex items-center text-yellow-300"><i className="fa-solid fa-coins mr-2"></i> {gameState.gold.toLocaleString()} gp</span>
                    <span className="flex items-center text-blue-300"><i className="fa-solid fa-shield-halved mr-2"></i> Def: {townDefenseBonus}</span>
                    <span className="flex items-center text-pink-300"><i className="fa-solid fa-piggy-bank mr-2"></i> Tax: {calculatedTax}/cycle</span>
                </div>
                
                <button 
                    onClick={() => { if (taxReady && onCollectTaxes) { onCollectTaxes(calculatedTax); setTaxReady(false); setTaxProgress(0); } }}
                    disabled={!taxReady}
                    className={`flex items-center gap-2 px-3 py-1 border-2 transition-all shadow-[2px_2px_0_#000] active:translate-y-1 active:shadow-none
                        ${taxReady ? 'bg-red-900 border-red-700 text-white animate-pulse' : 'bg-[#1a1816] border-[#5d5447] text-gray-500'}`}
                >
                    <div className="w-16 h-2 bg-black border border-gray-600 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${taxProgress}%` }}></div>
                    </div>
                    <span>{taxReady ? 'COLLECT' : 'TAXING...'}</span>
                </button>
            </div>

            <div className="flex gap-1 overflow-x-auto p-2 scrollbar-thin scrollbar-thumb-wood-light">
                <button 
                    onClick={() => { setBuildMode(!buildMode); setSelectedBuildingId(null); }}
                    className={`flex-shrink-0 px-4 py-2 font-bold border-2 transition-all flex flex-col items-center justify-center gap-1 min-w-[70px] shadow-[2px_2px_0_#000] active:translate-y-1 active:shadow-none
                        ${buildMode ? 'bg-red-900 border-red-700 text-white' : 'bg-[#5c4033] border-[#3e3226] text-[#ff981f] hover:brightness-110'}`}
                >
                    <i className={`fa-solid ${buildMode ? 'fa-times' : 'fa-hammer'} text-xl`}></i>
                    <span className="text-[10px] uppercase">{buildMode ? 'CLOSE' : 'BUILD'}</span>
                </button>

                {buildMode && BUILDINGS.filter(b => !b.hidden).map(b => {
                    const canAfford = gameState.gold >= b.cost;
                    const isSelected = selectedBuildingId === b.id;
                    return (
                        <button 
                            key={b.id}
                            onClick={() => setSelectedBuildingId(b.id)}
                            className={`flex-shrink-0 w-16 h-16 p-1 border-2 flex flex-col items-center justify-between transition-all relative group shadow-[2px_2px_0_#000] active:translate-y-1 active:shadow-none
                                ${isSelected 
                                    ? 'bg-[#2b2522] border-[#00ff00] text-white scale-105 z-10' 
                                    : (!canAfford ? 'bg-[#2b2522] border-red-900 opacity-80' : 'bg-[#3e3226] border-[#5d5447] text-gray-400 hover:text-white hover:border-[#ff981f]')
                                }`}
                        >
                             <i className={`fa-solid ${b.icon} text-xl mt-1`} style={{ color: isSelected ? 'white' : (!canAfford ? '#701414' : '') }}></i>
                             <div className={`text-[10px] w-full text-center truncate font-bold ${canAfford ? 'text-[#ff981f]' : 'text-red-500'}`}>{b.cost}g</div>
                             
                             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-40 bg-[#2b2522] border-2 border-[#5d5447] p-2 text-xs z-50 hidden group-hover:block pointer-events-none shadow-xl text-left">
                                 <div className="text-[#ff981f] font-bold border-b border-gray-600 mb-1">{b.name}</div>
                                 <div className="text-gray-300 text-[10px] leading-tight mb-2">{b.description}</div>
                                 <div className="flex justify-between text-[9px] font-mono">
                                     {b.taxValue !== undefined && <span className="text-pink-400">Tax: {b.taxValue}</span>}
                                     {b.defenseValue !== undefined && <span className="text-blue-400">Def: +{b.defenseValue}</span>}
                                 </div>
                                 {!canAfford && <div className="text-red-500 font-bold mt-1 text-[9px] uppercase">Insufficient Funds</div>}
                             </div>
                        </button>
                    );
                })}
            </div>
        </div>

        {activeEvent && activeEvent.type === 'RAID' && (
             <div className="absolute top-4 left-1/2 -translate-x-1/2 w-80 bg-[#2b2522] border-4 border-[#4a0d0d] shadow-2xl z-[100] p-3 animate-in fade-in slide-in-from-top-4">
                 <div className="flex items-center gap-3 mb-2">
                     <i className="fa-solid fa-skull text-red-500 text-2xl animate-pulse"></i>
                     <div>
                         <h3 className="text-[#ff981f] font-bold text-lg leading-none uppercase">Raid Active!</h3>
                         <p className="text-red-400 text-xs">{activeEvent.message}</p>
                     </div>
                 </div>
                 <div className="w-full bg-black h-4 border border-[#5d5447] rounded-sm overflow-hidden relative">
                     <div 
                        className="h-full bg-blue-600" 
                        style={{ width: `${Math.min(100, ((activeEvent.currentXp || 0) / (activeEvent.requiredXp || 1)) * 100)}%` }}
                     ></div>
                     <span className="absolute inset-0 flex items-center justify-center text-[9px] text-white font-bold">
                         Defense Progress: {activeEvent.currentXp} / {activeEvent.requiredXp}
                     </span>
                 </div>
                 <p className="text-[#9a9a9a] text-[9px] mt-1 text-center italic">Troops are defending! Support them via tasks or clicking!</p>
             </div>
        )}
    </div>
  );
};

export default HomeBase;
