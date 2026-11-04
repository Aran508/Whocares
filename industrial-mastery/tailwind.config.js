/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 50: '#f3f6fb', 100: '#e4eaf4', 200: '#c9d4e6', 300: '#9fb0cd', 400: '#6f84a8', 500: '#4c6187', 600: '#36486b', 700: '#273656', 800: '#1a2742', 900: '#0f1b33' },
        brand: { 50: '#eef5ff', 100: '#d9e8ff', 200: '#b8d4ff', 300: '#86b6fb', 400: '#4f8ef0', 500: '#2a6fdb', 600: '#1d5ac0', 700: '#19489a', 800: '#183e7d', 900: '#173566' },
        ok: { 50: '#ecfbf3', 100: '#d1f5e1', 500: '#1f9d5c', 600: '#178049', 700: '#126339' },
        warn: { 50: '#fff7ec', 100: '#ffeacc', 500: '#e5830f', 600: '#c26a06', 700: '#97510a' },
        bad: { 50: '#fff1f1', 100: '#ffdcdc', 500: '#d63a3a', 600: '#b82a2a', 700: '#911f1f' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,27,51,0.04), 0 1px 3px rgba(15,27,51,0.06)',
        lift: '0 4px 14px rgba(15,27,51,0.08)',
      },
    },
  },
  plugins: [],
};
