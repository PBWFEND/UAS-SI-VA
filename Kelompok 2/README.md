# 👨‍🍳 Aplikasi Buku Resep Digital (Fullstack)

## 📌 Deskripsi Aplikasi
Aplikasi **Buku Resep Digital** adalah platform berbasis web yang memungkinkan pengguna untuk menyimpan, mengelola, dan membagikan resep masakan favorit mereka. Aplikasi ini dibangun menggunakan arsitektur **Fullstack** dengan pemisahan antara Frontend dan Backend untuk skalabilitas yang lebih baik.

**Fitur Utama:**
* **Autentikasi Pengguna:** Sistem registrasi dan login yang aman menggunakan JWT.
* **Manajemen Resep (CRUD):** Pengguna dapat Membuat, Membaca, Mengupdate, dan Menghapus resep pribadi.
* **Detail Lengkap:** Menyimpan informasi bahan, langkah pembuatan, waktu memasak, dan porsi.
* **Pencarian & Filter:** Fitur pencarian resep berdasarkan nama.
* **Responsive UI:** Tampilan yang menarik dan responsif di berbagai perangkat.

---

## 🛠️ Teknologi yang Digunakan
* **Frontend:** React.js, Vite
* **Backend:** Node.js, Express.js
* **Database:** MySQL
* **ORM:** Prisma
* **Deployment:** Railway (Backend & DB), Netlify (Frontend)
* **Testing API:** Postman

---

## 🗂️ Struktur Database (ERD)
Aplikasi ini menggunakan relasi sederhana **One-to-Many**:
* **Users:** Menyimpan data akun pengguna.
* **Recipes:** Menyimpan data resep masakan.
* *Satu User dapat membuat banyak Recipe, tetapi satu Recipe hanya milik satu User.*

---

## 🚀 Cara Setup & Menjalankan (Localhost)

Karena struktur project terpisah, silakan ikuti langkah berikut:

### Setup Backend (Server)
1. Buka terminal dan masuk ke folder `backend`.
```bash
cd backend
npm install
```

2. Buat file .env baru di dalam folder backend dan isi konfigurasi database:
```bash
DATABASE_URL="mysql://root:@localhost:3306/dbresep"
PORT=3000
JWT_SECRET="rahasia_anda_disini"
```

3. Jalankan migrasi database dan nyalakan server:
```Bash
npx prisma migrate dev --name init
npm run dev
```
(Server Backend akan berjalan di port 3000)

### Setup Frontend (Tampilan)
1. Buka terminal baru (jangan maikan terminal backend), lalu masuk ke folder frontend . 

```Bash
cd frontend
npm install
npm run dev
```
(Aplikasi Frontend akan berjalan di http://localhost:5173)

---

### API Endpoints
Gunakan Postman untuk melakukan pengujian API secara manual. Berikut adalah dokumentasi endpoint yang tersedia:
### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Registrasi pengguna  baru | ❌ |
| POST | `/api/auth/login` | Login & dapatkan token  | ❌ |

### Borrowing Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/recipes` | Melihat semua daftar resep | ✅ |
| POST | `/api/recipes` | Menambahkan resep baru  | ✅ |
| PUR | `/api/recipes/:id` | Mengupdate resep (milik sendiri) | ✅ |
| DELETE | `/api/recipes/:id` | Menhapus resep (milik sendiri)  | ✅ |


Keterangan:

❌ : Tidak butuh Token (Public).

✅ : Wajib menyertakan Token JWT di Header (Authorization: Bearer <token>).

---

### Anggota Kelompok
| Nama Anggota | NIM | 
|--------|----------|
| Tira Azzahra | 230660221021 | 
| Nisa Rahmawati | 230660221023 | 
| Amelia Putri Latifah | 230660221101 | 
| Elangga Yudistira | 230660221109| 

---

### Link Demo
**Frontend (Netlify)**: [Paste Link Netlify Kamu Di Sini]

**Backend (Railway)**: [Paste Link Railway Kamu Di Sini]

---

### Akun Testing (Demo)
Untuk mempermudah pengujian aplikasi tanpa harus registrasi, Anda dapat menggunakan akun berikut:
- Email: `admin@gmail.com`
- Password: `admin1234`

Catatan: Atau dapat juga mendaftarkan akun baru melalui halaman Register.

---






