/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
        surface: {
          DEFAULT: '#080d14',
          card:    '#0d1520',
          border:  '#1a2a3a',
          hover:   '#111e2e',
        },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #0891b2 0%, #06b6d4 50%, #22d3ee 100%)',
        'gradient-dark':  'linear-gradient(135deg, #080d14 0%, #0d1520 100%)',
        'gradient-card':  'linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(34,211,238,0.04) 100%)',
      },
      boxShadow: {
        'brand': '0 0 40px rgba(6,182,212,0.25)',
        'card':  '0 4px 24px rgba(0,0,0,0.5)',
        'glow':  '0 0 24px rgba(6,182,212,0.45)',
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-in-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow':  'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
