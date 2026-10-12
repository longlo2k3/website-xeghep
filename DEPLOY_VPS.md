# 🚀 Hướng Dẫn Đóng Gói Docker & Triển Khai Lên VPS

Hệ thống bao gồm 3 phân hệ được đóng gói hoàn chỉnh bằng Docker:
1. **`website`**: Frontend khách hàng (Next.js 15) — Cổng mặc định `3000`
2. **`admin`**: Giao diện quản trị SPA (React 19 + Vite 6 + Nginx) — Cổng mặc định `5173`
3. **`backend`**: Hệ thống Core API & Payload CMS 3 (Next.js 15 + Sharp + PostgreSQL) — Cổng mặc định `3001`
4. **`db`**: Cơ sở dữ liệu PostgreSQL 16 Alpine — Lưu trữ persistent qua Docker volume `cms_pgdata`

---

## 📋 Mục Lục

1. [Yêu Cầu Hệ Thống VPS](#1-yêu-cầu-hệ-thống-vps)
2. [Cài Đặt Docker & Docker Compose Trên VPS](#2-cài-đặt-docker--docker-compose-trên-vps)
3. [Đưa Mã Nguồn Lên VPS](#3-đưa-mã-nguồn-lên-vps)
4. [Cấu Hình Biến Môi Trường (.env)](#4-cấu-hình-biến-môi-trường-env)
5. [Khởi Chạy Hệ Thống Bằng Docker](#5-khởi-chạy-hệ-thống-bằng-docker)
6. [Khởi Tạo Dữ Liệu & Tạo Tài Khoản Admin](#6-khởi-tạo-dữ-liệu--tạo-tài-khoản-admin)
7. [Cấu Hình Tên Miền & SSL (Nginx + Certbot)](#7-cấu-hình-tên-miền--ssl-nginx--certbot)
8. [Các Lệnh Vận Hành & Bảo Trì](#8-các-lệnh-vận-hành--bảo-trì)

---

## 1. Yêu Cầu Hệ Thống VPS

- **Hệ điều hành khuyên dùng**: Ubuntu 22.04 LTS hoặc 24.04 LTS (hoặc Debian 12).
- **Cấu hình tối thiểu**:
  - **RAM**: 2GB (Khuyến nghị 4GB RAM + bật thêm 2GB Swap để build Next.js mượt mà).
  - **CPU**: 2 Cores trở lên.
  - **Ổ cứng**: SSD tối thiểu 25GB trống.

*(Mẹo: Nếu VPS có 2GB RAM, hãy tạo 2GB Swap trước khi build để tránh bị tràn RAM / OOM Kill):*
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## 2. Cài Đặt Docker & Docker Compose Trên VPS

Nếu VPS chưa có Docker, chạy các lệnh sau (áp dụng Ubuntu/Debian):

```bash
# Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y

# Cài đặt Docker engine chính thức
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Thêm quyền cho user hiện tại (tránh phải gõ sudo)
sudo usermod -aG docker $USER
newgrp docker

# Kiểm tra phiên bản
docker --version
docker compose version
```

---

## 3. Đưa Mã Nguồn Lên VPS

Bạn có thể đưa mã nguồn lên VPS bằng **Git** hoặc **Rsync/SCP**:

### Cách 1: Sử dụng Git (Khuyên dùng)
```bash
cd /var/www
git clone <URL_REPO_CUA_BAN>.git cms
cd cms
```

### Cách 2: Upload từ máy cá nhân qua rsync
```bash
# Chạy lệnh này từ máy của bạn (trên Git Bash hoặc WSL / Linux)
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude 'dist' ./ user@ip_vps:/var/www/cms/
```

---

## 4. Cấu Hình Biến Môi Trường (.env)

Tại thư mục gốc dự án trên VPS, copy file mẫu và điều chỉnh:

```bash
cp .env.example .env
nano .env
```

**Các thông số quan trọng cần cập nhật trong `.env`:**
- `POSTGRES_PASSWORD`: Đặt mật khẩu DB bảo mật cao.
- `PAYLOAD_SECRET`: Tạo chuỗi ngẫu nhiên từ 32 ký tự trở lên (ví dụ: `openssl rand -base64 32`).
- `PAYLOAD_PUBLIC_SERVER_URL`: Tên miền API công khai (ví dụ: `https://api.xegheplientinh.vn`).
- `FRONTEND_URL`: Tên miền Website (ví dụ: `https://xegheplientinh.vn`).
- `SEED_ADMIN_EMAIL` & `SEED_ADMIN_PASSWORD`: Email và mật khẩu quản trị ban đầu.
- `TELEGRAM_BOT_TOKEN` & `TELEGRAM_CHAT_ID`: Token nhận thông báo đơn đặt xe tự động.

---

## 5. Khởi Chạy Hệ Thống Bằng Docker

Tiến hành build và khởi chạy toàn bộ 4 containers ở chế độ chạy nền (`-d`):

```bash
# Build và khởi chạy tất cả dịch vụ
docker compose up -d --build
```

Kiểm tra trạng thái các container:
```bash
docker compose ps
```

Kết quả mong đợi:
| Service | Container Name | Status | Ports |
|---|---|---|---|
| `db` | `cms-db` | Up (healthy) | `127.0.0.1:5432->5432/tcp` |
| `backend` | `cms-backend` | Up | `0.0.0.0:3001->3001/tcp` |
| `admin` | `cms-admin` | Up | `0.0.0.0:5173->80/tcp` |
| `website` | `cms-website` | Up | `0.0.0.0:3000->3000/tcp` |

Xem log thời gian thực nếu cần kiểm tra:
```bash
docker compose logs -f backend
```

---

## 6. Khởi Tạo Dữ Liệu & Tạo Tài Khoản Admin

Khi khởi chạy lần đầu trên VPS mới, cơ sở dữ liệu còn trống. Bạn thực thi các lệnh sau trực tiếp vào container backend:

### 6.1. Tạo tài khoản Admin quản trị đầu tiên:
```bash
docker compose exec backend npm run seed:admin
```
*(Tài khoản được tạo theo thông tin `SEED_ADMIN_EMAIL` và `SEED_ADMIN_PASSWORD` trong file `.env`)*

### 6.2. (Tùy chọn) Nạp bộ dữ liệu mẫu ban đầu:
Nếu muốn nạp toàn bộ danh mục tuyến đường, bảng giá, bài viết, chính sách và media ban đầu:
```bash
# Nạp toàn bộ dữ liệu hệ thống
docker compose exec backend npm run seed

# Hoặc nạp riêng từng phần theo nhu cầu:
# docker compose exec backend npm run seed:routes       # Tuyến đường & cước
# docker compose exec backend npm run seed:pricing      # Bảng giá sân bay & km
# docker compose exec backend npm run seed:pages        # Trang tĩnh & chính sách
# docker compose exec backend npm run seed:articles     # Bài viết tin tức
# docker compose exec backend npm run seed:company      # Cấu hình doanh nghiệp
```

---

## 7. Cấu Hình Tên Miền & SSL (Nginx + Certbot)

Để gắn domain chính thức và bảo mật bằng HTTPS:

### 7.1. Trỏ DNS các bản ghi A về địa chỉ IP của VPS:
- `@` (hoặc `xegheplientinh.vn`) -> `IP_VPS`
- `www` -> `IP_VPS`
- `admin` (hoặc `admin.xegheplientinh.vn`) -> `IP_VPS`
- `api` (hoặc `api.xegheplientinh.vn`) -> `IP_VPS`

### 7.2. Cài Nginx trên host VPS:
```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

### 7.3. Áp dụng cấu hình Reverse Proxy:
Copy file `nginx-vps.conf.example` vào Nginx host:
```bash
sudo cp nginx-vps.conf.example /etc/nginx/sites-available/cms.conf
sudo ln -s /etc/nginx/sites-available/cms.conf /etc/nginx/sites-enabled/
```
Chỉnh sửa tên miền thực tế của bạn trong `/etc/nginx/sites-available/cms.conf`:
```bash
sudo nano /etc/nginx/sites-available/cms.conf
```
Kiểm tra cú pháp và kích hoạt:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 7.4. Cài đặt SSL miễn phí tự động gia hạn với Let's Encrypt:
```bash
sudo certbot --nginx -d xegheplientinh.vn -d www.xegheplientinh.vn -d admin.xegheplientinh.vn -d api.xegheplientinh.vn
```
Certbot sẽ tự động cấu hình HTTPS và cơ chế tự động gia hạn SSL!

---

## 8. Các Lệnh Vận Hành & Bảo Trì

### Xem log các dịch vụ
```bash
# Xem log toàn bộ hệ thống
docker compose logs -f

# Xem riêng log backend
docker compose logs -f backend

# Xem riêng log website
docker compose logs -f website

# Xem riêng log admin SPA
docker compose logs -f admin
```

### Cập nhật mã nguồn mới
Khi bạn push code mới lên Git:
```bash
git pull
docker compose up -d --build
```
*(Nhờ cơ chế Docker layer cache, chỉ những phần code thay đổi mới cần build lại, quá trình deploy mất chưa tới 1 phút)*

### Khởi động lại hoặc dừng hệ thống
```bash
# Khởi động lại toàn bộ
docker compose restart

# Dừng hệ thống
docker compose down

# Dừng và xóa dữ liệu (CẢNH BÁO: CHỈ DÙNG KHI MUỐN RESET TOÀN BỘ)
# docker compose down -v
```

### Sao lưu (Backup) & Khôi phục Cơ sở dữ liệu
```bash
# Sao lưu cơ sở dữ liệu ra file backup.sql
docker compose exec -T db pg_dump -U cms cms > cms_backup_$(date +%F).sql

# Khôi phục cơ sở dữ liệu từ file backup
docker compose exec -T db psql -U cms cms < cms_backup_2026-10-12.sql
```

### Sao lưu thư mục Media (Ảnh tải lên)
Thư mục ảnh được lưu trong Docker volume `cms_media`. Bạn có thể nén và sao lưu ra ngoài:
```bash
docker run --rm -v cms_media:/volume -v $(pwd):/backup alpine tar czf /backup/media_backup_$(date +%F).tar.gz -C /volume .
```
