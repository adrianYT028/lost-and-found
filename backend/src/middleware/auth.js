const jwt = require('jsonwebtoken');
const { User } = require('../../models');

// Middleware to authenticate JWT tokens
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    // Check if token starts with 'Bearer '
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token format.'
      });
    }
    
    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid. User not found.'
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.'
      });
    }
    
    // Add user to request object
    req.user = user;
    next();
    
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
};

// Middleware to check for specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }
    
    next();
  };
};

// Middleware to check if user is admin
const isAdmin = authorize('admin');

// Middleware to check if user is admin or moderator
const isModerator = authorize('admin', 'moderator');

// Optional auth middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }
    
    const token = authHeader.substring(7);
    
    if (!token) {
      req.user = null;
      return next();
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user || !user.isActive) {
      req.user = null;
      return next();
    }
    
    req.user = user;
    next();
    
  } catch (error) {
    // If token is invalid, just continue without user
    req.user = null;
    next();
  }
};

// Middleware to check if user owns the resource
const checkOwnership = (resourceField = 'reportedBy') => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required.'
        });
      }
      
      // Skip ownership check for admins
      if (req.user.role === 'admin') {
        return next();
      }
      
      // The resource should be attached to req.resource by previous middleware
      const resource = req.resource;
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found.'
        });
      }
      
      // Check if user owns the resource
      const ownerId = resource[resourceField];
      
      if (!ownerId || ownerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only access your own resources.'
        });
      }
      
      next();
      
    } catch (error) {
      console.error('Ownership check error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Server error during ownership verification.'
      });
    }
  };
};

// Middleware to check if user is part of a match
const checkMatchParticipant = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }
    
    // Skip check for admins
    if (req.user.role === 'admin') {
      return next();
    }
    
    const match = req.resource; // Should be set by previous middleware
    
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found.'
      });
    }
    
    // Check if user is either the lost item owner or found item reporter
    const isLostOwner = match.lostItemOwner.toString() === req.user._id.toString();
    const isFoundReporter = match.foundItemReporter.toString() === req.user._id.toString();
    
    if (!isLostOwner && !isFoundReporter) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not a participant in this match.'
      });
    }
    
    // Add participant info to request
    req.isLostOwner = isLostOwner;
    req.isFoundReporter = isFoundReporter;
    
    next();
    
  } catch (error) {
    console.error('Match participant check error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during participant verification.'
    });
  }
};

// Middleware to check rate limiting per user
const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    if (!req.user) {
      return next(); // Skip rate limiting for unauthenticated users
    }
    
    const userId = req.user._id.toString();
    const now = Date.now();
    
    // Clean up old entries
    for (const [key, data] of requests.entries()) {
      if (now - data.firstRequest > windowMs) {
        requests.delete(key);
      }
    }
    
    // Get or create user entry
    if (!requests.has(userId)) {
      requests.set(userId, {
        count: 1,
        firstRequest: now
      });
    } else {
      const userData = requests.get(userId);
      userData.count++;
      
      if (userData.count > maxRequests) {
        return res.status(429).json({
          success: false,
          message: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((windowMs - (now - userData.firstRequest)) / 1000)
        });
      }
    }
    
    next();
  };
};

// Middleware to validate email verification
const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }
  
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Email verification required. Please verify your email to continue.'
    });
  }
  
  next();
};

// Middleware to check account status
const requireActiveAccount = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }
  
  if (!req.user.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Account is deactivated. Please contact support.'
    });
  }
  
  next();
};

module.exports = {
  auth,
  authorize,
  isAdmin,
  isModerator,
  optionalAuth,
  checkOwnership,
  checkMatchParticipant,
  userRateLimit,
  requireEmailVerification,
  requireActiveAccount
};
