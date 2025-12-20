# Backend SIPRAK
## Sistem Peminjaman Ruang dan Fasilitas Kampus

Backend SIPRAK merupakan REST API yang dibangun untuk mendukung
aplikasi Sistem Peminjaman Ruang dan Fasilitas Kampus. Backend ini
bertanggung jawab dalam pengelolaan autentikasi pengguna, manajemen
data peminjaman, serta pengamanan akses data menggunakan JSON Web Token
(JWT).

---

# Dokumentasi API

## Autentikasi

Sebagian besar endpoint membutuhkan token JWT yang dikirim melalui header:

```
Authorization: Bearer <token>
```

---

## 1️⃣ Auth API

### Register Pengguna

**Endpoint**

```
POST /auth/register
```

**Deskripsi**
Digunakan untuk mendaftarkan pengguna baru ke dalam sistem SIPRAK. Data pengguna akan disimpan ke database dengan password yang telah dienkripsi menggunakan bcrypt.

**Request Body**

```json
{
  "name": "user123",
  "email": "user@gmail.com",
  "password": "password123"
}
```

**Response Sukses**

```json
{
  "message": "Register success"
}
```

**Response Gagal (Validasi Input)**

```json
{
  "message": "Name, email, and password are required"
}
```

**Response Gagal (Email Sudah Terdaftar)**

```json
{
  "message": "Email already registered"
}
```

---
### Login Pengguna

**Endpoint**

```
POST /auth/login
```

**Deskripsi**  
Digunakan untuk melakukan autentikasi pengguna dan menghasilkan token JWT.

**Request Body**

```json
{
  "email": "user@gmail.com",
  "password": "password123"
}
```

**Response Sukses**

```json
{
  "message": "User login successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Gagal**

```json
{
  "message": "Invalid email or password"
}
```

---

## 2️ Borrowing API

### Ambil Semua Data Peminjaman

**Endpoint**

```
GET /borrowings
```

**Deskripsi**  
Menampilkan daftar peminjaman milik pengguna yang sedang login.

**Header**

```
Authorization: Bearer <token>
```

**Response Sukses**

```json
{
  "message": "Get all borrowings successfully",
  "data": [
    {
      "id": 1,
      "title": "Rapat Himpunan",
      "facility": "Ruang Aula",
      "borrowDate": "2025-12-20T08:00:00.000Z",
      "returnDate": "2025-12-20T13:00:00.000Z",
      "status": "pending",
      "userId": 3,
      "createdAt": "2025-12-20T03:12:19.638Z"
        },
  ]
}
```

---

### Tambah Data Peminjaman

**Endpoint**

```
POST /borrowings
```

**Deskripsi**  
Digunakan untuk mengajukan peminjaman ruang atau fasilitas kampus.

**Header**

```
Authorization: Bearer <token>
```

**Request Body**

```json
{
  "title": "Seminar Telkomsel",
  "facility": "Ruang Seminar",
  "borrowDate": "2025-12-24T08:00:00.000Z",
  "returnDate": "2025-12-24T16:00:00.000Z"
}
```

**Response Sukses**

```json
{
    "message": "Borrowing created successfully",
    "data": {
        "id": 7,
        "title": "Seminar Telkomsel",
        "facility": "Ruang Seminar",
        "borrowDate": "2025-12-24T08:00:00.000Z",
        "returnDate": "2025-12-24T16:00:00.000Z",
        "status": "pending",
        "userId": 3,
        "createdAt": "2025-12-20T03:46:43.974Z"
    }
}
```

**Response Validasi Gagal**

```json
{
  "message": "Validation error"
}
```

---

### Update Data Peminjaman

**Endpoint**

```
PUT /borrowings/:id
```

**Deskripsi**  
Digunakan untuk memperbarui data peminjaman ruang atau fasilitas kampus. Pengguna hanya dapat memperbarui data peminjaman miliknya sendiri.

**Header**

```
Authorization: Bearer <token>
```

**Parameter URL**

```
id: number (ID peminjaman)
```

**Request Body**

```json
{
      "id": 7,
      "title": "Seminar Telkomsel",
      "facility": "Ruang Aula",
      "borrowDate": "2025-12-22T09:00:00.000Z",
      "returnDate": "2025-12-22T15:00:00.000Z",
}
```

Field yang dikirim akan memperbarui data lama. Field `status` dapat diubah sesuai kebutuhan sistem.

**Response Sukses**

```json
{
  "message": "Borrowing updated successfully",
    "data": {
        "id": 7,
        "title": "Seminar Telkomsel",
        "facility": "Ruang Aula",
        "borrowDate": "2025-12-24T08:00:00.000Z",
        "returnDate": "2025-12-24T16:00:00.000Z",
        "status": "pending",
        "userId": 3,
        "createdAt": "2025-12-20T03:46:43.974Z"
    }
}
```

**Response Gagal (Data Tidak Ditemukan)**

```json
{
  "message": "Borrowing not found"
}
```

**Response Gagal (Bukan Pemilik Data)**

```json
{
  "message": "Forbidden"
}
```

**Response Validasi Gagal**

```json
{
  "message": "Validation error"
}
```

---

### Hapus Data Peminjaman

**Endpoint**

```
DELETE /borrowings/:id
```

**Deskripsi**  
Menghapus data peminjaman berdasarkan ID. Pengguna hanya dapat menghapus data miliknya sendiri.

**Header**

```
Authorization: Bearer <token>
```

**Response Sukses**

```json
{
  "message": "Borrowing deleted successfully"
}
```

**Response Gagal (Bukan Pemilik Data)**

```json
{
  "message": "Access denied"
}
```

## Struktur Direktori

```
backend/
├── prisma/                     # Konfigurasi ORM dan database
│   ├── migrations/             # Riwayat migrasi database
│   │   └── 20251217100637_init/
│   │       └── migration.sql   # SQL hasil generate Prisma
│   ├── migration_lock.toml     # File pengunci migrasi Prisma
│   └── schema.prisma           # Skema database (model & relasi)
│
├── src/                        # Folder utama source code backend
│   ├── config/                 # Konfigurasi aplikasi
│   │   ├── jwt.js              # Konfigurasi JWT (secret & expiry)
│   │   └── prisma.js           # Inisialisasi Prisma Client
│   │
│   ├── controllers/            # Logika bisnis aplikasi
│   │   ├── authController.js   # Proses autentikasi (login)
│   │   ├── borrowingController.js # Manajemen peminjaman
│   │   └── userController.js   # Manajemen data pengguna
│   │
│   ├── middleware/             # Middleware keamanan
│   │   ├── authMiddleware.js   # Proteksi JWT
│   │   └── ownership.js        # Validasi kepemilikan data
│   │
│   ├── routes/                 # Definisi endpoint API
│   │   ├── authRoutes.js       # Route autentikasi
│   │   ├── borrowingRoutes.js  # Route peminjaman
│   │   └── userRoutes.js       # Route user
│   │
│   └── validators/             # Validasi input request
│       ├── authValidator.js    # Validasi login
│       └── borrowingValidator.js # Validasi peminjaman
│
├── .env.example                # Contoh konfigurasi environment
├── .gitignore                  # File/folder yang diabaikan Git
├── app.js                      # Konfigurasi Express & middleware
├── server.js                   # Entry point server backend
├── package.json                # Konfigurasi project & dependencies
├── package-lock.json           # Lock versi dependency
└── Readme.md                   # Dokumentasi backend SIPRAK
```