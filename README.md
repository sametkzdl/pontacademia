# 🏛️ Pont Academy Web Platform

Pont Academy, YKS & LGS sınavlarına hazırlanan öğrenciler için birebir özel ders, öğrenci koçluğu, puan hesaplama araçları ve derece yapmış eğitmen kadrosu sunan modern bir eğitim platformudur.

---

## 🚀 Teknolojiler & Mimari

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **UI / Kütüphane**: React 19, TypeScript
- **İkon Seti**: Lucide React
- **Stil & Tasarım**: Vanilla CSS & CSS Design System (Açık Cloud & Gece Laciverti, Altın Vurgular)
- **State & Performans**: Native DOM & `FormData` mimarisi (Gereksiz render'ları önleyen sıfır re-render yaklaşımı)
- **Sunucu İletişimi**: Next.js Server Actions (`actions.ts`) & Node.js/PostgreSQL Backend API Entegrasyonu

---

## 📂 Sayfa Yapısı ve Rotalar

| Rota | Durum | Açıklama |
|---|---|---|
| `/` | Genel | Pont Academy ana sayfası (Eğitim modelleri, koçlar, başarı istatistikleri, referanslar) |
| `/ozel-ders-basvuru` | Genel | Öğrenciler için birebir özel ders başvuru formu |
| `/kocluk-basvuru` | Genel | Eğitmen/Koç seçimi ve koçluk başvuru formu |
| `/tyt-puan-hesaplama` | Genel | TYT net ve puan hesaplama motoru |
| `/yks-puan-hesaplama` | Genel | TYT + AYT + OBP puan ve sıralama simülasyonu |
| `/teacherApplicationForm` | **Özel (Gizli Rota)** | Eğitmen ve koç adayları için kapsamlı başvuru ve ders yetkinlik formu (`noindex, nofollow`) |

---

## 📋 Eğitmen Başvuru Formu (`/teacherApplicationForm`)

Eğitmen adaylarının değerlendirilmesi için hazırlanan özel başvuru sayfası aşağıdaki bölümlerden oluşur:

1. **Kişisel & İletişim Bilgileri**: Ad Soyad, Doğum Tarihi, Cinsiyet (Kadın/Erkek), Telefon, E-posta, IBAN Numarası, Vesikalık Fotoğrafı
2. **İstanbul İkametgah / Konum Bilgisi**: Aktif bulunulan ilçe (39 ilçe listesi) ve açık adres/mahalle/yurt bilgisi
3. **Akademik Bilgiler & YKS Derecesi**: Üniversite & Bölüm, YKS Sıralaması, Sınıf / Mezuniyet durumu
4. **Ders Yetkinlik Seviyeleri (10 Üzerinden Puanlama)**:
   - **TYT:** Türkçe, Matematik, Fizik, Kimya, Biyoloji, Tarih, Coğrafya
   - **AYT:** Matematik, Fizik, Kimya, Biyoloji, Edebiyat/Türkçe, Tarih, Coğrafya
5. **Yüz Yüze Gidilebilecek İstanbul İlçeleri (*Zorunlu)**: 39 ilçe içinden çoklu seçim (Avrupa/Anadolu filtreleri, arama çubuğu)
6. **Online Ders Seçeneği (Opsiyonel)**: Uzaktan ders verme tercihi
7. **Ek Notlar (Opsiyonel)**: Eğitmenlik deneyimi ve müsaitlik detayları

---

## 🛠️ Kurulum ve Çalıştırma

### 1. Bağımlılıkları Yükleyin
```bash
npm install
```

### 2. Geliştirme Sunucusunu Başlatın
```bash
npm run dev
```
Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine gidin.

### 3. Prodüksiyon Derlemesi
```bash
npm run build
npm run start
```

---

## 🗄️ Backend Entegrasyonu (Roadmap)

Form verileri `src/app/actions.ts` üzerinden Node.js & PostgreSQL backend servisine yönlendirilecek şekilde yapılandırılmıştır.

Detaylı mimari ve veritabanı şemaları için:
- 📖 [ARCHITECTURE.md](./ARCHITECTURE.md)
- 📋 [FORM_SCHEMAS.md](./FORM_SCHEMAS.md)
