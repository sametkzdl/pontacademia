# Pont Academia — Ubuntu Sunucu Kurulum & Dağıtım Rehberi (Deployment Guide)

Bu doküman, Pont Academia projesinin Ubuntu sunucusunda **İmamoğlu Kur'an Kursu (`dormweb`)** ve **Sevoza (`sevoza-next`)** projeleriyle birlikte izole ve performanslı şekilde barındırılması sürecini içerir.

---

## 🏗️ Sunucu Mimarisi ve Port Dağılımı

| Proje Adı | Dizin Yolu | PM2 Adı | Port | Veritabanı | Domain |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **İmamoğlu Kur'an Kursu** | `/var/www/dormweb` | `dormweb` | `3000` | `dormweb_db` | `mustafaimamoglukurankursu.org` |
| **Sevoza Otomasyon** | `/var/www/product-add-otomation` | `sevoza-next` | `3001` | - | `sevoza.com` |
| **Pont Academia** | `/var/www/pontacademia` | `pontacademia` | **`3002`** | **`pontacademia`** | **`pontakademi.com`** |

---

## 🔑 Varsayılan Yönetici (Admin) Giriş Bilgileri

* **Giriş Portalı:** `https://pontakademi.com/login`
* **E-Posta:** `admin@pontacademy.com`
* **Varsayılan Şifre:** `admin123456`
* **Yetki:** `ADMIN`

---

## 📋 Sıfırdan Kurulum Adımları

### 1. Repoyu Klonlama ve Yetkilendirme
```bash
cd /var/www
sudo git clone https://github.com/sametkzdl/pontacademia.git pontacademia
sudo chown -R samet:samet /var/www/pontacademia
cd /var/www/pontacademia
npm install
```

---

### 2. PostgreSQL Veritabanı ve Kullanıcı Yapılandırması

PostgreSQL konsoluna bağlanın:
```bash
sudo -u postgres psql
```

Komutları sırayla çalıştırın:
```sql
-- Kullanıcı ve veritabanı oluşturma
CREATE USER pont_user WITH PASSWORD 'Pont2026Secure!';
CREATE DATABASE pontacademia OWNER pont_user;
GRANT ALL PRIVILEGES ON DATABASE pontacademia TO pont_user;

-- pontacademia veritabanına bağlanıp şema yetkilerini tanımlama
\c pontacademia
GRANT ALL ON SCHEMA public TO pont_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO pont_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO pont_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO pont_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO pont_user;
\q
```

---

### 3. Çevre Değişkenleri (`.env`)
`/var/www/pontacademia/.env` dosyasını oluşturup şu değerleri ekleyin:

```env
# Database Connection
DATABASE_URL="postgresql://pont_user:Pont2026Secure!@localhost:5432/pontacademia?schema=public"

# Auth & JWT Secret
JWT_SECRET="pont_academy_jwt_secret_secure_key_2026"

# Cloudflare R2 Object Storage
R2_ACCOUNT_ID="c5f0ac0af7baac97991567e7f16c0b9c"
R2_ACCESS_KEY_ID="666b25d444e96fe3862ee6675b548470"
R2_SECRET_ACCESS_KEY="6fa388a3b81405f80d9f23df43f4532e9b93eddeeaf98b53f54723f6b53defde"
R2_BUCKET_NAME="pontacademia"
R2_PUBLIC_DOMAIN="https://pub-9efb985e63d448d5b41327987a260d8f.r2.dev"
```

---

### 4. Prisma Tablo Senkronizasyonu ve Admin Tohumlama (Seed)
```bash
cd /var/www/pontacademia
npx prisma db push
npx prisma db seed
```

---

### 5. Next.js Build ve PM2 (Root/Sudo Ortamı)

Diğer projelerle (`dormweb`, `sevoza-next`) aynı `sudo pm2` çatısı altında çalıştırmak için:
```bash
cd /var/www/pontacademia
npm run build

# PM2 ile 3002 portunda başlat
sudo pm2 start npm --name "pontacademia" --cwd /var/www/pontacademia -- start -- -p 3002

# Başlangıç yapılandırmasını kaydet
sudo pm2 save
```

---

### 6. Nginx Reverse Proxy Yapılandırması

`/etc/nginx/sites-available/pontacademia` dosyasını oluşturun:
```bash
sudo nano /etc/nginx/sites-available/pontacademia
```

İçeriği ekleyin:
```nginx
server {
    server_name pontakademi.com;

    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 25M;
}
```

Sembolik link oluşturup Nginx'i yeniden yükleyin:
```bash
sudo ln -s /etc/nginx/sites-available/pontacademia /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

### 7. Certbot ile SSL (HTTPS) Kurulumu
```bash
sudo certbot --nginx -d pontakademi.com
```

---

## 🔄 Gelecekte Projeyi Güncelleme (Update Workflow)

Yeni bir güncelleme veya kod değişikliği sunucuya çekildiğinde:
```bash
cd /var/www/pontacademia
git pull
npm install
npx prisma db push
npm run build
sudo pm2 restart pontacademia
```
