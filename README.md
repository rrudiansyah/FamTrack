# FamTrack Backend

Aplikasi backend yang dibangun untuk menangani manajemen _user_ dan autentikasi, termasuk proses registrasi, login, autentikasi melalui JWT/Bearer Token, manajemen sesi pengguna, serta logout.

## Teknologi Stack

Proyek ini dibangun menggunakan perangkat dan pustaka modern berikut:
- **Runtime**: [Bun](https://bun.sh/) (Sangat cepat dan membawa manajemen _package_ secara bawaan).
- **Framework Web**: [ElysiaJS](https://elysiajs.com/) (Web framework TypeScript yang terkenal ringan dan dioptimasi penuh untuk Bun).
- **Bahasa Pemrograman**: TypeScript.
- **Database Utama**: MySQL.
- **ORM (Object-Relational Mapping)**: [Drizzle ORM](https://orm.drizzle.team/) (Ringan, aman (_type-safe_), dan berkinerja tinggi).
- **Enkripsi Kredensial**: `Bun.password` berbasis enkripsi _Bcrypt_.
- **Testing**: `bun:test` (Pustaka pengujian bawaan Bun).

---

## Arsitektur & Struktur Direktori

Kode aplikasi dipecah berdasarkan tanggung jawab utilitas masing-masing (konsep _Layered Architecture_ berbasis service-route):

- **`/src`**: Folder inti berisikan seluruh kode aplikasi.
  - **`/routes`**: Bertugas menangani rute/URL URL khusus Elysia, mendefinisikan validasi dengan `t.Object`, dan ekstraksi parameter (_request parser_).
    - Format penamaan: `[nama-entitas]-route.ts` (Contoh: `users-route.ts`).
  - **`/services`**: Bertugas menampung seluruh operasi database (_query_) dan *business logic*. Tujuannya agar _router_ tetap tipis.
    - Format penamaan: `[nama-entitas]-service.ts` (Contoh: `users-service.ts`).
  - **`/db`**: Memuat skema database Drizzle dan inisiasi _connection string_. Terdapat `schema.ts` dan `index.ts`.
  - **`index.ts`**: Merupakan titik masuk (_Entry Point_) utama server aplikasi. Menarik semua kumpulan / _plugin_ _route_ dari `/routes`.
- **`/tests`**: Berisi keseluruhan _Unit Tests_.
  - Format penamaan testing: `[nama-fitur].test.ts` (Contoh: `login.test.ts`). Memiliki `setup.ts` sebagai pembersih _state_ database.
- **`/drizzle`**: Menampung *file migration* Drizzle ORM yang dijalankan ke MySQL.

---

## Database Schema

Aplikasi secara struktur memiliki 2 buah relasi tabel utama yakni:

1. **`users`**
   Tabel utama menyimpan profil asli masing-masing _client_.
   - `id`: `serial` (Penanda Utama/Primary Key).
   - `name`: `varchar(255)` (Nama lengkap maksimum).
   - `email`: `varchar(255)` (Email valid, unik dan tak tertimpa).
   - `password`: `varchar(255)` (Sandi ter-*hash* dengan algoritma kuat).
   - `phone`: `varchar(255)` (Nomor ponsel aktif pengguna).
   - `created_at`: `timestamp` (Waktu pencatatan akun).

2. **`sessions`**
   Melayani status "Log Masuk" pengguna yang terautentikasi (sebagai pendamping *token-based JWT*). Akses kontrol ini memperlengkapi fitur mutakhir seperti menendang masuk _session_ dari luar (Bila diterapkan nantinya).
   - `token`: `varchar(255)` (Nilai UUID Acak/Token Bearer sebagai Primary Key).
   - `user_id`: `bigint` (Kunci Asing/Foreign Key mengarah pada tabel `users`).
   - `created_at`: `timestamp` (Waktu token diciptakan).

---

## Daftar Endpoint API

Semua layanan di-*expose* ke _prefix_ `/api`. Respon yang keliru maupun gagal dari sisi pengguna selalu dihindari sebatas limitasi spesifik di `[400/401/422]`, dan `[500]` mengindikasikan server rusak. 

### 1. Registrasi User
- **Method & Path**: `POST /api/users`
- **Tugas**: Mendaftar *user* baru.
- **Body Input**: `{ name, email, password, phone }`
- **Output (Sukses)**: `201 Created` - `{ "data": "Registrasi Berhasil" }`

### 2. Login User
- **Method & Path**: `POST /api/users/login`
- **Tugas**: Mendapatkan akses masuk.
- **Body Input**: `{ email, password }`
- **Output (Sukses)**: `200 OK` - `{ "data": "<UUID Token>" }`

### 3. Dapatkan Profil User Aktif (Get Current User)
- **Method & Path**: `GET /api/users/current`
- **Tugas**: Memperlihatkan metadata dari sesi _Login_.
- **Header Khusus**: `Authorization: Bearer <UUID Token>`
- **Output (Sukses)**: `200 OK` - `{ "data": { id, name, email, createdAt } }`

### 4. Logout User Aktif
- **Method & Path**: `DELETE /api/users/logout`
- **Tugas**: Keluar serta menghancurkan relasi di `sessions`.
- **Header Khusus**: `Authorization: Bearer <UUID Token>`
- **Output (Sukses)**: `200 OK` - `{ "data": "OK" }`

---

## Instalasi & Panduan Pemasangan Lokal (Setup Project)

Pastikan lingkungan lokal Anda sudah siap dan telah ter-_install_ _MySQL_ serta `Bun`.

1. Tarik projek (Clone Repositori).
2. Pergi ke direktori aplikasi via Terminal lalu instal seluruh kebutuhan paket/ _framework_ :
   ```bash
   bun install
   ```
3. Konfigurasikan file `.env` yang berada mendatar di *root* dan masukkan detail alamat relasi Drizzle Anda:
   ```env
   DATABASE_URL="mysql://<user>:<password>@<host>:<port>/<nama_database>"
   ```
4. Aplikasikan migrasi langsung ke MySQL dengan skrip dorong dari Drizzle:
   ```bash
   bun run db:push
   ```

## Cara Menjalankan Aplikasi
Menyalakan *server backend* ini sangat mudah dengan memutar _script runtime watch_ (`dev`) agar otomatis memuat (_reload_) setiap tersimpan perombakan kodingan:
```bash
bun run dev
```
Bila server berhasil dihidupkan, secara _default_ Elysia mendengarkan permintaan jaringan pada soket `http://localhost:3000`.

## Cara Menjalankan Ujian Komprehensif (Unit Testing)
Di belakang layar *unit tests* dibangun di folder `/tests/`. Saat prosedur unit test hidup, mekanisme `setup.ts` meluncurkan pembersihan gencar untuk menghindari tumpang tindih (_overlapping data_) dari setiap blok perisai sehingga menjamin integritas _test_ konsisten.
Anda cukup memanggil perintah tes tunggal dari _interpreter_ `Bun` langsung:
```bash
bun test
```
