# Dokumentasi REST API Provinsi Indonesia

## Deskripsi
REST API untuk melakukan operasi CRUD (Create, Read, Update, Delete) terhadap data provinsi di Indonesia. Data provinsi bersumber dari [wilayah.id](https://wilayah.id/).

---

## Setup & Instalasi

### 1. Install Dependencies
```bash
composer install
```

### 2. Konfigurasi Database
Buat file `.env` dan sesuaikan konfigurasi database:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nama_database
DB_USERNAME=username
DB_PASSWORD=password
```

### 3. Jalankan Migration
```bash
php artisan migrate
```

### 4. Seed Data Provinsi
```bash
php artisan db:seed --class=ProvinsiSeeder
```

### 5. Jalankan Server
```bash
php artisan serve
```
Server akan berjalan di `http://localhost:8000`

---

## API Endpoints

### 1. GET /api/provinsi
Menampilkan daftar semua provinsi.

**Request:**
```bash
curl -X GET http://localhost:8000/api/provinsi
```

**Response:**
```json
{
    "success": true,
    "message": "Daftar provinsi berhasil diambil",
    "data": [
        {
            "id": 1,
            "code": "11",
            "name": "Aceh",
            "created_at": "2025-12-25T11:08:17.000000Z",
            "updated_at": "2025-12-25T11:08:17.000000Z"
        },
        ...
    ]
}
```

---

### 2. GET /api/provinsi/{id}
Menampilkan detail provinsi berdasarkan ID.

**Request:**
```bash
curl -X GET http://localhost:8000/api/provinsi/1
```

**Response (Success):**
```json
{
    "success": true,
    "message": "Detail provinsi berhasil diambil",
    "data": {
        "id": 1,
        "code": "11",
        "name": "Aceh",
        "created_at": "2025-12-25T11:08:17.000000Z",
        "updated_at": "2025-12-25T11:08:17.000000Z"
    }
}
```

**Response (Not Found):**
```json
{
    "success": false,
    "message": "Provinsi tidak ditemukan"
}
```

---

### 3. POST /api/provinsi
Menambah provinsi baru.

**Request:**
```bash
curl -X POST http://localhost:8000/api/provinsi \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"code":"99","name":"Provinsi Baru"}'
```

**Body Parameter:**
| Field | Type   | Required | Keterangan              |
|-------|--------|----------|-------------------------|
| code  | string | Ya       | Kode provinsi (unik)    |
| name  | string | Ya       | Nama provinsi           |

**Response (Success - 201):**
```json
{
    "success": true,
    "message": "Provinsi berhasil ditambahkan",
    "data": {
        "id": 39,
        "code": "99",
        "name": "Provinsi Baru",
        "created_at": "2025-12-25T12:00:00.000000Z",
        "updated_at": "2025-12-25T12:00:00.000000Z"
    }
}
```

**Response (Validation Error - 422):**
```json
{
    "success": false,
    "message": "Validasi gagal",
    "errors": {
        "code": ["The code has already been taken."]
    }
}
```

---

### 4. PUT /api/provinsi/{id}
Mengupdate data provinsi berdasarkan ID.

**Request:**
```bash
curl -X PUT http://localhost:8000/api/provinsi/1 \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"name":"Aceh Darussalam"}'
```

**Body Parameter:**
| Field | Type   | Required | Keterangan              |
|-------|--------|----------|-------------------------|
| code  | string | Tidak    | Kode provinsi (unik)    |
| name  | string | Tidak    | Nama provinsi           |

**Response (Success):**
```json
{
    "success": true,
    "message": "Provinsi berhasil diupdate",
    "data": {
        "id": 1,
        "code": "11",
        "name": "Aceh Darussalam",
        "created_at": "2025-12-25T11:08:17.000000Z",
        "updated_at": "2025-12-25T12:00:00.000000Z"
    }
}
```

---

### 5. DELETE /api/provinsi/{id}
Menghapus provinsi berdasarkan ID.

**Request:**
```bash
curl -X DELETE http://localhost:8000/api/provinsi/1 \
  -H "Accept: application/json"
```

**Response (Success):**
```json
{
    "success": true,
    "message": "Provinsi berhasil dihapus"
}
```

**Response (Not Found - 404):**
```json
{
    "success": false,
    "message": "Provinsi tidak ditemukan"
}
```

---

## Struktur File

```
app/
├── Http/Controllers/
│   └── ProvinsiController.php    # Controller CRUD
├── Models/
│   └── Provinsi.php              # Model Provinsi
database/
├── migrations/
│   └── 2025_12_25_120000_create_provinsi_table.php
├── seeders/
│   └── ProvinsiSeeder.php        # Seeder 38 provinsi
routes/
└── api.php                       # Route definitions
```

---

## Teknologi

- **Framework:** Laravel 11
- **Database:** MySQL/SQLite
- **API Type:** RESTful API

---

## Author

Purnama Anugrah - Test Programmer TATI 2025
