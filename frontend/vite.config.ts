import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  server: {
    port: 5173,
    host: '0.0.0.0',
    open: false,
    proxy: {
      '/api': {
        target: 'https://localhost',
        changeOrigin: true,
      },
    },
    hmr: {
      host: 'localhost'
    },
    fs: { strict: false },
  },
});