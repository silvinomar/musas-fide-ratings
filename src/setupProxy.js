const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://ratings.fide.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/profile'
      },
      headers: {
        Referer: 'https://silvinomar.github.io/musas-fide-ratings'
      }
    })
  );
};
