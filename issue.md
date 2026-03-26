# Perencanaan: Penambahan Fitur Swagger API Documentation

## Deskripsi Tugas
Dibutuhkan implementasi Swagger UI untuk dokumentasi interaktif seluruh API yang ada di aplikasi FamTrack. Tujuannya adalah agar *user* lain atau *front-end developer* yang ingin menggunakan API di aplikasi ini dapat dengan mudah melihat spesifikasi *endpoint* (URL, metode HTTP, struktur *request body*, dan *header* yang dibutuhkan) serta dapat langsung mengujinya melalui antarmuka browser tanpa harus murni menggunakan cURL/Postman dari nol.

## Persyaratan Teknis
- Memanfaatkan _plugin_ resmi bawaan ekosistem framework saat ini: `@elysiajs/swagger`.
- Antarmuka (UI) Swagger harus di-_expose_ atau dapat diakses melalui rute `/swagger`.
- Semua *endpoint* Users (`/api/users/*`) sudah otomatis terdeteksi karena ElysiaJS menggunakan pustaka _TypeBox_, namun harus dikelompokkan biar rapi.

---

## Tahapan Implementasi (Panduan Detail untuk Junior Programmer / AI)

Untuk mengimplementasikan fitur ini, jalankan langkah-langkah sistematis berikut:

### Langkah 1: Instalasi Dependensi Swagger
Buka terminal pada direktori proyek utama, lalu instal *plugin* Swagger untuk Elysia:
```bash
bun add @elysiajs/swagger
```

### Langkah 2: Daftarkan Plugin di Entry Point Utama
Buka file **`src/index.ts`**.
1. Lakukan *import* modul Swagger di bagian atas:
   ```typescript
   import { swagger } from '@elysiajs/swagger';
   ```
2. Sisipkan pemanggilan `.use(swagger(...))` ke dalam *instance* aplikasi Elysia (`app`). **Pastikan pemanggilan `.use(swagger())` diletakkan lebih atas / sebelum** pemanggilan `.use(usersRoute)`. Ini penting agar Swagger mampu memindai semua rute di bawahnya.
   
   Contoh penerapan kode:
   ```typescript
   export const app = new Elysia()
     .use(swagger({
       documentation: {
         info: {
           title: 'FamTrack API',
           version: '1.0.0',
           description: 'API Documentation for FamTrack Application'
         }
       }
     }))
     .get('/', () => 'Hello dari Elysia')
     .use(usersRoute)
     .listen(3000);
   ```

### Langkah 3: Beri Label / Metadata pada Setiap Endpoint (Opsional tapi Krusial)
*Secara default, Elysia otomatis membuat skema Swagger berdasarkan tipe parameter (TypeBox). Namun rute akan terlihat berantakan.* Untuk merapikannya, buka **`src/routes/users-route.ts`** dan berikan properti `detail` pada tiap rute.

Contoh pada rute *Registrasi User* (`.post('/')`):
Tambahkan `detail` di dalam objek parameter _options_ (sebelah definisi `body`):
```typescript
  }, {
    body: t.Object({
      name: t.String({ maxLength: 255 }),
      email: t.String({ format: 'email' }),
      // ...
    }),
    detail: {
      tags: ['Users'], // Untuk mengelompokkan kategori API
      summary: 'Registrasi User Baru', // Judul endpoint
      description: 'Mendaftarkan pengguna baru dengan email dan password.'
    }
  })
```
Lakukan penambahan atribut `detail:` (tags dan summary) yang serupa pada endpoint `.post('/login')`, `.get('/current')`, dan `.delete('/logout')`.

### Langkah 4: Pengujian Lokal
1. Jalankan aplikasi seperti biasa:
   ```bash
   bun run dev
   ```
2. Buka *browser* pilihan Anda dan kunjungi URL: `http://localhost:3000/swagger`.
3. Periksa tampilan UI Swagger yang muncul, pastikan nama API yang Anda konfigurasi di `src/index.ts` sudah tergambar dengan benar.
4. Coba tes salah satu endpoint (misal: registrasi atau login) langsung menggunakan tombol *"Try it out"* di dalam UI-nya.
