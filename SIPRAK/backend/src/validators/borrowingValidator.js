const { body, validationResult } = require('express-validator');

// Middleware untuk handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      errors: errors.array()
    });
  }
  next();
};

exports.borrowingValidator = [
  body('title').notEmpty().withMessage('Title is required'),
  body('facility').notEmpty().withMessage('Facility is required'),
  body('borrowDate').isISO8601().withMessage('Invalid borrow date format'),
  body('returnDate').isISO8601().withMessage('Invalid return date format'),
  
  handleValidationErrors  
];