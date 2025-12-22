
import React from 'react';

export type ActionType = 'IDLE' | 'COMBAT' | 'MAGIC' | 'WOODCUTTING' | 'LIFTING' | 'READING' | 'DOG_TRAINING' | 'FARMING' | 'COOKING' | 'CRAFTING' | 'MUSIC' | 'RUNNING' | 'LANGUAGE' | 'ART' | 'HOUSEHOLD' | 'SCOUT' | 'MEDITATE' | 'WRITE' | 'CODE' | 'TEA' | 'GARDEN' | 'DOG' | 'CAT' | 'SPIRIT' | 'XP' | 'FLOW' | 'FOCUS';

interface PixelAvatarProps {
    action: ActionType;
    scale?: number;
    assetBasePath: string;
}

const SPRITE_MAP: Record<string, string> = {
    // New Sprites - Player
    'IDLE': 'sprite_avatar_idle_1766253224945.png',
    'MEDITATE': 'sprite_avatar_meditate_1766253239584.png',
    'READING': 'sprite_avatar_read_1766253268401.png',
    'FARMING': 'sprite_avatar_garden_1766253254213.png',
    'GARDEN': 'sprite_avatar_garden_1766253254213.png',
    'TEA': 'sprite_avatar_tea_1766253296801.png',
    'COOKING': 'sprite_avatar_tea_1766253296801.png',
    'WRITE': 'sprite_avatar_write_1766253310611.png',
    'CRAFTING': 'sprite_avatar_write_1766253310611.png',
    'ART': 'sprite_avatar_write_1766253310611.png',
    'CODE': 'sprite_avatar_code_1766253324374.png',

    // Companions & Spirits
    'DOG': 'sprite_companion_dog_1766253672506.png',
    'CAT': 'sprite_companion_cat_1766253685081.png',
    'SPIRIT': 'sprite_spirit_wisp_1766253698411.png',

    // FX Icons
    'XP': 'icon_xp_drop_1766253713370.png',
    'FLOW': 'icon_boost_flow_1766253727964.png',
    'FOCUS': 'icon_boost_focus_1766253741073.png',

    // Legacy Mappings
    'COMBAT': 'sprite_avatar_garden_1766253254213.png',
    'MAGIC': 'sprite_avatar_meditate_1766253239584.png',
    'WOODCUTTING': 'sprite_avatar_garden_1766253254213.png',
    'LIFTING': 'sprite_avatar_garden_1766253254213.png',
    'DOG_TRAINING': 'sprite_companion_dog_1766253672506.png', // Show dog instead
    'MUSIC': 'sprite_avatar_idle_1766253224945.png',
    'RUNNING': 'sprite_avatar_idle_1766253224945.png',
    'LANGUAGE': 'sprite_avatar_read_1766253268401.png',
    'HOUSEHOLD': 'sprite_avatar_garden_1766253254213.png',
    'SCOUT': 'sprite_spirit_wisp_1766253698411.png', // Show wisp
};

const PixelAvatar: React.FC<PixelAvatarProps> = ({ action, scale = 1, assetBasePath }) => {
    const spriteFile = SPRITE_MAP[action] || SPRITE_MAP['IDLE'];
    const [imgError, setImgError] = React.useState(false);

    // Dynamic Image Path
    // Ensure we handle the "app://..." protocol quirks if needed, but assetBasePath should be clean now.
    const imgSrc = `${assetBasePath}/${spriteFile}`;

    return (
        <div
            className="relative flex items-center justify-center transition-all duration-500"
            style={{
                width: 120 * scale, // Increased base size for 4k assets
                height: 120 * scale,
                imageRendering: 'pixelated'
            }}
        >
            {/* Subtle breathing animation */}
            {!imgError ? (
                <img
                    src={imgSrc}
                    alt={action}
                    onError={() => setImgError(true)}
                    className="w-full h-full object-contain drop-shadow-2xl animate-pulse-slow"
                />
            ) : (
                // Fallback Placeholder
                <div className="w-20 h-20 bg-indigo-400 rounded-lg flex items-center justify-center shadow-lg animate-pulse">
                    <span className="text-white text-xs font-bold uppercase">{action}</span>
                </div>
            )}

            {/* Simple shadow */}
            {!imgError && <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1/2 h-2 bg-black/20 rounded-full blur-[2px]"></div>}

            <style>{`
            @keyframes pulse-slow {
                0%, 100% { transform: translateY(0); filter: brightness(1); }
                50% { transform: translateY(-2px); filter: brightness(1.05); }
            }
            .animate-pulse-slow {
                animation: pulse-slow 4s ease-in-out infinite;
            }
            `}</style>
        </div>
    );
};

export default PixelAvatar;
