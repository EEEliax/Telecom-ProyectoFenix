import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true, // CRÍTICO: sin esto, el handshake de Socket.io nunca llega al backend
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
  },
});
