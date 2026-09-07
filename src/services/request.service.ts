import { db } from "@/utils/db";

export interface CreateRequestInput {
  userId: string;
  userRole: "TEACHER" | "STUDENT";
  type: "STUDENT_COMPLAINT" | "TEACHER_DROP_STUDENT" | "STUDENT_LESSON_REQUEST" | "STUDENT_DROP_TEACHER" | "GENERAL_COMPLAINT";
  targetStudentId?: string | null;
  targetTeacherId?: string | null;
  matchId?: string | null;
  subject?: string | null;
  title?: string | null;
  description: string;
}

export interface UpdateRequestStatusInput {
  requestId: string;
  status: "PENDING" | "IN_REVIEW" | "APPROVED" | "REJECTED" | "RESOLVED";
  adminNotes?: string | null;
  adminUserId: string;
}

export class RequestService {
  /**
   * Yeni Talep / Şikayet / Bırakma Formu Oluştur
   */
  static async createRequest(data: CreateRequestInput) {
    if (!data.description || data.description.trim() === "") {
      throw new Error("Açıklama / gerekçe alanı zorunludur.");
    }

    // Eğer matchId verildiyse match bilgilerini doğrula ve eksik target alanlarını doldur
    let validMatchId: string | null = null;
    if (data.matchId) {
      const matchInfo = await db.studentTeacherMatch.findUnique({
        where: { id: data.matchId },
        include: { student: true, teacher: true },
      });

      if (matchInfo) {
        validMatchId = matchInfo.id;
        if (!data.targetStudentId) data.targetStudentId = matchInfo.studentId;
        if (!data.targetTeacherId) data.targetTeacherId = matchInfo.teacherId;
        if (!data.subject) data.subject = matchInfo.subject || (matchInfo.type === "KOCLUK" ? "Eğitim Koçluğu" : "Özel Ders");
      }
    }

    // Yabancı anahtar kontrolü (User doğrulaması)
    let validTargetStudentId: string | null = null;
    if (data.targetStudentId) {
      const exists = await db.user.findUnique({ where: { id: data.targetStudentId }, select: { id: true } });
      if (exists) validTargetStudentId = exists.id;
    }

    let validTargetTeacherId: string | null = null;
    if (data.targetTeacherId) {
      const exists = await db.user.findUnique({ where: { id: data.targetTeacherId }, select: { id: true } });
      if (exists) validTargetTeacherId = exists.id;
    }

    return await db.supportRequest.create({
      data: {
        userId: data.userId,
        userRole: data.userRole,
        type: data.type,
        targetStudentId: validTargetStudentId,
        targetTeacherId: validTargetTeacherId,
        matchId: validMatchId,
        subject: data.subject || null,
        title: data.title || null,
        description: data.description.trim(),
        status: "PENDING",
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        targetStudent: { select: { id: true, name: true, email: true } },
        targetTeacher: { select: { id: true, name: true, email: true } },
        match: true,
      },
    });
  }

