
import React from 'react';

export type EnemyType = 'GOBLIN' | 'THIEF' | 'BANDIT' | 'BANDIT_LEADER' | 'DRAGON';

interface PixelEnemyProps {
  type: EnemyType;
  isHit?: boolean;
}

const PixelEnemy: React.FC<PixelEnemyProps> = ({ type, isHit }) => {
  return (
    <div 
        className={`relative w-24 h-24 transition-transform duration-100 ${isHit ? 'scale-90 brightness-150' : 'animate-bounce-gentle'}`}
        style={{ imageRendering: 'pixelated' }}
    >
        <style>{`
            @keyframes bounce-gentle {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-5px); }
            }
            .animate-bounce-gentle {
                animation: bounce-gentle 2s infinite ease-in-out;
            }
        `}</style>

        {/* Shadow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-2 bg-black/40 rounded-full blur-[2px]"></div>

        <svg viewBox="0 0 32 32" className="w-full h-full drop-shadow-md">
            {type === 'GOBLIN' && (
                <g>
                    {/* Body */}
                    <rect x="10" y="14" width="12" height="10" fill="#2d6e32" />
                    {/* Head */}
                    <rect x="8" y="6" width="16" height="10" fill="#3db045" />
                    {/* Ears */}
                    <path d="M8 8 L4 6 L8 12 Z" fill="#3db045" />
                    <path d="M24 8 L28 6 L24 12 Z" fill="#3db045" />
                    {/* Eyes */}
                    <rect x="11" y="9" width="3" height="3" fill="yellow" />
                    <rect x="18" y="9" width="3" height="3" fill="yellow" />
                    <rect x="12" y="10" width="1" height="1" fill="black" />
                    <rect x="19" y="10" width="1" height="1" fill="black" />
                    {/* Mouth */}
                    <rect x="12" y="14" width="8" height="1" fill="#1a401d" />
                    {/* Loincloth */}
                    <rect x="10" y="22" width="12" height="4" fill="#4a3b2a" />
                    {/* Spear */}
                    <rect x="24" y="10" width="2" height="16" fill="#666" transform="rotate(15 25 18)" />
                    <rect x="23" y="8" width="4" height="4" fill="#ccc" transform="rotate(15 25 18)" />
                </g>
            )}

            {type === 'THIEF' && (
                <g>
                    {/* Cloak Body */}
                    <rect x="8" y="12" width="16" height="16" fill="#333" />
                    {/* Hood */}
                    <rect x="10" y="4" width="12" height="10" fill="#222" />
                    {/* Face (Hidden in shadow) */}
                    <rect x="12" y="6" width="8" height="6" fill="#111" />
                    {/* Eyes (Glowing Red) */}
                    <rect x="13" y="8" width="2" height="1" fill="red" />
                    <rect x="17" y="8" width="2" height="1" fill="red" />
                    {/* Dagger */}
                    <rect x="4" y="18" width="6" height="2" fill="#888" />
                    <rect x="4" y="18" width="2" height="6" fill="#444" />
                </g>
            )}

            {type === 'BANDIT' && (
                <g>
                    {/* Leather Armor Body */}
                    <rect x="8" y="14" width="16" height="14" fill="#8B4513" />
                    {/* Shoulder Pads */}
                    <rect x="6" y="14" width="4" height="6" fill="#5c4033" />
                    <rect x="22" y="14" width="4" height="6" fill="#5c4033" />
                    
                    {/* Head */}
                    <rect x="10" y="4" width="12" height="10" fill="#e0ac69" />
                    {/* Bandana Mask */}
                    <rect x="10" y="10" width="12" height="4" fill="#333" />
                    <rect x="9" y="9" width="1" height="6" fill="#333" /> {/* knot side */}
                    
                    {/* Eyes */}
                    <rect x="12" y="6" width="2" height="2" fill="black" />
                    <rect x="18" y="6" width="2" height="2" fill="black" />
                    {/* Angry Brows */}
                    <path d="M11 5 L14 7" stroke="black" strokeWidth="1" />
                    <path d="M21 5 L18 7" stroke="black" strokeWidth="1" />

                    {/* Scimitar */}
                    <path d="M4 24 Q 0 10 10 6 L 12 8 Q 6 12 8 24 Z" fill="#ccc" transform="rotate(-10 6 24)" />
                    <rect x="5" y="24" width="4" height="2" fill="#4a3b2a" />
                </g>
            )}

            {type === 'BANDIT_LEADER' && (
                <g>
                    {/* Darker Plate Body */}
                    <rect x="7" y="13" width="18" height="16" fill="#2c2c2c" />
                    {/* Cape */}
                    <path d="M6 14 L2 28 L10 28 Z" fill="#701414" />
                    <path d="M26 14 L30 28 L22 28 Z" fill="#701414" />
                    
                    {/* Head */}
                    <rect x="10" y="4" width="12" height="10" fill="#e0ac69" />
                    {/* Full Face Helm */}
                    <rect x="9" y="3" width="14" height="11" fill="#444" />
                    <rect x="11" y="6" width="10" height="2" fill="#111" /> {/* Visor */}
                    <rect x="14" y="2" width="4" height="4" fill="#701414" /> {/* Plume */}
                    
                    {/* Two-Handed Sword */}
                    <g transform="rotate(30 24 16)">
                        <rect x="22" y="6" width="4" height="24" fill="#ccc" /> {/* Blade */}
                        <rect x="24" y="6" width="1" height="24" fill="#fff" opacity="0.5" />
                        <rect x="20" y="24" width="8" height="2" fill="#555" /> {/* Guard */}
                        <rect x="23" y="26" width="2" height="6" fill="#333" /> {/* Hilt */}
                        <circle cx="24" cy="33" r="1.5" fill="#701414" /> {/* Pommel */}
                    </g>
                </g>
            )}

            {type === 'DRAGON' && (
                 <g>
                    {/* Body */}
                    <rect x="6" y="14" width="20" height="14" fill="#8b0000" />
                    {/* Neck */}
                    <rect x="22" y="8" width="6" height="8" fill="#8b0000" />
                    {/* Head */}
                    <rect x="24" y="4" width="8" height="6" fill="#a00000" />
                    {/* Eye */}
                    <rect x="28" y="5" width="2" height="2" fill="yellow" />
                    {/* Wing */}
                    <path d="M10 14 L2 6 L14 10 Z" fill="#ff4444" />
                    {/* Tail */}
                    <path d="M6 24 L2 28 L10 26 Z" fill="#8b0000" />
                 </g>
            )}
        </svg>
    </div>
  );
};

export default PixelEnemy;
