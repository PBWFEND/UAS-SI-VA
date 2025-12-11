// src/routes/inventory.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/inventoryController');

router.use(auth); // semua route butuh auth
router.post('/', ctrl.createInventory);
router.get('/', ctrl.getInventories);
router.get('/:id', ctrl.getInventory);
router.put('/:id', ctrl.updateInventory);
router.delete('/:id', ctrl.deleteInventory);

module.exports = router;
