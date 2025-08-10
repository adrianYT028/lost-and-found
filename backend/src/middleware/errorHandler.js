// Global error handling middleware

// Error Handler Middleware - Updated for Sequelize
const handleError = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error:', err);

  // Sequelize foreign key constraint error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    const message = 'Invalid reference to related data';
    error = {
      message,
      statusCode: 400,
      success: false
    };
  }

  // Legacy Mongoose bad ObjectId (for backward compatibility)
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = {
      message,
      statusCode: 404,
      success: false
    };
  }

  // Sequelize database connection error
  if (err.name === 'SequelizeConnectionError') {
    const message = 'Database connection error';
    error = {
      message,
      statusCode: 500,
      success: false
    };
  }

  // Legacy Mongoose duplicate key error (for backward compatibility)
  if (err.code === 11000 && err.keyValue) {
    let message = 'Duplicate field value entered';
    
    // Extract field name from error
    const field = Object.keys(err.keyValue)[0];
    if (field === 'email') {
      message = 'Email already registered';
    } else if (field === 'studentId') {
      message = 'Student ID already registered';
    }
    
    error = {
      message,
      statusCode: 400,
      success: false
    };
  }

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const message = err.errors ? err.errors.map(error => error.message).join(', ') : 'Validation error';
    error = {
      message,
      statusCode: 400,
      success: false
    };
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    let message = 'Duplicate value entered';
    
    if (err.errors && err.errors.length > 0) {
      const field = err.errors[0].path;
      if (field === 'email') {
        message = 'Email already registered';
      } else if (field === 'studentId') {
        message = 'Student ID already registered';
      }
    }
    
    error = {
      message,
      statusCode: 400,
      success: false
    };
  }

  // Custom ValidationError (from our app)
  if (err.name === 'ValidationError' && !err.errors) {
    error = {
      message: err.message,
      statusCode: err.statusCode || 400,
      success: false
    };
  }

  // Legacy Mongoose validation error (for backward compatibility)
  if (err.name === 'ValidationError' && err.errors) {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = {
      message,
      statusCode: 400,
      success: false
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = {
      message,
      statusCode: 401,
      success: false
    };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = {
      message,
      statusCode: 401,
      success: false
    };
  }

  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large. Maximum size is 10MB';
    error = {
      message,
      statusCode: 400,
      success: false
    };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    const message = 'Too many files or unexpected field name';
    error = {
      message,
      statusCode: 400,
      success: false
    };
  }

  // Cloudinary errors
  if (err.message && err.message.includes('Invalid image file')) {
    const message = 'Invalid image file format';
    error = {
      message,
      statusCode: 400,
      success: false
    };
  }

  // Rate limiting error
  if (err.status === 429) {
    const message = 'Too many requests, please try again later';
    error = {
      message,
      statusCode: 429,
      success: false
    };
  }

  // MongoDB connection errors
  if (err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
    const message = 'Database connection error. Please try again later';
    error = {
      message,
      statusCode: 503,
      success: false
    };
  }

  // Default error response
  const statusCode = error.statusCode || err.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Prepare error response
  const errorResponse = {
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: err
    })
  };

  // Add request info in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.request = {
      method: req.method,
      url: req.originalUrl,
      body: req.body,
      params: req.params,
      query: req.query,
      headers: {
        'user-agent': req.get('user-agent'),
        'content-type': req.get('content-type')
      }
    };
  }

  // Log different error levels
  if (statusCode >= 500) {
    console.error('🔴 Server Error:', {
      message,
      statusCode,
      method: req.method,
      url: req.originalUrl,
      user: req.user?.email || 'anonymous',
      stack: err.stack
    });
  } else if (statusCode >= 400) {
    console.warn('🟡 Client Error:', {
      message,
      statusCode,
      method: req.method,
      url: req.originalUrl,
      user: req.user?.email || 'anonymous'
    });
  }

  res.status(statusCode).json(errorResponse);
};

// Async wrapper to catch async errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 404 handler for undefined routes
const notFound = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
};

// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error types
class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
    this.name = 'ValidationError';
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429);
    this.name = 'RateLimitError';
  }
}

class ServerError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, 500);
    this.name = 'ServerError';
  }
}

// Export the main errorHandler function as default
module.exports = handleError;

// Also export other utilities
module.exports.asyncHandler = asyncHandler;
module.exports.notFound = notFound;
module.exports.AppError = AppError;
module.exports.ValidationError = ValidationError;
module.exports.AuthenticationError = AuthenticationError;
module.exports.AuthorizationError = AuthorizationError;
module.exports.NotFoundError = NotFoundError;
module.exports.ConflictError = ConflictError;
module.exports.RateLimitError = RateLimitError;
module.exports.ServerError = ServerError;
