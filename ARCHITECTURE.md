# 🏛️ Pont Academy - Clean Architecture & Sistem Mimarisi Rehberi

Bu belge, **Pont Academy** projesinin kurumsal yazılım mimarisini, katmanlı dizin hiyerarşisini, nested layout portal yapısını, atomik bileşen sistemini, modüler CSS mimarisini, veri tabanı şemalarını ve ölçeklenebilirlik standartlarını tanımlar. Projeye eklenecek her yeni özellik buradaki kurallara sıkı sıkıya bağlı kalmalıdır.

---

## 📂 1. Katman Hiyerarşisi ve Dizin Yapısı

Proje, **Clean Architecture (Temiz Mimari)**, **Atomic Design** ve **Nested Layout Routing** prensiplerine göre yapılandırılmıştır:

```
pontacademia/
├── prisma/
│   └── schema/                         # 🗄️ Modüler Prisma Veritabanı Şemaları
│       ├── base.prisma                 # Datasource & Client Generator
│       ├── user.prisma                 # User modeli ve kimlik tanımları
│       ├── teacher.prisma              # TeacherProfile ve TeacherApplication modelleri
│       ├── student.prisma              # StudentProfile ve StudentApplication modelleri
│       ├── match.prisma                # StudentTeacherMatch (Öğrenci - Öğretmen Eşleştirme)
│       ├── setting.prisma              # SystemSetting (Dinamik Fiyat, Banner ve İletişim Ayarları)
│       └── contact.prisma              # ContactMessage (Web Sitesi İletişim & Danışmanlık Mesajları)
├── src/
│   ├── app/
│   │   ├── api/                        # ⚡ Ultra-Thin Route Handlers (Sadece yönlendirici)
│   │   │   ├── admin/
│   │   │   │   ├── applications/       # Başvuru onay ve ret uç noktaları
│   │   │   │   ├── users/              # Kullanıcı listeleme, şifre yenileme ve durum değiştirme
│   │   │   │   ├── matches/            # Eşleştirme CRUD uç noktaları
│   │   │   │   ├── settings/           # Genel ayarları güncelleme (Admin)
│   │   │   │   └── contacts/           # İletişim mesajlarını listeleme ve durum güncelleme
│   │   │   ├── teacher/
│   │   │   │   └── students/           # Öğretmenin öğrencileri ve dersleri
│   │   │   ├── student/
│   │   │   │   └── teachers/           # Öğrencinin öğretmenleri ve dersleri
│   │   │   ├── settings/               # Genel ayarları getirme (Genel / Public)
│   │   │   ├── contact/                # İletişim formu mesajı iletme (Genel / Public)
│   │   │   ├── coaches/                # Aktif koç listesi uç noktası (Genel)
│   │   │   ├── auth/                   # Giriş, çıkış, oturum kontrolü (JWT)
│   │   │   ├── profile/                # Kullanıcı profili güncelleme
│   │   │   └── storage/                # Cloudflare R2 dosya yükleme, proxy ve silme
│   │   ├── admin/                      # 🖥️ Yönetici Portalı (Ortak Layout & Nested Rotalar)
│   │   │   ├── layout.tsx              # Üst bar, dinamik rozet sayaçları ve ortak menü
│   │   │   ├── teacher-applications/   # Öğretmen başvuruları sekmesi
│   │   │   ├── student-applications/   # Öğrenci başvuruları sekmesi
│   │   │   ├── teachers/               # Öğretmen listesi ve şifre yenileme
│   │   │   ├── students/               # Öğrenci listesi ve şifre yenileme
│   │   │   ├── matches/                # Öğrenci - Öğretmen eşleştirme yönetimi
│   │   │   ├── messages/               # Web sitesi gelen iletişim mesajları
│   │   │   └── settings/               # Genel site & fiyat ayarları sekmesi
│   │   ├── teacher/                    # 🖥️ Eğitmen Portalı (Ortak Layout & Nested Rotalar)
│   │   │   ├── layout.tsx              # Üst bar ve eğitmen navigasyonu
│   │   │   ├── students/               # Atanmış öğrenciler ve dersler
│   │   │   ├── profile/                # Eğitmen profil düzenleme
│   │   │   └── password/               # Eğitmen şifre güncelleme
│   │   ├── student/                    # 🖥️ Öğrenci Portalı (Ortak Layout & Nested Rotalar)
│   │   │   ├── layout.tsx              # Üst bar ve öğrenci navigasyonu
│   │   │   ├── teachers/               # Atanmış eğitmenler ve dersler
│   │   │   ├── profile/                # Öğrenci profil düzenleme
│   │   │   └── password/               # Öğrenci şifre güncelleme
│   │   ├── login/                      # 🖥️ Rol bazlı akıllı yönlendirmeli kimlik doğrulama ekranı
│   │   ├── kocluk-basvuru/             # 🖥️ Dinamik Koç Seçimli Koçluk Başvuru Formu
│   │   ├── ozel-ders-basvuru/          # 🖥️ Çoklu Ders Seçimli Özel Ders Başvuru Formu
│   │   └── teacherApplicationForm/     # 🖥️ Eğitmen & Koçluk Başvuru Formu
│   ├── components/                     # 🧩 Atomik Bileşen Kütüphanesi
│   │   ├── atoms/                      # Temel Yapı Taşları
│   │   │   ├── Input.tsx               # Standart ve tutarlı form girdisi
│   │   │   ├── PasswordInput.tsx       # Şifre göster/gizle ve otomatik üretici
│   │   │   ├── Button.tsx              # Primary, secondary, danger, ghost butonları
│   │   │   ├── Badge.tsx               # Durum ve rol rozetleri
│   │   │   ├── Select.tsx              # Standart seçim kutusu
│   │   │   └── Textarea.tsx            # Metin alanı bileşeni
│   │   ├── molecules/                  # Moleküler Bileşenler
│   │   │   ├── Modal.tsx               # Yeniden kullanılabilir evrensel modal
│   │   │   ├── SearchFilterBar.tsx     # Arama, durum filtresi ve sıralama çubuğu
│   │   │   └── SubjectTagSlider.tsx    # Kaydırılabilir yatay çoklu ders rozetleri
│   │   └── index.ts                    # Barrel export
│   ├── styles/                         # 🎨 Modüler CSS Sistemi
│   │   ├── variables.css               # Renk tokenları, gölgeler, font değişkenleri
│   │   ├── base.css                    # Sıfırlamalar, tipografi, containerlar
│   │   ├── components.css              # Butonlar, kartlar, formlar, rozetler
│   │   ├── sections.css                # Header, footer, hero, fiyatlandırma, vitrin
│   │   └── animations.css              # Keyframes, hover ve scroll efektleri
│   ├── controllers/                    # 🎯 Request/Response Orkestrasyonu & Validation
│   │   ├── auth.controller.ts          # Giriş, çıkış, oturum ve şifre kontrolcüsü
│   │   ├── application.controller.ts   # Başvuru onay/ret ve hesap bağlama kontrolcüsü
│   │   ├── user.controller.ts          # Kullanıcı listeleme, durum ve şifre yenileme
│   │   ├── match.controller.ts         # Öğrenci - Öğretmen eşleştirme kontrolcüsü
│   │   ├── setting.controller.ts       # Sistem ayarları kontrolcüsü
│   │   ├── contact.controller.ts       # İletişim mesajları kontrolcüsü
│   │   ├── profile.controller.ts       # Profil güncelleme kontrolcüsü
│   │   └── storage.controller.ts       # Dosya yükleme ve R2 proxy kontrolcüsü
│   ├── services/                       # ⚙️ Saf İş Mantığı (Business Logic) & DB İşlemleri
│   │   ├── auth.service.ts             # Auth iş kuralları
│   │   ├── application.service.ts      # Başvuru iş kuralları & akıllı hesap bağlama
│   │   ├── user.service.ts             # Kullanıcı filtreleme & şifre güncelleme
│   │   ├── match.service.ts            # Eşleştirme CRUD & çoklu branş yönetimi
│   │   ├── setting.service.ts          # Dinamik sistem ayarları servisi
│   │   ├── contact.service.ts          # İletişim mesajları servisi
│   │   ├── profile.service.ts          # Profil veri mutasyonları
│   │   └── storage.service.ts          # Dosya doğrulama ve R2 anahtar yönetimi
│   ├── utils/                          # 🧰 Yardımcı Araçlar, Güvenlik & 3. Parti
│   │   ├── db.ts                       # Singleton Prisma Client (`db` & `prisma`)
│   │   ├── auth.ts                     # JWT imzalama, doğrulama & session helpers
│   │   ├── hash.ts                     # Bcrypt şifre hashleme & karşılaştırma
│   │   ├── response.ts                 # Standart `ApiResponse` JSON üreticisi
│   │   └── third-party/                # 🌐 Dış Servis Entegrasyonları
│   │       ├── mail.service.ts         # E-posta bildirim servisi
│   │       └── r2.service.ts           # Cloudflare R2 S3 uyumlu nesne depolama
│   └── middleware.ts                   # 🛡️ Rol Tabanlı Güzergah Koruyucu (Route Guard)
└── ARCHITECTURE.md                     # 📖 Bu Doküman
```

