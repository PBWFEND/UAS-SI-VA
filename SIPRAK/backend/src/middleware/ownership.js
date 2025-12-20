const prisma = require('../config/prisma');

module.exports = async (req, res, next) => {
  const borrowing = await prisma.borrowing.findUnique({
    where: { id: Number(req.params.id) }
  });

  if (!borrowing || borrowing.userId !== req.user.id)
    return res.status(403).json({ message: 'Access denied' });

  next();
};
