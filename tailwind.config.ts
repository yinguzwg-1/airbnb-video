import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class', // 启用基于class的深色模式
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        // 自定义深色模式颜色
        'dark-bg': '#0F172A',
        'dark-surface': '#1E293B',
        'dark-border': '#334155',
      },
      keyframes: {
        audioWave: {
          '0%, 100%': { transform: 'scaleY(1)' },
          '50%': { transform: 'scaleY(2)' },
        }
      },
      animation: {
        'audio-wave': 'audioWave 1s ease-in-out infinite',
      }
    },
  },
  plugins: [],
};
export default config;
