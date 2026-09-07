# 📝 Form Şemaları ve Veri Yapıları (FORM_SCHEMAS.md)

Bu dokümanda Pont Academy üzerindeki başvuru formları, profil güncelleme şemaları, eşleştirme veri yapıları ve backend API payload formatları yer almaktadır.

---

## 1. Eğitmen & Koçluk Başvuru Formu (`/teacherApplicationForm`)

### Form Alanları Tablosu

| Alan Adı (`name`) | Tip | Zorunlu | Açıklama & Değer Aralığı |
|---|---|---|---|
| `fullName` | `string` | Evet | Adayın Adı ve Soyadı |
| `birthDate` | `date` | Evet | Doğum Tarihi (YYYY-AA-GG) |
| `gender` | `enum` | Evet | `"Kadın"` veya `"Erkek"` |
| `phone` | `string` | Evet | Telefon Numarası (05xx xxx xx xx) |
| `email` | `string` | Evet | Geçerli E-posta Adresi |
| `iban` | `string` | Evet | IBAN Numarası (TR...) |
| `currentDistrict` | `enum` | Evet | İstanbul'da ikamet edilen ilçe (39 ilçe listesi) |
| `currentAddress` | `string` | Evet | Açık adres, mahalle, semt veya yurt bilgisi |
| `school` | `string` | Evet | Üniversite ve Bölüm bilgisi |
| `scoreType` | `enum` | Evet | `"SAY"`, `"EA"`, `"SÖZ"`, `"DİL"` |
| `yksRank` | `string` | Evet | YKS Derecesi/Sıralaması (Örn: Sayısal 240.) |
| `classStatus` | `enum` | Evet | `"Hazırlık"`, `"1. Sınıf"`, `"2. Sınıf"`, `"3. Sınıf"`, `"4. Sınıf"`, `"Yüksek Lisans / Doktora"`, `"Mezun"` |
| `photo` | `file` | Evet | Vesikalık / Profil Fotoğrafı (JPG, PNG, WEBP) |
| `photoFileName` | `string` | Evet | Seçilen fotoğraf dosyasının adı |
| `tytTurkce` | `number` | Evet | TYT Türkçe Bilgi Düzeyi (1 - 10) |
| `tytMat` | `number` | Evet | TYT Matematik Bilgi Düzeyi (1 - 10) |
| `tytFizik` | `number` | Evet | TYT Fizik Bilgi Düzeyi (1 - 10) |
| `tytKimya` | `number` | Evet | TYT Kimya Bilgi Düzeyi (1 - 10) |
| `tytBiyoloji` | `number` | Evet | TYT Biyoloji Bilgi Düzeyi (1 - 10) |
| `tytTarih` | `number` | Evet | TYT Tarih Bilgi Düzeyi (1 - 10) |
| `tytCografya` | `number` | Evet | TYT Coğrafya Bilgi Düzeyi (1 - 10) |
| `aytMat` | `number` | Evet | AYT Matematik Bilgi Düzeyi (1 - 10) |
| `aytFizik` | `number` | Evet | AYT Fizik Bilgi Düzeyi (1 - 10) |
| `aytKimya` | `number` | Evet | AYT Kimya Bilgi Düzeyi (1 - 10) |
| `aytBiyoloji` | `number` | Evet | AYT Biyoloji Bilgi Düzeyi (1 - 10) |
| `aytTurkce` | `number` | Evet | AYT Edebiyat/Türkçe Bilgi Düzeyi (1 - 10) |
| `aytTarih` | `number` | Evet | AYT Tarih Bilgi Düzeyi (1 - 10) |
| `aytCografya` | `number` | Evet | AYT Coğrafya Bilgi Düzeyi (1 - 10) |
| `ydtIngilizce` | `number` | Evet | YDT İngilizce Bilgi Düzeyi (1 - 10) |
| `districts` | `string` | **Evet** | Yüz yüze ders verilebilecek ilçeler (Virgülle ayrılmış metin) |
| `onlineAvailable` | `string` | Hayır | `"Evet"` veya `""` (Online ders verebilme seçeneği) |
| `notes` | `string` | Hayır | Eklemek istenen notlar, tecrübeler ve müsaitlik |
| `formType` | `string` | Evet | Sabit değer: `"teacher_application"` |
| `submittedAt` | `ISO8601` | Evet | Gönderim zaman damgası |

---

## 2. Eğitim Koçluğu Başvuru Formu (`/kocluk-basvuru`)

### Form Alanları Tablosu

