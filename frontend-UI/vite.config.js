import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const backendOrigin =
  process.env.BACKEND_ORIGIN || 'http://localhost:8080';

export default defineConfig({
  plugins: [react()],

  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,

    hmr: {
      protocol: 'ws',
      host: 'localhost',
      clientPort: 5173,
    },

    proxy: {
      '/api': {
        target: backendOrigin,
        changeOrigin: true,
      },

      '/uploads': {
        target: backendOrigin,
        changeOrigin: true,
      },
    },
  },
});