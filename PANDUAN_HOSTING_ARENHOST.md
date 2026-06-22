# Panduan Deployment Proyek Portfolio ke ArenHost 🚀

Dokumen ini berisi panduan langkah-demi-langkah (step-by-step) untuk menghosting proyek Portfolio Anda (React frontend + Express backend + MariaDB/MySQL database) di **ArenHost**.

ArenHost menyediakan dua jenis layanan utama yang bisa Anda gunakan:
1. **Metode A: Cloud VPS (Sangat Direkomendasikan)** — Memberikan kontrol penuh, performa terbaik, dan setup yang lebih bersih menggunakan PM2 dan Nginx.
2. **Metode B: Shared Hosting / Cloud Hosting cPanel** — Lebih murah dan mudah dikelola tanpa perlu memikirkan manajemen OS server, menggunakan fitur "Setup Node.js App" di cPanel.

---

## 🛠️ Persiapan Sebelum Memulai

Sebelum melakukan deployment, pastikan Anda telah menyiapkan:
- Akun aktif di [ArenHost](https://www.arenhost.id/).
- Domain yang sudah aktif (misal: `domainkamu.com`) dan sudah diarahkan DNS-nya ke IP VPS atau Server Hosting ArenHost Anda.
- Jika menggunakan VPS, pastikan Anda bisa terhubung menggunakan SSH.
- Skema database dari file [schema.sql](file:///home/hekal/Projects/Portofolio/database/schema.sql).

---

## 💻 METODE A: Deployment Menggunakan Cloud VPS (Rekomendasi Utama)

Metode ini menggunakan VPS berbasis Ubuntu (direkomendasikan Ubuntu 22.04 LTS atau 24.04 LTS).

### Langkah 1: Konek ke VPS & Install Dependency
Masuk ke VPS Anda menggunakan SSH:
```bash
ssh root@ip_address_vps_kamu
```

Perbarui paket sistem dan install Node.js, MariaDB, Nginx, Git, dan tools lainnya:
```bash
# Update package list
sudo apt update && sudo apt upgrade -y

# Install Node.js (Versi 20 LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MariaDB Server (MySQL)
sudo apt install mariadb-server -y

# Install Nginx & Git
sudo apt install nginx git -y

# Install PM2 secara global (untuk menjaga backend tetap berjalan)
sudo npm install -p pm2 -g
```

### Langkah 2: Setup Database MariaDB/MySQL
Jalankan konfigurasi keamanan database:
```bash
sudo mysql_secure_installation
```
*(Ikuti petunjuk di layar: atur password root baru, lalu jawab `Y` untuk semua pertanyaan keamanan)*.

Masuk ke MySQL console untuk membuat database dan user:
```bash
sudo mysql -u root -p
```

Di dalam MySQL console, jalankan query berikut:
```sql
CREATE DATABASE portfolio_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'portfolio_user'@'localhost' IDENTIFIED BY 'PasswordKuatKamu123!';
GRANT ALL PRIVILEGES ON portfolio_db.* TO 'portfolio_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Langkah 3: Clone Proyek & Konfigurasi Backend
Pindahkan direktori kerja ke `/var/www/` dan clone proyek Anda (atau upload menggunakan SFTP/FileZilla):
```bash
cd /var/www
# Ganti url di bawah dengan repo github Anda atau upload file langsung
git clone https://github.com/username/Portofolio.git portfolio
cd portfolio/server
```

Install dependency backend:
```bash
npm install --production
```

Buat file `.env` untuk backend:
```bash
cp .env.example .env
nano .env
```

Sesuaikan isi `.env` dengan kredensial produksi Anda:
```env
PORT=5000
NODE_ENV=production

# Database MySQL
DB_HOST=localhost
DB_USER=portfolio_user
DB_PASSWORD=PasswordKuatKamu123!
DB_NAME=portfolio_db
DB_PORT=3306

# JWT Secret (Ganti dengan string random yang panjang)
JWT_SECRET=BuatStringRandomPanjangDisiniGantiSaatProduksi
JWT_EXPIRES_IN=7d

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# URL Frontend (sesuaikan dengan domain Anda)
CLIENT_URL=https://domainkamu.com
```
*(Tekan `Ctrl+O` lalu `Enter` untuk menyimpan, dan `Ctrl+X` untuk keluar dari editor nano)*.

Import skema database Anda:
```bash
mysql -u portfolio_user -p portfolio_db < ../database/schema.sql
```
*(Masukkan password `PasswordKuatKamu123!` yang Anda buat di Langkah 2)*.

### Langkah 4: Jalankan Backend dengan PM2
Agar backend berjalan terus di background meskipun terminal SSH ditutup, gunakan PM2:
```bash
pm2 start server.js --name "portfolio-backend"

# Buat PM2 otomatis berjalan saat VPS reboot/restart
pm2 startup
pm2 save
```

### Langkah 5: Build dan Siapkan Frontend
Masuk ke folder client:
```bash
cd ../client
```

Buat file `.env` untuk konfigurasi API URL frontend:
```bash
nano .env
```
Isi dengan URL API backend Anda (melalui domain):
```env
VITE_API_URL=https://domainkamu.com/api
```

Install dependency client dan lakukan build:
```bash
npm install
npm run build
```
Proses ini akan menghasilkan folder `/var/www/portfolio/client/dist` yang berisi file HTML/JS/CSS statis.

### Langkah 6: Konfigurasi Nginx Web Server
Hapus konfigurasi default Nginx dan buat konfigurasi baru:
```bash
sudo rm /etc/nginx/sites-enabled/default
sudo nano /etc/nginx/sites-available/portfolio
```

Masukkan konfigurasi berikut (sesuaikan `domainkamu.com` dengan domain Anda):
```nginx
server {
    listen 80;
    server_name domainkamu.com www.domainkamu.com;

    # Folder static build React Frontend
    root /var/www/portfolio/client/dist;
    index index.html;

    # Handle React Router (SPA) routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy untuk Express Backend API
    location /api {
        proxy_pass http://localhost:5000/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Proxy untuk Static Upload Images dari Backend
    location /uploads {
        proxy_pass http://localhost:5000/uploads;
        proxy_set_header Host $host;
    }
}
```

Aktifkan konfigurasi dan restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
sudo nginx -t  # Tes jika ada syntax error
sudo systemctl restart nginx
```

### Langkah 7: Setup SSL HTTPS Gratis (Let's Encrypt)
Jalankan perintah berikut untuk menginstall Certbot SSL:
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d domainkamu.com -d www.domainkamu.com
```
*(Ikuti instruksi, pilih opsi untuk redirect seluruh traffic HTTP ke HTTPS secara otomatis)*.

🎉 **Selesai!** Proyek Anda kini berjalan dengan aman menggunakan HTTPS di `https://domainkamu.com`.

---

## 🌐 METODE B: Deployment Menggunakan Shared Hosting cPanel

Jika Anda membeli paket Web Hosting (cPanel) di ArenHost, ikuti metode ini.

### Langkah 1: Buat Database di cPanel
1. Login ke **cPanel** ArenHost Anda.
2. Cari menu **MySQL® Database Wizard**.
3. Buat database baru (misal: `usercpanel_portfolio_db`).
4. Buat user database baru (misal: `usercpanel_portfolio_user`) dan catat password-nya.
5. Centang **ALL PRIVILEGES** untuk menghubungkan user ke database tersebut.
6. Kembali ke dashboard cPanel, buka **phpMyAdmin**.
7. Pilih database yang baru dibuat, klik menu **Import**, pilih file `schema.sql` dari komputer Anda (terdapat di folder `database/schema.sql`), lalu klik **Go** / **Kirim**.

### Langkah 2: Setup Aplikasi Node.js untuk Backend
1. Di cPanel, cari menu **Setup Node.js App** (di bawah kategori Software).
2. Klik tombol **Create Application**.
3. Konfigurasikan sebagai berikut:
   - **Node.js version**: Pilih versi terbaru (misal: `20.x`).
   - **Application Mode**: `Production`
   - **Application root**: `portfolio-backend` (folder ini akan dibuat otomatis di luar public_html).
   - **Application URL**: `domainkamu.com/api` (atau gunakan subdomain seperti `api.domainkamu.com`).
   - **Application startup file**: `server.js`
4. Klik **Create**. Aplikasi akan mulai berjalan.
5. Setelah terbuat, scroll ke bagian bawah halaman dan klik **Stop App** terlebih dahulu karena kita harus mengupload source code backend-nya dahulu.

### Langkah 3: Upload Source Code Backend
1. Masuk ke **File Manager** cPanel.
2. Buka folder `portfolio-backend` (terletak di direktori utama, sejajar dengan `public_html`).
3. Kompres folder `server` di komputer lokal Anda menjadi file `.zip` (Kecuali folder `node_modules`).
4. Upload file `.zip` tersebut ke folder `portfolio-backend` di File Manager, lalu ekstrak/extract. Pastikan file `server.js` dan folder `src` langsung berada di dalam `/portfolio-backend/`.
5. Di folder `portfolio-backend/`, buat file bernama `.env` lalu masukkan konfigurasi database cPanel Anda:
   ```env
   PORT=5000
   NODE_ENV=production
   DB_HOST=127.0.0.1
   DB_USER=usercpanel_portfolio_user
   DB_PASSWORD=PasswordDatabaseCpanelAnda
   DB_NAME=usercpanel_portfolio_db
   DB_PORT=3306
   JWT_SECRET=BuatStringRandomKunciKeamananCpanel
   JWT_EXPIRES_IN=7d
   UPLOAD_PATH=./uploads
   MAX_FILE_SIZE=5242880
   CLIENT_URL=https://domainkamu.com
   ```
6. Buka kembali menu **Setup Node.js App** di cPanel.
7. Di bagian konfigurasi aplikasi Anda, klik **Edit** (ikon pensil).
8. Cari kolom **Run npm install** lalu klik tombol tersebut untuk menginstall seluruh package backend secara otomatis.
9. Setelah instalasi selesai, klik **Start App**.

### Langkah 4: Build & Upload Frontend (React Vite)
Karena hosting cPanel umumnya tidak mendukung build tool React (Vite) secara langsung dengan efisien, kita akan membild frontend secara lokal di komputer kita terlebih dahulu.

1. Di komputer lokal Anda, buka file `client/.env` dan ubah URL API ke url produksi cPanel Anda:
   ```env
   VITE_API_URL=https://domainkamu.com/api
   ```
2. Jalankan perintah build di terminal komputer lokal Anda (di folder `/client`):
   ```bash
   npm run build
   ```
3. Proses ini menghasilkan folder `/client/dist/`.
4. Kompres seluruh isi folder `dist/` (bukan folder dist nya, melainkan isinya seperti `assets/`, `index.html`, dll.) menjadi file `.zip`.
5. Masuk ke **File Manager** cPanel, masuk ke folder `public_html`.
6. Upload file `.zip` tersebut ke `public_html` dan ekstrak.

### Langkah 5: Konfigurasi Routing React Router (SPA) di cPanel
Agar routing React Router bekerja saat halaman di-refresh (mencegah error 404), kita perlu membuat file `.htaccess` di dalam `public_html`:

1. Di **File Manager** cPanel, masuk ke `public_html`.
2. Klik **+ File** di bagian atas untuk membuat file baru dengan nama `.htaccess`.
3. Jika file sudah ada, klik kanan lalu **Edit**.
4. Masukkan kode berikut:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     
     # Jangan rewrite jika url mengarah ke backend API /api
     RewriteRule ^api - [L,NC]
     
     # Jangan rewrite jika url mengarah ke backend uploads /uploads
     RewriteRule ^uploads - [L,NC]
     
     # Kirim semua request lain ke index.html untuk dihandle React Router
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```
5. Klik **Save Changes**.

### Langkah 6: Install SSL Gratis di cPanel
1. Cari menu **Lets Encrypt™ SSL** atau **AutoSSL** di cPanel.
2. Pilih domain utama Anda (`domainkamu.com` dan `www.domainkamu.com`).
3. Klik **Issue** untuk membuat sertifikat SSL gratis secara otomatis.

🎉 **Selesai!** Proyek Anda sekarang berhasil di-host di cPanel ArenHost dan berjalan secara normal.

---

## 🔍 Troubleshooting Umum

### 1. Error: "Internal Server Error" atau "Cannot GET /"
- **Penyebab**: Koneksi database gagal atau startup script error.
- **Solusi**: Periksa log backend Anda.
  - *Di VPS*: Jalankan `pm2 logs portfolio-backend` untuk melihat log error secara detail.
  - *Di cPanel*: Buka menu **Setup Node.js App**, lihat path log file yang tercantum di bagian bawah halaman.

### 2. Gambar Upload tidak Muncul
- **Penyebab**: Folder `uploads` di backend tidak memiliki izin tulis (write permission) atau file dipindahkan ke direktori yang salah.
- **Solusi**: Pastikan folder `/server/uploads` (VPS) atau `/portfolio-backend/uploads` (cPanel) memiliki izin `755` atau `775`.

### 3. Login Admin Gagal (Invalid Token atau CORS)
- **Penyebab**: Variabel `CLIENT_URL` di backend tidak sama persis dengan alamat domain frontend Anda (misal kurang `https://` atau berbeda `www`).
- **Solusi**: Pastikan `CLIENT_URL` di file `.env` backend sama persis dengan domain yang diakses oleh user.