---

## ⚡ 2. Nested Routing & Ortak Layout Mimarisi

Platformun `/admin`, `/teacher` ve `/student` portalları **Next.js App Router Nested Routing** mimarisiyle yapılandırılmıştır:

1. **Ortak Layout (`layout.tsx`)**:
   - Üst bar, marka logosu, rol etiketi, dinamik bildirim sayaçları (bekleyen başvurular, okunmamış mesajlar) ve çıkış butonu tek bir `layout.tsx` dosyasında render edilir.
   - Sayfalar arası geçişte üst bar asla yeniden yüklenmez, durumunu ve bildirim sayaçlarını korur.
2. **Modüler Alt Rotalar**:
   - Her sekme kendi özel URL'ine sahiptir (örn: `/admin/settings`, `/admin/teacher-applications`, `/teacher/students`, `/student/teachers`).
   - Kullanıcı tarayıcıda sayfayı yenilediğinde veya doğrudan bir alt URL'e gittiğinde doğru sekme anında açılır.
3. **Akıllı Yönlendirme (Smart Login Redirect)**:
   - Kullanıcı `/login` ekranından giriş yaptığında rolüne göre doğrudan ilgili portala (`/admin`, `/teacher`, `/student`) aktarılır.

---

## 🧱 3. Katmanların Görev ve Sorumlulukları

