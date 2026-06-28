/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0B0B0F',
          900: '#0B0B0F',
          800: '#14141C',
        },
        night: {
          DEFAULT: '#0B0B0F',
          soft: '#14141C',
        },
        parchment: '#EDE3CC',
        gold: {
          DEFAULT: '#C9A227',
          bright: '#E0B23C',
        },
        ember: '#8E1D14',
        'scroll-red': '#8E1D14',
        mithril: '#B8C0CC',
        'elven-green': '#4ADE80',
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        serif: ['"EB Garamond"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'gold-glow':
          '0 0 0 1px rgba(201,162,39,0.35), 0 0 24px rgba(201,162,39,0.25), 0 0 70px rgba(201,162,39,0.18)',
        'gold-glow-strong':
          '0 0 0 1px rgba(224,178,60,0.55), 0 0 40px rgba(224,178,60,0.4), 0 0 120px rgba(201,162,39,0.28)',
        'ember-glow':
          '0 0 0 1px rgba(142,29,20,0.6), 0 0 30px rgba(142,29,20,0.35), inset 0 0 40px rgba(0,0,0,0.55)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow-pulse': {
          '0%, 100%': {
            opacity: '0.55',
            filter: 'drop-shadow(0 0 8px rgba(201,162,39,0.35))',
          },
          '50%': {
            opacity: '1',
            filter: 'drop-shadow(0 0 20px rgba(224,178,60,0.6))',
          },
        },
        'rune-drift': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '600px 0' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 6s linear infinite',
        float: 'float 7s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 5s ease-in-out infinite',
        'rune-drift': 'rune-drift 40s linear infinite',
        'fade-up': 'fade-up 0.6s ease-out both',
      },
    },
  },
  plugins: [],
};
