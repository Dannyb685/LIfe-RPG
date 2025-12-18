/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./**/*.{ts,tsx}"
  ],
  // CRITICAL: Disable preflight to prevent destroying Obsidian's default UI
  corePlugins: {
    preflight: false,
  },
  // Scope styles to our specific view class to prevent leakage
  // We will manually apply this class in the React root or View container
  important: '.life-rpg-view', 
  theme: {
    extend: {
      colors: {
        osrs: {
            bg: '#1e1e1e', 
            panel: '#3e3226', // Wood base
            inset: '#2c241b', // Darker wood
            border: '#5d5447', 
            gold: '#ffff00', 
            orange: '#ff981f', 
            red: '#cc2222', 
            green: '#00ff00', 
        },
        parchment: '#e3d5ca',
        wood: {
            light: '#5c4033',
            dark: '#3e3226',
            black: '#231c16'
        }
      },
      fontFamily: {
          fantasy: ['"Cinzel Decorative"', 'serif'],
          pixel: ['"VT323"', 'monospace'],
          sans: ['"VT323"', 'monospace'], // Override default sans to pixel for this theme
      },
      boxShadow: {
          'osrs': 'inset 2px 2px 0px rgba(255, 255, 255, 0.1), inset -2px -2px 0px rgba(0, 0, 0, 0.5), 4px 4px 0px rgba(0,0,0,0.5)',
          'osrs-inset': 'inset 4px 4px 0px rgba(0,0,0,0.6), 1px 1px 0px rgba(255,255,255,0.1)',
          'voxel': '1px 1px 0 #1a1a1a, 2px 2px 0 #1a1a1a, 3px 3px 0 #1a1a1a, 4px 4px 0 #1a1a1a'
      },
      dropShadow: {
          'text': '1px 1px 0 #000',
          'text-lg': '2px 2px 0 #000'
      }
    },
  },
  plugins: [],
}