const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { z } = require('zod');

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 12;

// Validation schemas
const registerSellerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  sellerType: z.enum(['digital_assets', 'tools', 'jewellery', 'fashion']),
  businessName: z.string().min(3).max(100),
  businessInfo: z.object({
    address: z.string(),
    phone: z.string(),
    taxId: z.string(),
  }),
});

const updateSellerSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  businessName: z.string().min(3).max(100).optional(),
  businessInfo: z.object({
    address: z.string(),
    phone: z.string(),
    taxId: z.string(),
  }).optional(),
});

class SellerService {
  /**
   * Register a new seller
   * @param {Object} sellerData - Seller registration data
   * @returns {Promise<Object>} Created seller
   */
  async registerSeller(sellerData) {
    // Validate input
    const validatedData = registerSellerSchema.parse(sellerData);
    
    const { name, email, password, sellerType, businessName, businessInfo } = validatedData;

    // Check if email already exists
    const existingSeller = await prisma.seller.findUnique({ where: { email } });
    const existingUser = await prisma.user.findUnique({ where: { email } });
    
    if (existingSeller || existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Create seller
    const seller = await prisma.seller.create({
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

    // Remove password hash from response
    delete seller.passwordHash;

    return seller;
  }

  /**
   * Get seller profile with statistics
   * @param {string} sellerId - Seller ID
   * @returns {Promise<Object>} Seller profile with stats
   */
  async getSellerProfile(sellerId) {
    const seller = await prisma.seller.findUnique({
      where: { id: sellerId },
      include: {
        products: true,
      },
    });

    if (!seller) {
      throw new Error('Seller not found');
    }

    // Calculate statistics
    const totalProducts = seller.products.length;
    
    // Get total sales and revenue from orders
    const orderItems = await prisma.orderItem.findMany({
      where: { sellerId },
    });

    const totalSales = orderItems.length;
    const revenue = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

    // Remove password hash and parse businessInfo
    delete seller.passwordHash;
    seller.businessInfo = JSON.parse(seller.businessInfo);
    delete seller.products; // Don't include full products in profile

    return {
      seller,
      stats: {
        totalProducts,
        totalSales,
        revenue,
      },
    };
  }

  /**
   * Update seller information
   * @param {string} sellerId - Seller ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated seller
   */
  async updateSeller(sellerId, updates) {
    // Validate input
    const validatedData = updateSellerSchema.parse(updates);

    // Prepare update data
    const updateData = {};
    if (validatedData.name) updateData.name = validatedData.name;
    if (validatedData.businessName) updateData.businessName = validatedData.businessName;
    if (validatedData.businessInfo) {
      updateData.businessInfo = JSON.stringify(validatedData.businessInfo);
    }

    const seller = await prisma.seller.update({
      where: { id: sellerId },
      data: updateData,
    });

    // Remove password hash and parse businessInfo
    delete seller.passwordHash;
    seller.businessInfo = JSON.parse(seller.businessInfo);

    return seller;
  }

  /**
   * Get all products for a seller
   * @param {string} sellerId - Seller ID
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Products with pagination
   */
  async getSellerProducts(sellerId, pagination = {}) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { 
          sellerId,
          deletedAt: null,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({
        where: { 
          sellerId,
          deletedAt: null,
        },
      }),
    ]);

    // Parse JSON fields
    products.forEach(product => {
      product.attributes = JSON.parse(product.attributes);
      product.images = JSON.parse(product.images);
      product.imageUrl = product.images[0] || null;
    });

    return {
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Verify seller type permissions
   * @param {string} sellerType - Seller type
   * @param {string} category - Product category
   * @returns {boolean} Whether seller can sell this category
   */
  canSellCategory(sellerType, category) {
    // Seller type must match product category
    return sellerType === category;
  }
}

module.exports = new SellerService();
