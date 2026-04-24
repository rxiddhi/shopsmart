const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class CartService {
  /**
   * Add item to cart
   * @param {string} userId - User ID
   * @param {string} productId - Product ID
   * @param {number} quantity - Quantity to add
   * @returns {Promise<Object>} Cart item and cart total
   */
  async addToCart(userId, productId, quantity = 1) {
    // Verify product exists and is available
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.deletedAt) {
      throw new Error('Product not found or unavailable');
    }

    if (!product.isAvailable) {
      throw new Error('Product is currently unavailable');
    }

    // Verify quantity doesn't exceed stock
    if (quantity > product.stock) {
      throw new Error(`Only ${product.stock} units available`);
    }

    // Check if product already in cart
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    let cartItem;
    if (existingCartItem) {
      // Increment quantity
      const newQuantity = existingCartItem.quantity + quantity;
      if (newQuantity > product.stock) {
        throw new Error(`Only ${product.stock} units available`);
      }
      
      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          userId,
          productId,
          quantity,
        },
      });
    }

    // Calculate cart total
    const cart = await this.getCart(userId);

    return {
      cartItem,
      cartTotal: cart.total,
    };
  }

  /**
   * Get user's cart with product details
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Cart with items and total
   */
  async getCart(userId) {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            seller: {
              select: {
                id: true,
                name: true,
                businessName: true,
              },
            },
          },
        },
      },
    });

    // Calculate total and parse JSON fields
    let total = 0;
    const items = cartItems.map(item => {
      const product = item.product;
      product.attributes = JSON.parse(product.attributes);
      product.images = JSON.parse(product.images);
      product.imageUrl = product.images[0] || null;
      
      const subtotal = product.price * item.quantity;
      total += subtotal;

      return {
        id: item.id,
        product,
        quantity: item.quantity,
        subtotal,
      };
    });

    return { items, total };
  }

  /**
   * Update cart item quantity
   * @param {string} userId - User ID
   * @param {string} cartItemId - Cart item ID
   * @param {number} quantity - New quantity
   * @returns {Promise<Object>} Updated cart
   */
  async updateCartItem(userId, cartItemId, quantity) {
    // Verify cart item belongs to user
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { product: true },
    });

    if (!cartItem || cartItem.userId !== userId) {
      throw new Error('Cart item not found');
    }

    // Verify quantity doesn't exceed stock
    if (quantity > cartItem.product.stock) {
      throw new Error(`Only ${cartItem.product.stock} units available`);
    }

    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }

    // Update quantity
    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });

    return this.getCart(userId);
  }

  /**
   * Remove item from cart
   * @param {string} userId - User ID
   * @param {string} cartItemId - Cart item ID
   * @returns {Promise<Object>} Updated cart
   */
  async removeFromCart(userId, cartItemId) {
    // Verify cart item belongs to user
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!cartItem || cartItem.userId !== userId) {
      throw new Error('Cart item not found');
    }

    // Delete cart item
    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return this.getCart(userId);
  }

  /**
   * Clear entire cart
   * @param {string} userId - User ID
   * @returns {Promise<{success: boolean}>}
   */
  async clearCart(userId) {
    await prisma.cartItem.deleteMany({
      where: { userId },
    });

    return { success: true };
  }

  /**
   * Validate cart before checkout
   * @param {string} userId - User ID
   * @returns {Promise<{valid: boolean, issues: Array}>}
   */
  async validateCart(userId) {
    const issues = [];

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      issues.push({
        type: 'empty_cart',
        message: 'Cart is empty',
      });
      return { valid: false, issues };
    }

    for (const cartItem of cartItems) {
      const product = cartItem.product;

      // Check if product still exists and is available
      if (!product || product.deletedAt) {
        issues.push({
          type: 'product_unavailable',
          productId: cartItem.productId,
          message: 'Product no longer available',
        });
        continue;
      }

      if (!product.isAvailable) {
        issues.push({
          type: 'product_unavailable',
          productId: product.id,
          productName: product.name,
          message: `${product.name} is currently unavailable`,
        });
        continue;
      }

      // Check inventory
      if (product.stock < cartItem.quantity) {
        issues.push({
          type: 'insufficient_stock',
          productId: product.id,
          productName: product.name,
          requested: cartItem.quantity,
          available: product.stock,
          message: `Only ${product.stock} units of ${product.name} available`,
        });
      }
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }
}

module.exports = new CartService();
