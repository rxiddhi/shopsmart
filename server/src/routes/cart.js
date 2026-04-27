const express = require('express');
const cartService = require('../services/cartService');
const { authenticate, requireUser } = require('../middleware/auth');

const router = express.Router();

// All cart routes require authentication
router.use(authenticate);

/**
 * GET /api/cart
 * Get user's cart
 */
router.get('/', async (req, res, next) => {
  try {
    const cart = await cartService.getCart(req.user.userId);
    res.json(cart);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/cart/items
 * Add item to cart
 */
router.post('/items', async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId) {
      return res.status(400).json({ error: 'product_id_required', message: 'Product ID is required' });
    }
    const result = await cartService.addToCart(req.user.userId, productId, quantity || 1);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/cart/items/:id
 * Update cart item quantity
 */
router.put('/items/:id', async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'invalid_quantity', message: 'Quantity must be positive' });
    }
    const cart = await cartService.updateCartItem(req.user.userId, req.params.id, quantity);
    res.json(cart);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/cart/items/:id
 * Remove item from cart
 */
router.delete('/items/:id', async (req, res, next) => {
  try {
    const cart = await cartService.removeFromCart(req.user.userId, req.params.id);
    res.json(cart);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/cart
 * Clear entire cart
 */
router.delete('/', async (req, res, next) => {
  try {
    const result = await cartService.clearCart(req.user.userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
