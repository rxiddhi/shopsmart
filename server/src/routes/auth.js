const express = require('express');
const authService = require('../services/authService');

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user or seller
 */
router.post('/register', async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/login
 * Login user or seller
 */
router.post('/login', async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'refresh_token_required', message: 'Refresh token is required' });
    }
    const result = await authService.refreshToken(refreshToken);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/logout
 * Logout (client-side token invalidation)
 */
router.post('/logout', async (req, res, next) => {
  try {
    const result = await authService.logout(req.user?.userId, req.headers.authorization);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
