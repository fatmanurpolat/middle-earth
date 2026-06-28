/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0B0B0F',
          night: '#14141C',
        },
        parchment: '#EDE3CC',
        gold: {
          DEFAULT: '#C9A227',
          bright: '#E0B23C',
        },
        ember: '#8E1D14',
        mithril: '#B8C0CC',
        elven: '#4ADE80',
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        serif: ['"EB Garamond"', 'Georgia', 'serif'],
      },
      keyframes: {
        'golden-glow': {
          '0%, 100%': {
            boxShadow:
              '0 0 14px rgba(201, 162, 39, 0.25), 0 0 32px rgba(201, 162, 39, 0.08)',
          },
          '50%': {
            boxShadow:
              '0 0 26px rgba(224, 178, 60, 0.5), 0 0 60px rgba(201, 162, 39, 0.2)',
          },
        },
        'accent-glow': {
          '0%, 100%': {
            boxShadow: '0 0 14px var(--accent-glow-soft, rgba(201,162,39,0.25))',
          },
          '50%': {
            boxShadow:
              '0 0 30px var(--accent-glow-strong, rgba(224,178,60,0.5))',
          },
        },
        'rune-shimmer': {
          '0%': { opacity: '0.35', filter: 'drop-shadow(0 0 2px rgba(184,192,204,0.4))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 10px rgba(184,192,204,0.9))' },
          '100%': { opacity: '0.35', filter: 'drop-shadow(0 0 2px rgba(184,192,204,0.4))' },
        },
        'door-breathe': {
          '0%, 100%': { opacity: '0.55', filter: 'drop-shadow(0 0 6px rgba(184,192,204,0.5))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 18px rgba(184,192,204,0.95))' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'ring-draw': {
          '0%': { strokeDashoffset: 'var(--ring-circumference, 1000)' },
          '100%': { strokeDashoffset: 'var(--ring-offset, 0)' },
        },
      },
      animation: {
        'golden-glow': 'golden-glow 4s ease-in-out infinite',
        'accent-glow': 'accent-glow 4s ease-in-out infinite',
        'rune-shimmer': 'rune-shimmer 5s ease-in-out infinite',
        'door-breathe': 'door-breathe 6s ease-in-out infinite',
        'fade-up': 'fade-up 0.6s ease-out both',
      },
    },
  },
  plugins: [],
};
