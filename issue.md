# Perencanaan: Pembuatan Unit Test API (ElysiaJS & Bun Test)

## Deskripsi Tugas
Dibutuhkan implementasi *Unit Testing* yang komprehensif untuk seluruh API endpoint yang sudah tersedia di aplikasi FamTrack. Pengujian ini bertujuan untuk memastikan semua fungsionalitas utama (*registration, login, get current user, logout*) berjalan dengan stabil dan sesuai ekspektasi ketika menerima berbagai *input*, baik yang *valid* maupun *invalid*.

## Persyaratan Teknis
- **Lokasi File Test:** Semua file test harus diletakkan di dalam folder `tests/` di *root* proyek.
- **Framework Test:** Menggunakan standar bawaan Bun yaitu `bun:test` (via command `bun test`).
- **Data Konsisten:** **Penting!** Sebelum menjalankan setiap kode skenario pengujian, data pada *database* (seperti tabel `users` dan `sessions`) **harus dihapus terlebih dahulu** (bisa menggunakan *hooks* `beforeEach` atau aksi spesifik pada tiap test) agar pengujian satu dengan yang lainnya tidak saling bertabrakan dan menjamin konsistensi *state*.

---

## Daftar Skenario Pengujian yang Harus Diimplementasikan

Berikut adalah daftar skenario yang harus di-_cover_ oleh *programmer* yang akan mengerjakan tiket ini. **Tidak perlu panduan kode detail**, cukup penuhi skenario-skenario berikut menggunakan fungsi bawaan `fetch`/App Elysia:

### 1. API: Registrasi User (`POST /api/users`)
- **[ ] Skenario Sukses:** Mendaftar dengan data lengkap dan nama maksimal 255 karakter. (Ekspektasi: HTTP 201)
- **[ ] Skenario Gagal (Email Kembar):** Mendaftar menggunakan email yang sudah ada di database. (Ekspektasi: HTTP 400 - "Email sudah terdaftar")
- **[ ] Skenario Gagal (Validasi Nama >255 Karakter):** Mendaftar dengan panjang karakter `name` melebihi 255 karakter. (Ekspektasi: HTTP 422 - validasi error).
- **[ ] Skenario Gagal (Validasi Email Invalid):** Mendaftar dengan format email yang salah. (Ekspektasi: HTTP 422 - validasi error).
- **[ ] Skenario Gagal (Payload Kosong/Kurang):** Mengirim *request body* tanpa salah satu properti wajib (misal tanpa `password`). (Ekspektasi: HTTP 422 - validasi error).

### 2. API: Login User (`POST /api/users/login`)
- **[ ] Skenario Sukses:** Login menggunakan *email* dan *password* yang benar. Pastikan respon berisi *token JWT/UUID*. (Ekspektasi: HTTP 200)
- **[ ] Skenario Gagal (Email Tidak Ditemukan):** Login dengan email yang belum pernah didaftarkan. (Ekspektasi: HTTP 401 - "Email atau password salah")
- **[ ] Skenario Gagal (Password Salah):** Login dengan email yang terdaftar tapi password salah. (Ekspektasi: HTTP 401 - "Email atau password salah")
- **[ ] Skenario Gagal (Invalid Payload):** Mengirim payload login tanpa format *email* yang benar. (Ekspektasi: HTTP 422 - validasi error).

### 3. API: Dapatkan User Saat Ini (`GET /api/users/current`)
- **[ ] Skenario Sukses:** Meminta data user lengkap dengan *header* `Authorization: Bearer <token-asli>` setelah berhasil login. (Ekspektasi: HTTP 200 dengan data user dikembalikan)
- **[ ] Skenario Gagal (Tanpa Header Auth):** Meminta data tanpa mengirimkan header `Authorization` sama sekali. (Ekspektasi: HTTP 401 - "Unauthorized")
- **[ ] Skenario Gagal (Token Tidak Valid / Kedaluwarsa):** Meminta data dengan header `Authorization: Bearer <token-acak-salah>`. (Ekspektasi: HTTP 401 - "Unauthorized")
- **[ ] Skenario Gagal (Format Header Salah):** Mengirim token tanpa awalan "Bearer " (contoh: `Authorization: <token>`). (Ekspektasi: HTTP 401 - "Unauthorized")

### 4. API: Logout User (`DELETE /api/users/logout`)
- **[ ] Skenario Sukses:** Melakukan aksi logout menggunakan token yang baru saja dibuat saat login. Memastikan balikan sukses, dan *record session* divalidasi kehapus dari tabel database. (Ekspektasi: HTTP 200 - "OK")
- **[ ] Skenario Gagal (Double Logout):** Melakukan aksi logout dua kali dengan token yang sama secara berurutan. (Ekspektasi Kedua: HTTP 401 - "Unauthorized" karena sudah dihapus pada test pertama).
- **[ ] Skenario Gagal (Tanpa Header Auth):** Meminta logout tanpa mengirimkan header `Authorization`. (Ekspektasi: HTTP 401 - "Unauthorized")
- **[ ] Skenario Gagal (Token Tidak Valid):** Meminta logout dengan menggunakan header `Authorization: Bearer <token-yang-salah>`. (Ekspektasi: HTTP 401 - "Unauthorized")
