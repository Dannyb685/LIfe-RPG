
import React from 'react';

interface LootPopupProps {
  message: string;
  amount: number;
  icon: string;
  color?: string; // Tailwind text color class
}

const LootPopup: React.FC<LootPopupProps> = ({ message, amount, icon, color = 'text-[#ffff00]' }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
      <style>{`
        @keyframes loot-beam {
          0% { height: 0; opacity: 0; }
          20% { height: 100vh; opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { opacity: 0; }
        }
        @keyframes loot-pop {
          0% { transform: scale(0) translateY(20px); opacity: 0; }
          40% { transform: scale(1.2) translateY(-10px); opacity: 1; }
          60% { transform: scale(1) translateY(0); }
          90% { transform: scale(1) translateY(-5px); opacity: 1; }
          100% { transform: scale(0.8) translateY(-20px); opacity: 0; }
        }
        @keyframes spin-slow {
            0% { transform: rotateY(0deg); }
            100% { transform: rotateY(360deg); }
        }
      `}</style>
      
      {/* Loot Beam */}
      <div 
        className="absolute bottom-1/2 left-1/2 w-16 -translate-x-1/2 bg-gradient-to-t from-yellow-400/0 via-yellow-400/40 to-yellow-400/0 blur-md origin-bottom"
        style={{ animation: 'loot-beam 2.5s ease-out forwards' }}
      ></div>

      {/* Item Container */}
      <div 
        className="relative flex flex-col items-center justify-center"
        style={{ animation: 'loot-pop 3s ease-in-out forwards' }}
      >
          {/* Glowing Backlight */}
          <div className="absolute inset-0 bg-yellow-500/30 blur-xl rounded-full"></div>

          {/* Icon */}
          <div className="text-6xl drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] mb-2 z-10" style={{ animation: 'spin-slow 3s linear infinite' }}>
              <i className={`fa-solid ${icon} ${color}`}></i>
          </div>

          {/* Text */}
          <div className="bg-[#362f2b]/90 border-2 border-[#5d5447] px-6 py-3 rounded shadow-[4px_4px_0_rgba(0,0,0,0.6)] text-center z-10 backdrop-blur-sm">
              <div className={`font-bold text-lg ${color} uppercase tracking-wider drop-shadow-md`}>
                  {message}
              </div>
              <div className="text-white font-mono text-xl font-bold flex items-center justify-center gap-2">
                  <span>+{amount}</span>
                  <img src="https://i.imgur.com/81j18dD.png" alt="gp" className="w-5 h-5" />
              </div>
          </div>
      </div>
    </div>
  );
};

export default LootPopup;
