// Lokasi: backend/src/app.js

const express = require('express');
const cors = require('cors'); // <--- PENTING: Panggil library cors
const dotenv = require('dotenv');

// Import routes (sesuaikan dengan nama file route Anda)
const authRoutes = require('./routes/auth.routes'); 
// const menuRoutes = require('./routes/menuRoutes'); // (Jika ada)

dotenv.config();

const app = express();

// --- BAGIAN PENTING (Middleware) ---
app.use(cors()); // <--- Pasang izin CORS di sini (Paling Atas)
app.use(express.json());

// --- ROUTES ---
app.use('/api/auth', authRoutes);
// app.use('/api/menus', menuRoutes); // (Contoh route lain)

module.exports = app;