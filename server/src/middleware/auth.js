const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Middleware to verify JWT token and authenticate requests
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(403).json({ 
        error: 'unauthorized',
        message: 'No authorization token provided' 
      });
    }

    // Extract token (format: "Bearer <token>")
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      return res.status(403).json({ 
        error: 'unauthorized',
        message: 'Invalid authorization format' 
      });
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Attach user info to request
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };
      
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'token_expired',
          message: 'Your session has expired' 
        });
      }
      
      return res.status(403).json({ 
        error: 'invalid_token',
        message: 'Invalid authorization token' 
      });
    }
  } catch (error) {
    return res.status(500).json({ 
      error: 'server_error',
      message: 'Authentication error' 
    });
  }
};

/**
 * Middleware to check if user has required role
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({ 
        error: 'unauthorized',
        message: 'Authentication required' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'forbidden',
        message: 'You do not have permission to perform this action' 
      });
    }

    next();
  };
};

/**
 * Middleware to check if authenticated user is a seller
 */
const requireSeller = authorize('seller');

/**
 * Middleware to check if authenticated user is a regular user
 */
const requireUser = authorize('user');

/**
 * Middleware to allow both users and sellers
 */
const requireAuthenticated = authorize('user', 'seller');

module.exports = {
  authenticate,
  authorize,
  requireSeller,
  requireUser,
  requireAuthenticated,
};
