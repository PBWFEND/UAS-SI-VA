const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const menuRoutes = require('./menu.routes');
const orderRoutes = require('./order.routes');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.use('/auth', authRoutes);

// Protected routes
router.use('/users', protect, userRoutes);
router.use('/menus', protect, menuRoutes);
router.use('/orders', protect, orderRoutes);

module.exports = router;