# Panduan Push Project ke GitHub & Mengamankan `.env`

Dokumen ini berisi panduan lengkap langkah demi langkah untuk mengunggah (push) project portofolio Anda ke GitHub, serta memastikan file sensitif seperti `.env` (yang berisi kredensial/database URL) **tidak ikut terunggah**.

---

## 🔒 Bagian 1: Mencegah `.env` Ter-push ke GitHub

Untuk mencegah file `.env` atau folder berat seperti `node_modules` masuk ke GitHub, kita menggunakan file khusus bernama **`.gitignore`** di root project.

> [!NOTE]
> Kami sudah membuatkan file [.gitignore](file:///home/hekal/Projects/Portofolio/.gitignore) di root project Anda dengan konfigurasi berikut:
> - Mengabaikan file `.env`, `.env.local`, `client/.env`, dan `server/.env`.
> - Mengabaikan folder `node_modules/` (baik di root, client, maupun server).
> - Mengabaikan folder build output (`dist/`).

### Cara Kerja `.gitignore`
Saat Git mendeteksi file `.gitignore`, Git akan secara otomatis melewatkan file/folder yang terdaftar di dalamnya ketika Anda menjalankan perintah `git add .`. Dengan demikian, file rahasia Anda aman secara lokal dan tidak akan terpublikasi ke internet.

---

## 🚀 Bagian 2: Langkah-Langkah Push ke GitHub

Ikuti langkah-langkah berikut secara berurutan menggunakan terminal di folder root project (`/home/hekal/Projects/Portofolio`):

### Langkah 1: Inisialisasi Git Lokal
Jika project Anda belum menggunakan Git, lakukan inisialisasi terlebih dahulu:
```bash
git init
```

### Langkah 2: Cek Status File
Pastikan `.gitignore` bekerja dengan baik dengan mengecek status file yang akan dilacak oleh Git:
```bash
git status
```
> [!IMPORTANT]
> Pastikan file `.env` **TIDAK muncul** dalam daftar *Untracked files*. Jika folder `node_modules` atau file `.env` masih muncul, periksa kembali isi file `.gitignore` Anda.

### Langkah 3: Tambahkan Semua File dan Buat Commit Pertama
Tambahkan semua project file ke staging area dan lakukan commit:
```bash
git add .
git commit -m "Initial commit: Setup project portofolio"
```

### Langkah 4: Membuat Repositori di GitHub
1. Buka browser dan masuk ke akun [GitHub](https://github.com).
2. Klik tombol **New** (atau klik ikon **+** di pojok kanan atas -> **New repository**).
3. Isi detail repositori Anda:
   - **Repository name**: Isi sesuai keinginan Anda (misalnya: `my-portfolio`).
   - **Public/Private**: Pilih sesuai kebutuhan (disarankan *Public* jika ingin dipamerkan sebagai portofolio, namun jika ada kode yang sangat rahasia selain `.env`, pilih *Private*).
   - **Initialize this repository with**: **JANGAN** centang README, .gitignore, atau License (karena kita sudah memilikinya secara lokal).
4. Klik tombol **Create repository**.

### Langkah 5: Hubungkan Repository Lokal dengan GitHub
Setelah repositori dibuat, GitHub akan menampilkan halaman panduan beserta URL repositori Anda (misalnya: `https://github.com/username/my-portfolio.git`).

Jalankan perintah berikut di terminal lokal Anda (sesuaikan URL dengan milik Anda):
```bash
# Mengubah nama branch default menjadi main
git branch -M main

# Menghubungkan repo lokal ke remote GitHub
git remote add origin https://github.com/username/my-portfolio.git
```

### Langkah 6: Push Code ke GitHub
Terakhir, unggah seluruh kode lokal Anda ke branch `main` di GitHub:
```bash
git push -u origin main
```
*(Jika diminta, masukkan username GitHub dan **Personal Access Token (PAT)** Anda sebagai password. Anda bisa membuat PAT di menu Settings GitHub -> Developer Settings -> Personal Access Tokens).*

---

## 💡 Best Practice: Cara Membagikan Struktur `.env` Tanpa Kredensial

Karena file `.env` tidak di-push ke GitHub, orang lain yang mendownload repository Anda atau server deployment tidak akan mengetahui variabel apa saja yang dibutuhkan agar program bisa berjalan.

Cara mengatasinya adalah dengan membuat file `.env.example`. File ini hanya berisi **kunci variabelnya saja** tanpa nilai rahasianya.

Contoh isi `server/.env.example`:
```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET=rahasia_anda_disini
```

Ketika ada developer lain yang meng-clone project ini, mereka cukup menyalin file `.env.example` menjadi `.env` dan mengisi nilainya sendiri:
```bash
cp .env.example .env
```
*(Anda sudah memiliki file `server/.env.example` di dalam project Anda. Pastikan untuk memperbaruinya jika Anda menambah variabel lingkungan baru).*
