const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

exports.register = async (req, res) => {
    // 1. Cek Validasi Input
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;

    try {
        // 2. Cek apakah user sudah ada
        let user = await prisma.user.findUnique({ where: { email } });
        if (user) return res.status(400).json({ msg: 'Email sudah terdaftar' });

        // 3. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Simpan ke Database
        user = await prisma.user.create({
            data: { name, email, password: hashedPassword }
        });

        res.status(201).json({ msg: 'Registrasi berhasil', userId: user.id });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    try {
        // 1. Cari user berdasarkan email
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ msg: 'Kredensial salah' });

        // 2. Cek Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Kredensial salah' });

        // 3. Buat Token JWT
        const payload = { id: user.id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// Tambahan: Get User Profile
exports.getProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, name: true, email: true, createdAt: true } // Jangan kirim password
        });
        res.json(user);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};