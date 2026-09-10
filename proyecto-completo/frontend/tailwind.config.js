/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#2563eb',
          dark: '#1e3a8a',
          sky: '#38bdf8',
        },
        primary: {
          DEFAULT: '#2563eb',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#eff6ff',
          foreground: '#1e3a8a',
        },
        accent: {
          DEFAULT: '#e0f2fe',
          foreground: '#1e3a8a',
        },
        muted: {
          DEFAULT: '#f1f5f9',
          foreground: '#64748b',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#0f172a',
        },
        background: '#f8fafc',
        foreground: '#0f172a',
        border: '#e2e8f0',
        input: '#e2e8f0',
        ring: '#2563eb',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0,0,0,0.05)',
        md: '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04)',
      },
      keyframes: {
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
      },
    },
  },
  plugins: [],
};
