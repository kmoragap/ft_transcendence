import { defineConfig } from 'vite';

function pongRewritePlugin() {
  return {
    name: 'pong-rewrite',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url === '/pong' || req.url === '/pong/') req.url = '/pong.html';
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url === '/pong' || req.url === '/pong/') req.url = '/pong.html';
        next();
      });
    },
  };
}

export default defineConfig({
  root: '.',
  publicDir: 'public',
  server: {
    port: 5173,
    host: '0.0.0.0',
    open: false,
    proxy: {
      '/api': {
        target: 'http://auth:3000',
        changeOrigin: true,
      },
    },
    fs: { strict: false },
  },
  plugins: [pongRewritePlugin()],
});