# Bug: Error 500 saat Registrasi dengan Nama Lebih dari 255 Karakter

## Deskripsi Masalah

Saat ini, jika seorang pengguna mencoba melakukan registrasi (`POST /api/users`) dan memasukkan *field* `name` yang panjangnya melebihi 255 karakter, *server* akan memunculkan respons **HTTP 500 Internal Server Error** dengan pesan `"Terjadi kesalahan pada server"`. 

Hal ini disebabkan karena pada definisi *schema* database (`src/db/schema.ts`), kolom `name` telah ditentukan sebagai `varchar(255)`. Ketika string dengan panjang lebih dari 255 karakter dikirim untuk di-insert, *database* (MySQL) akan menolak proses *insert* (`Data too long for column 'name'`), yang menyebabkan fungsi tersebut *crash* dan ditangkap oleh blok `catch` secara umum sehingga menghasilkan *error* HTTP 500.

Seharusnya, validasi dilakukan di tingkat rute API (Elysia) sebelum menyentuh layer *database*. Jika nilai `name` terlalu panjang, API harus mengembalikan _client error_ (seperti `422 Unprocessable Entity` atau `400 Bad Request`) sehingga penanganannya lebih jelas baik bagi *frontend* maupun penggunanya.

## Ekspetasi (Expected Behavior)
1. Permintaan pendaftaran dengan atribut `name` > 255 karakter harus langsung ditolak sebelum query DB dieksekusi.
2. Respons HTTP harus berupa status `400` atau `422` yang menandakan *error* validasi input dari *client*.

## Struktur Folder Pekerjaan
- `src/routes/users-route.ts` (File tempat validasi didefinisikan)

---

## Tahapan Penyelesaian (Panduan untuk Junior Programmer / AI)

Untuk memperbaiki masalah ini, ikuti langkah-langkah di bawah ini:

### Langkah 1: Tambahkan Validasi pada Router Elysia
1. Buka file `src/routes/users-route.ts`.
2. Cari definisi *endpoint* untuk registrasi yaitu baris kode yang berbunyi `post('/', async ({ body, set }) => { ... })`.
3. Di akhir deklarasi *endpoint* tersebut, kamu akan menemukan bagian definisi parameter *body* yang menggunakan Elysia TypeBox (`t.Object`).
4. Pada properti `name`, ubah validasi dari `t.String()` menjadi `t.String({ maxLength: 255 })`.
5. Opsional namun disarankan: Jika dirasa perlu, tambahkan opsi `maxLength` juga pada opsi string lain (sesuai panjang di *database schema* jika relevan).

*Contoh implementasi perbaikan pada blok akhir router registrasi:*

```typescript
  body: t.Object({
    name: t.String({ maxLength: 255 }), // Tambahkan aturan panjang maksimum
    email: t.String({ format: 'email' }),
    password: t.String(),
    phone: t.String(),
  })
```

### Langkah 2: Lakukan Pengujian Validasi
1. Pastikan *server* berhasil berjalan lokal (`bun run dev`).
2. Gunakan *tool* API testing (cURL, Postman, REST Client, atau via skrip *fetch*).
3. **Coba Skenario Gagal (Invalid):**
   Lakukan request `POST http://localhost:3000/api/users` dengan parameter `name` berisikan lebih dari 255 karakter (misal string "A" sebanyak 300 kali).
   - Server **TIDAK BOLEH** mengembalikan status HTTP 500.
   - Server harus mengembalikan status `422` (default Elysia error status) berisikan struktur JSON penjelasan bahwa validasi `name` telah gagal ("Expected string length less or equal to 255").
4. **Coba Skenario Sukses (Valid):**
   Lakukan request dengan `name` yang valid (<= 255 karakter). Pastikan proses pendaftaran berjalan sukses dan mendapatkan status `201 Created`.
