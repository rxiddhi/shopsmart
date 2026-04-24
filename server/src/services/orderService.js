const { PrismaClient } = require('@prisma/client');
const cartService = require('./cartService');

const prisma = new PrismaClient();

class OrderService {
  /**
   * Generate unique order number
   * Format: ORD-YYYYMMDD-XXXXX
   * @private
   */
  generateOrderNumber() {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `ORD-${dateStr}-${random}`;
  }

  /**
   * Create order from cart
   * @param {string} userId - User ID
   * @param {Object} shippingInfo - Shipping information
   * @param {string} paymentMethod - Payment method
   * @returns {Promise<Object>} Created order
   */
  async createOrder(userId, shippingInfo, paymentMethod) {
    // Validate cart before processing
    const cartValidation = await cartService.validateCart(userId);
    if (!cartValidation.valid) {
      throw new Error(`Cart validation failed: ${JSON.stringify(cartValidation.issues)}`);
    }

    // Begin transaction
    return await prisma.$transaction(async (tx) => {
      // Fetch cart items with products
      const cartItems = await tx.cartItem.findMany({
        where: { userId },
        include: { product: true },
      });

      if (cartItems.length === 0) {
        throw new Error('Cart is empty');
      }

      // Validate inventory and calculate total
      let total = 0;
      const orderItems = [];

      for (const cartItem of cartItems) {
        const product = cartItem.product;

        // Check inventory availability
        if (product.stock < cartItem.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        // Check product availability
        if (!product.isAvailable || product.deletedAt) {
          throw new Error(`Product ${product.name} is no longer available`);
        }

        // Calculate subtotal
        const subtotal = product.price * cartItem.quantity;
        total += subtotal;

        // Prepare order item
        orderItems.push({
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity: cartItem.quantity,
          subtotal,
          sellerId: product.sellerId,
        });
      }

      // Generate unique order number
      const orderNumber = this.generateOrderNumber();

      // Create order record
      const order = await tx.order.create({
        data: {
          userId,
          orderNumber,
          status: 'pending',
          total,
          shippingAddress: JSON.stringify(shippingInfo.address),
          shippingMethod: shippingInfo.method,
          paymentMethod,
          paymentStatus: 'pending',
        },
      });

      // Create order items and update inventory
      for (const item of orderItems) {
        // Create order item
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            ...item,
          },
        });

        // Decrement product stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Clear user's cart
      await tx.cartItem.deleteMany({
        where: { userId },
      });

      // Return order with parsed fields
      order.shippingAddress = JSON.parse(order.shippingAddress);
      
      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        totalAmount: order.total,
        status: order.status,
        estimatedDelivery: this.calculateDeliveryDate(shippingInfo.method),
      };
    });
  }

  /**
   * Calculate estimated delivery date
   * @private
   */
  calculateDeliveryDate(shippingMethod) {
    const days = shippingMethod === 'express' ? 2 : shippingMethod === 'standard' ? 5 : 7;
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }

  /**
   * Get order details
   * @param {string} orderId - Order ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Order with items
   */
  async getOrder(orderId, userId) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Verify user owns the order
    if (order.userId !== userId) {
      throw new Error('You do not have permission to view this order');
    }

    // Parse JSON fields
    order.totalAmount = order.total;
    order.shippingAddress = JSON.parse(order.shippingAddress);
    order.items.forEach(item => {
      if (item.product) {
        item.product.attributes = JSON.parse(item.product.attributes);
        item.product.images = JSON.parse(item.product.images);
        item.product.imageUrl = item.product.images[0] || null;
      }
    });

    return order;
  }

  /**
   * Get user's order history
   * @param {string} userId - User ID
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Orders with pagination
   */
  async getUserOrders(userId, pagination = {}) {
    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      }),
      prisma.order.count({ where: { userId } }),
    ]);

    // Parse JSON fields
    orders.forEach(order => {
      order.totalAmount = order.total;
      order.shippingAddress = JSON.parse(order.shippingAddress);
      order.items.forEach(item => {
        if (item.product) {
          item.product.attributes = JSON.parse(item.product.attributes);
          item.product.images = JSON.parse(item.product.images);
          item.product.imageUrl = item.product.images[0] || null;
        }
      });
    });

    return {
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get seller's orders
   * @param {string} sellerId - Seller ID
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Orders containing seller's products
   */
  async getSellerOrders(sellerId, filters = {}) {
    const { status } = filters;

    const where = {
      items: {
        some: {
          sellerId,
        },
      },
    };

    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          where: { sellerId },
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Parse JSON fields
    orders.forEach(order => {
      order.totalAmount = order.total;
      order.shippingAddress = JSON.parse(order.shippingAddress);
      order.items.forEach(item => {
        if (item.product) {
          item.product.attributes = JSON.parse(item.product.attributes);
          item.product.images = JSON.parse(item.product.images);
          item.product.imageUrl = item.product.images[0] || null;
        }
      });
    });

    return orders;
  }

  /**
   * Update order status (seller/admin only)
   * @param {string} orderId - Order ID
   * @param {string} sellerId - Seller ID
   * @param {string} newStatus - New status
   * @returns {Promise<Object>} Updated order
   */
  async updateOrderStatus(orderId, sellerId, newStatus) {
    // Verify seller owns at least one product in the order
    const orderItems = await prisma.orderItem.findMany({
      where: {
        orderId,
        sellerId,
      },
    });

    if (orderItems.length === 0) {
      throw new Error('You do not have permission to update this order');
    }

    // Validate status transition
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error('Invalid status');
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Validate status progression
    const statusOrder = ['pending', 'confirmed', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(order.status);
    const newIndex = statusOrder.indexOf(newStatus);

    if (newStatus !== 'cancelled' && newIndex < currentIndex) {
      throw new Error('Invalid status transition');
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    updatedOrder.shippingAddress = JSON.parse(updatedOrder.shippingAddress);

    return updatedOrder;
  }

  /**
   * Process refund
   * @param {string} orderId - Order ID
   * @param {string} reason - Refund reason
   * @returns {Promise<Object>} Refund details
   */
  async processRefund(orderId, reason) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Update payment status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'refunded',
        status: 'cancelled',
      },
    });

    return {
      refundId: `REF-${Date.now()}`,
      amount: order.total,
      status: 'processed',
    };
  }
}

module.exports = new OrderService();