### A. Route Handlers (`src/app/api/.../route.ts`)
- **Görevi**: Next.js HTTP metodlarını (`GET`, `POST`, `PATCH`, `DELETE`) karşılamak ve isteği doğrudan ilgili Controller'a devretmek.
- **Kural**: Route handler dosyalarında **asla** doğrudan veritabanı sorgusu veya iş mantığı yazılmaz.

### B. Controller Katmanı (`src/controllers/...`)
- **Görevi**: 
  1. Parametreleri ve istek gövdesini (`req.json()`) çıkarmak.
  2. Girdi doğrulamasını (Validation) yapmak.
  3. Yetki kontrollerini (`getSessionUser()`, `role === "ADMIN"`) gerçekleştirmek.
  4. İşi Service katmanına devretmek.
  5. Standart `ApiResponse` formatında yanıt dönmek (`ApiResponse.success`, `ApiResponse.error`, `ApiResponse.forbidden`).

### C. Service Katmanı (`src/services/...`)
- **Görevi**: Saf iş mantığını, veritabanı sorgularını (`db`), veri dönüşümlerini ve servisler arası koordinasyonu yönetir.
- **Kural**: Service sınıfları HTTP nesnelerine (`NextRequest`, `NextResponse`) **asla bağımlı olmaz**.

---

## 🔗 4. Öğrenci - Öğretmen Eşleştirme & Çoklu Branş Sistemi

Platformda bir öğrenci hem Eğitim Koçluğu hem de birden fazla branştan Birebir Özel Ders alabilir:
- **Çoklu Branş Eşleştirme**: Admin bir öğrenciye Matematik için ayrı, Fizik için ayrı öğretmen atayabilir.
- **Ders Rozetleri (`SubjectTagSlider`)**: Tablolarda çok sayıda seçilen ders satır yüksekliğini ve tablo kolonlarını bozmadan yatay kaydırılabilir butonlarla gösterilir.
- **Mevcut Hesap Koruma**: Onaylanan öğrencinin sistemde zaten bir hesabı varsa şifresi sıfırlanmaz, mevcut hesabına bağlanır.
- **Öğrenci Profil Ders Yönetimi & Talep Zorunluluğu**:
  - Öğrenci kendi profilinden (`/student/profile`) yeni dersler ekleyebilir; ekleme modalında mevcut kayıtlı dersler kilitli (`🔒`) sunulur ve mükerrer seçim engellenir.
  - Öğrencinin aktif kayıtlı dersleri profilden doğrudan "X" ile silmesi engellenmiştir.
  - Kayıtlı bir dersi bırakmak veya iptal etmek isteyen öğrenci `/student/requests` üzerinden onaylı **Ders Bırakma Talebi** oluşturmak zorundadır; bu sayede işlenmemiş dersler ve finansal süreçler idari koruma altına alınır.

