// src/controllers/inventoryController.js
const prisma = require('../utils/prisma');

const createInventory = async (req, res) => {
  try {
    const { name, category, quantity, description } = req.body;
    if (!name || !category || quantity == null) return res.status(400).json({ message: 'Missing fields' });

    const inv = await prisma.inventory.create({
      data: {
        name,
        category,
        quantity: parseInt(quantity, 10),
        description,
        user: { connect: { id: req.user.id } }
      }
    });
    res.status(201).json(inv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getInventories = async (req, res) => {
  try {
    // Query params: page, limit, q (search)
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const skip = (page - 1) * limit;
    const q = req.query.q || undefined;

    const where = {
      userId: req.user.id,
      ...(q ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { category: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } }
        ]
      } : {})
    };

    const [items, total] = await Promise.all([
      prisma.inventory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.inventory.count({ where })
    ]);

    res.json({ data: items, meta: { total, page, limit } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const inv = await prisma.inventory.findUnique({ where: { id } });
    if (!inv || inv.userId !== req.user.id) return res.status(404).json({ message: 'Not found' });
    res.json(inv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.inventory.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user.id) return res.status(404).json({ message: 'Not found' });
    const { name, category, quantity, description } = req.body;

    const updated = await prisma.inventory.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        category: category ?? existing.category,
        quantity: quantity != null ? parseInt(quantity, 10) : existing.quantity,
        description: description ?? existing.description
      }
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.inventory.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user.id) return res.status(404).json({ message: 'Not found' });

    await prisma.inventory.delete({ where: { id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createInventory, getInventories, getInventory, updateInventory, deleteInventory };
