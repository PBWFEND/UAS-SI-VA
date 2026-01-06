const express = require('express');
const { body } = require('express-validator');
const {
  getMenus,
  createMenu,
  updateMenu,
  deleteMenu
} = require('../controllers/menuController');

const router = express.Router();

// Validation rules
const menuValidation = [
  body('name').notEmpty().withMessage('Menu name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').notEmpty().withMessage('Category is required')
];

// Routes
router.route('/')
  .get(getMenus)
  .post(menuValidation, createMenu);

router.route('/:id')
  .put(menuValidation, updateMenu)
  .delete(deleteMenu);

module.exports = router;