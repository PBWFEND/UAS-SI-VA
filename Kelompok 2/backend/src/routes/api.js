const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const recipeController = require('../controllers/recipeController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// --- AUTH ROUTES ---
// POST /api/auth/register
router.post('/auth/register', [
    check('name', 'Nama wajib diisi').not().isEmpty(),
    check('email', 'Sertakan email yang valid').isEmail(),
    check('password', 'Password minimal 6 karakter').isLength({ min: 6 })
], authController.register);

// POST /api/auth/login
router.post('/auth/login', [
    check('email', 'Email valid diperlukan').isEmail(),
    check('password', 'Password wajib diisi').exists()
], authController.login);

// GET /api/users/profile (Protected)
router.get('/users/profile', authMiddleware, authController.getProfile);


// --- RECIPE ROUTES (CRUD) ---
// Semua route di bawah ini butuh Login (authMiddleware)

// GET /api/recipes
router.get('/recipes', authMiddleware, recipeController.getRecipes);

// POST /api/recipes
router.post('/recipes', [
    authMiddleware,
    check('title', 'Judul resep wajib diisi').not().isEmpty(),
    check('ingredients', 'Bahan wajib diisi').not().isEmpty()
], recipeController.createRecipe);

// PUT /api/recipes/:id
router.put('/recipes/:id', authMiddleware, recipeController.updateRecipe);

// DELETE /api/recipes/:id
router.delete('/recipes/:id', authMiddleware, recipeController.deleteRecipe);

module.exports = router;