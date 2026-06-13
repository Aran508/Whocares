/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0B0F14',
        panel: '#141A21',
        panel2: '#1B232C',
        line: '#2A343F',
        amber: '#FF8A00',
        cyan: '#00D4FF',
        good: '#3DDC84',
        warn: '#FFC93C',
        bad: '#FF5C5C',
        ink: '#E8ECEF',
        mute: '#7E8A97'
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      boxShadow: {
        glow: '0 0 24px rgba(0, 212, 255, 0.25)',
        glowAmber: '0 0 24px rgba(255, 138, 0, 0.25)'
      }
    }
  },
  plugins: []
};
