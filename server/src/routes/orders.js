const express = require('express');
const orderService = require('../services/orderService');
const { authenticate, requireSeller } = require('../middleware/auth');

const router = express.Router();

// All order routes require authentication
router.use(authenticate);

/**
 * POST /api/orders
 * Create order from cart
 */
router.post('/', async (req, res, next) => {
  try {
    const { shippingInfo, paymentMethod } = req.body;
    
    if (!shippingInfo || !shippingInfo.address || !shippingInfo.method) {
      return res.status(400).json({ 
        error: 'invalid_shipping_info', 
        message: 'Shipping information is required' 
      });
    }
    
    if (!paymentMethod) {
      return res.status(400).json({ 
        error: 'payment_method_required', 
        message: 'Payment method is required' 
      });
    }
    
    const order = await orderService.createOrder(req.user.userId, shippingInfo, paymentMethod);
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/orders
 * Get user's order history
 */
router.get('/', async (req, res, next) => {
  try {
    const pagination = {
      page: req.query.page ? parseInt(req.query.page) : 1,
      limit: req.query.limit ? parseInt(req.query.limit) : 20,
    };
    const result = await orderService.getUserOrders(req.user.userId, pagination);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/orders/:id
 * Get single order details
 */
router.get('/:id', async (req, res, next) => {
  try {
    const order = await orderService.getOrder(req.params.id, req.user.userId);
    res.json(order);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/orders/:id/status
 * Update order status (seller only)
 */
router.put('/:id/status', requireSeller, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'status_required', message: 'Status is required' });
    }
    const order = await orderService.updateOrderStatus(req.params.id, req.user.userId, status);
    res.json(order);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
