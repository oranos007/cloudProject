import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // Adjust if deploying to a subpath (e.g., '/app/')
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000', // Frontend service (server.js)
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'client/build', // Match server.js static files directory
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          recharts: ['recharts'],
          router: ['react-router-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'recharts'],
  },
});