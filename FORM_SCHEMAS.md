# 📝 Form Şemaları ve Veri Yapıları (FORM_SCHEMAS.md)

Bu dokümanda Pont Academy üzerindeki form alanları, tipleri, doğrulama (validation) kuralları ve backend'e gönderilen JSON payload formatları yer almaktadır.

---

## 1. Eğitmen Başvuru Formu (`/teacherApplicationForm`)

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
| `yksRank` | `string` | Evet | YKS Derecesi/Sıralaması (Örn: Sayısal 450.) |
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
| `districts` | `string` | **Evet** | Yüz yüze ders verilebilecek ilçeler (Virgülle ayrılmış metin) |
| `onlineAvailable` | `string` | Hayır | `"Evet"` veya `""` (Online ders verebilme seçeneği) |
| `notes` | `string` | Hayır | Eklemek istenen notlar, tecrübeler ve müsaitlik |
| `formType` | `string` | Evet | Sabit değer: `"teacher_application"` |
| `submittedAt` | `ISO8601` | Evet | Gönderim zaman damgası |

### Örnek JSON Payload
```json
{
  "formType": "teacher_application",
  "fullName": "Ahmet Yılmaz",
  "birthDate": "2002-05-14",
  "gender": "Erkek",
  "phone": "05321234567",
  "email": "ahmet.yilmaz@boun.edu.tr",
  "iban": "TR120006200000012345678901",
  "currentDistrict": "Kadıköy",
  "currentAddress": "Moda Cad. No: 24 D: 5 Kadıköy / İstanbul",
  "school": "Boğaziçi Üniversitesi - Bilgisayar Mühendisliği",
  "yksRank": "SAY 240.",
  "classStatus": "2. Sınıf",
  "photoFileName": "profil_foto.png",
  "tytTurkce": "9",
  "tytMat": "10",
  "tytFizik": "9",
  "tytKimya": "8",
  "tytBiyoloji": "7",
  "tytTarih": "6",
  "tytCografya": "6",
  "aytMat": "10",
  "aytFizik": "10",
  "aytKimya": "9",
  "aytBiyoloji": "8",
  "aytTurkce": "5",
  "aytTarih": "5",
  "aytCografya": "5",
  "districts": "Kadıköy, Üsküdar, Ataşehir, Beşiktaş, Şişli",
  "onlineAvailable": "Evet",
  "notes": "Hafta sonları ve hafta içi akşam saatleri için müsaitim.",
  "submittedAt": "2026-09-07T13:00:00.000Z"
}
```

---

## 2. Özel Ders Başvuru Formu (`/ozel-ders-basvuru`)

| Alan Adı | Tip | Açıklama |
|---|---|---|
| `name` | `string` | Öğrencinin / Velinin Adı Soyadı |
| `phone` | `string` | İletişim Telefonu |
| `email` | `string` | E-posta Adresi |
| `city` | `string` | Şehir / İlçe |
| `grade` | `string` | Sınıfı (9, 10, 11, 12, Mezun, LGS) |
| `subject` | `string` | Talep edilen ders (Matematik, Fizik, Kimya vb.) |
| `target` | `string` | Hedeflenen üniversite / bölüm / lise |
| `notes` | `string` | Öğrenci durumu ile ilgili ek notlar |
| `formType` | `string` | Sabit değer: `"ozel_ders"` |

---

## 3. Koçluk Başvuru Formu (`/kocluk-basvuru`)

| Alan Adı | Tip | Açıklama |
|---|---|---|
| `name` | `string` | Öğrencinin / Velinin Adı Soyadı |
| `phone` | `string` | İletişim Telefonu |
| `email` | `string` | E-posta Adresi |
| `city` | `string` | Şehir / İlçe |
| `grade` | `string` | Sınıfı |
| `coachId` | `string` | Tercih edilen koçun ID'si (veya "fark_etmez") |
| `coachName` | `string` | Tercih edilen koçun adı |
| `targetScore` | `string` | Hedeflenen sıralama veya puan |
| `currentNets` | `string` | Mevcut deneme netleri |
| `notes` | `string` | Öğrenci koçluğu ile ilgili beklentiler |
| `formType` | `string` | Sabit değer: `"kocluk"` |
