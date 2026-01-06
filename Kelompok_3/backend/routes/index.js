const express = require("express");
const router = express.Router();

const authController = require("../controllers/AuthController");
const authMiddleware = require("../middlewares/auth");
const { validateRegister, validateLogin } = require("../utils/validators/auth");


router.post("/register", validateRegister, authController.register);
router.post("/login", validateLogin, authController.login);

router.get("/profile", authMiddleware, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

const loanController = require("../controllers/LoanController");
const { validateLoan } = require("../utils/validators/loan");
const auth = require("../middlewares/auth");


router.get("/loans", auth, loanController.getLoans);
router.post("/loans", auth, validateLoan, loanController.createLoan);
router.put("/loans/:id", auth, loanController.updateLoan);
router.delete("/loans/:id", auth, loanController.deleteLoan);


module.exports = router;
