import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        // Sky blue brand palette
        brand: {
          50:  '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
        },
        // Dark mode navy surfaces
        'dark-bg': '#0B1120',
        'dark-surface': '#152038',
        'dark-border': '#1E3A5F',
      },
      keyframes: {
        audioWave: {
          '0%, 100%': { transform: 'scaleY(1)' },
          '50%': { transform: 'scaleY(2)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'float-gentle': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'slide-up-spring': {
          '0%': { opacity: '0', transform: 'translateY(24px) scale(0.96)' },
          '60%': { opacity: '1', transform: 'translateY(-4px) scale(1.01)' },
          '80%': { transform: 'translateY(2px) scale(0.995)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'morph-in': {
          '0%': { opacity: '0', transform: 'scale(0.92)', filter: 'blur(8px)' },
          '100%': { opacity: '1', transform: 'scale(1)', filter: 'blur(0px)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(56, 189, 248, 0.4)' },
          '50%': { transform: 'scale(1.05)', boxShadow: '0 0 20px 4px rgba(56, 189, 248, 0.2)' },
        },
      },
      animation: {
        'audio-wave': 'audioWave 1s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'float-gentle': 'float-gentle 3s ease-in-out infinite',
        'slide-up-spring': 'slide-up-spring 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'morph-in': 'morph-in 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'breathe': 'breathe 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
export default config;
