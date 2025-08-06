export default {
  root: '.',
  server: {
    port: 5173,
    host: '0.0.0.0',
    open: false,
    proxy: {
        '/api': {
          target: 'http://auth:3000',
          changeOrigin: true,
          rewrite: (path) => path,
        },
    }
  }
}