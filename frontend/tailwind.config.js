/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans:    ["'Space Grotesk'", 'system-ui', 'sans-serif'],
        display: ["'Space Grotesk'", 'system-ui', 'sans-serif'],
        mono:    ["'JetBrains Mono'", "'Fira Code'", 'Menlo', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
          950: '#09090b',
        },
        surface: {
          DEFAULT: '#0a0a0a',
          card:    '#111111',
          border:  'rgba(255,255,255,0.07)',
          hover:   '#1a1a1a',
          muted:   '#0d0d0d',
        },
        zinc: {
          950: '#09090b',
        },
      },
      backgroundImage: {
        'gradient-brand':   'linear-gradient(135deg,#3f3f46 0%,#52525b 50%,#71717a 100%)',
        'gradient-radial':  'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
        'noise':            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'brand':    '0 0 40px rgba(255,255,255,0.06)',
        'glow':     '0 0 20px rgba(255,255,255,0.10)',
        'glow-lg':  '0 0 60px rgba(255,255,255,0.08)',
        'card':     '0 1px 3px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.4)',
        'card-lg':  '0 4px 6px rgba(0,0,0,0.5), 0 20px 40px rgba(0,0,0,0.5)',
        'inset-sm': 'inset 0 1px 0 rgba(255,255,255,0.04)',
      },
      animation: {
        'fade-in':     'fadeIn 0.4s ease-out',
        'slide-up':    'slideUp 0.5s ease-out',
        'slide-right': 'slideRight 0.4s ease-out',
        'pulse-slow':  'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'float':       'float 6s ease-in-out infinite',
        'scan':        'scan 2s ease-in-out infinite',
        'shimmer':     'shimmer 2s linear infinite',
        'waveform':    'waveform 1s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:   { '0%': { opacity: '0', transform: 'translateY(24px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideRight:{ '0%': { opacity: '0', transform: 'translateX(-16px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        float:     { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        scan:      { '0%,100%': { opacity: '0.4' }, '50%': { opacity: '1' } },
        shimmer:   { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        waveform:  { '0%,100%': { scaleY: '0.4' }, '50%': { scaleY: '1' } },
      },
      backdropBlur: { xs: '2px' },
      borderRadius: { '2xl': '1rem', '3xl': '1.5rem', '4xl': '2rem' },
    },
  },
  plugins: [],
};

