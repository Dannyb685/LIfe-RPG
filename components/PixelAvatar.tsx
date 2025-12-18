
import React from 'react';

export type ActionType = 'IDLE' | 'COMBAT' | 'MAGIC' | 'WOODCUTTING' | 'LIFTING' | 'READING' | 'DOG_TRAINING' | 'FARMING' | 'COOKING' | 'CRAFTING' | 'MUSIC' | 'RUNNING' | 'LANGUAGE' | 'ART' | 'HOUSEHOLD' | 'SCOUT';

interface PixelAvatarProps {
  action: ActionType;
  scale?: number;
}

const PixelAvatar: React.FC<PixelAvatarProps> = ({ action, scale = 1 }) => {
  
  return (
    <div 
        className="relative" 
        style={{ 
            width: 80 * scale,
            height: 96 * scale,
            imageRendering: 'pixelated'
        }}
    >
      <style>{`
        /* IDLE: Subtle breathing/bobbing */
        @keyframes idle-breathe {
            0%, 100% { transform: scaleY(1); }
            50% { transform: scaleY(1.02); }
        }
        
        /* COMBAT: Dynamic Slash */
        @keyframes combat-slash {
            0% { transform: rotate(0deg); }
            20% { transform: rotate(40deg); } /* Wind up back */
            40% { transform: rotate(-110deg); } /* Fast Strike forward */
            60% { transform: rotate(-90deg); } /* Hold/Follow through */
            100% { transform: rotate(0deg); } /* Recover */
        }

        /* WOODCUTTING: Heavy Chop */
        @keyframes chop-swing {
             0% { transform: rotate(0deg); }
             35% { transform: rotate(-60deg); } /* Raise Axe High */
             50% { transform: rotate(90deg); } /* Slam Down */
             70% { transform: rotate(90deg); } /* Stick in wood */
             100% { transform: rotate(0deg); } /* Reset */
        }

        /* MAGIC: Floating & Pulsing */
        @keyframes magic-float-hands {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-4px); }
        }
        @keyframes magic-orb-pulse {
             0% { r: 2; opacity: 0.4; fill: #00ffff; }
             50% { r: 6; opacity: 1; fill: #ffffff; box-shadow: 0 0 10px #00ffff; }
             100% { r: 2; opacity: 0.4; fill: #00ffff; }
        }

        /* LIFTING: Reps */
        @keyframes lift-rep {
            0% { transform: translateY(0px); }
            15% { transform: translateY(0px); } /* Bottom pause */
            40% { transform: translateY(-14px); } /* Push Up */
            60% { transform: translateY(-14px); } /* Hold Top */
            85% { transform: translateY(0px); } /* Lower */
            100% { transform: translateY(0px); }
        }

        /* READING: Page Flip / Bob */
        @keyframes read-bob {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(2deg) translateY(1px); }
        }

        /* FARMING: Raking */
        @keyframes rake-motion {
            0% { transform: translateX(0px) rotate(0deg); }
            50% { transform: translateX(-10px) rotate(-8deg); }
            100% { transform: translateX(0px) rotate(0deg); }
        }

        /* DOG: Excited Jump */
        @keyframes dog-excited {
            0%, 100% { transform: translateY(0px); }
            15% { transform: translateY(-8px) rotate(-5deg); }
            30% { transform: translateY(0px); }
            45% { transform: translateY(-4px) rotate(5deg); }
            60% { transform: translateY(0px); }
        }
        
        /* RUNNING: Legs */
        @keyframes run-left-leg {
            0% { transform: rotate(20deg); }
            50% { transform: rotate(-20deg); }
            100% { transform: rotate(20deg); }
        }
        @keyframes run-right-leg {
            0% { transform: rotate(-20deg); }
            50% { transform: rotate(20deg); }
            100% { transform: rotate(-20deg); }
        }
        @keyframes run-bob {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-2px); }
        }

        /* COOKING: Stirring */
        @keyframes cook-stir {
            0% { transform: translateX(0px) translateY(0px); }
            25% { transform: translateX(2px) translateY(1px); }
            50% { transform: translateX(0px) translateY(2px); }
            75% { transform: translateX(-2px) translateY(1px); }
            100% { transform: translateX(0px) translateY(0px); }
        }
        @keyframes bubble-rise {
            0% { transform: translateY(0px); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateY(-10px); opacity: 0; }
        }

        /* CRAFTING: Hammering */
        @keyframes craft-hammer {
            0% { transform: rotate(0deg); }
            20% { transform: rotate(-45deg); } /* Raise */
            40% { transform: rotate(45deg); } /* Strike */
            60% { transform: rotate(45deg); } /* Hold */
            100% { transform: rotate(0deg); }
        }

        /* MUSIC: Strumming & Notes */
        @keyframes music-strum {
            0% { transform: rotate(0deg); }
            50% { transform: rotate(15deg); }
            100% { transform: rotate(0deg); }
        }
        @keyframes note-float {
            0% { transform: translateY(0px) rotate(0deg); opacity: 0; }
            20% { opacity: 1; }
            100% { transform: translateY(-15px) rotate(20deg); opacity: 0; }
        }

        /* LANGUAGE: Speech Bubble */
        @keyframes talk-bubble {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        
        /* ART: Painting */
        @keyframes art-paint {
            0% { transform: rotate(0deg) translateY(0); }
            25% { transform: rotate(-10deg) translateY(-2px); }
            50% { transform: rotate(10deg) translateY(2px); }
            75% { transform: rotate(-5deg) translateY(-1px); }
            100% { transform: rotate(0deg) translateY(0); }
        }
        
        /* HOUSEHOLD: Sweeping */
        @keyframes house-sweep {
            0% { transform: rotate(10deg) translateX(0); }
            50% { transform: rotate(-10deg) translateX(-4px); }
            100% { transform: rotate(10deg) translateX(0); }
        }
        
        /* SCOUT: Spyglass Look */
        @keyframes scout-look {
            0% { transform: rotate(0deg); }
            10% { transform: rotate(-90deg); } /* Lift to eye */
            40% { transform: rotate(-90deg); } /* Hold */
            50% { transform: rotate(-80deg); } /* Scan */
            60% { transform: rotate(-100deg); } /* Scan */
            90% { transform: rotate(-90deg); } /* Hold */
            100% { transform: rotate(0deg); } /* Lower */
        }

        .anim-idle-body { animation: idle-breathe 3s ease-in-out infinite; transform-origin: bottom; }
        .anim-combat { animation: combat-slash 1.1s ease-in-out infinite; transform-origin: 24px 20px; }
        .anim-chop { animation: chop-swing 1.4s ease-in-out infinite; transform-origin: 6px 26px; }
        .anim-magic-hands { animation: magic-float-hands 2s ease-in-out infinite; }
        .anim-magic-orb { animation: magic-orb-pulse 1.5s ease-in-out infinite; }
        .anim-lift { animation: lift-rep 2.5s ease-in-out infinite; }
        .anim-read { animation: read-bob 3s ease-in-out infinite; transform-origin: center; }
        .anim-rake { animation: rake-motion 1.2s ease-in-out infinite; }
        .anim-dog { animation: dog-excited 1.2s ease-in-out infinite; }
        
        .anim-run-left { animation: run-left-leg 0.6s linear infinite; transform-origin: 16px 30px; }
        .anim-run-right { animation: run-right-leg 0.6s linear infinite; transform-origin: 16px 30px; }
        .anim-run-body { animation: run-bob 0.3s ease-in-out infinite; }
        
        .anim-stir { animation: cook-stir 0.8s linear infinite; }
        .anim-bubble-1 { animation: bubble-rise 2s ease-in infinite; }
        .anim-bubble-2 { animation: bubble-rise 2s ease-in infinite; animation-delay: 1s; }
        
        .anim-hammer { animation: craft-hammer 1s ease-in-out infinite; transform-origin: 24px 20px; }
        
        .anim-strum { animation: music-strum 0.4s ease-in-out infinite; transform-origin: 20px 24px; }
        .anim-note-1 { animation: note-float 2s linear infinite; }
        .anim-note-2 { animation: note-float 2.5s linear infinite; animation-delay: 1.2s; }
        
        .anim-talk { animation: talk-bubble 2s ease-in-out infinite; transform-origin: 32px 10px; }
        
        .anim-paint { animation: art-paint 1.5s ease-in-out infinite; transform-origin: 24px 20px; }
        .anim-sweep { animation: house-sweep 1s ease-in-out infinite; transform-origin: 16px 48px; }
        .anim-look { animation: scout-look 4s ease-in-out infinite; transform-origin: 24px 20px; }
      `}</style>

      {/* Shadow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-2 bg-black/40 rounded-full blur-[2px]"></div>

      <svg 
        viewBox="0 0 48 48" 
        className="w-full h-full drop-shadow-md"
        shapeRendering="crispEdges"
      >
        <g transform="translate(8, 0)">
            {/* --- LEGS & FEET --- */}
            {action === 'RUNNING' ? (
                <g>
                   {/* Left Leg */}
                   <g className="anim-run-left">
                       <rect x="10" y="30" width="5" height="16" fill="#2d6e32" />
                       <rect x="9" y="44" width="6" height="4" fill="#4a3b2a" />
                   </g>
                   {/* Right Leg */}
                   <g className="anim-run-right">
                       <rect x="17" y="30" width="5" height="16" fill="#2d6e32" />
                       <rect x="17" y="44" width="6" height="4" fill="#4a3b2a" />
                   </g>
                </g>
            ) : (
                <g>
                    {/* Static Legs (Green Pants) */}
                    <rect x="10" y="30" width="12" height="16" fill="#2d6e32" /> 
                    <rect x="15" y="30" width="2" height="10" fill="#225526" />
                    {/* Boots */}
                    <rect x="9" y="44" width="6" height="4" fill="#4a3b2a" />
                    <rect x="17" y="44" width="6" height="4" fill="#4a3b2a" />
                </g>
            )}

            {/* --- ANIMATED TORSO & HEAD GROUP --- */}
            <g className={action === 'RUNNING' ? 'anim-run-body' : (action === 'IDLE' ? 'anim-idle-body' : '')}>
                {/* Torso */}
                <rect x="8" y="16" width="16" height="14" fill="#8b7355" />
                
                {/* Head Group */}
                <g transform="translate(0, 0)">
                    <rect x="10" y="6" width="12" height="10" fill="#e0ac69" />
                    <rect x="14" y="14" width="4" height="2" fill="#4a3b2a" /> {/* Goatee */}
                    <rect x="12" y="9" width="2" height="2" fill="#000" /> {/* Eye */}
                    <rect x="18" y="9" width="2" height="2" fill="#000" /> {/* Eye */}
                    
                    {/* LANGUAGE: Speech Bubble */}
                    {action === 'LANGUAGE' && (
                        <g className="anim-talk" transform="translate(18, -10)">
                            <path d="M0 0 L20 0 L20 14 L10 14 L4 18 L6 14 L0 14 Z" fill="#fff" stroke="#333" strokeWidth="1" />
                            <text x="5" y="10" fontSize="8" fill="#000">...</text>
                        </g>
                    )}
                </g>

                {/* --- ARMS & PROPS --- */}
                
                {/* COMBAT */}
                {action === 'COMBAT' && (
                    <g className="anim-combat">
                        {/* Arm */}
                        <rect x="22" y="16" width="4" height="10" fill="#8b7355" />
                        <rect x="22" y="26" width="4" height="4" fill="#e0ac69" />
                        {/* Sword (Rotated relative to hand) */}
                        <g transform="translate(24, 28) rotate(-45)">
                            <rect x="-1" y="-12" width="2" height="14" fill="#ccc" /> {/* Blade */}
                            <rect x="-3" y="2" width="6" height="2" fill="#444" /> {/* Guard */}
                            <rect x="-1" y="4" width="2" height="4" fill="#4a3b2a" /> {/* Hilt */}
                        </g>
                    </g>
                )}

                {/* WOODCUTTING */}
                {action === 'WOODCUTTING' && (
                    <g className="anim-chop">
                        <rect x="4" y="16" width="4" height="10" fill="#8b7355" />
                        <rect x="4" y="26" width="4" height="4" fill="#e0ac69" />
                        {/* Axe */}
                        <g transform="translate(6, 28) rotate(-15)">
                            <rect x="-1" y="-14" width="2" height="18" fill="#5c4033" /> {/* Handle */}
                            <rect x="-3" y="-14" width="6" height="5" fill="#555" /> {/* Head */}
                            <rect x="-4" y="-14" width="1" height="5" fill="#888" /> {/* Edge */}
                        </g>
                    </g>
                )}

                {/* MAGIC */}
                {action === 'MAGIC' && (
                    <g className="anim-magic-hands">
                        {/* Left Arm Raised */}
                        <rect x="4" y="16" width="4" height="10" fill="#8b7355" transform="rotate(30 8 16)" />
                        {/* Right Arm Raised */}
                        <rect x="24" y="16" width="4" height="10" fill="#8b7355" transform="rotate(-30 24 16)" />
                        {/* Glowing Orb */}
                        <circle cx="16" cy="12" r="3" className="anim-magic-orb" />
                    </g>
                )}

                {/* LIFTING */}
                {action === 'LIFTING' && (
                    <g className="anim-lift">
                        {/* Left Arm Up */}
                        <rect x="2" y="14" width="4" height="12" fill="#8b7355" transform="rotate(-160 4 16)" />
                        {/* Right Arm Up */}
                        <rect x="26" y="14" width="4" height="12" fill="#8b7355" transform="rotate(160 28 16)" />
                        {/* Barbell Left */}
                        <rect x="-6" y="4" width="6" height="4" fill="#333" />
                        <rect x="-2" y="4" width="2" height="10" fill="#888" />
                        <rect x="-6" y="10" width="6" height="4" fill="#333" />
                        {/* Barbell Right */}
                        <rect x="30" y="4" width="6" height="4" fill="#333" />
                        <rect x="32" y="4" width="2" height="10" fill="#888" />
                        <rect x="30" y="10" width="6" height="4" fill="#333" />
                    </g>
                )}

                {/* READING */}
                {action === 'READING' && (
                    <g className="anim-read">
                        <rect x="8" y="20" width="4" height="8" fill="#8b7355" transform="rotate(-30 10 20)" />
                        <rect x="20" y="20" width="4" height="8" fill="#8b7355" transform="rotate(30 22 20)" />
                        {/* Book */}
                        <rect x="10" y="22" width="12" height="10" fill="#eee" />
                        <rect x="15" y="22" width="2" height="10" fill="#5c4033" />
                    </g>
                )}
                
                {/* FARMING */}
                {action === 'FARMING' && (
                    <g className="anim-rake">
                         <rect x="22" y="18" width="4" height="8" fill="#8b7355" transform="rotate(-10 24 18)"/>
                         <rect x="22" y="26" width="4" height="4" fill="#e0ac69" />
                         {/* Rake Tool */}
                         <rect x="25" y="10" width="2" height="30" fill="#5c4033" transform="rotate(15 26 25)" />
                         <rect x="22" y="38" width="10" height="2" fill="#555" transform="rotate(15 26 25)" />
                         <rect x="22" y="38" width="1" height="4" fill="#555" transform="rotate(15 26 25)" />
                         <rect x="26" y="38" width="1" height="4" fill="#555" transform="rotate(15 26 25)" />
                         <rect x="30" y="38" width="1" height="4" fill="#555" transform="rotate(15 26 25)" />
                    </g>
                )}

                {/* DOG TRAINING (Static Arm + Separate Dog) */}
                {action === 'DOG_TRAINING' && (
                    <g>
                        {/* Whistle Arm */}
                        <rect x="22" y="18" width="4" height="8" fill="#8b7355" transform="rotate(-20 24 18)" />
                        <rect x="24" y="24" width="4" height="2" fill="#333" /> {/* Whistle */}
                    </g>
                )}
                
                {/* RUNNING ARMS */}
                {action === 'RUNNING' && (
                    <g>
                        <rect x="6" y="16" width="4" height="12" fill="#8b7355" transform="rotate(20 8 16)" />
                        <rect x="22" y="16" width="4" height="12" fill="#8b7355" transform="rotate(-20 24 16)" />
                    </g>
                )}
                
                {/* COOKING */}
                {action === 'COOKING' && (
                    <g>
                         {/* Stirring Arm */}
                         <g className="anim-stir">
                             <rect x="20" y="20" width="4" height="10" fill="#8b7355" transform="rotate(45 22 20)" />
                             {/* Spoon */}
                             <rect x="26" y="26" width="2" height="14" fill="#aaa" transform="rotate(15)" />
                         </g>
                         {/* Other arm */}
                         <rect x="6" y="16" width="4" height="12" fill="#8b7355" />
                    </g>
                )}
                
                {/* CRAFTING */}
                {action === 'CRAFTING' && (
                     <g className="anim-hammer">
                        <rect x="22" y="16" width="4" height="10" fill="#8b7355" />
                        <rect x="22" y="26" width="4" height="4" fill="#e0ac69" />
                        {/* Hammer */}
                        <g transform="translate(24, 28) rotate(-45)">
                             <rect x="-1" y="-10" width="2" height="12" fill="#5c4033" />
                             <rect x="-4" y="-14" width="8" height="5" fill="#555" />
                        </g>
                     </g>
                )}
                
                {/* MUSIC */}
                {action === 'MUSIC' && (
                    <g>
                         {/* Holding Arm */}
                         <rect x="6" y="20" width="4" height="10" fill="#8b7355" transform="rotate(-40 8 20)" />
                         {/* Strumming Arm */}
                         <rect x="22" y="20" width="4" height="10" fill="#8b7355" className="anim-strum" />
                         {/* Lute Body */}
                         <ellipse cx="16" cy="28" rx="8" ry="10" fill="#8B4513" />
                         <rect x="14" y="28" width="4" height="4" fill="#222" rx="2" />
                         <rect x="14" y="12" width="4" height="16" fill="#8B4513" transform="rotate(-15 16 28)" />
                    </g>
                )}
                
                {/* LANGUAGE */}
                {action === 'LANGUAGE' && (
                    <g>
                        {/* Gesturing Hand */}
                         <rect x="22" y="16" width="4" height="10" fill="#8b7355" transform="rotate(-20 24 16)" />
                         <rect x="6" y="16" width="4" height="12" fill="#8b7355" />
                    </g>
                )}
                
                {/* ART */}
                {action === 'ART' && (
                    <g>
                         {/* Painting Arm */}
                         <g className="anim-paint">
                            <rect x="22" y="16" width="4" height="10" fill="#8b7355" />
                            <rect x="22" y="26" width="4" height="4" fill="#e0ac69" />
                            {/* Brush */}
                            <rect x="24" y="26" width="2" height="10" fill="#d2b48c" transform="rotate(-30 25 28)" />
                            <rect x="27" y="34" width="2" height="3" fill="#ff0000" transform="rotate(-30 25 28)" />
                         </g>
                         {/* Palette Arm */}
                         <rect x="6" y="16" width="4" height="12" fill="#8b7355" transform="rotate(30 8 16)"/>
                         <ellipse cx="6" cy="26" rx="5" ry="4" fill="#d2b48c" />
                         <circle cx="5" cy="25" r="1" fill="#ff0000" />
                         <circle cx="7" cy="25" r="1" fill="#0000ff" />
                         <circle cx="6" cy="27" r="1" fill="#00ff00" />
                    </g>
                )}
                
                {/* HOUSEHOLD */}
                {action === 'HOUSEHOLD' && (
                    <g className="anim-sweep">
                         {/* Both hands holding broom */}
                         <rect x="6" y="18" width="4" height="10" fill="#8b7355" transform="rotate(45 8 18)" />
                         <rect x="22" y="18" width="4" height="10" fill="#8b7355" transform="rotate(-45 24 18)" />
                         {/* Broom Stick */}
                         <rect x="14" y="10" width="2" height="30" fill="#5c4033" />
                         {/* Broom Bristles */}
                         <path d="M10 40 L20 40 L22 46 L8 46 Z" fill="#d2b48c" />
                    </g>
                )}
                
                {/* SCOUT */}
                {action === 'SCOUT' && (
                    <g className="anim-look">
                         {/* Holding Arm */}
                         <rect x="22" y="16" width="4" height="10" fill="#8b7355" />
                         <rect x="22" y="26" width="4" height="4" fill="#e0ac69" />
                         {/* Spyglass */}
                         <g transform="translate(24, 28) rotate(-90)">
                            <rect x="-2" y="-12" width="4" height="10" fill="#d4af37" />
                            <rect x="-3" y="-2" width="6" height="4" fill="#555" />
                            <rect x="-1" y="-16" width="2" height="4" fill="#333" />
                         </g>
                    </g>
                )}

                {/* IDLE ARMS */}
                {action === 'IDLE' && (
                    <>
                        <rect x="6" y="16" width="4" height="12" fill="#8b7355" />
                        <rect x="6" y="26" width="4" height="4" fill="#e0ac69" />
                        <rect x="22" y="16" width="4" height="12" fill="#8b7355" />
                        <rect x="22" y="26" width="4" height="4" fill="#e0ac69" />
                    </>
                )}
            </g>

            {/* --- SEPARATE ENTITIES (Props not attached to torso) --- */}
            {action === 'DOG_TRAINING' && (
                <g className="anim-dog" transform="translate(30, 36)">
                    <rect x="0" y="0" width="12" height="7" fill="#8B4513" /> {/* Body */}
                    <rect x="-2" y="-4" width="5" height="5" fill="#8B4513" /> {/* Head */}
                    <rect x="0" y="7" width="2" height="3" fill="#8B4513" /> {/* Leg */}
                    <rect x="9" y="7" width="2" height="3" fill="#8B4513" /> {/* Leg */}
                    <rect x="11" y="0" width="2" height="3" fill="#8B4513" transform="rotate(-20)" /> {/* Tail */}
                </g>
            )}
            
            {action === 'COOKING' && (
                <g transform="translate(18, 38)">
                     <path d="M0 0 L16 0 L14 10 L2 10 Z" fill="#444" /> {/* Pot */}
                     <circle cx="8" cy="0" r="7" fill="#654321" /> {/* Soup */}
                     <circle cx="6" cy="0" r="1" fill="#bbb" className="anim-bubble-1" />
                     <circle cx="10" cy="1" r="1" fill="#bbb" className="anim-bubble-2" />
                </g>
            )}
            
            {action === 'CRAFTING' && (
                <g transform="translate(20, 36)">
                    <rect x="0" y="0" width="16" height="6" fill="#555" /> {/* Anvil Top */}
                    <rect x="4" y="6" width="8" height="6" fill="#555" /> {/* Base */}
                    <rect x="0" y="12" width="16" height="2" fill="#4a3b2a" /> {/* Stump */}
                </g>
            )}
            
            {action === 'MUSIC' && (
                <g transform="translate(26, 10)">
                     <text x="0" y="0" fill="#fff" fontSize="10" className="anim-note-1">♪</text>
                     <text x="6" y="-6" fill="#fff" fontSize="8" className="anim-note-2">♫</text>
                </g>
            )}
            
            {action === 'ART' && (
                <g transform="translate(24, 30)">
                     {/* Easel */}
                     <rect x="0" y="0" width="12" height="14" fill="#eee" transform="rotate(-10)" /> {/* Canvas */}
                     <rect x="2" y="2" width="8" height="10" fill="#fff" transform="rotate(-10)" /> 
                     <rect x="4" y="4" width="4" height="4" fill="red" opacity="0.5" transform="rotate(-10)" />
                     <rect x="4" y="14" width="2" height="10" fill="#5c4033" transform="rotate(10)" /> {/* Leg */}
                     <rect x="8" y="14" width="2" height="10" fill="#5c4033" transform="rotate(-10)" /> {/* Leg */}
                </g>
            )}

        </g>
      </svg>
    </div>
  );
};

export default PixelAvatar;
