/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        night: {
          DEFAULT: '#050816',
          900: '#070B1A',
          800: '#0A0F24',
          700: '#0D142E',
          600: '#111A38',
        },
        surface: {
          DEFAULT: 'rgba(13, 20, 46, 0.6)',
          raised: 'rgba(17, 26, 56, 0.7)',
          overlay: 'rgba(10, 15, 36, 0.85)',
        },
        brand: {
          50: '#eef4ff',
          100: '#dbe9fe',
          200: '#bfd7fe',
          300: '#93bbfd',
          400: '#609afa',
          500: '#3b82f6',
          600: '#2f6fe4',
          700: '#2659ce',
          800: '#254aa7',
          900: '#234084',
          950: '#1b2a52',
        },
        neon: {
          cyan: '#22d3ee',
          blue: '#3b82f6',
          indigo: '#818cf8',
          violet: '#a78bfa',
          purple: '#c084fc',
        },
      },
      boxShadow: {
        'glow-sm': '0 0 12px -2px rgba(59, 130, 246, 0.35)',
        'glow': '0 0 24px -4px rgba(34, 211, 238, 0.35), 0 0 12px -2px rgba(59, 130, 246, 0.3)',
        'glow-lg': '0 0 48px -8px rgba(34, 211, 238, 0.45), 0 0 24px -6px rgba(129, 140, 248, 0.35)',
        'card': '0 8px 32px -12px rgba(0, 0, 0, 0.55), inset 0 1px 0 0 rgba(255, 255, 255, 0.04)',
        'card-hover': '0 16px 48px -12px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(34, 211, 238, 0.12), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        'panel': '0 20px 60px -20px rgba(0, 0, 0, 0.7)',
      },
      animation: {
        'shimmer': 'shimmer 2s infinite linear',
        'fade-in': 'fadeIn 0.25s ease-out forwards',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.75' },
        },
      },
    },
  },
  plugins: [],
}
