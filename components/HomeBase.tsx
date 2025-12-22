
import React, { useState, useMemo } from 'react';
import { GameState, ActionType, BaseLayoutItem } from '../types';
import PixelAvatar from './PixelAvatar';
import { BUILDINGS } from '../constants';

interface HomeBaseProps {
    gameState: GameState;
    onInteraction?: (id: string) => void;
    backgroundImage?: string;
    avatarAction?: ActionType;
    assetBasePath: string;
}

const GRID_SIZE = 24;
const TILE_WIDTH = 64;
const TILE_HEIGHT = 32;
const BLOCK_HEIGHT = 16;

type TerrainType = 'GRASS' | 'WATER' | 'FOREST' | 'MOUNTAIN' | 'SAND' | 'DIRT' | 'SNOW' | 'SWAMP';

const getIsoCoords = (x: number, y: number) => {
    const isoX = (x - y) * (TILE_WIDTH / 2);
    const isoY = (x + y) * (TILE_HEIGHT / 2);
    return { x: isoX, y: isoY };
};

const getTerrainStyle = (t: TerrainType) => {
    switch (t) {
        case 'GRASS': return { top: '#f4f1ea', side: '#e5e5e5' }; // Washi Paper (Base)
        case 'WATER': return { top: '#e0e7ff', side: '#c7d2fe' }; // Ink Wash Blue
        case 'SAND': return { top: '#fef3c7', side: '#fde68a' }; // Warm Paper
        case 'MOUNTAIN': return { top: '#525252', side: '#262626' }; // Sumi Ink Stone
        case 'SNOW': return { top: '#ffffff', side: '#f3f4f6' };
        default: return { top: '#f4f1ea', side: '#e5e5e5' };
    }
};

const HomeBase: React.FC<HomeBaseProps> = ({ gameState, backgroundImage, avatarAction = 'IDLE', assetBasePath }) => {
    const [hoveredCell, setHoveredCell] = useState<{ x: number, y: number } | null>(null);

    const terrainMap = useMemo(() => {
        const map: TerrainType[] = [];
        const noise = (nx: number, ny: number) => Math.sin(nx) * Math.cos(ny);
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                const distFromCenter = Math.sqrt((x - 12) ** 2 + (y - 12) ** 2);
                if (distFromCenter < 5) { map.push('GRASS'); continue; }
                const elevation = noise(x * 0.15, y * 0.15);
                if (elevation < -0.6) map.push('WATER');
                else if (elevation > 0.8) map.push('MOUNTAIN');
                else map.push('GRASS');
            }
        }
        return map;
    }, []);

    const getItemAt = (x: number, y: number) => gameState.baseLayout.find(i => i.x === x && i.y === y);

    return (
        <div className="h-[600px] w-full relative overflow-hidden bg-transparent rounded-3xl border border-sanctuary-border group">
            <div
                className="absolute inset-0 transition-opacity duration-1000"
                style={{
                    backgroundImage: backgroundImage ? `url("${backgroundImage}")` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.15
                }}
            />

            <div className="absolute inset-0 flex items-center justify-center p-20">
                <div
                    className="relative transition-transform duration-500 ease-out"
                    style={{
                        width: GRID_SIZE * TILE_WIDTH,
                        height: GRID_SIZE * TILE_HEIGHT,
                        transform: 'scale(0.8) translateY(-50px)',
                    }}
                >
                    {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                        const x = i % GRID_SIZE;
                        const y = Math.floor(i / GRID_SIZE);
                        const terrain = terrainMap[i];
                        const item = getItemAt(x, y);
                        const style = getTerrainStyle(terrain);
                        const { x: isoX, y: isoY } = getIsoCoords(x, y);

                        return (
                            <div
                                key={`${x}-${y}`}
                                className="absolute"
                                style={{
                                    left: '50%',
                                    marginLeft: isoX,
                                    top: isoY,
                                    width: TILE_WIDTH,
                                    height: TILE_HEIGHT + BLOCK_HEIGHT,
                                    zIndex: x + y,
                                }}
                            >
                                <div className="relative w-full h-full">
                                    <div
                                        className="absolute bottom-0 left-0 w-full"
                                        style={{
                                            height: '50%',
                                            backgroundColor: style.side,
                                            clipPath: 'polygon(0 0, 50% 25%, 100% 0, 100% 100%, 50% 100%, 0 75%)',
                                            transform: 'translateY(4px)',
                                            opacity: 0.3
                                        }}
                                    />
                                    <div
                                        className="absolute top-0 left-0 w-full h-full"
                                        style={{
                                            height: TILE_HEIGHT,
                                            backgroundColor: style.top,
                                            clipPath: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)',
                                            opacity: 0.6
                                        }}
                                        onMouseEnter={() => setHoveredCell({ x, y })}
                                    />
                                </div>

                                {item && (
                                    <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 flex justify-center items-end z-50">
                                        <i className={`fa-solid ${BUILDINGS.find(b => b.id === item.buildingId)?.icon || 'fa-question'} text-2xl text-[var(--text-normal)] opacity-80`} />
                                    </div>
                                )}

                                {x === 12 && y === 12 && (
                                    <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 flex justify-center items-end z-50">
                                        <div className="scale-60 origin-bottom">
                                            <PixelAvatar action={avatarAction} assetBasePath={assetBasePath} />
                                        </div>
                                    </div>
                                )}

                                {/* Companion: Dog */}
                                {x === 13 && y === 11 && (
                                    <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 flex justify-center items-end z-40">
                                        <div className="scale-50 origin-bottom">
                                            <PixelAvatar action="DOG" assetBasePath={assetBasePath} />
                                        </div>
                                    </div>
                                )}

                                {/* Spirit: Wisp */}
                                {x === 10 && y === 14 && (
                                    <div className="absolute bottom-[40%] left-1/2 -translate-x-1/2 flex justify-center items-end z-40">
                                        <div className="scale-40 origin-bottom animate-bounce-slow">
                                            <PixelAvatar action="SPIRIT" assetBasePath={assetBasePath} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end pointer-events-none">
                <div className="p-6 bg-white/40 backdrop-blur-md rounded-2xl border border-sanctuary-border pointer-events-auto">
                    <h3 className="text-xl font-serif italic text-sanctuary-ink mb-1">Sanctuary Level {Math.floor(gameState.skills.reduce((acc, s) => acc + s.level, 0))}</h3>
                    <div className="text-xs text-sanctuary-inkLight tracking-widest uppercase">
                        Current Zone: The Clearing
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeBase;
