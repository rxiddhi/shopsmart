const express = require('express');
const sellerService = require('../services/sellerService');
const orderService = require('../services/orderService');
const { authenticate, requireSeller } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/sellers/register
 * Register a new seller
 */
router.post('/register', async (req, res, next) => {
  try {
    const seller = await sellerService.registerSeller(req.body);
    res.status(201).json(seller);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/sellers/profile
 * Get seller profile with statistics
 */
router.get('/profile', authenticate, requireSeller, async (req, res, next) => {
  try {
    const profile = await sellerService.getSellerProfile(req.user.userId);
    res.json(profile);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/sellers/profile
 * Update seller profile
 */
router.put('/profile', authenticate, requireSeller, async (req, res, next) => {
  try {
    const seller = await sellerService.updateSeller(req.user.userId, req.body);
    res.json(seller);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/sellers/products
 * Get seller's products
 */
router.get('/products', authenticate, requireSeller, async (req, res, next) => {
  try {
    const pagination = {
      page: req.query.page ? parseInt(req.query.page) : 1,
      limit: req.query.limit ? parseInt(req.query.limit) : 20,
    };
    const result = await sellerService.getSellerProducts(req.user.userId, pagination);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/sellers/orders
 * Get seller's orders
 */
router.get('/orders', authenticate, requireSeller, async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
    };
    const orders = await orderService.getSellerOrders(req.user.userId, filters);
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
