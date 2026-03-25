# Issue: Implementasi Endpoint Get Current User

## Deskripsi
Dibutuhkan sebuah API endpoint untuk mengambil data user yang saat ini sedang login (current user) berdasarkan token sesi (session token) yang dikirimkan melalui header `Authorization`.

## Spesifikasi API Endpoint

- **Endpoint URL:** `GET /api/users/current`

**Headers Request:**
- `Authorization`: Bearer `<token>`
  *(Dimana `<token>` adalah token UUID yang tersimpan di tabel `sessions` saat proses login)*

**Response Body - Success (200 OK):**
```json
{
    "data": {
        "id": 1,
        "name": "eko",
        "email": "eko@localhost",
        "created_at": "timestamp"
    }
}
```

**Response Body - Error (401 Unauthorized):**
*(Jika token tidak ada, tidak valid, atau sesi sudah kedaluwarsa/tidak ditemukan di database)*
```json
{
    "error": "Unauthorized"
}
```

## Struktur File dan Folder
Kode aplikasi ditempatkan di dalam folder `src` dengan struktur sebagai berikut:
- **`src/routes/`**: Berisi definisi routing ElysiaJS untuk menangani HTTP request dan response.
  - Nama file target: `users-route.ts`
- **`src/services/`**: Berisi business logic, interaksi database, dan validasi.
  - Nama file target: `users-service.ts`

---

## Tahapan Implementasi (Panduan untuk Junior Programmer / AI)

Untuk mengimplementasikan fitur **Get Current User**, ikuti langkah-langkah sistematis berikut:

### Langkah 1: Buat Business Logic (Get Current User) di `src/services/users-service.ts`

1. Buka file `src/services/users-service.ts`.
2. Buat fungsi baru, misalnya `getCurrentUser(token: string)`.
3. **Validasi Input:** Jika parameter `token` kosong, langsung *throw error* (misalnya throw Error('Unauthorized')).
4. **Query Database:**
   - Lakukan query ke database menggunakan Drizzle ORM.
   - Anda perlu melakukan `JOIN` antara tabel `sessions` dan tabel `users`.
   - Cari data `sessions` yang memiliki nilai `token` sama dengan string token yang diberikan.
5. **Pengecekan Hasil Query:**
   - Jika query tidak menemukan data sesi (artinya token tidak valid/tidak ada di DB), *throw error* dengan pesan `"Unauthorized"`.
6. **Return Data:**
   - Jika data ditemukan, kembalikan (return) informasi user (`id`, `name`, `email`, `created_at`) dalam format objek yang sesuai dengan spesifikasi response sukses:
     ```typescript
     {
         data: {
             id: user.id,
             name: user.name,
             email: user.email,
             created_at: user.createdAt
         }
     }
     ```

### Langkah 2: Buat Endpoint API di `src/routes/users-route.ts`

1. Buka file `src/routes/users-route.ts`.
2. Tambahkan endpoint baru dengan method `GET /current` setelah definisi endpoint yang sudah ada.
3. **Ekstrak Header Authorization:**
   - Pada handler ElysiaJS, akses object `headers`.
   - Ambil nilai dari header `authorization`. (Perhatikan bahwa header HTTP biasanya *case-insensitive* namun di library sering dibaca sebagai *lowercase* `authorization`).
4. **Parsing Token Bearer:**
   - Nilai header authorization biasanya formatnya `"Bearer <token>"`.
   - Cek apakah header tersebut ada dan dimulai dengan kata `"Bearer "`.
   - Ekstrak *string* token UUID-nya dari header tersebut (misal dengan membuang kata "Bearer " di depannya).
   - Jika header tidak ada atau formatnya salah, kembalikan response status `401 Unauthorized` dengan object `{"error": "Unauthorized"}`.
5. **Panggil Service:**
   - Gunakan blok `try-catch`.
   - Di dalam blok `try`, panggil fungsi `usersService.getCurrentUser(token)` yang dibuat pada Langkah 1.
   - Kembalikan hasil (`result`) dari service tersebut ke client.
6. **Tangani Response Error:**
   - Di dalam blok `catch`, set HTTP status code menjadi `401 Unauthorized`.
   - Kembalikan JSON body `{"error": "Unauthorized"}`.

### Langkah 3: Testing Endpoint

1. Pastikan server Elysia berjalan (misal `bun run dev`).
2. Gunakan REST Client (Postman/Hoppscotch/cURL) untuk melakukan pengujian **GET** ke `http://localhost:<port>/api/users/current`.
3. **Skenario Gagal:**
   - Kirim *request* TANPA menyertakan header Authorization. Pastikan mendapat balikan HTTP status `401` dengan body `{"error": "Unauthorized"}`.
   - Kirim *request* DENGAN menyertakan header Authorization dengan Bearer token sembarang ("Bearer token-ngasal-123"). Pastikan mendapat balikan HTTP status `401` dengan body `{"error": "Unauthorized"}`.
4. **Skenario Sukses:**
   - Dapatkan token valid dengan melakukan request login (`POST /api/users/login`) ke server.
   - Ambil nilai token dari property `data` pada response body login.
   - Kirim *request* **GET** ke `http://localhost:<port>/api/users/current` DENGAN menyertakan header `Authorization` bernilai `"Bearer <token-valid-tadi>"`.
   - Pastikan mendapat balikan HTTP OK `200` dan body response berisi data user sesuai struktur yang ditentukan.
