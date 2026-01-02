const { body } = require("express-validator");

exports.validateLoan = [
  body("toolName").notEmpty(),
  body("quantity").isInt({ min: 1 }),
  body("borrowDate").isISO8601(),
];
