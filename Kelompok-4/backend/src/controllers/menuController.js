const { validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getMenus = async (req, res, next) => {
  try {
    const menus = await prisma.menu.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      status: 'success',
      data: menus
    });
  } catch (error) {
    next(error);
  }
};

const createMenu = async (req, res, next) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, price, category, imageUrl, isAvailable } = req.body;

    const menu = await prisma.menu.create({
      data: {
        name,
        description: description || '',
        price: parseFloat(price),
        category,
        imageUrl: imageUrl || '',
        isAvailable: isAvailable !== undefined ? isAvailable : true,
        userId: req.user.id
      }
    });

    res.status(201).json({
      status: 'success',
      data: menu
    });
  } catch (error) {
    next(error);
  }
};

const updateMenu = async (req, res, next) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, description, price, category, imageUrl, isAvailable } = req.body;

    // Check if menu exists and belongs to user
    const existingMenu = await prisma.menu.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user.id
      }
    });

    if (!existingMenu) {
      return res.status(404).json({
        status: 'error',
        message: 'Menu not found'
      });
    }

    const menu = await prisma.menu.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description: description || existingMenu.description,
        price: parseFloat(price),
        category,
        imageUrl: imageUrl || existingMenu.imageUrl,
        isAvailable: isAvailable !== undefined ? isAvailable : existingMenu.isAvailable
      }
    });

    res.json({
      status: 'success',
      data: menu
    });
  } catch (error) {
    next(error);
  }
};

const deleteMenu = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if menu exists and belongs to user
    const existingMenu = await prisma.menu.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user.id
      }
    });

    if (!existingMenu) {
      return res.status(404).json({
        status: 'error',
        message: 'Menu not found'
      });
    }

    await prisma.menu.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      status: 'success',
      message: 'Menu deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMenus, createMenu, updateMenu, deleteMenu };