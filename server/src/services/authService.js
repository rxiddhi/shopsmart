const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  role: z.enum(['user', 'seller']).default('user'),
  // Seller-specific fields
  sellerType: z.enum(['digital_assets', 'tools', 'jewellery', 'fashion']).optional(),
  businessName: z.string().min(3).max(100).optional(),
  businessInfo: z.object({
    address: z.string(),
    phone: z.string(),
    taxId: z.string(),
  }).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const BCRYPT_ROUNDS = 12;

class AuthService {
  /**
   * Register a new user or seller
   * @param {Object} userData - User registration data
   * @param {string} userData.role - 'user' or 'seller'
   * @returns {Promise<{user: Object, token: string, refreshToken: string}>}
   */
  async register(userData) {
    // Validate input
    const validatedData = registerSchema.parse(userData);
    
    const { name, email, password, role, sellerType, businessName, businessInfo } = validatedData;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    const existingSeller = await prisma.seller.findUnique({ where: { email } });
    
    if (existingUser || existingSeller) {
      throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    let user;
    
    if (role === 'seller') {
      // Validate seller-specific fields
      if (!sellerType || !businessName || !businessInfo) {
        throw new Error('Seller registration requires sellerType, businessName, and businessInfo');
      }

      // Create seller
      user = await prisma.seller.create({
        data: {
          name,
          email,
          passwordHash,
          sellerType,
          businessName,
          businessInfo: JSON.stringify(businessInfo),
          status: 'pending',
          verified: false,
        },
      });
      user.role = 'seller';
    } else {
      // Create user
      user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
        },
      });
      user.role = 'user';
    }

    // Generate tokens
    const token = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Remove password hash from response
    delete user.passwordHash;

    return { user, token, refreshToken };
  }

  /**
   * Login user or seller
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<{user: Object, token: string, refreshToken: string}>}
   */
  async login(credentials) {
    // Validate input
    const { email, password } = loginSchema.parse(credentials);

    // Find user or seller
    let user = await prisma.user.findUnique({ where: { email } });
    let role = 'user';
    
    if (!user) {
      user = await prisma.seller.findUnique({ where: { email } });
      role = 'seller';
    }

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Add role to user object
    user.role = role;

    // Generate tokens
    const token = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Remove password hash from response
    delete user.passwordHash;

    return { user, token, refreshToken };
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token to verify
   * @returns {Promise<{valid: boolean, userId: string, role: string}>}
   */
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return {
        valid: true,
        userId: decoded.userId,
        role: decoded.role,
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expired');
      }
      return { valid: false };
    }
  }

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<{token: string, refreshToken: string}>}
   */
  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, JWT_SECRET);
      
      // Find user or seller
      let user;
      if (decoded.role === 'seller') {
        user = await prisma.seller.findUnique({ where: { id: decoded.userId } });
      } else {
        user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      }

      if (!user) {
        throw new Error('User not found');
      }

      user.role = decoded.role;

      // Generate new tokens
      const token = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      return { token, refreshToken: newRefreshToken };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Logout (client-side token invalidation)
   * @param {string} userId - User ID
   * @param {string} token - Token to invalidate
   * @returns {Promise<{success: boolean}>}
   */
  async logout(userId, token) {
    // In a production system, you would add the token to a blacklist
    // For now, we'll just return success (client should delete the token)
    return { success: true };
  }

  /**
   * Generate access token
   * @private
   */
  generateAccessToken(user) {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
  }

  /**
   * Generate refresh token
   * @private
   */
  generateRefreshToken(user) {
    return jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    );
  }
}

module.exports = new AuthService();
