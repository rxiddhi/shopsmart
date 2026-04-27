const { ZodError } = require('zod');

/**
 * Centralized error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log error (in production, use a proper logging service)
  console.error('Error:', err.message);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'validation_error',
      message: 'Validation failed',
      details: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(403).json({
      error: 'invalid_token',
      message: 'Invalid authorization token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'token_expired',
      message: 'Your session has expired',
    });
  }

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(400).json({
      error: 'duplicate_entry',
      message: 'A record with this value already exists',
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'not_found',
      message: 'Record not found',
    });
  }

  // Custom application errors
  if (err.message) {
    // Determine status code based on error message
    let statusCode = 500;
    let errorCode = 'server_error';

    if (err.message.includes('not found')) {
      statusCode = 404;
      errorCode = 'not_found';
    } else if (
      err.message.includes('permission') ||
      err.message.includes('unauthorized') ||
      err.message.includes('forbidden')
    ) {
      statusCode = 403;
      errorCode = 'forbidden';
    } else if (
      err.message.includes('invalid') ||
      err.message.includes('validation') ||
      err.message.includes('required') ||
      err.message.includes('must')
    ) {
      statusCode = 400;
      errorCode = 'validation_error';
    } else if (err.message.includes('already exists') || err.message.includes('already registered')) {
      statusCode = 400;
      errorCode = 'duplicate_entry';
    } else if (err.message.includes('insufficient stock') || err.message.includes('unavailable')) {
      statusCode = 400;
      errorCode = 'insufficient_stock';
    }

    return res.status(statusCode).json({
      error: errorCode,
      message: err.message,
    });
  }

  // Default error response
  res.status(500).json({
    error: 'server_error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message || 'Internal server error',
  });
};

module.exports = errorHandler;
