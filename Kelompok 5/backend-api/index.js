const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authController = require('./controllers/authController');

// Inisialisasi Environment Variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Agar server bisa membaca data JSON dari Postman/Frontend

// Route Dasar untuk Testing
app.get('/', (req, res) => {
    res.send('Server UAS Kelompok 5 - Booking Foto Running!');
});

// Route untuk Fitur Auth (Poin Security 20%)
app.post('/api/register', authController.register);
app.post('/api/login', authController.login);

// Menjalankan Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});