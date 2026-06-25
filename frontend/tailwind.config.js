/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    container: { center: true, padding: '1.5rem' },
    extend: {
      colors: {
        // Brand
        primary: {
          DEFAULT: '#0A4DFF', // deep electric blue
          dark: '#0036C2',
          light: '#3B7BFF',
        },
        accent: '#22D3EE', // cyan glow
        signal: '#FF3B30', // red signal, used sparingly
        // Neutrals
        ink: {
          DEFAULT: '#0A1628', // deep navy near-black
          soft: '#1B2638',
          muted: '#64748B',
        },
        paper: '#FFFFFF',
        chrome: '#F4F5F2', // warm off-white for sections
        line: '#E5E9F0',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        arabic: ['"Noto Kufi Arabic"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // Editorial display sizes
        'display-sm': ['clamp(2.25rem, 4vw, 3rem)', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
        'display-md': ['clamp(2.75rem, 6vw, 4.5rem)', { lineHeight: '1.02', letterSpacing: '-0.03em' }],
        'display-lg': ['clamp(3.5rem, 8vw, 6rem)', { lineHeight: '0.98', letterSpacing: '-0.035em' }],
        'display-xl': ['clamp(4rem, 10vw, 8rem)', { lineHeight: '0.92', letterSpacing: '-0.04em' }],
      },
      letterSpacing: {
        'wider-1': '0.06em',
        'wider-2': '0.14em',
      },
      boxShadow: {
        soft: '0 1px 0 rgba(10,22,40,0.04), 0 8px 32px -16px rgba(10,22,40,0.12)',
        line: 'inset 0 0 0 1px rgba(10,22,40,0.08)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'pulse-ring': {
          '0%,100%': { transform: 'scale(1)', opacity: '0.6' },
          '50%': { transform: 'scale(1.05)', opacity: '0.9' },
        },
      },
      animation: {
        marquee: 'marquee 40s linear infinite',
        'pulse-ring': 'pulse-ring 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
