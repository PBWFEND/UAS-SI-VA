const { body } = require("express-validator");
const prisma = require("../../prisma/client");

exports.validateRegister = [
  body("name").notEmpty(),
  body("email")
    .isEmail()
    .custom(async (email) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) throw new Error("Email sudah terdaftar");
    }),
  body("password").isLength({ min: 6 }),
];

exports.validateLogin = [
  body("email").isEmail(),
  body("password").notEmpty(),
];
