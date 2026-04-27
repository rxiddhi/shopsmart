const express = require('express');
const productService = require('../services/productService');
const { authenticate, requireSeller } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/products
 * Get products with filters and pagination
 */
router.get('/', async (req, res, next) => {
  try {
    const filters = {
      category: req.query.category,
      sellerType: req.query.sellerType,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
      searchQuery: req.query.search,
    };

    const pagination = {
      page: req.query.page ? parseInt(req.query.page) : 1,
      limit: req.query.limit ? parseInt(req.query.limit) : 20,
    };

    const result = await productService.getProducts(filters, pagination);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/products/:id
 * Get single product by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json(product);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/products
 * Create a new product (seller only)
 */
router.post('/', authenticate, requireSeller, async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body, req.user.userId);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/products/:id
 * Update product (seller only, ownership check)
 */
router.put('/:id', authenticate, requireSeller, async (req, res, next) => {
  try {
    const product = await productService.updateProduct(
      req.params.id,
      req.user.userId,
      req.body
    );
    res.json(product);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/products/:id
 * Soft delete product (seller only)
 */
router.delete('/:id', authenticate, requireSeller, async (req, res, next) => {
  try {
    const result = await productService.deleteProduct(req.params.id, req.user.userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
