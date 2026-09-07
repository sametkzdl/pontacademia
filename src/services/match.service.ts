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
        lessons: {
          select: {
            id: true,
            scheduledDate: true,
            status: true,
            durationMinutes: true,
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
   * Öğrencinin Talep Ettiği Dersleri ve Eşleşme Durumunu Getir
   */
  static async getStudentMatchStatus(studentId: string) {
    if (!studentId) {
      throw new Error("Öğrenci ID'si gereklidir.");
    }

    const student = await db.user.findUnique({
      where: { id: studentId },
      include: { studentProfile: true },
    });

    if (!student || student.role !== "STUDENT") {
      throw new Error("Öğrenci bulunamadı veya yetkisiz.");
    }

    // Öğrencinin aktif eşleştirmelerini çek
    const activeMatches = await db.studentTeacherMatch.findMany({
      where: {
        studentId,
        status: "ACTIVE",
      },
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

    // Öğrencinin talep ettiği dersleri ayıkla
    const rawSelected = student.studentProfile?.selectedSubjects || student.studentProfile?.subject || "";
    const requestedSubjectsList: string[] = rawSelected
      ? rawSelected.split(",").map((s: string) => s.trim()).filter(Boolean)
      : [];

    // Eşleşmiş dersleri map et
    const matchedSubjects = activeMatches.map((m) => ({
      id: m.id,
      type: m.type,
      subject: m.subject,
      teacherId: m.teacherId,
      teacherName: m.teacher?.name || "Eğitmen",
      createdAt: m.createdAt,
    }));

    const normalize = (str: string) => (str || "").toLowerCase().replace(/[^a-z0-9ğüşıöç]/g, "");

    // Eşleşmemiş talep edilen dersleri filtrele
    const unmatchedSubjects: string[] = [];
    const matchedRequestedSubjects: Array<{ subject: string; teacherName: string }> = [];

    for (const reqSub of requestedSubjectsList) {
      const isCoachingReq = reqSub.toLowerCase().includes("koçluk") || reqSub.toLowerCase().includes("kocluk");
      
      if (isCoachingReq) {
        const coachingMatch = matchedSubjects.find(m => m.type === "KOCLUK");
        if (coachingMatch) {
          matchedRequestedSubjects.push({ subject: reqSub, teacherName: coachingMatch.teacherName });
        } else {
          unmatchedSubjects.push(reqSub);
        }
      } else {
        const normReq = normalize(reqSub);
        const match = matchedSubjects.find(m => {
          const normSub = normalize(m.subject || "");
          return normSub === normReq || (normReq.length > 3 && normSub.includes(normReq)) || (normSub.length > 3 && normReq.includes(normSub));
        });

        if (match) {
          matchedRequestedSubjects.push({ subject: reqSub, teacherName: match.teacherName });
        } else {
          unmatchedSubjects.push(reqSub);
        }
      }
    }

    return {
      studentId,
      studentName: student.name,
      studentProfile: student.studentProfile,
      requestedSubjects: requestedSubjectsList,
      matchedSubjects,
      matchedRequestedSubjects,
      unmatchedSubjects,
      hasActiveCoaching: matchedSubjects.some(m => m.type === "KOCLUK"),
    };
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
   * Eşleştirmeyi Güncelle (Öğretmen Değiştirme, Durum veya Not Güncelleme)
   */
  static async updateMatch(
    matchId: string,
    data: { teacherId?: string; status?: string; notes?: string; subject?: string }
  ) {
    const currentMatch = await db.studentTeacherMatch.findUnique({
      where: { id: matchId },
      include: { student: true, teacher: true },
    });

    if (!currentMatch) {
      throw new Error("Eşleştirme bulunamadı.");
    }

    if (data.teacherId && data.teacherId !== currentMatch.teacherId) {
      // 1. Bu eşleştirmeye ait henüz işlenmemiş / tamamlanmamış (PENDING_APPROVAL veya SCHEDULED) ders var mı kontrol et
      const pendingLessons = await db.lesson.findMany({
        where: {
          matchId: matchId,
          status: { in: ["PENDING_APPROVAL", "SCHEDULED"] },
        },
      });

      if (pendingLessons.length > 0) {
        throw new Error(
          `Bu öğrenci ve öğretmen arasında henüz işlenmemiş ${pendingLessons.length} adet planlı veya onay bekleyen ders bulunmaktadır. Eğitmeni değiştirmeden önce mevcut derslerin tamamlanması veya iptal edilmesi gerekmektedir.`
        );
      }

      // 2. Yeni öğretmenin geçerli bir TEACHER olup olmadığını kontrol et
      const newTeacher = await db.user.findUnique({
        where: { id: data.teacherId },
      });

      if (!newTeacher || newTeacher.role !== "TEACHER") {
        throw new Error("Seçilen kullanıcı geçerli bir eğitmen değil.");
      }

      // Yeni öğretmen ile öğrenci arasında aynı ders/koçluk için aktif eşleştirme var mı?
      const existingMatch = await db.studentTeacherMatch.findFirst({
        where: {
          id: { not: matchId },
          studentId: currentMatch.studentId,
          teacherId: data.teacherId,
          type: currentMatch.type,
          status: "ACTIVE",
          ...(currentMatch.type === "OZEL_DERS" ? { subject: currentMatch.subject } : {}),
        },
      });

      if (existingMatch) {
        if (currentMatch.type === "KOCLUK") {
          throw new Error(
            `Seçilen eğitmen (${newTeacher.name}) ile bu öğrenci arasında zaten aktif bir Eğitim Koçluğu eşleştirmesi bulunmaktadır.`
          );
        } else {
          throw new Error(
            `Seçilen eğitmen (${newTeacher.name}) ile bu öğrenci arasında "${currentMatch.subject}" dersi için zaten aktif bir eşleştirme bulunmaktadır.`
          );
        }
      }
    }

    return await db.studentTeacherMatch.update({
      where: { id: matchId },
      data: {
        ...(data.teacherId ? { teacherId: data.teacherId } : {}),
        ...(data.status ? { status: data.status } : {}),
        ...(data.subject ? { subject: data.subject } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            studentProfile: {
              select: {
                phone: true,
                grade: true,
                currentDistrict: true,
                city: true,
              },
            },
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            teacherProfile: {
              select: {
                phone: true,
                school: true,
                currentDistrict: true,
                districts: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Eşleşme Durumunu Değiştir (ACTIVE <-> PASSIVE)
   * Pasife alınmış bir eşleşme aktifleştirilmek istendiğinde mükerrer aktif ders kontrolü yapar.
   */
  static async toggleMatchStatus(matchId: string, newStatus: "ACTIVE" | "PASSIVE") {
    const currentMatch = await db.studentTeacherMatch.findUnique({
      where: { id: matchId },
      include: {
        student: true,
        teacher: true,
      },
    });

    if (!currentMatch) {
      throw new Error("Eşleştirme kaydı bulunamadı.");
    }

    if (newStatus === "ACTIVE" && currentMatch.status !== "ACTIVE") {
      // Bu öğrencinin bu branş için zaten başka bir AKTİF eşleşmesi var mı?
      const conflictingMatch = await db.studentTeacherMatch.findFirst({
        where: {
          id: { not: matchId },
          studentId: currentMatch.studentId,
          type: currentMatch.type,
          status: "ACTIVE",
          ...(currentMatch.type === "OZEL_DERS" ? { subject: currentMatch.subject } : {}),
        },
        include: { teacher: true },
      });

      if (conflictingMatch) {
        if (currentMatch.type === "KOCLUK") {
          throw new Error(
            `Öğrencinin halihazırda ${conflictingMatch.teacher?.name || "başka bir eğitmen"} ile aktif bir Eğitim Koçluğu eşleştirmesi bulunmaktadır. Bu eşleştirmeyi aktife alabilmek için önce mevcut aktif eşleştirmeyi pasife almalısınız.`
          );
        } else {
          throw new Error(
            `Öğrencinin "${currentMatch.subject}" dersi için halihazırda ${conflictingMatch.teacher?.name || "başka bir eğitmen"} ile aktif bir eşleştirmesi bulunmaktadır. Bu eşleştirmeyi aktife alabilmek için önce mevcut aktif eşleştirmeyi pasife almalısınız.`
          );
        }
      }
    }

    return await db.studentTeacherMatch.update({
      where: { id: matchId },
      data: { status: newStatus },
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
        lessons: {
          select: {
            id: true,
            scheduledDate: true,
            status: true,
            durationMinutes: true,
          },
        },
      },
    });
  }
}


