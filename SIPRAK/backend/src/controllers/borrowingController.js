const prisma = require('../config/prisma');

/**
 * CREATE Borrowing
 */
const { validationResult } = require('express-validator');

exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { title, facility, borrowDate, returnDate } = req.body;

    const data = await prisma.borrowing.create({
      data: {
        title,
        facility,
        borrowDate: new Date(borrowDate),
        returnDate: new Date(returnDate),
        userId: req.user.id
      }
    });

    res.status(201).json({
      message: 'Borrowing created successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};



/**
 * GET All Borrowings (by logged user)
 */
exports.findAll = async (req, res) => {
  const data = await prisma.borrowing.findMany({
    where: { userId: req.user.id }
  });

  res.json({
    message: 'Get all borrowings successfully',
    data
  });
};

/**
 * UPDATE Borrowing
 */
exports.update = async (req, res, next) => {
  try {
    const { title, facility, borrowDate, returnDate } = req.body;

    const data = await prisma.borrowing.update({
      where: { id: Number(req.params.id) },
      data: {
        title,
        facility,
        borrowDate: borrowDate ? new Date(borrowDate) : undefined,
        returnDate: returnDate ? new Date(returnDate) : undefined
      }
    });

    res.json({
      message: 'Borrowing updated successfully',
      data
    });
  } catch (error) {
    next(error);
  }
};


/**
 * DELETE Borrowing
 */
exports.delete = async (req, res) => {
  await prisma.borrowing.delete({
    where: { id: Number(req.params.id) }
  });

  res.json({
    message: 'Borrowing deleted successfully'
  });
};
