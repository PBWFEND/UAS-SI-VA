import express from 'express';
import { addInventory, getInventories } from '../controllers/inventoryController.js';

const router = express.Router();

// Tambah item
router.post('/', addInventory);

// List item
router.get('/', getInventories);

export default router;
