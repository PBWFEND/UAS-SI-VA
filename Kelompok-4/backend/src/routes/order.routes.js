const express = require('express');
const { body } = require('express-validator');
const {
  createOrder,
  getOrders,
  getOrderById
} = require('../controllers/orderController');

const router = express.Router();

// Validation rules
const orderValidation = [
  body('customerName').notEmpty().withMessage('Customer name is required'),
  body('tableNumber').isInt({ min: 1 }).withMessage('Table number must be a positive integer'),
  body('items').isArray({ min: 1 }).withMessage('At least one menu item is required'),
  body('items.*.menuId').isInt().withMessage('Menu ID must be an integer'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
];

// Routes
router.route('/')
  .get(getOrders)
  .post(orderValidation, createOrder);

router.get('/:id', getOrderById);

module.exports = router;