const http = require('http');
const httpProxy = require('http-proxy-middleware');
const fs = require('fs');

const proxy = httpProxy.createProxyMiddleware({
  target: 'http://localhost:3007',
  changeOrigin: true,
  ws: true,
  logLevel: 'warn'
});

const server = http.createServer((req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  proxy(req, res);
});

const PORT = 80;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Reverse proxy running on port ${PORT} -> http://localhost:3007`);
});