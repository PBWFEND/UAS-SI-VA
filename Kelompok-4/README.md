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
Kelompok-4/
│
├── README.md
│
├── backend/
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── src/
│       ├── index.js
│       ├── app.js
│       ├── routes/
│       │   ├── api.js
│       │   ├── auth.routes.js
│       │   ├── user.routes.js
│       │   ├── menu.routes.js
│       │   └── order.routes.js
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── userController.js
│       │   ├── menuController.js
│       │   └── orderController.js
│       ├── middleware/
│       │   ├── authMiddleware.js
│       │   └── errorMiddleware.js
│       └── utils/
│           └── jwt.js
│
└── frontend/
    ├── package.json
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── services/
        │   └── api.js
        ├── pages/
        │   ├── Login.jsx
        │   ├── Dashboard.jsx
        │   ├── Menu.jsx
        │   └── Orders.jsx
        └── components/
            ├── Header.jsx
            ├── Sidebar.jsx
            ├── MenuCard.jsx
            └── OrderTable.jsx

# Anggota Kelompok 4
- Abdul Azis Arrizqi 230660221091
- Muhammad Aulia Ramadhani 230660221013
- Ade Yusup Maulana
- Nisrina Salsabila

# Link deploy Frontend
https://projek-kelompok-4.netlify.app/

# Localhost Backend
mysql://root:@localhost:3306/umkm_db

