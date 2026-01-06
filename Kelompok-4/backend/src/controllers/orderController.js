const { validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const createOrder = async (req, res, next) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { customerName, tableNumber, items, notes } = req.body;

    // Calculate total amount and validate items
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of items) {
      const menu = await prisma.menu.findFirst({
        where: {
          id: item.menuId,
          userId: req.user.id,
          isAvailable: true
        }
      });

      if (!menu) {
        return res.status(404).json({
          status: 'error',
          message: `Menu with ID ${item.menuId} not found or not available`
        });
      }

      const itemTotal = menu.price * item.quantity;
      totalAmount += itemTotal;

      orderItemsData.push({
        menuId: item.menuId,
        quantity: item.quantity,
        price: menu.price,
        notes: item.notes || ''
      });
    }

    // Create order with order items
    const order = await prisma.order.create({
      data: {
        customerName,
        tableNumber: parseInt(tableNumber),
        totalAmount,
        userId: req.user.id,
        orderItems: {
          create: orderItemsData
        }
      },
      include: {
        orderItems: {
          include: {
            menu: true
          }
        }
      }
    });

    res.status(201).json({
      status: 'success',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        orderItems: {
          include: {
            menu: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      status: 'success',
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(id),
        userId: req.user.id
      },
      include: {
        orderItems: {
          include: {
            menu: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    res.json({
      status: 'success',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getOrders, getOrderById };