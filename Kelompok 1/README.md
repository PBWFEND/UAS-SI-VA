LabInventory – RESTful API Backend & Web App

Sistem Manajemen Inventaris Laboratorium
Project UAS – Backend Development (Express.js + Prisma + JWT)

1. Deskripsi Proyek

LabInventory adalah sistem manajemen inventaris laboratorium berbasis web yang dirancang untuk membantu pengelolaan alat, bahan, dan perlengkapan laboratorium secara terstruktur.
Aplikasi ini memungkinkan pengguna untuk mengelola inventaris pribadi menggunakan autentikasi JWT dan menyediakan fitur CRUD lengkap.

Proyek ini dikembangkan sebagai tugas UAS Backend Development dengan ketentuan wajib: Express.js, Prisma ORM, JWT Authentication, Validasi Input, dan memiliki relasi One-to-Many.

Catatan:
Seluruh implementasi backend, frontend, arsitektur API, setup database, deployment, serta dokumentasi dikerjakan oleh Fajar (230660221093).

2. Anggota Kelompok

| Nama        | NIM          | Tugas                                                                                |
| ----------- | ------------ | ------------------------------------------------------------------------------------ |
| **Fajar**   | 230660221093 | *Seluruh implementasi proyek (backend, frontend, database, deployment, dokumentasi)* |
| Wendi F     | -            | Anggota Kelompok                                                                     |
| Dede Dian P | -            | Anggota Kelompok                                                                     |
| Agil P      | -            | Anggota Kelompok                                                                     |
| Febry       | -            | Anggota Kelompok                                                                     |

3. Teknologi yang Digunakan
Backend

Node.js + Express.js

Prisma ORM

MySQL

JWT Authentication

Bcrypt Password Hashing

Express-Validator

Frontend

React + TypeScript

Vite

Tailwind CSS

Axios

Deployment

Frontend: Netlify
URL: https://lab-inventory-kel1-uas.netlify.app

Backend: Local Server (port 3000)

4. Fitur Utama Aplikasi
Autentikasi Pengguna

Register

Login

JWT Token

Proteksi rute private

Hashing password (Bcrypt)

Manajemen Inventaris (CRUD)

Tambah item inventaris

Lihat seluruh item milik user

Update item

Hapus item

Relasi One-to-Many antara User → Inventory

Fitur Pendukung

Validasi input (express-validator)

Kategori inventaris

Multi-user, namun user hanya dapat melihat inventaris miliknya sendiri

5. Struktur Database
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

6. Struktur Folder Proyek

Frontend (Vite + React)

lab-inventory-hub/
    │── public/
    │── src/
    │   ├── components/
    │   ├── contexts/
    │   ├── hooks/
    │   ├── lib/
    │   ├── pages/
    │   ├── App.tsx
    │   ├── main.tsx
    │── index.html
    │── .env

Backend (Express + Prisma)

lab-inventory-backend/
    │── prisma/
    │   ├── migrations/
    │   ├── schema.prisma
    │── src/
    │   ├── controllers/
    │   │   ├── authController.js
    │   │   ├── inventoryController.js
    │   ├── middlewares/
    │   │   ├── authMiddleware.js
    │   ├── routes/
    │   │   ├── auth.js
    │   │   ├── inventoryRoutes.js
    │   ├── utils/
    │   │   ├── prisma.js
    │   ├── index.js
    │── .env

7. Instalasi & Setup
A. Backend
1. Install Dependencies
npm install

2. Konfigurasi .env
DATABASE_URL="mysql://root:@localhost:3306/lab_inventory"

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET="your_super_secret_jwt_key_change_this_in_production"

3. Migrasi Database
npx prisma migrate dev

4. Run Server
npm run dev


Backend berjalan pada:
http://localhost:3000

B. Frontend
1. Install Dependencies
npm install

2. Konfigurasi .env
VITE_API_URL=http://localhost:3000/api

3. Running Frontend
npm run dev


Frontend berjalan pada:

Local: http://localhost:8080

Network: http://192.168.18.5:8080/

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

10. Deployment

Frontend dihosting pada Netlify:

https://lab-inventory-kel1-uas.netlify.app

Backend berjalan pada lokal:

http://localhost:3000

11. Kesimpulan

Proyek LabInventory berhasil memenuhi seluruh persyaratan UAS Backend Development, termasuk implementasi RESTful API, autentikasi JWT, validasi input, relasi database, serta integrasi penuh dengan frontend berbasis React + Vite.

Aplikasi ini siap dikembangkan lebih lanjut menjadi sistem inventaris laboratorium yang lebih komprehensif dan terintegrasi.
