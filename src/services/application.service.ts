import db from "@/utils/db";
import { hashPassword } from "@/utils/hash";
import { ThirdPartyMailService } from "@/utils/third-party/mail.service";

export interface TeacherApplicationInput {
  fullName: string;
  birthDate: string;
  gender: string;
  phone: string;
  email: string;
  iban: string;
  currentDistrict: string;
  currentAddress: string;
  school: string;
  scoreType?: string;
  yksRank: string;
  classStatus: string;
  districts: string[];
  onlineAvailable: boolean;
  notes?: string;
  tytScores: Record<string, number>;
  aytScores: Record<string, number>;
}

export interface StudentApplicationInput {
  formType: "ozel_ders" | "kocluk";
  name: string;
  phone: string;
  email: string;
  parentName?: string;
  parentPhone?: string;
  scoreType?: string;
  city?: string;
  currentDistrict?: string;
  currentAddress?: string;
  grade?: string;
  subject?: string;
  selectedSubjects?: string;
  target?: string;
  coachId?: string;
  coachName?: string;
  photoUrl?: string;
  photoFileName?: string;
  notes?: string;
}

export class ApplicationService {
  /**
   * Öğretmen Başvurusu Kaydet
   */
  static async createTeacherApplication(data: TeacherApplicationInput) {
    if (!data.fullName || !data.email || !data.phone || !data.school) {
      throw new Error("Lütfen tüm zorunlu alanları doldurunuz.");
    }

    return await db.teacherApplication.create({
      data: {
        fullName: data.fullName.trim(),
        birthDate: data.birthDate || "",
        gender: data.gender || "",
        phone: data.phone.trim(),
        email: data.email.toLowerCase().trim(),
        iban: data.iban ? data.iban.trim() : "",
        currentDistrict: data.currentDistrict || "",
        currentAddress: data.currentAddress || "",
        school: data.school.trim(),
        scoreType: data.scoreType || "SAY",
        yksRank: data.yksRank || "",
        classStatus: data.classStatus || "",
        districts: Array.isArray(data.districts) ? data.districts.join(", ") : (data.districts || ""),
        onlineAvailable: Boolean(data.onlineAvailable),
        notes: data.notes || "",
        tytScores: JSON.stringify(data.tytScores || {}),
        aytScores: JSON.stringify(data.aytScores || {}),
        status: "PENDING",
      },
    });
  }

  /**
   * Öğrenci Başvurusu Kaydet (Özel Ders / Koçluk)
   */
  static async createStudentApplication(data: StudentApplicationInput) {
    if (!data.name || !data.phone || !data.email) {
      throw new Error("Lütfen Ad Soyad, Telefon ve E-posta alanlarını doldurunuz.");
    }

    return await db.studentApplication.create({
      data: {
        formType: data.formType || "ozel_ders",
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: data.email.toLowerCase().trim(),
        parentName: data.parentName ? data.parentName.trim() : null,
        parentPhone: data.parentPhone ? data.parentPhone.trim() : null,
        scoreType: data.scoreType || "SAY",
        city: data.city || "",
        currentDistrict: data.currentDistrict || "",
        currentAddress: data.currentAddress || "",
        grade: data.grade || "",
        subject: data.subject || "",
        selectedSubjects: data.selectedSubjects || "",
        target: data.target || "",
        coachId: data.coachId || "",
        coachName: data.coachName || "",
        photoUrl: data.photoUrl || null,
        photoFileName: data.photoFileName || null,
        notes: data.notes || "",
        status: "PENDING",
      },
    });
  }

  /**
   * Tüm Başvuruları Getir (Admin için)
   */
  static async getAllApplications() {
    const [teacherApplications, studentApplications] = await Promise.all([
      db.teacherApplication.findMany({ orderBy: { createdAt: "desc" } }),
      db.studentApplication.findMany({ orderBy: { createdAt: "desc" } }),
    ]);

    return {
      teacherApplications,
      studentApplications,
    };
  }

  /**
   * Öğretmen Başvurusunu Onayla ve Öğretmen Hesabı Aç
   */
  static async approveTeacherApplication(applicationId: string, temporaryPassword: string) {
    const application = await db.teacherApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new Error("Başvuru bulunamadı.");
    }

    const passwordHash = await hashPassword(temporaryPassword);

    // Parse scores
    let parsedTyt: Record<string, number> = {};
    let parsedAyt: Record<string, number> = {};
    try {
      if (application.tytScores) parsedTyt = JSON.parse(application.tytScores);
      if (application.aytScores) parsedAyt = JSON.parse(application.aytScores);
    } catch {
      // ignore JSON parse error
    }

