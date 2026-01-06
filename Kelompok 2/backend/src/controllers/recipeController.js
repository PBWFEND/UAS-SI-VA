const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const prisma = new PrismaClient();

// GET All Recipes (Hanya milik user yang login)
exports.getRecipes = async (req, res) => {
    try {
        const recipes = await prisma.recipe.findMany({
            where: { userId: req.user.id } // Filter by User ID (Ownership)
        });
        res.json(recipes);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// CREATE Recipe
exports.createRecipe = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, ingredients, instructions } = req.body;

    try {
        const newRecipe = await prisma.recipe.create({
            data: {
                title,
                ingredients,
                instructions,
                userId: req.user.id // Ambil ID dari token JWT
            }
        });
        res.json(newRecipe);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// UPDATE Recipe (Cek Ownership!)
exports.updateRecipe = async (req, res) => {
    const { id } = req.params;
    const { title, ingredients, instructions } = req.body;

    try {
        // Cari resep dulu
        const recipe = await prisma.recipe.findUnique({ where: { id: parseInt(id) } });

        if (!recipe) return res.status(404).json({ msg: 'Resep tidak ditemukan' });

        // CEK OWNERSHIP: Apakah yang login pemilik resep ini?
        if (recipe.userId !== req.user.id) {
            return res.status(401).json({ msg: 'Tidak diizinkan mengedit resep orang lain' });
        }

        // Update
        const updatedRecipe = await prisma.recipe.update({
            where: { id: parseInt(id) },
            data: { title, ingredients, instructions }
        });

        res.json(updatedRecipe);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// DELETE Recipe (Cek Ownership!)
exports.deleteRecipe = async (req, res) => {
    const { id } = req.params;

    try {
        const recipe = await prisma.recipe.findUnique({ where: { id: parseInt(id) } });

        if (!recipe) return res.status(404).json({ msg: 'Resep tidak ditemukan' });

        // CEK OWNERSHIP
        if (recipe.userId !== req.user.id) {
            return res.status(401).json({ msg: 'Tidak diizinkan menghapus resep orang lain' });
        }

        await prisma.recipe.delete({ where: { id: parseInt(id) } });
        res.json({ msg: 'Resep berhasil dihapus' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};