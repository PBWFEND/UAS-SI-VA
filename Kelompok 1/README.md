LabInventory – RESTful API Backend & Web App

Sistem Manajemen Inventaris Laboratorium
Project UAS – Backend Development (Express.js + Prisma + JWT)

# Deskripsi Proyek

LabInventory adalah sistem manajemen inventaris laboratorium berbasis web yang dirancang untuk membantu pengelolaan alat, bahan, dan perlengkapan laboratorium secara terstruktur.
Aplikasi ini memungkinkan pengguna untuk mengelola inventaris pribadi menggunakan autentikasi JWT dan menyediakan fitur CRUD lengkap.

Proyek ini dikembangkan sebagai tugas UAS Backend Development dengan ketentuan wajib: Express.js, Prisma ORM, JWT Authentication, Validasi Input, dan memiliki relasi One-to-Many.



# Anggota Kelompok

| Nama        | NIM          | Tugas                                                                                |
| ----------- | ------------ | ------------------------------------------------------------------------------------ |
| **Fajar**   | 230660221093 | Ketua Kelompok                                                                       |
| Wendi F     | 230660221026 | Anggota Kelompok                                                                     |
| Dede Dian P | 230660221010 | Anggota Kelompok                                                                     |
| Agil P      | 230660221095 | Anggota Kelompok                                                                     |
| Febry       | 230660221015 | Anggota Kelompok                                                                     |


# 🛠️ Teknologi yang Digunakan
🧠 Backend

Node.js + Express.js — REST API & server-side logic

Prisma ORM — Database ORM & migration

MySQL — Database relasional

JWT (JSON Web Token) — Autentikasi & otorisasi

Bcrypt — Hashing password pengguna

Express Validator — Validasi input request

🎨 Frontend

React + TypeScript — UI & type safety

Vite — Development server & build tool

Tailwind CSS — Utility-first CSS framework

Axios — HTTP client untuk komunikasi API

☁️ Deployment

Frontend: Netlify

Live URL:
🔗 https://lab-inventory-kel1-uas.netlify.app

Backend: Local Server (port 3000)

# 🚀 Fitur Utama Aplikasi
🔐 Autentikasi Pengguna

Register pengguna baru

Login pengguna

Autentikasi menggunakan JWT (JSON Web Token)

Proteksi rute private menggunakan middleware

Hashing password dengan Bcrypt untuk keamanan data

📦 Manajemen Inventaris (CRUD)

Tambah item inventaris

Lihat seluruh item inventaris milik user

Update data item inventaris

Hapus item inventaris

Relasi One-to-Many antara User → Inventory

⚙️ Fitur Pendukung

Validasi input menggunakan express-validator

Kategori inventaris untuk pengelompokan item

Multi-user system, setiap user hanya dapat mengakses inventaris miliknya sendiri

✅ Keunggulan Sistem

Keamanan data terjamin dengan JWT & Bcrypt

Struktur backend terpisah (Controller, Routes, Middleware)

Cocok untuk digital startup, project UAS, dan portfolio GitHub

# Struktur Database
Diagram Relasi (ERD)

Relasi: User (1) → (Many) Inventory
User
- id (PK)
- name
- email (Unique)
- password
- createdAt

Inventory
- id (PK)
- name
- category
- quantity
- description
- createdAt
- userId (FK)
\
# 📁 Struktur Folder Proyek
🖥️ Frontend (Vite + React)
lab-inventory-hub/
├── public/
├── src/
│   ├── components/        # Reusable UI components
│   ├── contexts/          # React Context (Auth, Global State, dll)
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Helper / utility functions
│   ├── pages/             # Halaman utama aplikasi
│   ├── App.tsx            # Root component
│   └── main.tsx           # Entry point React
├── index.html
└── .env                   # Environment variables

