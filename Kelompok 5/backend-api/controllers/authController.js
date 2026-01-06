// File: controllers/authController.js
const prisma = require('../prisma/client'); // Pastikan kamu sudah buat file client ini
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
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Email atau password salah" });
    }

    // Buat Token JWT sesuai syarat UAS
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ message: "Login sukses", token });
};

module.exports = { register, login };