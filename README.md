# VibeGraph – Creative Studio Booking System
**Tugas Besar UAS Pemrograman Berbasis Web Back End** **Kelompok 5 - Kelas SI-VA**

---

## 1. 📝 Deskripsi Aplikasi
VibeGraph adalah platform manajemen pemesanan (booking) studio foto kreatif berbasis web. Aplikasi ini memungkinkan pelanggan untuk memilih berbagai kategori layanan fotografi (Self-Photo, Pro Studio, Graduation, dll), memilih lokasi cabang, dan mengelola reservasi mereka secara real-time. 

Sistem ini dibangun dengan fokus pada keamanan data menggunakan autentikasi JWT dan enkripsi password, serta integrasi database relasional untuk menyimpan riwayat pesanan pengguna.

## 2. 👥 Anggota Kelompok & Pembagian Tugas

| Nama Anggota | NIM | Peran & Kontribusi Utama |
| :--- | :--- | :--- |
| **Dina Salwa Mannatu** | 230660221011 | **Ketua Kelompok**. Full Stack Developer: Mengembangkan seluruh logika Backend (Express, Prisma), Frontend (React), dan integrasi API. Mengerjakan dari awal hingga akhir. |
| **Clara Desmiati** | 230660221005 | **Topik & Dokumentasi**. Menentukan topik, menyusun dokumentasi akhir, Pengujian fungsionalitas fitur (Testing). |
| **Yulia Rizky Afifah** | 230660221090 | **-**. Pengujian fungsionalitas fitur (Testing)|
| **Sharel Faturahman** | 230660221108 | **-**. Pengujian fungsionalitas fitur (Testing)|

## 3. 🛠️ Teknologi yang Digunakan
- **Backend:** Node.js & Express.js
- **ORM & Database:** Prisma ORM & MySQL
- **Security:** JSON Web Token (JWT) & Bcrypt Password Hashing
- **Validation:** Express-Validator
- **Frontend:** React.js, Tailwind CSS, & Axios
- **Deployment:** Netlify (Frontend)

## 4. 🗄️ Struktur Database (ERD)
Aplikasi menggunakan relasi **One-to-Many** antara tabel `User` (Pelanggan) dan `Booking` (Pesanan).



- **User**: Menyimpan data akun (1 user bisa memiliki banyak booking).
- **Booking**: Menyimpan detail pesanan yang terkait dengan ID pengguna.

## 5. 📂 Struktur Folder Proyek

### Backend (Express + Prisma) 
```text
backend-api/
├── controllers/
│   ├── authController.js     # Logika Register & Login
│   └── bookingController.js  # Logika CRUD Pesanan
├── middleware/
│   └── authMiddleware.js    # Verifikasi JWT Token
├── prisma/
│   ├── schema.prisma        # Definisi Tabel & Relasi
│   └── client.js            # Inisialisasi Prisma Client
├── .env                     # Variabel Sensitif (Hidden)
├── .env.example             # Template Variabel Environment
├── index.js                 # Entry Point & Validasi Route
└── package.json

### Frontend (React.js)
frontend-app/
├── public/
│   └── _redirects           # Konfigurasi Navigasi Netlify
├── src/
│   ├── App.jsx              # Logika Utama & Routing Frontend
│   └── main.jsx
├── index.html
├── package.json
└── tailwind.config.js


## 6. 🚀 Instalasi & Cara Setup
1. **Clone Repository:**
   ```bash
   git clone [https://github.com/username/vibegraph-project.git](https://github.com/username/vibegraph-project.git)
Setup Backend:
- Masuk ke folder backend: cd backend
- Install dependencies: npm install
- Salin .env.example menjadi .env dan sesuaikan DATABASE_URL.
- Jalankan migrasi: npx prisma migrate dev
- Jalankan server: node index.js

Setup Frontend:
- Masuk ke folder frontend: cd frontend
- Install dependencies: npm install
- Jalankan aplikasi: npm run dev


## 7. 🔗 Dokumentasi API (Endpoints)

| Method | Endpoint | Deskripsi | Proteksi | Validasi Input |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/register` | Pendaftaran akun baru | Publik | Nama, Email, Pass (Min 6) |
| `POST` | `/api/login` | Masuk & mendapatkan Token | Publik | Email & Password |
| `POST` | `/api/bookings` | Membuat reservasi baru | Private (JWT) | Paket, Tanggal, Lokasi |
| `GET` | `/api/bookings` | Mengambil riwayat pesanan | Private (JWT) | - |


**Booking (Private Routes)**
Memerlukan Header: Authorization: Bearer <token> | Method | Endpoint | Deskripsi | | :--- | :--- | :--- | | POST | /api/bookings | Membuat reservasi studio baru | | GET | /api/bookings | Melihat riwayat pesanan milik user sendiri |


## 8. ✅ Pemenuhan Checklist Proyek UAS

| No | Modul Wajib | Status | Implementasi Teknis |
| :-- | :--- | :--- | :--- |
| 01 | **Express.js** | Selesai | Menggunakan Express sebagai web server utama. |
| 02 | **Prisma ORM** | Selesai | Implementasi Prisma untuk manajemen database MySQL. |
| 03 | **JWT Auth** | Selesai | Keamanan rute menggunakan JSON Web Token (JWT). |
| 04 | **Validasi Input** | Selesai | Menggunakan `express-validator` pada sisi Backend. |
| 05 | **Bcrypt Hashing** | Selesai | Password pengguna dienkripsi sebelum masuk database. |
| 06 | **Relasi Database**| Selesai | Relasi One-to-Many antara tabel User dan Booking. |
| 07 | **Deployment** | Selesai | Frontend berhasil dideploy ke layanan Netlify. |
| 08 | **GitHub Output** | Selesai | Repository menyertakan `.env.example` dan README. |

## 9. 🚀 Instalasi & Setup
1. **Clone & Install**: `npm install` di folder backend & frontend.
2. **Database**: Sesuaikan `DATABASE_URL` di `.env` lalu jalankan `npx prisma migrate dev`.
3. **Run**: Jalankan backend dengan `node index.js` dan frontend dengan `npm run dev`.

## 10. 🌐 Deployment Link
- **Frontend (Netlify):** [https://vibegraph-kelompok5-uas.netlify.app/]
- **Backend berjalan pada lokal:** [http://localhost:3000]

File Konfigurasi: .env.example tersedia di folder root backend-api.

## 11. Kesimpulan
Proyek VibeGraph berhasil memenuhi seluruh persyaratan UAS Backend Development. Aplikasi ini mengintegrasikan sistem autentikasi yang aman, validasi data yang ketat, dan manajemen database relasional untuk menghadirkan solusi booking studio foto yang fungsional.

---
© 2026 - Kelompok 5 SI-VA • UAS Pemrograman Berbasis Web Back End