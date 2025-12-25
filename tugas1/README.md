
# Sistem Log Harian Pegawai - Pemerintah Daerah X

## Deskripsi
Aplikasi ini adalah sistem log harian pegawai berbasis Laravel API dan React (Vite) untuk Pemerintah Daerah X. Setiap pegawai dapat menginput log harian, diverifikasi atasan sesuai struktur organisasi.

## Fitur Utama
- CRUD log harian pegawai
- Status log: Pending, Disetujui, Ditolak
- Verifikasi log oleh atasan langsung
- Statistik dashboard
- Visualisasi struktur organisasi
- Responsive design

## Struktur Pegawai (Sample)
- Kepala Dinas
  - Kepala Bidang 1
    - Staff 1
  - Kepala Bidang 2
    - Staff 2

## Akun Demo
| Posisi            | Email                        | Password     |
|-------------------|-----------------------------|--------------|
| Kepala Dinas      | kepala.dinas@pemda.go.id    | password123  |
| Kepala Bidang 1   | kepala.bidang1@pemda.go.id  | password123  |
| Kepala Bidang 2   | kepala.bidang2@pemda.go.id  | password123  |
| Staff Bidang 1    | staff1@pemda.go.id          | password123  |
| Staff Bidang 2    | staff2@pemda.go.id          | password123  |

---

## Cara Menjalankan dengan Docker Compose

### 1. Pastikan sudah terinstall:
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### 2. Jalankan perintah berikut di folder project:

```bash
docker compose up --build
```

- Backend Laravel akan berjalan di: http://localhost:8000
- Frontend React akan berjalan di: http://localhost:5173

Catatan: Anda tidak perlu membuka URL backend (http://localhost:8000) di browser. Backend cukup berjalan sebagai API, dan frontend (http://localhost:5173) akan melakukan request ke API tersebut.

### 3. Login ke aplikasi
Buka browser ke http://localhost:5173 dan login menggunakan salah satu akun demo di atas.

### 4. Fitur Utama
- **Log Harian:** Tambah/edit/hapus log harian, status otomatis "Pending".
- **Verifikasi:** Atasan dapat menyetujui/menolak log bawahan.
- **Struktur Organisasi:** Lihat hierarki pegawai.
- **Dashboard:** Statistik log dan verifikasi.

### 5. Reset Data
Setiap kali container backend dijalankan, database akan di-reset dan diisi data sample otomatis.


## Pengembangan Lokal (Opsional)
Jika ingin menjalankan tanpa Docker:

### Backend
```bash
cd tugas1
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve
```

### Frontend
```bash
cd tugas1/frontend
bun install # atau npm install
bun run dev # atau npm run dev
```

---

## Lisensi
MIT
