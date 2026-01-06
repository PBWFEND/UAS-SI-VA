// File: controllers/bookingController.js
const prisma = require('../prisma/client');

const createBooking = async (req, res) => {
    // Pastikan semua field ini diekstrak dari req.body
    const { packageType, bookingDate, location, duration, peopleCount } = req.body;

    try {
        const booking = await prisma.booking.create({
            data: {
                packageType,
                location,
                // Pastikan durasi tersimpan sebagai String
                duration: duration || "15 Menit",
                // Pastikan peopleCount tersimpan sebagai Integer (Angka)
                peopleCount: parseInt(peopleCount) || 1,
                bookingDate: new Date(bookingDate),
                userId: req.user.id 
            }
        });
        res.status(201).json({ message: "Booking berhasil dibuat", booking });
    } catch (error) {
        console.error("Error Prisma:", error);
        res.status(500).json({ 
            message: "Gagal membuat booking", 
            error: error.message 
        });
    }
};

const getUserBookings = async (req, res) => {
    try {
        const bookings = await prisma.booking.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' } // Mengurutkan dari pesanan terbaru
        });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil data riwayat pesanan" });
    }
};

module.exports = { createBooking, getUserBookings };