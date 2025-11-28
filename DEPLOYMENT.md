
# Tutorial Lengkap Deploy WhatsApp API Web (Waha + Backend + Frontend) di VPS

## 1. Persiapan VPS
### a. Spesifikasi Minimal
- VPS dengan Ubuntu 20.04/22.04 (atau Debian)
- RAM minimal 2GB (disarankan 4GB jika banyak campaign)
- Storage minimal 20GB

### b. Update & Install Dependensi
```sh
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose git
sudo systemctl enable --now docker
```

## 2. Clone Project dari GitHub
```sh
git clone https://github.com/Nicowell13/client1.git
cd client1
```


## 3. Konfigurasi Environment
### a. Backend
- Edit `backend/.env`:
  - Pastikan variabel `MONGO_URI`, `REDIS_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` sudah diisi.
  - Ganti PORT ke 4000 jika ingin backend diakses di api.watrix.online:4000
- Contoh:
  ```env
  PORT=4000
  MONGO_URI=mongodb://mongo:27017/whatsapp
  REDIS_URL=redis://redis:6379
  JWT_SECRET=your_jwt_secret
  ADMIN_EMAIL=admin@example.com
  ADMIN_PASSWORD=supersecret
  ```

### b. Frontend
- Edit `frontend/.env`:
  - Ganti API URL ke domain backend Anda:
  ```env
  NEXT_PUBLIC_API_URL=https://api.watrix.online
  ```

### c. Waha
- Edit `waha/.env.waha1` (dan seterusnya jika multi-instance):
  - Contoh:
  ```env
  PORT=3000
  SESSION_NAME=waha1
  REDIS_URL=redis://redis:6379
  ```

## 4. Build & Jalankan Semua Service
```sh
docker-compose up -d --build
```
- Tunggu semua container berjalan (cek dengan `docker ps`).
- Untuk melihat log: `docker-compose logs -f`


## 5. Inisialisasi Admin
- Login ke backend MongoDB:
  ```sh
  docker exec -it mongo mongosh
  use whatsapp
  db.users.find()
  ```
- Jika user admin belum ada, bisa register lewat endpoint `https://api.watrix.online/api/auth/register` (gunakan Postman/curl, dengan token admin default dari .env).


## 6. Akses Aplikasi
- Buka browser ke domain Anda:
  - Frontend: https://app.watrix.online
  - Backend API: https://api.watrix.online
- Login dengan akun admin yang sudah Anda buat.


## 7. (Opsional) Setup Domain & SSL
- Point domain ke IP VPS 170.64.182.80:
  - Buat A record:
    - api.watrix.online → 170.64.182.80
    - app.watrix.online → 170.64.182.80
- Edit file `nginx/nginx.conf` agar sesuai dengan domain api.watrix.online dan app.watrix.online.
- Untuk SSL gratis, gunakan [Let's Encrypt](https://certbot.eff.org/):
  ```sh
  sudo apt install certbot python3-certbot-nginx
  sudo certbot --nginx -d api.watrix.online -d app.watrix.online
  ```

## 8. Backup & Restore Data
- Backup MongoDB:
  ```sh
  docker exec mongo mongodump --archive=/data/db/backup.gz --gzip
  docker cp mongo:/data/db/backup.gz ./backup.gz
  ```
- Backup Redis:
  ```sh
  docker exec redis redis-cli save
  docker cp redis:/data/dump.rdb ./dump.rdb
  ```

## 9. Update Kode
```sh
git pull
# Lalu rebuild
docker-compose up -d --build
```

## 10. Troubleshooting
- Cek status container: `docker ps`
- Cek log error: `docker-compose logs -f`
- Jika port bentrok, edit mapping port di `docker-compose.yml`
- Jika ada error database, cek koneksi dan volume

---

**Catatan:**
- Untuk menambah instance Waha, duplikat service di `docker-compose.yml` dan tambahkan file .env baru.
- Untuk scaling, gunakan VPS dengan resource lebih besar atau cluster.
- Untuk keamanan, ganti semua password default dan gunakan firewall VPS.

Jika butuh bantuan lebih lanjut (setup domain, scaling, monitoring, dsb), silakan tanyakan!
