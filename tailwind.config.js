/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        gold: {
          primary: '#F5A623',
          bright:  '#FBBF24',
          dark:    '#B45309',
        },
        space: {
          black:  '#0C0C0F',
          navy:   '#141417',
          mid:    '#1C1C21',
          border: '#2A2A32',
        },
        candle: {
          green: '#22C55E',
          red:   '#EF4444',
        },
        accent: {
          green:      '#22C55E',
          'green-dim': '#16A34A',
        },
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        mono:    ['"DM Sans"', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        sora:    ['Sora', 'sans-serif'],
        sans:    ['"DM Sans"', 'sans-serif'],
      },
      boxShadow: {
        gold:     '0 0 20px rgba(245, 166, 35, 0.25)',
        'gold-lg':'0 0 40px rgba(245, 166, 35, 0.35)',
        green:    '0 0 20px rgba(34, 197, 94, 0.25)',
        red:      '0 0 20px rgba(239, 68, 68, 0.2)',
        card:     '0 2px 12px rgba(0,0,0,0.4)',
      },
      animation: {
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'float':      'float 6s ease-in-out infinite',
        'rocket':     'rocket 0.8s ease-out forwards',
        'shake':      'shake 0.5s ease-in-out',
      },
      keyframes: {
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(245,166,35,0.2)' },
          '50%':      { boxShadow: '0 0 30px rgba(245,166,35,0.5)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        rocket: {
          '0%':   { transform: 'translateY(0) scale(1)',   opacity: '1' },
          '50%':  { transform: 'translateY(-40px) scale(1.3)', opacity: '0.8' },
          '100%': { transform: 'translateY(-80px) scale(0.5)', opacity: '0' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%':      { transform: 'translateX(-8px)' },
          '40%':      { transform: 'translateX(8px)' },
          '60%':      { transform: 'translateX(-5px)' },
          '80%':      { transform: 'translateX(5px)' },
        },
      },
    },
  },
  plugins: [],
}
