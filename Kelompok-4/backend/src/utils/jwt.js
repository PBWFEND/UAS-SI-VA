const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET;

const generateToken = (payload, expiresIn = '24h') => {
  return jwt.sign(payload, jwtSecret, { expiresIn });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, jwtSecret);
  } catch (error) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };