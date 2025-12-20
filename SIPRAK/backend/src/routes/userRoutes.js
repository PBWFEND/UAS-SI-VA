const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const { profile } = require('../controllers/userController');

router.get('/profile', auth, profile);

module.exports = router;
