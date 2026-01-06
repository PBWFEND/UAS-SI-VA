# Sistem Menu & Pesanan untuk UMKM

Sistem digital untuk membantu UMKM (warung/kafe) dalam mengelola menu makanan & minuman, menerima pesanan pelanggan, dan melihat riwayat pesanan dengan keamanan berbasis JWT.

## 🚀 Fitur Utama

### 🔐 Authentication & Authorization
- Register & Login dengan JWT
- Password hashing dengan bcrypt
- Protected routes dengan middleware
- Token expired handling

### 📋 Manajemen Menu
- CRUD lengkap untuk menu makanan/minuman
- Kategorisasi menu
- Status ketersediaan menu
- Harga dan deskripsi menu

### 🛒 Sistem Pesanan
- Buat pesanan baru dengan multiple items
- Kalkulasi total otomatis
- Riwayat pesanan lengkap
- Filter berdasarkan status pesanan

### 📊 Dashboard Analytics
- Statistik total menu & pesanan
- Total pendapatan
- Menu dan pesanan terbaru

## 🛠 Tech Stack

### Backend
- Node.js & Express.js
- Prisma ORM dengan MySQL/PostgreSQL
- JWT Authentication
- Bcrypt Password Hashing
- express-validator untuk validasi
- CORS enabled

### Frontend
- React (Vite)
- Tailwind CSS
- Axios untuk HTTP requests
- React Router DOM v6
- JWT stored in localStorage

## 📁 Struktur Folder
