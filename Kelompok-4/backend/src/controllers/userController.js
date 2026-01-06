const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    res.json({
      status: 'success',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile };