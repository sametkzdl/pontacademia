# 🏛️ Pont Academy Web Platform

Pont Academy, YKS & LGS sınavlarına hazırlanan öğrenciler için birebir özel ders, derece koçluğu, puan hesaplama simülasyonları ve dereceli eğitmen kadrosu sunan modern, ölçeklenebilir ve kurumsal bir eğitim platformudur.

---

## 🚀 Teknolojiler & Mimari

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **UI / Kütüphane**: React 19, TypeScript
- **Bileşen Mimarisi**: Atomic Design (`src/components/atoms/`, `src/components/molecules/`)
- **Stil & Tasarım**: Modüler Vanilla CSS (`src/styles/variables.css`, `base.css`, `components.css`, `sections.css`, `animations.css`)
- **İkon Seti**: Lucide React
- **Veritabanı & ORM**: SQLite / PostgreSQL, Modüler [Prisma ORM](https://www.prisma.io/) (Prisma Schema Folder: `user`, `teacher`, `student`, `match`, `setting`, `contact`)
- **Mimari Desen**: Clean Architecture (Ultra-Thin Route Handlers -> Controller -> Service -> DB)
- **Dosya Depolama**: Cloudflare R2 (S3 Uyumlu) & Güvenli Dahili Proxy (`/api/storage/file`)
- **Kimlik Doğrulama & Guard**: JWT (jose), Bcrypt Password Hashing, HTTP-only Güvenli Çerezler, Rol Bazlı Otomatik Yönlendirme ve Route Guard (`middleware.ts`)

---

## 📂 Sayfa & Portal Mimarisi

| Rota | Mimari Türü | Açıklama |
|---|---|---|
| `/` | SSR / Static | Pont Academy ana sayfası (Dinamik fiyatlar, canlı kampanya bannerı, hoca vitrini, puan hesaplama, iletişim) |
| `/login` | Client Form | Rol bazlı yönlendirmeli kullanıcı giriş paneli (Yönetici, Eğitmen, Öğrenci) |
| `/admin/*` | **Nested Routes & Layout** | Yönetici Portalı: Başvuru onay/ret, eğitmen/öğrenci yönetimi, çoklu branş eşleştirme, mesajlar, genel ayarlar |
| `/teacher/*` | **Nested Routes & Layout** | Eğitmen Portalı: Atanmış öğrenciler & dersler, profil düzenleme, şifre güncelleme |
| `/student/*` | **Nested Routes & Layout** | Öğrenci Portalı: Atanmış eğitmenler & koç, alacağı dersler, profil, şifre |
| `/kocluk-basvuru` | Multi-step Form | Dinamik koç seçimi ve kapsamlı öğrenci koçluk başvuru formu |
| `/ozel-ders-basvuru` | Client Form | Çoklu ders seçimli birebir özel ders başvuru formu |
| `/teacherApplicationForm` | Kapsamlı Form | Eğitmen ve koç adayları için 10 üzerinden ders yetkinlik ve ilçe seçim formu |
| `/tyt-puan-hesaplama` | Araç | TYT net ve puan hesaplama motoru |
| `/yks-puan-hesaplama` | Araç | TYT + AYT + OBP puan ve sıralama simülasyonu |

---

## 🧩 Yenilikçi Özellikler & Modüller

1. **Dinamik Sistem & Site Ayarları (`/admin/settings`)**:
   - Ana sayfada gösterilen saatlik özel ders fiyatı, aylık koçluk fiyatı, üst kampanya bannerı ve iletişim bilgileri admin panelinden anlık güncellenir.
2. **Rol Bazlı Otomatik Yönlendirme (Smart Login Redirect)**:
   - Giriş yapıldığında kullanıcının rolüne göre (`ADMIN` → `/admin`, `TEACHER` → `/teacher`, `STUDENT` → `/student`) otomatik yönlendirme sağlanır.
3. **Kaydırılabilir Çoklu Ders Rozetleri (`SubjectTagSlider`)**:
   - Öğrencinin seçtiği çoklu dersler tablo kolonlarını bozmadan yatay kaydırılabilir amber rozetlerle sunulur.
4. **Çoklu Branş Eşleştirme Sistemi (`StudentTeacherMatch`)**:
   - Bir öğrenciye farklı branşlar için farklı öğretmenler atanabilir.
5. **Gelişmiş Atomik Bileşen Kütüphanesi**:
   - Tek tip `Input`, `PasswordInput`, `Button`, `Badge`, `Select`, `Textarea`, `Modal`, `SearchFilterBar` bileşenleriyle tam tutarlılık.

---

## 🛠️ Kurulum ve Çalıştırma

### 1. Bağımlılıkları Yükleyin
```bash
npm install
```

### 2. Veritabanını Senkronize Edin
```bash
npx prisma db push
```

### 3. Geliştirme Sunucusunu Başlatın
```bash
npm run dev
```
Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine gidin.

---

## 📖 Dokümantasyon

- 🏛️ [ARCHITECTURE.md](./ARCHITECTURE.md) - Clean Architecture, Katman Hiyerarşisi, Nested Layouts, CSS ve R2 Depolama Kılavuzu
- 📝 [FORM_SCHEMAS.md](./FORM_SCHEMAS.md) - Form alanları, tipler, doğrulama kuralları ve API JSON payload formatları

