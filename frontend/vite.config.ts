import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.indexOf('node_modules/phaser3-rex-plugins') >= 0) return 'vendor-rexui';
          if (id.indexOf('node_modules/phaser') >= 0) return 'vendor-phaser';
          if (id.indexOf('node_modules') >= 0) return 'vendor';
        }
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
});
