const express = require('express');
const path = require('path');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 4200;
const API_URL = process.env.API_URL || 'http://localhost:8080';

// Enable gzip compression
app.use(compression());

// Serve static files from the Angular build output
app.use(express.static(path.join(__dirname, 'dist/appraisal-frontend/browser')));

// API proxy - forward all /api requests to the backend
app.use('/api', (req, res) => {
  const url = `${API_URL}${req.url}`;
  
  const options = {
    method: req.method,
    headers: {
      ...req.headers,
      host: new URL(API_URL).host
    }
  };

  // Forward cookies for session management
  if (req.headers.cookie) {
    options.headers.cookie = req.headers.cookie;
  }

  const proxyReq = require(API_URL.startsWith('https') ? 'https' : 'http').request(url, options, (proxyRes) => {
    // Forward response headers (including Set-Cookie for session)
    Object.keys(proxyRes.headers).forEach(key => {
      res.setHeader(key, proxyRes.headers[key]);
    });
    
    res.status(proxyRes.statusCode);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err);
    res.status(502).json({ error: 'Bad Gateway', message: 'Unable to reach backend API' });
  });

  // Forward request body for POST/PUT/PATCH
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    req.pipe(proxyReq);
  } else {
    proxyReq.end();
  }
});

// All other routes should serve the Angular index.html (for client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/appraisal-frontend/browser/index.html'));
});

app.listen(PORT, () => {
  console.log(`Angular app is running on http://localhost:${PORT}`);
  console.log(`API requests will be proxied to ${API_URL}`);
});