---

## ☁️ 5. Cloudflare R2 Nesne Depolama & Güvenli Proxy

Tüm medya ve profil fotoğrafları Cloudflare R2 üzerinde yönetilir:
- **Ortam İzolasyonu**: `.env` içindeki `APP_ENV` değerine göre `development/` veya `production/` klasörlerinde saklanır.
- **Güvenli Proxy**: `/api/storage/file?key=...` proxy uç noktası üzerinden `Cache-Control: public, max-age=31536000` önbellek başlıklarıyla sunulur.
- **Fotoğraf Gizlilik Tercihi**: Eğitmen `showPhotoOnWeb: false` seçtiğinde genel `/api/coaches` rotasında fotoğraf gizlenir, admin ve öğretmen panellerinde güvenle gösterilir.

---

## 🪟 6. Evrensel Modal & Z-Index Mimarisi (React Portal & Stacking Context Standartları)

### ⚠️ Kritik Mimari Kural: Inline Modal ve Özel Overlay Kesinlikle Yasaktır!
Projeye eklenen veya düzenlenen hiçbir sayfada yerel `<div className="fixed-modal-overlay">` veya inline modal yazılmaz. Her zaman `@/components` içerisindeki evrensel `<Modal>` bileşeni kullanılmalıdır.

### 🔍 Kök Neden (Stacking Context & Transform Tuzağı):
Panel layout'larımızda (`TeacherLayout`, `StudentLayout`, `AdminLayout`) sayfa geçişleri için kullanılan `.page-transition` CSS sınıfı `transform: translateY(...)` ve `animation` barındırır. CSS standartları gereği bir kapsayıcıda `transform` veya `animation` bulunması yeni bir **Stacking Context (İstifleme Bağlamı)** ve içeren blok oluşturur. Bu durum, içindeki `position: fixed; z-index: 99999` elemanlarının bile sayfa hiyerarşisine hapsolmasına, header altında kalmasına veya ekran dışına taşmasına yol açar.

### 🛡️ Evrensel Çözüm (`src/components/molecules/Modal.tsx`):
- **React Portal**: Modal bileşeni `createPortal(modalElement, document.body)` kullanarak DOM ağacında doğrudan `<body>` etiketinin altına taşınır ve layout stacking context'inden tamamen kurtulur.
- **Scroll Lock & Escape**: Açıldığında `document.body.style.overflow = "hidden"` uygular, kapandığında temizler. `Escape` tuşu dinleyicisi otomatik olarak çalışır.
- **Z-Index Standardı**: Evrensel olarak `z-index: 999999` seviyesinde render edilir.
- **Mobil Uyum**: `maxHeight: calc(100vh - 48px)`, esnek scroll gövdesi (`overflowY: auto`) ve dokunmatik kaydırma (`-webkit-overflow-scrolling: touch`) ile küçük ekranlarda asla taşma yapmaz.

### 📊 Z-Index Hiyerarşi Tablosu:
| Katman | Z-Index Değeri | Kullanım Alanı |
|---|---|---|
| Sayfa İçeriği & Kartlar | `0 - 10` | Normal sayfa akışı, tablolar, form alanları |
| Sticky Filtre / Tab Bar | `20 - 50` | Tablo filtre çubukları, alt gezinme butonları |
| Sabit Üst Bar (Header) | `100` | Admin, öğretmen ve öğrenci portal header'ı |
| Toast & Bildirimler | `1000` | Anlık başarı / hata uyarıları |
| **Evrensel Modallar (`<Modal />`)** | **`999999`** | **Tüm popup, onay, düzenleme ve detay modalları (Portal)** |


