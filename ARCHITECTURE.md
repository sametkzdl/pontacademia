# 🏛️ Pont Academy - Clean Architecture & Sistem Mimarisi Rehberi

Bu belge, **Pont Academy** projesinin kurumsal yazılım geliştirme standartlarını, katmanlı mimari yapısını, dosya hiyerarşisini ve ölçeklenebilirlik kurallarını tanımlar. Projeye eklenecek her yeni özellik ve uç nokta (endpoint) buradaki standartlara sıkı sıkıya bağlı kalmalıdır.

---

## 📂 1. Katman Hiyerarşisi ve Dizin Yapısı

Proje, **Clean Architecture (Temiz Mimari)** ve **SoC (Separation of Concerns - Sorumlulukların Ayrışması)** prensiplerine göre yapılandırılmıştır:

```
pontacademia/
├── prisma/
│   └── schema/                         # 🗄️ Modüler Prisma Veritabanı Şemaları
│       ├── base.prisma                 # Datasource & Client Generator
│       ├── user.prisma                 # User modeli ve genel kimlik modelleri
│       ├── teacher.prisma              # TeacherProfile ve TeacherApplication modelleri
│       └── student.prisma              # StudentProfile ve StudentApplication modelleri
├── src/
│   ├── app/
│   │   ├── api/                        # ⚡ Ultra-Thin Route Handlers (Sadece yönlendirici)
│   │   │   ├── admin/
│   │   │   │   ├── applications/
│   │   │   │   └── users/
│   │   │   ├── applications/
│   │   │   │   ├── teacher/
│   │   │   │   └── student/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   ├── logout/
│   │   │   │   ├── me/
│   │   │   │   └── change-password/
│   │   │   └── profile/
│   │   ├── admin/                      # 🖥️ Yönetici Portalı UI
│   │   ├── teacher/                    # 🖥️ Eğitmen Portalı UI
│   │   ├── student/                    # 🖥️ Öğrenci Portalı UI
│   │   ├── login/                      # 🖥️ Giriş Sayfası UI
│   │   ├── teacherApplicationForm/     # 🖥️ Eğitmen Başvuru Formu UI
│   │   └── actions.ts                  # Server Actions köprüleri
│   ├── controllers/                    # 🎯 Request/Response Orkestrasyonu & Validation
│   │   ├── auth.controller.ts          # Giriş, çıkış, oturum ve şifre kontrolcüsü
│   │   ├── application.controller.ts   # Başvuru onay, ret ve kayıt kontrolcüsü
│   │   ├── user.controller.ts          # Kullanıcı listeleme ve durum kontrolcüsü
│   │   └── profile.controller.ts       # Profil güncelleme kontrolcüsü
│   ├── services/                       # ⚙️ Saf İş Mantığı (Business Logic) & DB İşlemleri
│   │   ├── auth.service.ts             # Auth iş kuralları
│   │   ├── application.service.ts      # Başvuru iş kuralları & kullanıcı oluşturma
│   │   ├── user.service.ts             # Kullanıcı filtreleme & aktif/pasif operasyonları
│   │   └── profile.service.ts          # Profil veri mutasyonları
│   ├── utils/                          # 🧰 Yardımcı Araçlar, Güvenlik & 3. Parti
│   │   ├── db.ts                       # Singleton Prisma Client (`db` & `prisma`)
│   │   ├── auth.ts                     # JWT imzalama, doğrulama & session helpers
│   │   ├── hash.ts                     # Bcrypt şifre hashleme & karşılaştırma
│   │   ├── response.ts                 # Standart ApiResponse JSON üreticisi
│   │   └── third-party/                # 🌐 Dış Servis Entegrasyonları
│   │       └── mail.service.ts         # E-posta bildirim servisi (Resend, SES, SMTP)
│   └── middleware.ts                   # 🛡️ Rol Tabanlı Güzergah Koruyucu (Route Guard)
└── ARCHITECTURE.md                     # 📖 Bu Doküman
```

---

## 🧱 2. Katmanların Görev ve Sorumlulukları

### A. Route Handlers (`src/app/api/.../route.ts`)
- **Görevi**: Sadece Next.js HTTP metodlarını (`GET`, `POST`, `PATCH`, `DELETE`) karşılamak ve isteği doğrudan ilgili Controller'a devretmek.
- **Kural**: Route handler dosyalarında **asla** veritabanı sorgusu, doğrudan JWT doğrulaması veya karmaşık iş mantığı yazılmaz.
- **Örnek Kod**:
```typescript
import { NextRequest } from "next/server";
import { AuthController } from "@/controllers/auth.controller";

export async function POST(req: NextRequest) {
  return AuthController.login(req);
}
```

