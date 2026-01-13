# **PROJECT UAS – BACKEND DEVELOPMENT (KELOMPOK)**

## **Tugas Utama**

Setiap **kelompok** membangun **RESTful API Backend** menggunakan **Express.js + Prisma + JWT** pada topik bebas hasil riset kelompok.
Topik harus berasal dari **kasus nyata**, **permasalahan di lingkungan kampus**, atau **ide orisinal**, dan wajib memiliki **relasi data serta fitur CRUD lengkap**.

`API` harus dapat digunakan oleh `frontend` (web atau mobile), baik buatan sendiri maupun _mock client_.

## **A. Ketentuan Kelompok**

* **Jumlah anggota**: 2–4 mahasiswa.
* Setiap anggota wajib berkontribusi (coding, dokumentasi, presentasi).
* Commit di GitHub harus mencerminkan kontribusi tiap anggota.
* Semua anggota harus paham keseluruhan sistem, bukan hanya bagian yang dikerjakan.

## **B. Persyaratan Teknis Wajib (Checklist Proyek)**

| No. | Modul Wajib        | Deskripsi Implementasi                                                              |
| --: | ------------------ | ----------------------------------------------------------------------------------- |
|  01 | **Express.js**     | Backend dibangun menggunakan Express.                                               |
|  02 | **Prisma ORM**     | Prisma sebagai ORM untuk database MySQL/PostgreSQL (atau Supabase sebagai hosting). |
|  03 | **JWT Auth**       | Otentikasi menggunakan token JWT untuk login + proteksi rute.                       |
|  04 | **Validasi Input** | Menggunakan express-validator untuk semua input Auth dan CRUD.                      |
|  05 | **Auth API**       | Register & Login dengan hashing password (Bcrypt).                                  |
|  06 | **User API**       | Contoh minimal: `GET /api/users/profile`.                                           |
|  07 | **CRUD Resource**  | CRUD lengkap untuk 1 resource utama (One-to-Many dengan User).                      |
|  08 | **Deployment**     | Deploy ke Vercel, Railway, Render, Netlify, Cloudflare, atau Supabase.              |

## **C. Panduan Pemilihan Topik (Riset Kelompok)**

Topik harus memenuhi:

1. **Relasi One-to-Many** antara User → Resource.
2. **CRUD lengkap** dan membutuhkan validasi.
3. **Mengandung ownership**, sehingga hanya pemilik yang dapat mengakses datanya.
    - Contoh (dalam logika):
    ❌ User A mencoba menghapus Task milik User B → API harus menolak.

Contoh topik:

* Aplikasi Penjadwalan Praktikum
* Manajemen Inventaris Laboratorium
* Sistem Menu & Pesanan untuk UMKM
* Buku Resep Online
* Pengelolaan Tugas/To-Do Kelompok

## **D. Pembagian Tugas Minimal**

Setiap kelompok harus menentukan peran (boleh dirangkap):

* Backend Engineer (struktur project + Express setup)
* Database Engineer (schema Prisma)
* Auth Specialist (JWT, hashing, middleware)
* CRUD Specialist (rute resource)
* DevOps/Deployment
* Dokumentasi (README + API Docs + ERD)

## **E. Frontend (Sesuai Keinginan Mahasiswa)**

Kelompok **wajib** membuat **antarmuka sederhana** untuk mengonsumsi API backend.
Framework bebas: React, Vue, Svelte, atau lainnya.

### **Contoh Alur Implementasi Frontend**

#### **1. Login Page**

* Form input: **email/username** & **password**
* Saat tombol "Login" ditekan:

  * Hit endpoint **POST /api/auth/login**
  * Jika sukses → ambil token dari response
  * Simpan token ke **localStorage** atau **sessionStorage**

#### **2. Dashboard Page**

Menampilkan data resource kelompok (misalnya daftar kontak, daftar tugas, daftar menu).

Contoh alur:

* Lakukan request:
  `GET /api/contacts` (Token dikirim melalui Header Authorization)

* Render tabel berisi daftar data.

* Sediakan tombol **Tambah Data**:

  * Munculkan form/modal.
  * Setelah submit → Hit endpoint `POST /api/contacts`.
  * Refresh tabel.

* Sediakan tombol **Hapus** per baris:

  * Memanggil endpoint `DELETE /api/contacts/:id`
  * Data akan terhapus, lalu reload tampilan.

> **Catatan:** Resource “contacts” hanyalah contoh.
> Kelompok harus menyesuaikan dengan resource pilihan masing-masing.


# **F. Output Proyek (Wajib Dikumpulkan)**

### **1. Repository GitHub**

Berisi:

* Source code backend
* `.env.example`
* Dokumentasi API (Markdown/Postman/Insomnia)
* Pembagian tugas per anggota

### **2. Link Deployment**

API online di hosting pilihan kelompok.

### **3. Dokumentasi README**

Wajib berisi:

* Deskripsi aplikasi
* ERD (Opsional)
* Cara setup & menjalankan project
* Endpoint penting
* Kontribusi tiap anggota

### **4. (Opsional) Video Presentasi**

5–10 menit berisi demo API + penjelasan kontribusi anggota.

## **G. Rubrik Penilaian**

| Komponen                 |   Bobot | Kriteria                                         |
| ------------------------ | ------: | ------------------------------------------------ |
| **Backend Logic**        | **40%** | CRUD lengkap, relasi benar, error handling rapi. |
| **Security**             | **20%** | JWT benar, hashing aman, ownership check.        |
| **Database**             | **15%** | Prisma schema tepat, migrasi berhasil.           |
| **Validasi**             | **10%** | express-validator digunakan dengan benar.        |
| **Kolaborasi GitHub**    | **10%** | Commit aktif, kontribusi jelas.                  |
| **Frontend Integration** |  **5%** | Ada UI sederhana yang mengonsumsi API.           |

