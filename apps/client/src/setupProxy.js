const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Server.js'de varsayılan port olarak 3001 kullanılıyor
  const serverPort = process.env.REACT_APP_SERVER_PORT || 3001;
  
  app.use(
    '/api',
    createProxyMiddleware({
      target: `http://localhost:${serverPort}`,
      changeOrigin: true,
      secure: false,
    })
  );

  // Proxy 2048 game dev server
  app.use(
    '/games/2048',
    createProxyMiddleware({
      target: 'http://localhost:3002',
      changeOrigin: true,
      secure: false,
      ws: true,
      pathRewrite: { '^/games/2048': '' },
    })
  );

  // Proxy Tombala game dev server
  app.use(
    '/games/tombala',
    createProxyMiddleware({
      target: 'http://localhost:5173',
      changeOrigin: true,
      secure: false,
      ws: true,
      pathRewrite: { '^/games/tombala': '' },
    })
  );
};