---

### B. Controller Katmanı (`src/controllers/...`)
- **Görevi**: 
  1. HTTP isteğinden parametreleri ve gövdeyi (`req.json()`) çıkarmak.
  2. Girdi doğrulamasını (Validation) yapmak.
  3. Gerekli yetki kontrollerini (`getSessionUser()`, `role === "ADMIN"`) gerçekleştirmek.
  4. İşi Service katmanına devretmek.
  5. Standart `ApiResponse` formatında yanıt dönmek (`ApiResponse.success`, `ApiResponse.error`, `ApiResponse.forbidden`).
- **Örnek Kod**:
```typescript
export class ApplicationController {
  static async approveTeacher(req: NextRequest) {
    try {
      const session = await getSessionUser();
      if (!session || session.role !== "ADMIN") {
        return ApiResponse.forbidden("Yetkisiz işlem.");
      }

      const { applicationId, temporaryPassword } = await req.json();
      const result = await ApplicationService.approveTeacherApplication(applicationId, temporaryPassword);
      return ApiResponse.success(result);
    } catch (err: any) {
      return ApiResponse.error(err.message || "İşlem başarısız.", 400);
    }
  }
}
```

---

### C. Service Katmanı (`src/services/...`)
- **Görevi**: Sistemin kalbidir. Saf iş mantığını, veritabanı sorgularını (`db`), veri dönüşümlerini ve servisler arası koordinasyonu yönetir.
- **Kural**: Service sınıfları `NextRequest` veya `NextResponse` gibi HTTP nesnelerine **bağımlı olmamalıdır**. Saf TypeScript tipleri alır ve saf veri veya hata fırlatır (`throw new Error(...)`).
- **Örnek Kod**:
```typescript
export class UserService {
  static async toggleUserStatus(userId: string, isActive: boolean) {
    if (!userId) throw new Error("Kullanıcı ID'si gereklidir.");
    return await db.user.update({
      where: { id: userId },
      data: { isActive },
    });
  }
}
```

---

### D. Utils & 3. Parti Entegrasyon Katmanı (`src/utils/...`)
- **`src/utils/db.ts`**: Global Prisma client singleton.
- **`src/utils/auth.ts`**: JWT token imzalama (`signToken`), doğrulama (`verifyToken`), cookie oturum okuma (`getSessionUser`).
- **`src/utils/hash.ts`**: Güvenli şifre hashleme ve parola doğrulama.
- **`src/utils/response.ts`**: Tutarlı API yanıt formatı sağlayan `ApiResponse` sınıfı.
- **`src/utils/third-party/`**: E-posta, SMS, ödeme geçitleri, dosya yükleme (S3/Cloudinary) gibi dış dünya servisleri.

---

### E. Modüler Prisma Şemaları (`prisma/schema/...`)
- Prisma 6'nın `prismaSchemaFolder` özelliğiyle şemalar parçalanmıştır:
  - `base.prisma`: SQLite bağlantısı ve Client yapılandırması.
  - `user.prisma`: Kullanıcı kimlik tablosu (`users`).
  - `teacher.prisma`: `TeacherProfile` ve `TeacherApplication` modelleri.
  - `student.prisma`: `StudentProfile` ve `StudentApplication` modelleri.
- Şemada değişiklik yapıldığında:
  ```bash
  npx prisma validate
  npx prisma generate
  npx prisma db push
  ```

---

## 🚀 3. Yeni Bir Özellik Eklerken İzlenecek Adımlar (Ölçekleme Kılavuzu)

1. **Model İhtiyacı Varsa**:
   - `prisma/schema/` altında ilgili `.prisma` dosyasını oluşturun veya güncelleyin.
   - `npx prisma db push` ile veritabanını güncelleyin.
2. **Utils / 3. Parti İhtiyacı Varsa**:
   - `src/utils/` veya `src/utils/third-party/` altına yardımcı fonksiyonu veya servis sınıfını ekleyin.
3. **Servis Katmanı (`src/services/`)**:
   - Saf iş mantığını içeren metodu ekleyin (`XService.doSomething(data)`).
4. **Controller Katmanı (`src/controllers/`)**:
   - İstek doğrulama ve `ApiResponse` dönüşünü sağlayan Controller metodunu ekleyin (`XController.handleSomething(req)`).
5. **Route Handler (`src/app/api/.../route.ts`)**:
   - Controller metodunu çağıran ince rotayı oluşturun.
6. **Frontend Arayüzü**:
   - React bileşeninden ilgili API rotasını çağırın.
