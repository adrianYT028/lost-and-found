const express = require('express');
const { sequelize } = require('../models');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/items');
const userRoutes = require('./routes/users');
const aiMatchRoutes = require('./routes/aiMatches');
const adminRoutes = require('./routes/admin');
// const matchRoutes = require('./routes/matches'); // Commented out until migrated

// Import middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();
const path = require('path');

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "http://localhost:3001", "http://localhost:5002"],
    },
  },
  crossOriginResourcePolicy: false
}));
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3001',
    process.env.FRONTEND_URL_PROD || 'https://your-app.vercel.app'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Credentials'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads
app.use('/uploads', express.static('uploads'));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai-matches', aiMatchRoutes);
app.use('/api/admin', adminRoutes);
// app.use('/api/matches', matchRoutes); // Commented out until migrated

// Serve frontend build in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '..', '..', 'frontend', 'build');
  app.use(express.static(buildPath));

  // Return frontend for any non-API routes
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Lost & Found API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      items: '/api/items',
      users: '/api/users',
      matches: '/api/matches'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// PostgreSQL connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL Connected successfully');
    
    // Sync database tables (in development)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      console.log('📊 Database synchronized');
    }
    
  } catch (error) {
  console.error('❌ PostgreSQL connection error:', error.message);
  console.warn('Continuing without database connection. Some API routes may fail until DATABASE_URL is configured.');
  // Do not exit the process; allow server to start so frontend and non-db routes can be served.
  }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📝 API Documentation: http://localhost:${PORT}/`);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3001'}`);
    }
  });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  sequelize.close().then(() => {
    console.log('💾 PostgreSQL connection closed.');
    process.exit(0);
  });
});

startServer();

module.exports = app;