  /**
   * Kullanıcının Kendi Taleplerini Getir (Öğretmen veya Öğrenci)
   */
  static async getMyRequests(userId: string) {
    return await db.supportRequest.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        targetStudent: {
          select: {
            id: true,
            name: true,
            email: true,
            studentProfile: { select: { grade: true, phone: true } },
          },
        },
        targetTeacher: {
          select: {
            id: true,
            name: true,
            email: true,
            teacherProfile: { select: { school: true, phone: true } },
          },
        },
        match: {
          select: {
            id: true,
            type: true,
            subject: true,
            status: true,
          },
        },
        resolvedBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Tüm Talepleri Getir (Admin için - Filtreleme Destekli)
   */
  static async getAllRequests(filters?: { type?: string; status?: string; userRole?: string }) {
    const where: any = {};

    if (filters?.type && filters.type !== "ALL") {
      where.type = filters.type;
    }
    if (filters?.status && filters.status !== "ALL") {
      where.status = filters.status;
    }
    if (filters?.userRole && filters.userRole !== "ALL") {
      where.userRole = filters.userRole;
    }

    return await db.supportRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            studentProfile: { select: { grade: true, currentDistrict: true, phone: true } },
            teacherProfile: { select: { school: true, currentDistrict: true, phone: true } },
          },
        },
        targetStudent: {
          select: {
            id: true,
            name: true,
            email: true,
            studentProfile: { select: { grade: true, currentDistrict: true, phone: true } },
          },
        },
        targetTeacher: {
          select: {
            id: true,
            name: true,
            email: true,
            teacherProfile: { select: { school: true, currentDistrict: true, phone: true } },
          },
        },
        match: {
          select: {
            id: true,
            type: true,
            subject: true,
            status: true,
            student: { select: { id: true, name: true, email: true } },
            teacher: { select: { id: true, name: true, email: true } },
          },
        },
        resolvedBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Talep Durumunu Güncelle ve Yanıt Notu Yaz (Admin)
   */
  static async updateRequestStatus(data: UpdateRequestStatusInput) {
    const request = await db.supportRequest.findUnique({
      where: { id: data.requestId },
      include: { match: true },
    });

    if (!request) {
      throw new Error("Talep kaydı bulunamadı.");
    }

    // Admin kullanıcı doğrulaması (Foreign key hatasını önler)
    let validAdminId: string | null = null;
    if (data.adminUserId) {
      const adminExists = await db.user.findUnique({
        where: { id: data.adminUserId },
        select: { id: true },
      });
      if (adminExists) {
        validAdminId = adminExists.id;
      }
    }

    // Eğer Onaylandı (APPROVED) yapılıyorsa ve Bırakma Talebiyse -> Bağlı eşleştirmeyi PASİFE al
    if (
      data.status === "APPROVED" &&
      (request.type === "TEACHER_DROP_STUDENT" || request.type === "STUDENT_DROP_TEACHER") &&
      request.matchId
    ) {
      const matchExists = await db.studentTeacherMatch.findUnique({
        where: { id: request.matchId },
        select: { id: true },
      });
      if (matchExists) {
        await db.studentTeacherMatch.update({
          where: { id: request.matchId },
          data: { status: "PASSIVE" },
        });
      }
    }

    return await db.supportRequest.update({
      where: { id: data.requestId },
      data: {
        status: data.status,
        adminNotes: data.adminNotes !== undefined ? data.adminNotes : request.adminNotes,
        resolvedAt: data.status === "APPROVED" || data.status === "RESOLVED" || data.status === "REJECTED" ? new Date() : null,
        resolvedById: validAdminId,
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        targetStudent: { select: { id: true, name: true, email: true } },
        targetTeacher: { select: { id: true, name: true, email: true } },
        match: true,
        resolvedBy: { select: { id: true, name: true, role: true } },
      },
    });
  }

  /**
   * Talep İstatistiklerini Getir (Admin sayaçları için)
   */
  static async getRequestStats() {
    const [pendingCount, inReviewCount, approvedCount, resolvedCount, rejectedCount] = await Promise.all([
      db.supportRequest.count({ where: { status: "PENDING" } }),
      db.supportRequest.count({ where: { status: "IN_REVIEW" } }),
      db.supportRequest.count({ where: { status: "APPROVED" } }),
      db.supportRequest.count({ where: { status: "RESOLVED" } }),
      db.supportRequest.count({ where: { status: "REJECTED" } }),
    ]);

    const [lessonRequestsCount, dropRequestsCount, complaintsCount] = await Promise.all([
      db.supportRequest.count({ where: { type: "STUDENT_LESSON_REQUEST" } }),
      db.supportRequest.count({ where: { type: { in: ["TEACHER_DROP_STUDENT", "STUDENT_DROP_TEACHER"] } } }),
      db.supportRequest.count({ where: { type: { in: ["STUDENT_COMPLAINT", "GENERAL_COMPLAINT"] } } }),
    ]);

    return {
      pending: pendingCount,
      inReview: inReviewCount,
      approved: approvedCount,
      resolved: resolvedCount,
      rejected: rejectedCount,
      total: pendingCount + inReviewCount + approvedCount + resolvedCount + rejectedCount,
      lessonRequests: lessonRequestsCount,
      dropRequests: dropRequestsCount,
      complaints: complaintsCount,
    };
  }
}
