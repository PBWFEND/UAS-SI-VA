const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
// Import express-validator
const { body, validationResult } = require('express-validator');

const authController = require('./controllers/authController');
const bookingController = require('./controllers/bookingController');
const authMiddleware = require('./middleware/authMiddleware');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// --- MIDDLEWARE VALIDASI (Poin 10% UAS) ---
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            message: "Validasi Gagal", 
            errors: errors.array() 
        });
    }
    next();
};

const validateRegister = [
    body('name').notEmpty().withMessage('Nama tidak boleh kosong'),
    body('email').isEmail().withMessage('Format email tidak valid'),
    body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
    handleValidationErrors
];

const validateLogin = [
    body('email').isEmail().withMessage('Format email tidak valid'),
    body('password').notEmpty().withMessage('Password tidak boleh kosong'),
    handleValidationErrors
];

const validateBooking = [
    body('packageType').notEmpty().withMessage('Paket harus dipilih'),
    body('bookingDate').isISO8601().withMessage('Tanggal tidak valid'),
    body('location').notEmpty().withMessage('Lokasi harus dipilih'),
    body('peopleCount').isInt({ min: 1 }).withMessage('Minimal 1 orang'),
    handleValidationErrors
];

// --- ROUTES ---

app.get('/', (req, res) => {
    res.send('Server UAS Kelompok 5 - VibeGraph Running!');
});

// Auth Routes dengan Validasi
app.post('/api/register', validateRegister, authController.register);
app.post('/api/login', validateLogin, authController.login);

// Booking Routes dengan Validasi & Auth
app.post('/api/bookings', authMiddleware, validateBooking, bookingController.createBooking);
app.get('/api/bookings', authMiddleware, bookingController.getUserBookings);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});