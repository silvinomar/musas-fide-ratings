const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/profile',
    createProxyMiddleware({
      target: 'https://ratings.fide.com',
      changeOrigin: true,
    })
  );
};