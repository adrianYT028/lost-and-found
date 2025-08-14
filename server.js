// --- TEST ENDPOINT FOR ROUTING ---
app.get('/api/routing-test', (req, res) => {
  res.json({ message: 'API routing is working!' });
});
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Starting Lost & Found Server...');
console.log('📂 Current directory:', __dirname);
console.log('🌐 NODE_ENV:', process.env.NODE_ENV || 'development');

// Import API routes with error handling
let itemsAPI, authAPI, adminAPI, setupAPI;

try {
  itemsAPI = require('./api/items');
  console.log('✅ Items API loaded');
} catch (error) {
  console.error('❌ Failed to load Items API:', error.message);
}

try {
  authAPI = require('./api/auth');
  console.log('✅ Auth API loaded');
} catch (error) {
  console.error('❌ Failed to load Auth API:', error.message);
}

try {
  adminAPI = require('./api/admin');
  console.log('✅ Admin API loaded');
} catch (error) {
  console.error('❌ Failed to load Admin API:', error.message);
}

try {
  setupAPI = require('./api/setup');
  console.log('✅ Setup API loaded');
} catch (error) {
  console.error('❌ Failed to load Setup API:', error.message);
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'build')));

// API Routes (with conditional mounting)
if (itemsAPI) {
  app.use('/api/items', itemsAPI);
  console.log('📍 Mounted /api/items');
}

if (authAPI) {
  app.use('/api/auth', authAPI);
  console.log('📍 Mounted /api/auth');
}

if (adminAPI) {
  app.use('/api/admin', adminAPI);
  console.log('📍 Mounted /api/admin');
}

if (setupAPI) {
  app.use('/api/setup', setupAPI);
  console.log('📍 Mounted /api/setup');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    platform: 'heroku',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test endpoint to verify API routing
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    routes: ['/api/health', '/api/test', '/api/items', '/api/auth', '/api/admin', '/api/setup'],
    loadedRoutes: {
      items: !!itemsAPI,
      auth: !!authAPI,
      admin: !!adminAPI,
      setup: !!setupAPI
    },
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint to check environment
app.get('/api/debug', (req, res) => {
  res.json({
    message: 'Debug info',
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    hasSupabaseUrl: !!(process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL),
    hasSupabaseKey: !!(process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY),
    buildExists: require('fs').existsSync(path.join(__dirname, 'build')),
    timestamp: new Date().toISOString()
  });
});


// ...existing code...

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
