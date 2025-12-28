const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ msg: 'Akses ditolak, token tidak ada' });
    }

    try {
        // Token biasanya dikirim dalam format "Bearer <token>"
        // Kita ambil bagian tokennya saja
        const cleanToken = token.replace('Bearer ', '');
        
        const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
        req.user = decoded; // Menyimpan data user (id) ke request
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token tidak valid' });
    }
};

module.exports = authMiddleware;