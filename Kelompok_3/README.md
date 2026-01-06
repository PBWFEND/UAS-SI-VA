# 📦 Sistem Peminjaman Alat Laboratorium (Backend & Frontend)

## 📖 Deskripsi Aplikasi

Aplikasi *Sistem Peminjaman Alat Laboratorium* merupakan aplikasi berbasis web yang dibuat untuk memenuhi tugas *UAS Backend Development*. Aplikasi ini memungkinkan pengguna (user) untuk melakukan proses *login*, kemudian *mengelola data peminjaman alat laboratorium* miliknya sendiri.

Aplikasi ini menerapkan konsep *RESTful API**, *relasi One-to-Many*, serta *ownership data*, sehingga setiap user hanya dapat mengakses dan memodifikasi data peminjaman miliknya sendiri.

---

## Anggota Kelompok 3
Sesi Pramesti 		   (230660221017)
Lala Jalaliah 			(230660221019)
Astia Sundari Putri 	(230660221020)
Amelia Oktaviani 		(230660221127)

---
## 👥 Pembagian Tugas Kelompok 3

| Nama           | Peran              |
| -------------- | ------------------ |
| (Astia)        | Backend Engineer   |
| (Astia&Lala)   | Database & Prisma  |
| (Astia&Amelia) | Auth & Security    |
| (Astia&Sesi)   | Frontend Developer |

---
## Entity Relationship Diagram (ERD)

USER
- id (PK)
- name
- email
- password
- createdAt

LOAN
- id (PK)
- itemName
- amount
- loanDate
- returnDate
- userId (FK)
- createdAt

Relasi:
- 1 User dapat memiliki banyak Loan

---
## 🛠️ Tech Stack

### Backend

* Node.js
* Express.js
* Prisma ORM
* MySQL / PostgreSQL
* JWT (JSON Web Token)
* Bcrypt
* Express Validator

### Frontend

* React.js (Vite)
* Tailwind CSS

---

## 🗂️ Struktur Project

### Backend

```
backend/
├── controllers/
├── middlewares/
├── prisma/
├── routes/
├── utils/
├── index.js
├── package.json
└── .env.example
```

### Frontend

```
frontend/
├── src/
│   ├── pages/
│   ├── services/
│   └── App.jsx
├── index.html
└── package.json
```

---

## 🔐 Fitur Utama
* Register & Login User (JWT Authentication)
* Proteksi route menggunakan middleware auth
* CRUD Peminjaman Alat Laboratorium
* Relasi **User → Loan (One-to-Many)**
* Ownership check (user hanya dapat mengakses data miliknya)
* Validasi input menggunakan express-validator
* Frontend untuk mengonsumsi API backend

---

## 🔗 Endpoint API Penting

### Auth

* `POST /api/login`
* `POST /api/register`

### User

* `GET /api/users/profile`

### Loan (Peminjaman)

* `GET /api/loans`
* `POST /api/loans`
* `PUT /api/loans/:id`
* `DELETE /api/loans/:id`

---

## ⚙️ Cara Menjalankan Project

### Backend

1. Masuk ke folder backend
2. Install dependency

   ```bash
   npm install
   ```
3. Setup file `.env`
4. Jalankan migrasi database

   ```bash
   npx prisma migrate dev
   ```
5. Jalankan server

   ```bash
   npm run dev
   ```

### Frontend

1. Masuk ke folder frontend
2. Install dependency

   ```bash
   npm install
   ```
3. Jalankan aplikasi

   ```bash
   npm run dev
   ```
4. Akses di browser: `http://localhost:5173`

---

## 🎥 Demo & Presentasi

Aplikasi dapat didemokan melalui:

* Login user
* Menampilkan daftar peminjaman
* Menambah peminjaman
* Menghapus peminjaman

---

## 📌 Catatan

Frontend dan backend dipisahkan untuk menerapkan praktik pengembangan aplikasi modern (decoupled architecture).

---

✨ *Project ini dibuat untuk memenuhi penilaian UAS Backend Development.*
