const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

dotenv.config();
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- MIDDLEWARE AUTH ---
const auth = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ msg: 'Butuh Token!' });
    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (e) { res.status(401).json({ msg: 'Token Salah' }); }
};

// --- ROUTES AUTH ---

// 1. REGISTER
app.post('/api/auth/register', [
    check('email', 'Email wajib').isEmail(),
    check('password', 'Min 6 karakter').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({ data: { name, email, password: hashedPassword } });
        res.status(201).json({ msg: "User dibuat", userId: user.id });
    } catch (err) { res.status(500).json({ msg: "Email mungkin sudah ada" }); }
});

// 2. LOGIN
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(400).json({ msg: "Email/Password Salah" });
        }
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
        res.json({ token, user: { id: user.id, name: user.name } });
    } catch (err) { res.status(500).send("Server Error"); }
});

// --- ROUTES RESEP (UPDATED) ---

// 3. GET SEMUA RESEP
// Mengambil data resep beserta info Category, Time, Servings, dan Nama Pembuatnya
app.get('/api/recipes', auth, async (req, res) => {
    try {
        const recipes = await prisma.recipe.findMany({
            include: { 
                user: { 
                    select: { id: true, name: true } // Ambil nama user juga
                } 
            },
            orderBy: {
                id: 'desc' // Urutkan dari yang terbaru
            }
        });
        res.json(recipes);
    } catch (err) { res.status(500).send("Gagal ambil data"); }
});

// 4. POST RESEP BARU (LENGKAP)
// Sekarang menerima data: category, cookingTime, servings, image
app.post('/api/recipes', auth, async (req, res) => {
    const { title, ingredients, instructions, image, category, cookingTime, servings } = req.body;
    
    try {
        const recipe = await prisma.recipe.create({
            data: { 
                title, 
                ingredients, 
                instructions, 
                image, 
                category,       // Kolom Baru
                cookingTime,    // Kolom Baru
                servings,       // Kolom Baru
                userId: req.user.id 
            }
        });
        res.json(recipe);
    } catch (err) { 
        console.error(err);
        res.status(500).send("Gagal simpan resep"); 
    }
});

// 5. HAPUS RESEP
app.delete('/api/recipes/:id', auth, async (req, res) => {
    const { id } = req.params;
    try {
        const recipe = await prisma.recipe.findUnique({ where: { id: parseInt(id) } });
        if (!recipe) return res.status(404).json({ msg: "Tak ditemukan" });
        
        // Cek apakah user yang login adalah pemilik resep
        if (recipe.userId !== req.user.id) return res.status(403).json({ msg: "Bukan resepmu!" });
        
        await prisma.recipe.delete({ where: { id: parseInt(id) } });
        res.json({ msg: "Terhapus" });
    } catch (err) { res.status(500).send("Error hapus"); }
});

// ... kode app.delete sebelumnya ...

// 6. UPDATE RESEP (FITUR BARU)
app.put('/api/recipes/:id', auth, async (req, res) => {
    const { id } = req.params;
    const { title, ingredients, instructions, image, category, cookingTime, servings } = req.body;

    try {
        // Cek dulu resepnya ada atau tidak
        const recipe = await prisma.recipe.findUnique({ where: { id: parseInt(id) } });
        if (!recipe) return res.status(404).json({ msg: "Resep tidak ditemukan" });
        
        // Cek apakah yang edit adalah pemiliknya
        if (recipe.userId !== req.user.id) return res.status(403).json({ msg: "Ini bukan resepmu!" });

        // Lakukan Update
        const updatedRecipe = await prisma.recipe.update({
            where: { id: parseInt(id) },
            data: { title, ingredients, instructions, image, category, cookingTime, servings }
        });
        res.json(updatedRecipe);
    } catch (err) { 
        console.error(err);
        res.status(500).send("Gagal mengupdate resep"); 
    }
});


// Jalankan Server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});