    // Upsert User
    const user = await db.user.upsert({
      where: { email: application.email.toLowerCase().trim() },
      update: {
        name: application.fullName,
        role: "TEACHER",
        passwordHash,
        mustChangePassword: true,
        isActive: true,
      },
      create: {
        email: application.email.toLowerCase().trim(),
        name: application.fullName,
        role: "TEACHER",
        passwordHash,
        mustChangePassword: true,
        isActive: true,
      },
    });

    const teacherPhoto = application.photoFileName
      ? (application.photoFileName.startsWith("http") || application.photoFileName.startsWith("/")
          ? application.photoFileName
          : `/api/storage/file?key=${encodeURIComponent(application.photoFileName)}`)
      : null;

    // Upsert TeacherProfile
    await db.teacherProfile.upsert({
      where: { userId: user.id },
      update: {
        phone: application.phone,
        iban: application.iban,
        birthDate: application.birthDate,
        gender: application.gender,
        school: application.school,
        scoreType: application.scoreType || "SAY",
        yksRank: application.yksRank,
        classStatus: application.classStatus,
        currentDistrict: application.currentDistrict,
        currentAddress: application.currentAddress,
        districts: application.districts,
        onlineAvailable: application.onlineAvailable,
        showPhotoOnWeb: true,
        photoUrl: teacherPhoto || undefined,
        notes: application.notes,
        tytTurkce: parsedTyt["tytTurkce"] ?? parsedTyt["Türkçe"] ?? 5,
        tytMat: parsedTyt["tytMat"] ?? parsedTyt["Temel Matematik"] ?? 5,
        tytFizik: parsedTyt["tytFizik"] ?? parsedTyt["Fizik"] ?? 5,
        tytKimya: parsedTyt["tytKimya"] ?? parsedTyt["Kimya"] ?? 5,
        tytBiyoloji: parsedTyt["tytBiyoloji"] ?? parsedTyt["Biyoloji"] ?? 5,
        tytTarih: parsedTyt["tytTarih"] ?? parsedTyt["Tarih"] ?? 5,
        tytCografya: parsedTyt["tytCografya"] ?? parsedTyt["Coğrafya"] ?? 5,
        aytMat: parsedAyt["aytMat"] ?? parsedAyt["Matematik"] ?? 5,
        aytFizik: parsedAyt["aytFizik"] ?? parsedAyt["Fizik"] ?? 5,
        aytKimya: parsedAyt["aytKimya"] ?? parsedAyt["Kimya"] ?? 5,
        aytBiyoloji: parsedAyt["aytBiyoloji"] ?? parsedAyt["Biyoloji"] ?? 5,
        aytTurkce: parsedAyt["aytTurkce"] ?? parsedAyt["Edebiyat"] ?? 5,
        aytTarih: parsedAyt["aytTarih"] ?? parsedAyt["Tarih-1"] ?? 5,
        aytCografya: parsedAyt["aytCografya"] ?? parsedAyt["Coğrafya-1"] ?? 5,
        ydtIngilizce: parsedAyt["ydtIngilizce"] ?? parsedAyt["İngilizce (YDT)"] ?? parsedAyt["İngilizce"] ?? 5,
      },
      create: {
        userId: user.id,
        phone: application.phone,
        iban: application.iban,
        birthDate: application.birthDate,
        gender: application.gender,
        school: application.school,
        scoreType: application.scoreType || "SAY",
        yksRank: application.yksRank,
        classStatus: application.classStatus,
        currentDistrict: application.currentDistrict,
        currentAddress: application.currentAddress,
        districts: application.districts,
        onlineAvailable: application.onlineAvailable,
        showPhotoOnWeb: true,
        photoUrl: teacherPhoto,
        notes: application.notes,
        tytTurkce: parsedTyt["tytTurkce"] ?? parsedTyt["Türkçe"] ?? 5,
        tytMat: parsedTyt["tytMat"] ?? parsedTyt["Temel Matematik"] ?? 5,
        tytFizik: parsedTyt["tytFizik"] ?? parsedTyt["Fizik"] ?? 5,
        tytKimya: parsedTyt["tytKimya"] ?? parsedTyt["Kimya"] ?? 5,
        tytBiyoloji: parsedTyt["tytBiyoloji"] ?? parsedTyt["Biyoloji"] ?? 5,
        tytTarih: parsedTyt["tytTarih"] ?? parsedTyt["Tarih"] ?? 5,
        tytCografya: parsedTyt["tytCografya"] ?? parsedTyt["Coğrafya"] ?? 5,
        aytMat: parsedAyt["aytMat"] ?? parsedAyt["Matematik"] ?? 5,
        aytFizik: parsedAyt["aytFizik"] ?? parsedAyt["Fizik"] ?? 5,
        aytKimya: parsedAyt["aytKimya"] ?? parsedAyt["Kimya"] ?? 5,
        aytBiyoloji: parsedAyt["aytBiyoloji"] ?? parsedAyt["Biyoloji"] ?? 5,
        aytTurkce: parsedAyt["aytTurkce"] ?? parsedAyt["Edebiyat"] ?? 5,
        aytTarih: parsedAyt["aytTarih"] ?? parsedAyt["Tarih-1"] ?? 5,
        aytCografya: parsedAyt["aytCografya"] ?? parsedAyt["Coğrafya-1"] ?? 5,
        ydtIngilizce: parsedAyt["ydtIngilizce"] ?? parsedAyt["İngilizce (YDT)"] ?? parsedAyt["İngilizce"] ?? 5,
      },
    });