| Alan Adı | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| `coachId` | `string` | Evet | Seçilen koç ID'si veya `"fark_etmez"` |
| `coachName` | `string` | Evet | Seçilen koçun adı |
| `name` | `string` | Evet | Öğrencinin Adı Soyadı |
| `phone` | `string` | Evet | Öğrenci Telefonu |
| `email` | `string` | Evet | Öğrenci E-posta Adresi |
| `parentName` | `string` | Evet | Velinin Adı Soyadı |
| `parentPhone` | `string` | Evet | Veli Telefon Numarası |
| `scoreType` | `enum` | Evet | Sınav puan türü (`"SAY"`, `"EA"`, `"SÖZ"`, `"DİL"`, `"LGS"`) |
| `grade` | `string` | Evet | Sınıfı (9, 10, 11, 12, Mezun, 8. Sınıf LGS) |
| `currentDistrict` | `enum` | Evet | İstanbul'da ikamet edilen ilçe |
| `currentAddress` | `string` | Evet | Açık adres veya mahalle/semt |
| `target` | `string` | Evet | Hedeflenen Üniversite / Bölüm / Lise |
| `selectedSubjects` | `string` | Evet | Alınmak istenen dersler (Çoklu seçim, virgülle ayrılmış) |
| `notes` | `string` | Hayır | Öğrenci veya veli ek notları |
| `formType` | `string` | Evet | Sabit değer: `"kocluk"` |

---

## 3. Birebir Özel Ders Başvuru Formu (`/ozel-ders-basvuru`)

### Form Alanları Tablosu

| Alan Adı | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| `name` | `string` | Evet | Öğrencinin Adı Soyadı |
| `phone` | `string` | Evet | Öğrenci Telefonu |
| `email` | `string` | Evet | Öğrenci E-posta Adresi |
| `parentName` | `string` | Evet | Velinin Adı Soyadı |
| `parentPhone` | `string` | Evet | Veli Telefon Numarası |
| `scoreType` | `enum` | Evet | Sınav puan türü (`"SAY"`, `"EA"`, `"SÖZ"`, `"DİL"`, `"LGS"`) |
| `grade` | `string` | Evet | Sınıfı (9, 10, 11, 12, Mezun, LGS) |
| `currentDistrict` | `enum` | Evet | İstanbul'da ikamet edilen ilçe |
| `currentAddress` | `string` | Evet | Açık adres veya mahalle/semt |
| `target` | `string` | Evet | Hedeflenen Üniversite / Bölüm |
| `selectedSubjects` | `string` | Evet | Alınmak istenen özel dersler (Çoklu seçim, virgülle ayrılmış) |
| `notes` | `string` | Hayır | Öğrenci durumu ve özel ders talebi notları |
| `formType` | `string` | Evet | Sabit değer: `"ozel_ders"` |

---

## 4. Öğrenci - Öğretmen Eşleştirme API Payload (`POST /api/admin/matches`)

Admin panelinden yeni bir koçluk veya özel ders ataması yapılırken gönderilen JSON gövdesi:

```json
{
  "studentId": "cmtr...",
  "teacherId": "cmtr...",
  "type": "OZEL_DERS",
  "subject": "Matematik",
  "notes": "Haftada 2 gün 2'şer saat yüz yüze Kadıköy'de işlenecek."
}
```

```json
{
  "studentId": "cmtr...",
  "teacherId": "cmtr...",
  "type": "KOCLUK",
  "subject": "Eğitim Koçluğu",
  "notes": "Haftalık YKS SAY derece takibi ve program hazırlığı."
}
```

---

## 5. Sistem & Web Sitesi Genel Ayarlar Şeması (`POST /api/admin/settings`)

| Alan Adı | Tip | Açıklama |
|---|---|---|
| `privateLessonPrice` | `string` | Birebir Özel Ders Saatlik Ücreti (Örn: `"1.250 ₺"`) |
| `coachingPrice` | `string` | Birebir Eğitim Koçluğu Aylık Ücreti (Örn: `"4.500 ₺"`) |
| `campaignBannerActive` | `boolean` | Ana sayfa üst duyuru şeridi aktiflik durumu |
| `campaignBannerText` | `string` | Kampanya duyuru metni |
| `contactPhone` | `string` | İletişim & Danışmanlık telefon numarası |
| `contactEmail` | `string` | İletişim & Destek e-posta adresi |
| `contactAddress` | `string` | Ofis & Kurum açık lokasyon bilgisi |

---

## 6. Web Sitesi İletişim & Bilgi Al Formu (`POST /api/contact`)

| Alan Adı | Tip | Zorunlu | Açıklama |
|---|---|---|---|
| `name` | `string` | Evet | Ad Soyad |
| `email` | `string` | Evet | E-posta adresi |
| `phone` | `string` | Hayır | Telefon numarası |
| `subject` | `string` | Evet | İlgilenilen Alan / Sınav (YKS, LGS, Özel Ders vb.) |
| `message` | `string` | Evet | Öğrenci/Veli mesajı veya danışmanlık talebi |

