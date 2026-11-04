import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(({ mode }) => {
  // `vite build --mode artifact` produces one self-contained HTML file with hash routing.
  if (mode === 'artifact') {
    return {
      plugins: [react(), viteSingleFile()],
      base: './',
      define: { 'import.meta.env.VITE_HASH_ROUTER': JSON.stringify('1') },
      build: { outDir: 'dist-artifact', chunkSizeWarningLimit: 5000 },
    };
  }
  return {
    plugins: [react()],
    build: {
      chunkSizeWarningLimit: 2500,
      rollupOptions: { output: { manualChunks: { vendor: ['react', 'react-dom', 'react-router-dom'], charts: ['recharts'] } } },
    },
  };
});
