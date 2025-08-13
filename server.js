const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Import API routes
const itemsAPI = require('./api/items');
const authAPI = require('./api/auth');
const adminAPI = require('./api/admin');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'build')));

// API Routes
app.use('/api/items', itemsAPI);
app.use('/api/auth', authAPI);
app.use('/api/admin', adminAPI);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    platform: 'heroku',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Catch-all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Platform: Heroku`);
});

module.exports = app;