🧠 Backend (Express + Prisma)
lab-inventory-backend/
├── prisma/
│   ├── migrations/        # Database migrations
│   └── schema.prisma      # Prisma schema
├── src/
│   ├── controllers/       # Logic bisnis aplikasi
│   │   ├── authController.js
│   │   └── inventoryController.js
│   ├── middlewares/       # Middleware Express
│   │   └── authMiddleware.js
│   ├── routes/            # API routes
│   │   ├── auth.js
│   │   └── inventoryRoutes.js
│   ├── utils/             # Utility functions
│   │   └── prisma.js      # Prisma client
│   └── index.js           # Entry point server
└── .env                   # Environment variables


# ⚙️ Instalasi & Setup
🔧 A. Backend (Express + Prisma)
1️⃣ Install Dependencies
npm install

2️⃣ Konfigurasi Environment Variables

Buat file .env di root backend:

DATABASE_URL="mysql://root:@localhost:3306/lab_inventory"

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET="your_super_secret_jwt_key_change_this_in_production"

3️⃣ Migrasi Database
npx prisma migrate dev

4️⃣ Jalankan Server
npm run dev


📌 Backend berjalan pada:

http://localhost:3000

🎨 B. Frontend (Vite + React)
1️⃣ Install Dependencies
npm install

2️⃣ Konfigurasi Environment Variables

Buat file .env di root frontend:

VITE_API_URL=http://localhost:3000/api

3️⃣ Jalankan Frontend
npm run dev


📌 Frontend berjalan pada:

Local   : http://localhost:8080
Network : http://192.168.18.5:8080

✅ Catatan

Pastikan MySQL sudah berjalan sebelum migrasi Prisma

Pastikan PORT backend dan VITE_API_URL sesuai

Jangan upload file .env ke GitHub (gunakan .gitignore)
8. API Documentation (Ringkas)
Auth Routes

  | Method | Endpoint             | Deskripsi         |
  | ------ | -------------------- | ----------------- |
  | POST   | `/api/auth/register` | Registrasi user   |
  | POST   | `/api/auth/login`    | Login & JWT Token |

User Routes
  
  | Method | Endpoint             | Deskripsi             |
  | ------ | -------------------- | --------------------- |
  | GET    | `/api/users/profile` | Ambil data user login |

Inventory Routes (Protected)

| Method | Endpoint             | Deskripsi      |
| ------ | -------------------- | -------------- |
| GET    | `/api/inventory`     | List item user |
| POST   | `/api/inventory`     | Tambah item    |
| GET    | `/api/inventory/:id` | Detail item    |
| PUT    | `/api/inventory/:id` | Update item    |
| DELETE | `/api/inventory/:id` | Hapus item     |

9. Pemenuhan Checklist Proyek UAS

| No | Modul Wajib    | Status  | Implementasi                         |
| -- | -------------- | ------- | ------------------------------------ |
| 01 | Express.js     | Selesai | Backend dibangun full dengan Express |
| 02 | Prisma ORM     | Selesai | ORM untuk MySQL                      |
| 03 | JWT Auth       | Selesai | JWT untuk login dan proteksi rute    |
| 04 | Validasi Input | Selesai | express-validator pada auth dan CRUD |
| 05 | Auth API       | Selesai | Register & Login + Bcrypt            |
| 06 | User API       | Selesai | GET /api/users/profile               |
| 07 | CRUD Resource  | Selesai | CRUD Inventory (One-to-Many)         |
| 08 | Deployment     | Selesai | Netlify (Frontend)                   |

# Deployment

Frontend dihosting pada Netlify:

https://lab-inventory-kel1-uas.netlify.app

Backend berjalan pada lokal:

http://localhost:3000

# Kesimpulan

Proyek LabInventory berhasil memenuhi seluruh persyaratan UAS Backend Development, termasuk implementasi RESTful API, autentikasi JWT, validasi input, relasi database, serta integrasi penuh dengan frontend berbasis React + Vite.

Aplikasi ini siap dikembangkan lebih lanjut menjadi sistem inventaris laboratorium yang lebih komprehensif dan terintegrasi.
