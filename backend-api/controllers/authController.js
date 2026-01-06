// File: controllers/authController.js
const prisma = require('../prisma/client'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); // Enkripsi password untuk Security

    try {
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword }
        });
        res.status(201).json({ message: "User berhasil didaftarkan", user });
    } catch (error) {
        res.status(400).json({ message: "Email sudah digunakan" });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(401).json({ message: "Email tidak terdaftar" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Password salah" });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        
        // Pastikan mengembalikan token dalam objek
        res.json({ message: "Login sukses", token });
    } catch (error) {
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
};

module.exports = { register, login };