    // Update Application Status
    await db.teacherApplication.update({
      where: { id: applicationId },
      data: {
        status: "APPROVED",
        approvedUserId: user.id,
      },
    });

    // 3. Parti Mail Gönderimi (Asenkron)
    ThirdPartyMailService.sendAccountApprovalMail(
      application.email,
      application.fullName,
      temporaryPassword,
      "TEACHER"
    ).catch(err => console.error("Mail gönderme hatası:", err));

    return { user, temporaryPassword };
  }

  /**
   * Öğretmen Başvurusunu Reddet
   */
  static async rejectTeacherApplication(applicationId: string) {
    return await db.teacherApplication.update({
      where: { id: applicationId },
      data: { status: "REJECTED" },
    });
  }

  /**
   * Öğrenci Başvurusunu Onayla ve Öğrenci Hesabı Aç / Mevcut Hesaba Bağla
   */
  static async approveStudentApplication(applicationId: string, temporaryPassword?: string) {
    const application = await db.studentApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new Error("Başvuru bulunamadı.");
    }

    const email = application.email.toLowerCase().trim();
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    let user;
    let isNewAccount = false;
    const finalTempPassword = temporaryPassword || Math.random().toString(36).substring(2, 10);

    if (existingUser) {
      // Kullanıcı zaten var, şifresini ezmiyoruz
      user = await db.user.update({
        where: { id: existingUser.id },
        data: {
          name: application.name || existingUser.name,
          isActive: true,
        },
      });
    } else {
      // Yeni kullanıcı oluşturuyoruz
      isNewAccount = true;
      const passwordHash = await hashPassword(finalTempPassword);
      user = await db.user.create({
        data: {
          email,
          name: application.name,
          role: "STUDENT",
          passwordHash,
          mustChangePassword: true,
          isActive: true,
        },
      });
    }

    const studentPhoto = application.photoFileName || application.photoUrl || null;

    await db.studentProfile.upsert({
      where: { userId: user.id },
      update: {
        phone: application.phone,
        parentName: application.parentName,
        parentPhone: application.parentPhone,
        scoreType: application.scoreType,
        city: application.city,
        currentDistrict: application.currentDistrict,
        currentAddress: application.currentAddress,
        grade: application.grade,
        target: application.target,
        subject: application.subject,
        selectedSubjects: application.selectedSubjects,
        photoUrl: studentPhoto || undefined,
      },
      create: {
        userId: user.id,
        phone: application.phone,
        parentName: application.parentName,
        parentPhone: application.parentPhone,
        scoreType: application.scoreType,
        city: application.city,
        currentDistrict: application.currentDistrict,
        currentAddress: application.currentAddress,
        grade: application.grade,
        target: application.target,
        subject: application.subject,
        selectedSubjects: application.selectedSubjects,
        photoUrl: studentPhoto,
      },
    });

    await db.studentApplication.update({
      where: { id: applicationId },
      data: {
        status: "APPROVED",
        approvedUserId: user.id,
      },
    });

    if (isNewAccount) {
      ThirdPartyMailService.sendAccountApprovalMail(
        application.email,
        application.name,
        finalTempPassword,
        "STUDENT"
      ).catch(err => console.error("Mail gönderme hatası:", err));
    }

    return { user, temporaryPassword: isNewAccount ? finalTempPassword : null, isNewAccount };
  }

  /**
   * Öğrenci Başvurusunu Reddet
   */
  static async rejectStudentApplication(applicationId: string) {
    return await db.studentApplication.update({
      where: { id: applicationId },
      data: { status: "REJECTED" },
    });
  }

  /**
   * Öğretmen Başvurusundaki Ders Bilgi & Yetkinlik Puanlarını Güncelle (Admin için)
   */
  static async updateTeacherApplicationScores(
    applicationId: string,
    data: { tytScores?: Record<string, number> | string; aytScores?: Record<string, number> | string }
  ) {
    const updateData: any = {};
    if (data.tytScores !== undefined) {
      updateData.tytScores = typeof data.tytScores === "string" ? data.tytScores : JSON.stringify(data.tytScores);
    }
    if (data.aytScores !== undefined) {
      updateData.aytScores = typeof data.aytScores === "string" ? data.aytScores : JSON.stringify(data.aytScores);
    }

    return await db.teacherApplication.update({
      where: { id: applicationId },
      data: updateData,
    });
  }
}

