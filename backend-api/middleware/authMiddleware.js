// File: middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // Mengambil token dari Header

    if (!token) return res.status(401).json({ message: "Akses ditolak, token tidak ada" });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Menyimpan data user (id) ke dalam request
        next();
    } catch (err) {
        res.status(400).json({ message: "Token tidak valid" });
    }
};