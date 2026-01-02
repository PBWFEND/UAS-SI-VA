const prisma = require("../prisma/client");

// GET semua peminjaman milik user login
exports.getLoans = async (req, res) => {
  const userId = req.user.id;

  const loans = await prisma.loan.findMany({
    where: { userId },
    orderBy: { id: "desc" },
  });

  res.json({
    success: true,
    data: loans,
  });
};

// CREATE peminjaman
exports.createLoan = async (req, res) => {
  const userId = req.user.id;

  const loan = await prisma.loan.create({
    data: {
      toolName: req.body.toolName,
      quantity: Number(req.body.quantity),
      borrowDate: new Date(req.body.borrowDate),
      userId,
    },
  });

  res.status(201).json({
    success: true,
    message: "Peminjaman berhasil",
    data: loan,
  });
};

// UPDATE peminjaman (ownership check)
exports.updateLoan = async (req, res) => {
  const userId = req.user.id;
  const loanId = Number(req.params.id);

  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
  });

  if (!loan || loan.userId !== userId) {
    return res.status(403).json({
      success: false,
      message: "Akses ditolak",
    });
  }

  const updated = await prisma.loan.update({
    where: { id: loanId },
    data: {
      status: req.body.status,
      returnDate: req.body.returnDate
        ? new Date(req.body.returnDate)
        : null,
    },
  });

  res.json({
    success: true,
    data: updated,
  });
};

// DELETE peminjaman
exports.deleteLoan = async (req, res) => {
  const userId = req.user.id;
  const loanId = Number(req.params.id);

  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
  });

  if (!loan || loan.userId !== userId) {
    return res.status(403).json({
      success: false,
      message: "Akses ditolak",
    });
  }

  await prisma.loan.delete({
    where: { id: loanId },
  });

  res.json({
    success: true,
    message: "Peminjaman dihapus",
  });
};
