# 🚀 Personal Portfolio Website + Admin Panel

Website portofolio personal yang dinamis dengan Admin Panel terintegrasi.

## Tech Stack
- **Frontend**: React JS + Tailwind CSS (Vite)
- **Backend**: Node.js + Express.js (REST API)
- **Database**: MySQL

## Cara Setup & Jalankan

### 1. Setup Database MySQL
```bash
# Login ke MySQL
mysql -u root -p

# Import schema
source /path/to/Portofolio/database/schema.sql
```

### 2. Setup Backend
```bash
cd server

# Salin dan edit environment variables
cp .env.example .env
# Edit .env: isi DB_PASSWORD dengan password MySQL Anda

# Install dependencies (sudah dilakukan)
npm install

# Jalankan server
npm run dev
```
Server berjalan di: **http://localhost:5000**

### 3. Setup Frontend
```bash
cd client

# Jalankan development server
npm run dev
```
Frontend berjalan di: **http://localhost:5173**

## Akses

| URL | Keterangan |
|-----|-----------|
| http://localhost:5173 | Portfolio publik |
| http://localhost:5173/admin/login | Admin panel login |

### Kredensial Admin Default
- **Email**: `admin@portfolio.com`
- **Password**: `admin123`

## Struktur Proyek
```
Portofolio/
├── client/         ← React frontend
├── server/         ← Express backend
└── database/       ← SQL schema
    └── schema.sql
```

## Fitur
- ✅ Hero Section dinamis dengan animasi
- ✅ Stats counter dengan animasi angka
- ✅ Services grid
- ✅ Projects showcase dengan filter kategori
- ✅ Certificates grid
- ✅ About section
- ✅ Admin Panel dengan JWT auth
- ✅ Profile & foto management
- ✅ Projects CRUD + upload gambar
- ✅ Certificates CRUD + upload gambar
- ✅ Job Tracker (Kanban + Tabel view)
