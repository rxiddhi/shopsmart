const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

// Category-specific attribute schemas
const digitalAssetsSchema = z.object({
  fileType: z.string(),
  fileSize: z.number().positive(),
  downloadLink: z.string().url(),
  license: z.string(),
});

const toolsSchema = z.object({
  brand: z.string(),
  warranty: z.number().nonnegative(),
  specifications: z.string(),
  material: z.string(),
});

const jewellerySchema = z.object({
  metal: z.string(),
  gemstone: z.string(),
  weight: z.number().positive(),
  purity: z.number().min(0).max(100),
  certification: z.string(),
});

const fashionSchema = z.object({
  size: z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL']),
  color: z.string(),
  material: z.string(),
  brand: z.string(),
  gender: z.enum(['male', 'female', 'unisex']),
});

// Product creation schema
const createProductSchema = z.object({
  name: z.string().min(3).max(200),
  description: z.string(),
  price: z.number().positive(),
  category: z.enum(['digital_assets', 'tools', 'jewellery', 'fashion']),
  sellerType: z.enum(['digital_assets', 'tools', 'jewellery', 'fashion']),
  attributes: z.any(), // Will be validated based on category
  stock: z.number().int().nonnegative().default(0),
  images: z.array(z.string().url()).default([]),
});

class ProductService {
  /**
   * Validate product attributes based on seller type
   * @param {string} sellerType - Seller type
   * @param {Object} attributes - Product attributes
   * @returns {{valid: boolean, errors: string[]}}
   */
  validateProductAttributes(sellerType, attributes) {
    const errors = [];

    try {
      switch (sellerType) {
        case 'digital_assets':
          digitalAssetsSchema.parse(attributes);
          break;
        case 'tools':
          toolsSchema.parse(attributes);
          break;
        case 'jewellery':
          jewellerySchema.parse(attributes);
          break;
        case 'fashion':
          fashionSchema.parse(attributes);
          break;
        default:
          errors.push(`Invalid seller type: ${sellerType}`);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach(err => {
          errors.push(`${err.path.join('.')}: ${err.message}`);
        });
      } else {
        errors.push(error.message);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @param {string} sellerId - Seller ID
   * @returns {Promise<Object>} Created product
   */
  async createProduct(productData, sellerId) {
    // Validate basic product data
    const validatedData = createProductSchema.parse(productData);

    // Get seller to verify seller type
    const seller = await prisma.seller.findUnique({
      where: { id: sellerId },
    });

    if (!seller) {
      throw new Error('Seller not found');
    }

    // Validate seller type matches product category
    if (validatedData.category !== seller.sellerType) {
      throw new Error(`Seller type ${seller.sellerType} cannot sell products in category ${validatedData.category}`);
    }

    // Validate category-specific attributes
    const attributeValidation = this.validateProductAttributes(
      validatedData.sellerType,
      validatedData.attributes
    );

    if (!attributeValidation.valid) {
      throw new Error(`Invalid product attributes: ${attributeValidation.errors.join(', ')}`);
    }

    // Create product
    const images = validatedData.images || [];
    if (productData.imageUrl && !images.includes(productData.imageUrl)) {
      images.push(productData.imageUrl);
    }

    const product = await prisma.product.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        category: validatedData.category,
        sellerType: validatedData.sellerType,
        sellerId,
        attributes: JSON.stringify(validatedData.attributes),
        stock: validatedData.stock,
        isAvailable: true,
        images: JSON.stringify(images),
      },
    });

    // Parse JSON fields for response
    product.attributes = JSON.parse(product.attributes);
    product.images = JSON.parse(product.images);
    product.imageUrl = product.images[0] || null;

    return product;
  }

  /**
   * Get products with filtering and pagination
   * @param {Object} filters - Filter options
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Products with pagination metadata
   */
  async getProducts(filters = {}, pagination = {}) {
    const { 
      category, 
      sellerType, 
      minPrice, 
      maxPrice, 
      searchQuery 
    } = filters;
    
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * Math.min(limit, 100); // Max 100 per page
    const take = Math.min(limit, 100);

    // Build where clause
    const where = {
      isAvailable: true,
      deletedAt: null,
    };

    if (category) where.category = category;
    if (sellerType) where.sellerType = sellerType;
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (searchQuery) {
      where.OR = [
        { name: { contains: searchQuery, mode: 'insensitive' } },
        { description: { contains: searchQuery, mode: 'insensitive' } },
      ];
    }

    // Fetch products and total count
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              businessName: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
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
      totalPages: Math.ceil(total / take),
    };
  }

  /**
   * Get single product by ID with seller information
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} Product with seller details
   */
  async getProductById(productId) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            businessName: true,
            sellerType: true,
          },
        },
      },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    if (product.deletedAt) {
      throw new Error('Product not available');
    }

    // Parse JSON fields
    product.attributes = JSON.parse(product.attributes);
    product.images = JSON.parse(product.images);
    product.imageUrl = product.images[0] || null;

    return product;
  }

  /**
   * Update product (only by owner seller)
   * @param {string} productId - Product ID
   * @param {string} sellerId - Seller ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated product
   */
  async updateProduct(productId, sellerId, updates) {
    // Verify product exists and belongs to seller
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    if (product.sellerId !== sellerId) {
      throw new Error('You do not have permission to update this product');
    }

    // Prepare update data
    const updateData = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.description) updateData.description = updates.description;
    if (updates.price !== undefined) {
      if (updates.price <= 0) {
        throw new Error('Price must be positive');
      }
      updateData.price = updates.price;
    }
    if (updates.stock !== undefined) {
      if (updates.stock < 0) {
        throw new Error('Stock cannot be negative');
      }
      updateData.stock = updates.stock;
    }
    if (updates.isAvailable !== undefined) {
      updateData.isAvailable = updates.isAvailable;
    }
    if (updates.attributes) {
      // Validate attributes
      const validation = this.validateProductAttributes(
        product.sellerType,
        updates.attributes
      );
      if (!validation.valid) {
        throw new Error(`Invalid attributes: ${validation.errors.join(', ')}`);
      }
      updateData.attributes = JSON.stringify(updates.attributes);
    }
    if (updates.images || updates.imageUrl) {
      let images = updates.images;
      if (!images && updates.imageUrl) {
        images = [updates.imageUrl];
      }
      updateData.images = JSON.stringify(images);
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    // Parse JSON fields
    updatedProduct.attributes = JSON.parse(updatedProduct.attributes);
    updatedProduct.images = JSON.parse(updatedProduct.images);
    updatedProduct.imageUrl = updatedProduct.images[0] || null;

    return updatedProduct;
  }

  /**
   * Delete product (soft delete)
   * @param {string} productId - Product ID
   * @param {string} sellerId - Seller ID
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async deleteProduct(productId, sellerId) {
    // Verify product exists and belongs to seller
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    if (product.sellerId !== sellerId) {
      throw new Error('You do not have permission to delete this product');
    }

    // Soft delete
    await prisma.product.update({
      where: { id: productId },
      data: { deletedAt: new Date() },
    });

    return {
      success: true,
      message: 'Product deleted successfully',
    };
  }
}

module.exports = new ProductService();
