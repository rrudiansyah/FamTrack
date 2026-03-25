# Issue: Implementasi Fitur Registrasi Pengguna & Login
 
 ## Deskripsi
 Dibutuhkan sebuah API untuk melakukan registrasi pengguna baru dan juga login pengguna. Fitur ini meliputi pembuatan database, tabel pengguna (`users`), tabel sesi (`sessions`), dan endpoint API menggunakan framework ElysiaJS.
 
 ## 1. Spesifikasi Database & Tabel
 - **Nama Database:** `farmtrack_db`
 - **Tabel Utama:** `users`
 - **Tabel Baru:** `sessions`
 
 **Schema Tabel `users`:**
 - `id`: `int` (Auto Increment, Primary Key)
 - `name`: `varchar(255)` (Not Null)
 - `email`: `varchar(255)` (Not Null, Unique)
 - `password`: `varchar(255)` (Not Null) -> *Harus berupa hash dari bcrypt*
 - `phone`: `varchar(255)` (Not Null)
 - `created_at`: `timestamp` (Default: `CURRENT_TIMESTAMP`)
 
 **Schema Tabel `sessions`:**
 - `id`: `int` (Auto Increment, Primary Key)
 - `token`: `varchar(255)` (Not Null) -> *Isinya UUID untuk token user yang login*
 - `user_id`: `integer` (Foreign Key ke tabel `users`)
 - `created_at`: `timestamp` (Default: `CURRENT_TIMESTAMP`)
 
 ## 2. Spesifikasi API Endpoint
 
 ### A. Endpoint Registrasi
 - **Endpoint URL:** `POST /api/users`
 
 **Request Body (JSON):**
 ```json
 {
     "name": "eko",
     "email": "eko@localhost",
     "password": "rahasia",
     "phone": "08123456"
 }
 ```
 
 **Response Body - Success (200 / 201):**
 ```json
 {
     "data": "Registrasi Berhasil"
 }
 ```
 
 **Response Body - Error (400 / 409):**
 ```json
 {
     "error": "Email sudah terdaftar"
 }
 ```
 
 ### B. Endpoint Login
 - **Endpoint URL:** `POST /api/users/login`
 
 **Request Body (JSON):**
 ```json
 {
     "email": "eko@localhost",
     "password": "rahasia"
 }
 ```
 
 **Response Body - Success (200):**
 ```json
 {
     "data": "token"
 }
 ```
 
 **Response Body - Error (401 / 400):**
 ```json
 {
     "error": "Email atau password salah"
 }
 ```
 
 ## 3. Struktur File dan Folder
 Kode aplikasi harus ditempatkan di dalam folder `src` dengan struktur sebagai berikut:
 - **`src/routes/`**: Berisi definisi routing ElysiaJS untuk menangani HTTP request dan response.
   - Nama file: `users-route.ts`
 - **`src/services/`**: Berisi business logic, seperti validasi data ekstra, hashing password, pengecekan password, pembuatan token, dan interaksi dengan database.
   - Nama file: `users-service.ts`
 
 ---
 
 ## Tahapan Implementasi (Panduan untuk Junior Programmer / AI)
 
 Untuk mengimplementasikan fitur **Login**, ikuti langkah-langkah sistematis berikut:
 
 ### Langkah 1: Update Skema Database (Tabel Sessions)
 1. Buka file definisi skema Drizzle ORM Anda (misalnya `src/db/schema.ts`).
 2. Tambahkan definisi tabel baru `sessions` berdasarkan skema di atas (`id`, `token`, `user_id` FK ke users, `created_at`).
 3. Jalankan perintah migrasi Drizzle untuk mengaplikasikan tabel ini ke database MySQL/PostgreSQL (misal: `bun run db:push`).
 
 ### Langkah 2: Buat Business Logic Login di `src/services/users-service.ts`
 1. Buka file `src/services/users-service.ts`.
 2. Buat fungsi baru untuk proses login (misal: `loginUser(payload)`).
 3. **Pengecekan User:** Lakukan query ke database `users` mencari user dengan email yang diberikan.
    - Jika user tidak ditemukan, lempar error (throw error) dengan pesan `"Email atau password salah"`.
 4. **Verifikasi Password:** Gunakan library bcrypt (atau `Bun.password.verify`) untuk membandingkan password dari request body (plain text) dengan password di database (hashed).
    - Jika tidak cocok, lempar error dengan pesan `"Email atau password salah"`.
 5. **Generate Token:** Buat UUID unik (menggunakan `crypto.randomUUID()` atau library sejenis) untuk sesi login ini.
 6. **Simpan Sesi:** Insert record baru ke tabel `sessions` dengan `token` yang dibuat dan `user_id` dari user yang berhasil diverifikasi.
 7. **Return Token:** Kembalikan nilai UUID token yang baru saja di-generate dari fungsi ini.
 
 ### Langkah 3: Buat Endpoint Login di `src/routes/users-route.ts`
 1. Buka file `src/routes/users-route.ts`.
 2. Tambahkan endpoint baru dengan method `POST /api/users/login`.
 3. **Validasi Request Body:** Gunakan tipe data / TypeBox (misal `t.Object`) untuk memastikan body request memiliki string `email` dan `password`.
 4. **Panggil Service:** Di dalam handler block endpoint, bungkus pemanggilan menggunakan `try-catch`. Panggil fungsi `loginUser` yang dibuat pada Langkah 2.
 5. **Tangani Response:**
    - Jika di dalam `try` berhasil, kirimkan format respons json `{"data": "<token-dari-service>"}`.
    - Jika masuk ke blok `catch` dan message errornya adalah "Email atau password salah", ubah status HTTP menjadi status Client Error (misal 401 Unauthorized atau 400 Bad Request) dan kirimkan respons `{"error": "Email atau password salah"}`.
 
 ### Langkah 4: Testing Endpoint Login
 1. Pastikan server Elysia berjalan (misal `bun run dev`).
 2. Gunakan REST Client (Postman/Hoppscotch/cURL) untuk melakukan pengujian **POST** ke `http://localhost:<port>/api/users/login`.
 3. Kirim kredensial (email & password) asalkan (salah), dan pastikan balikan response adalah 40X dengan body `{"error": "Email atau password salah"}`.
 4. Kirim kredensial (email & password) yang valid. Pastikan respon adalah HTTP OK 200 dengan nilai UUID dari sesi tersebut di key `data`.
 5. Verifikasi di *database (HeidiSQL/TablePlus)* bahwa terdapat entry baru di dalam tabel `sessions` dengan `token` dan `user_id` yang sesuai.
