import db from "@/utils/db";

export interface CreateMatchInput {
  studentId: string;
  teacherId: string;
  type: "KOCLUK" | "OZEL_DERS";
  subject?: string;
  notes?: string;
}

export class MatchService {
  /**
   * Yeni Öğrenci - Öğretmen Eşleştirmesi Oluştur
   */
  static async createMatch(data: CreateMatchInput) {
    if (!data.studentId || !data.teacherId || !data.type) {
      throw new Error("Öğrenci, Öğretmen ve Eşleştirme Türü alanları zorunludur.");
    }

    // Öğrenci ve Öğretmen kullanıcılarını doğrula
    const [student, teacher] = await Promise.all([
      db.user.findUnique({ where: { id: data.studentId }, include: { studentProfile: true } }),
      db.user.findUnique({ where: { id: data.teacherId }, include: { teacherProfile: true } }),
    ]);

    if (!student || student.role !== "STUDENT") {
      throw new Error("Seçilen öğrenci bulunamadı veya geçerli bir öğrenci değil.");
    }

    if (!teacher || (teacher.role !== "TEACHER" && teacher.role !== "ADMIN")) {
      throw new Error("Seçilen öğretmen bulunamadı veya geçerli bir öğretmen değil.");
    }

    const targetSubject = data.type === "OZEL_DERS" ? (data.subject?.trim() || "Genel Özel Ders") : "Eğitim Koçluğu";

    // Aynı öğrenci ve öğretmen arasında aynı ders veya koçluk için aktif eşleştirme kontrolü
    const existingMatch = await db.studentTeacherMatch.findFirst({
      where: {
        studentId: data.studentId,
        teacherId: data.teacherId,
        status: "ACTIVE",
        ...(data.type === "KOCLUK"
          ? { type: "KOCLUK" }
          : { subject: targetSubject }),
      },
    });

    if (existingMatch) {
      if (data.type === "KOCLUK") {
        throw new Error("Bu öğrenci ve öğretmen arasında zaten aktif bir Eğitim Koçluğu eşleştirmesi bulunmaktadır.");
      } else {
        throw new Error(`Bu öğrenci ve öğretmen arasında "${targetSubject}" dersi için zaten aktif bir eşleştirme bulunmaktadır.`);
      }
    }

    return await db.studentTeacherMatch.create({
      data: {
        studentId: data.studentId,
        teacherId: data.teacherId,
        type: data.type,
        subject: targetSubject,
        notes: data.notes || null,
        status: "ACTIVE",
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            studentProfile: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            teacherProfile: true,
          },
        },
      },
    });
  }

  /**
   * Tüm Eşleştirmeleri Getir (Admin için)
   */
  static async getAllMatches() {
    return await db.studentTeacherMatch.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
            studentProfile: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
            teacherProfile: true,
          },
        },
      },
    });
  }

  /**
   * Öğretmenin Eşleşen Öğrencilerini Getir (Koçluk ve Özel Ders Ayrıntılı)
   */
  static async getTeacherMatches(teacherUserId: string) {
    return await db.studentTeacherMatch.findMany({
      where: {
        teacherId: teacherUserId,
        status: "ACTIVE",
      },
      orderBy: { createdAt: "desc" },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            studentProfile: true,
          },
        },
      },
    });
  }

  /**
   * Öğrencinin Eşleşen Öğretmen ve Koçunu Getir
   */
  static async getStudentMatches(studentUserId: string) {
    return await db.studentTeacherMatch.findMany({
      where: {
        studentId: studentUserId,
        status: "ACTIVE",
      },
      orderBy: { createdAt: "desc" },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            teacherProfile: true,
          },
        },
      },
    });
  }

  /**
   * Eşleştirmeyi Sil / Sonlandır
   */
  static async deleteMatch(matchId: string) {
    return await db.studentTeacherMatch.delete({
      where: { id: matchId },
    });
  }

  /**
   * Eşleştirme Durumunu Güncelle (ACTIVE / COMPLETED / CANCELLED)
   */
  static async updateMatch(matchId: string, data: { status?: string; notes?: string; subject?: string }) {
    return await db.studentTeacherMatch.update({
      where: { id: matchId },
      data,
    });
  }
}
