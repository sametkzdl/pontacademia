import db from "@/utils/db";

export interface CreateLessonInput {
  matchId: string;
  createdById: string;
  userRole: "ADMIN" | "TEACHER" | "STUDENT";
  scheduledDate: string | Date;
  durationMinutes?: number;
  locationType: "YUZ_YUZE" | "ONLINE";
  locationDetails?: string;
  notes?: string;
}

export class LessonService {
  /**
   * Yeni Ders Oturumu / Randevusu Oluştur
   */
  static async createLesson(data: CreateLessonInput) {
    if (!data.matchId || !data.createdById || !data.scheduledDate || !data.locationType) {
      throw new Error("Eşleştirme, Tarih/Saat ve Konum türü alanları zorunludur.");
    }

    const match = await db.studentTeacherMatch.findUnique({
      where: { id: data.matchId },
      include: {
        student: { select: { id: true, name: true, email: true } },
        teacher: { select: { id: true, name: true, email: true } },
      },
    });

    if (!match || match.status !== "ACTIVE") {
      throw new Error("Geçerli ve aktif bir öğrenci-öğretmen eşleştirmesi bulunamadı.");
    }

    const creator = await db.user.findUnique({
      where: { id: data.createdById },
      select: { id: true, name: true, role: true },
    });

    if (!creator) {
      throw new Error("Dersi oluşturan kullanıcı bulunamadı.");
    }

    // Yetki kontrolü: Kullanıcı bu eşleştirmenin öğrencisi, öğretmeni veya admin olmalıdır
    const isStudent = match.studentId === data.createdById;
    const isTeacher = match.teacherId === data.createdById;
    const isAdmin = data.userRole === "ADMIN" || creator.role === "ADMIN";

    if (!isStudent && !isTeacher && !isAdmin) {
      throw new Error("Bu eşleştirme için ders oluşturma yetkiniz bulunmamaktadır.");
    }

    // Başlangıç onay durumları
    let teacherApproved = false;
    let studentApproved = false;
    let status = "PENDING_APPROVAL";
    let approvedAt: Date | null = null;

    if (isAdmin) {
      teacherApproved = true;
      studentApproved = true;
      status = "SCHEDULED";
      approvedAt = new Date();
    } else if (isTeacher) {
      teacherApproved = true;
      studentApproved = false;
    } else if (isStudent) {
      studentApproved = true;
      teacherApproved = false;
    }

    const targetDate = new Date(data.scheduledDate);
    if (isNaN(targetDate.getTime())) {
      throw new Error("Geçerli bir tarih ve saat giriniz.");
    }

    const lesson = await db.lesson.create({
      data: {
        matchId: data.matchId,
        createdById: data.createdById,
        scheduledDate: targetDate,
        durationMinutes: data.durationMinutes || 60,
        locationType: data.locationType,
        locationDetails: data.locationDetails || null,
        notes: data.notes || null,
        status,
        teacherApproved,
        studentApproved,
        approvedAt,
      },
      include: {
        match: {
          include: {
            student: { select: { id: true, name: true, email: true, studentProfile: true } },
            teacher: { select: { id: true, name: true, email: true, teacherProfile: true } },
          },
        },
        createdBy: { select: { id: true, name: true, role: true } },
        logs: { include: { user: { select: { id: true, name: true, role: true } } } },
      },
    });

    // İlk Log Kaydını Oluştur
    const roleTitle = isAdmin ? "Yönetici" : isTeacher ? "Öğretmen" : "Öğrenci";
    const logMsg = isAdmin
      ? `Yönetici (${creator.name}) tarafından ders doğrudan planlandı.`
      : `${roleTitle} (${creator.name}) yeni ders talebi oluşturdu. Karşı tarafın onayı bekleniyor.`;

    await db.lessonLog.create({
      data: {
        lessonId: lesson.id,
        userId: data.createdById,
        action: "CREATED",
        message: logMsg,
      },
    });

    return lesson;
  }

  /**
   * Dersleri Rol Bazlı Getir
   */
  static async getLessons(user: { id: string; role: string }, filters?: { status?: string; matchId?: string }) {
    const whereClause: any = {};

    if (user.role === "STUDENT") {
      whereClause.match = { studentId: user.id };
    } else if (user.role === "TEACHER") {
      whereClause.match = { teacherId: user.id };
    }

    if (filters?.status && filters.status !== "ALL") {
      whereClause.status = filters.status;
    }

    if (filters?.matchId) {
      whereClause.matchId = filters.matchId;
    }

    const lessons = await db.lesson.findMany({
      where: whereClause,
      orderBy: { scheduledDate: "desc" },
      include: {
        match: {
          include: {
            student: { select: { id: true, name: true, email: true, studentProfile: true } },
            teacher: { select: { id: true, name: true, email: true, teacherProfile: true } },
          },
        },
        createdBy: { select: { id: true, name: true, role: true } },
        rejectedBy: { select: { id: true, name: true, role: true } },
        logs: {
          orderBy: { createdAt: "asc" },
          include: { user: { select: { id: true, name: true, role: true } } },
        },
        // Feedbacks SADECE ADMIN'e döner
        ...(user.role === "ADMIN"
          ? {
              feedbacks: {
                orderBy: { createdAt: "desc" },
                include: { user: { select: { id: true, name: true, role: true } } },
              },
            }
          : {}),
      },
    });

    // Kullanıcı öğrenci veya öğretmen ise, sadece kendi bıraktığı feedback'in var olup olmadığını göster (içeriğini veya karşı tarafın yorumunu sızdırmadan)
    if (user.role !== "ADMIN") {
      const userFeedbacks = await db.lessonFeedback.findMany({
        where: {
          userId: user.id,
          lessonId: { in: lessons.map((l) => l.id) },
        },
        select: { lessonId: true, rating: true, comment: true, createdAt: true },
      });

      const userFeedbackMap = new Map(userFeedbacks.map((f) => [f.lessonId, f]));

      return lessons.map((l) => ({
        ...l,
        myFeedback: userFeedbackMap.get(l.id) || null,
      }));
    }

    return lessons;
  }

  /**
   * Dersi Onayla (Karşı Taraf veya Admin)
   */
  static async approveLesson(lessonId: string, user: { id: string; name: string; role: string }) {
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: { match: true },
    });

    if (!lesson) {
      throw new Error("Ders bulunamadı.");
    }

    if (lesson.status === "REJECTED" || lesson.status === "CANCELLED" || lesson.status === "COMPLETED") {
      throw new Error(`Bu ders "${lesson.status}" durumunda olduğu için onaylanamaz.`);
    }

    const isStudent = lesson.match.studentId === user.id;
    const isTeacher = lesson.match.teacherId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isStudent && !isTeacher && !isAdmin) {
      throw new Error("Bu dersi onaylama yetkiniz bulunmamaktadır.");
    }

    let teacherApproved = lesson.teacherApproved;
    let studentApproved = lesson.studentApproved;

    if (isAdmin) {
      teacherApproved = true;
      studentApproved = true;
    } else if (isTeacher) {
      teacherApproved = true;
    } else if (isStudent) {
      studentApproved = true;
    }

    const isFullyApproved = teacherApproved && studentApproved;
    const newStatus = isFullyApproved ? "SCHEDULED" : "PENDING_APPROVAL";
    const approvedAt = isFullyApproved ? (lesson.approvedAt || new Date()) : null;

    const updated = await db.lesson.update({
      where: { id: lessonId },
      data: {
        teacherApproved,
        studentApproved,
        status: newStatus,
        approvedAt,
      },
    });

    // Log Ekle
    const roleTitle = isAdmin ? "Yönetici" : isTeacher ? "Öğretmen" : "Öğrenci";
    const logMsg = isFullyApproved
      ? `${roleTitle} (${user.name}) dersi onayladı. Ders her iki tarafça kesinleştirildi (Planlandı).`
      : `${roleTitle} (${user.name}) dersi onayladı.`;

    await db.lessonLog.create({
      data: {
        lessonId,
        userId: user.id,
        action: "APPROVED",
        message: logMsg,
      },
    });

    return updated;
  }

  /**
   * Dersi Reddet (Zorunlu Gerekçe İle)
   */
  static async rejectLesson(lessonId: string, user: { id: string; name: string; role: string }, reason: string) {
    if (!reason || !reason.trim()) {
      throw new Error("Lütfen dersi reddetme gerekçenizi belirtiniz.");
    }

    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: { match: true },
    });

    if (!lesson) {
      throw new Error("Ders bulunamadı.");
    }

    if (lesson.status === "COMPLETED") {
      throw new Error("Tamamlanmış bir ders reddedilemez.");
    }

    const isStudent = lesson.match.studentId === user.id;
    const isTeacher = lesson.match.teacherId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isStudent && !isTeacher && !isAdmin) {
      throw new Error("Bu dersi reddetme yetkiniz bulunmamaktadır.");
    }

    const updated = await db.lesson.update({
      where: { id: lessonId },
      data: {
        status: "REJECTED",
        rejectedById: user.id,
        rejectionReason: reason.trim(),
        rejectedAt: new Date(),
      },
    });

    // Log Ekle
    const roleTitle = isAdmin ? "Yönetici" : isTeacher ? "Öğretmen" : "Öğrenci";
    const logMsg = `${roleTitle} (${user.name}) dersi reddetti.`;

    await db.lessonLog.create({
      data: {
        lessonId,
        userId: user.id,
        action: "REJECTED",
        message: logMsg,
        reason: reason.trim(),
      },
    });

    return updated;
  }

  /**
   * Ders Sonu İşlendi / Tamamlandı Onayı Ver
   */
  static async completeLesson(lessonId: string, user: { id: string; name: string; role: string }) {
    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: { match: true },
    });

    if (!lesson) {
      throw new Error("Ders bulunamadı.");
    }

    if (lesson.status === "REJECTED" || lesson.status === "CANCELLED") {
      throw new Error("Reddedilmiş veya iptal edilmiş bir ders tamamlanamaz.");
    }

    const isStudent = lesson.match.studentId === user.id;
    const isTeacher = lesson.match.teacherId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isStudent && !isTeacher && !isAdmin) {
      throw new Error("Bu dersi tamamlama yetkiniz bulunmamaktadır.");
    }

    let teacherCompleted = lesson.teacherCompleted;
    let teacherCompletedAt = lesson.teacherCompletedAt;
    let studentCompleted = lesson.studentCompleted;
    let studentCompletedAt = lesson.studentCompletedAt;

    if (isAdmin) {
      teacherCompleted = true;
      teacherCompletedAt = new Date();
      studentCompleted = true;
      studentCompletedAt = new Date();
    } else if (isTeacher) {
      teacherCompleted = true;
      teacherCompletedAt = new Date();
    } else if (isStudent) {
      studentCompleted = true;
      studentCompletedAt = new Date();
    }

    const isFullyCompleted = teacherCompleted && studentCompleted;
    const newStatus = isFullyCompleted ? "COMPLETED" : lesson.status;
    const completedAt = isFullyCompleted ? (lesson.completedAt || new Date()) : null;

    const updated = await db.lesson.update({
      where: { id: lessonId },
      data: {
        teacherCompleted,
        teacherCompletedAt,
        studentCompleted,
        studentCompletedAt,
        status: newStatus,
        completedAt,
      },
    });

    // Log Ekle
    const roleTitle = isAdmin ? "Yönetici" : isTeacher ? "Öğretmen" : "Öğrenci";
    const logAction = isFullyCompleted
      ? "FULLY_COMPLETED"
      : isTeacher
      ? "TEACHER_COMPLETED"
      : "STUDENT_COMPLETED";

    const logMsg = isFullyCompleted
      ? isAdmin
        ? `Yönetici (${user.name}) tarafından ders doğrudan işlendi / tamamlandı olarak onaylandı.`
        : `${roleTitle} (${user.name}) dersin işlendiğini onayladı. Karşılıklı iki onay tamamlandı ve ders sistemde "Tamamlandı" olarak kaydedildi.`
      : `${roleTitle} (${user.name}) dersin işlendiğini onayladı. (Karşı tarafın tamamlanma onayı bekleniyor).`;

    await db.lessonLog.create({
      data: {
        lessonId,
        userId: user.id,
        action: logAction,
        message: logMsg,
      },
    });

    return updated;
  }

  /**
   * Tamamlanan Derse Gizli Yorum & Geri Bildirim Bırak (SADECE ADMİN GÖRÜR)
   */
  static async addFeedback(
    lessonId: string,
    user: { id: string; name: string; role: string },
    data: { rating?: number; comment: string }
  ) {
    if (!data.comment || !data.comment.trim()) {
      throw new Error("Lütfen görüş ve yorumunuzu yazınız.");
    }

    const lesson = await db.lesson.findUnique({
      where: { id: lessonId },
      include: { match: true },
    });

    if (!lesson) {
      throw new Error("Ders bulunamadı.");
    }

    const isStudent = lesson.match.studentId === user.id;
    const isTeacher = lesson.match.teacherId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isStudent && !isTeacher && !isAdmin) {
      throw new Error("Bu derse geri bildirim bırakma yetkiniz bulunmamaktadır.");
    }

    const userRole = isTeacher ? "TEACHER" : isStudent ? "STUDENT" : "ADMIN";

    return await db.lessonFeedback.upsert({
      where: {
        lessonId_userId: {
          lessonId,
          userId: user.id,
        },
      },
      create: {
        lessonId,
        userId: user.id,
        userRole,
        rating: data.rating || null,
        comment: data.comment.trim(),
      },
      update: {
        rating: data.rating || null,
        comment: data.comment.trim(),
        createdAt: new Date(),
      },
    });
  }

  /**
   * Ders Ödeme Durumunu ve Detaylarını Güncelle (Admin)
   */
  static async updateLessonPayment(data: {
    lessonId: string;
    adminUserId: string;
    paymentStatus: "PAID" | "UNPAID" | "FAILED";
    paidAmount?: number | null;
    paidBy?: string | null;
    paymentDate?: string | Date | null;
    paymentMethod?: string | null;
    paymentNotes?: string | null;
  }) {
    if (!data.lessonId || !data.adminUserId) {
      throw new Error("Ders ID ve Yönetici bilgisi zorunludur.");
    }

    const lesson = await db.lesson.findUnique({
      where: { id: data.lessonId },
      include: {
        match: {
          include: {
            student: true,
            teacher: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new Error("Ders kaydı bulunamadı.");
    }

    let parsedPaymentDate: Date | null = null;
    if (data.paymentDate) {
      parsedPaymentDate = new Date(data.paymentDate);
      if (isNaN(parsedPaymentDate.getTime())) {
        parsedPaymentDate = new Date();
      }
    } else if (data.paymentStatus === "PAID") {
      parsedPaymentDate = new Date();
    }

    const updated = await db.lesson.update({
      where: { id: data.lessonId },
      data: {
        paymentStatus: data.paymentStatus,
        paidAmount: data.paymentStatus === "PAID" ? (data.paidAmount ?? null) : null,
        paidBy: data.paidBy ? data.paidBy.trim() : null,
        paymentDate: data.paymentStatus === "PAID" ? parsedPaymentDate : null,
        paymentMethod: data.paymentStatus === "PAID" ? (data.paymentMethod ?? null) : null,
        paymentNotes: data.paymentNotes ? data.paymentNotes.trim() : null,
        paymentApprovedAt: data.paymentStatus === "PAID" ? new Date() : null,
      },
      include: {
        match: {
          include: {
            student: { select: { id: true, name: true, email: true, studentProfile: true } },
            teacher: { select: { id: true, name: true, email: true, teacherProfile: true } },
          },
        },
        createdBy: { select: { id: true, name: true, role: true } },
        rejectedBy: { select: { id: true, name: true, role: true } },
        logs: {
          orderBy: { createdAt: "asc" },
          include: { user: { select: { id: true, name: true, role: true } } },
        },
        feedbacks: {
          include: { user: { select: { id: true, name: true, role: true } } },
        },
      },
    });

    // Log kaydı oluştur
    const logAction = data.paymentStatus === "PAID" ? "PAYMENT_RECEIVED" : data.paymentStatus === "FAILED" ? "PAYMENT_FAILED" : "PAYMENT_RESET";
    const logMessage = data.paymentStatus === "PAID" 
      ? `Öğrenci ödemesi onaylandı. Tutar: ${data.paidAmount || 0} TL (${data.paidBy || "Öğrenci/Veli"})`
      : data.paymentStatus === "FAILED"
      ? `Öğrenci ödemesi onaylanmadı / alınamadı. Gerekçe: ${data.paymentNotes || "Belirtilmedi"}`
      : `Öğrenci ödeme durumu sıfırlandı (Bekleniyor).`;

    const adminUser = await db.user.findUnique({ where: { id: data.adminUserId } });
    const logUserId = adminUser ? adminUser.id : lesson.createdById;

    if (logUserId) {
      await db.lessonLog.create({
        data: {
          lessonId: data.lessonId,
          userId: logUserId,
          action: logAction,
          message: logMessage,
          reason: data.paymentNotes || null,
        },
      });
    }

    return updated;
  }

  /**
   * Eğitmen Ücret Transferini Güncelle ve Kaydet (Admin -> Teacher)
   */
  static async updateTeacherPayment(data: {
    lessonId: string;
    adminUserId: string;
    teacherPaymentStatus: "PAID" | "UNPAID" | "FAILED";
    teacherPaidAmount?: number | null;
    teacherPaidDate?: string | Date | null;
    teacherPaymentMethod?: string | null;
    teacherPaymentNotes?: string | null;
  }) {
    if (!data.lessonId || !data.adminUserId) {
      throw new Error("Ders ID ve Yönetici bilgisi zorunludur.");
    }

    const lesson = await db.lesson.findUnique({
      where: { id: data.lessonId },
      include: {
        match: {
          include: {
            student: true,
            teacher: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new Error("Ders kaydı bulunamadı.");
    }

    let parsedPaidDate: Date | null = null;
    if (data.teacherPaidDate) {
      parsedPaidDate = new Date(data.teacherPaidDate);
      if (isNaN(parsedPaidDate.getTime())) {
        parsedPaidDate = new Date();
      }
    } else if (data.teacherPaymentStatus === "PAID") {
      parsedPaidDate = new Date();
    }

    const updated = await db.lesson.update({
      where: { id: data.lessonId },
      data: {
        teacherPaymentStatus: data.teacherPaymentStatus,
        teacherPaidAmount: data.teacherPaymentStatus === "PAID" ? (data.teacherPaidAmount ?? null) : null,
        teacherPaidDate: data.teacherPaymentStatus === "PAID" ? parsedPaidDate : null,
        teacherPaymentMethod: data.teacherPaymentStatus === "PAID" ? (data.teacherPaymentMethod ?? null) : null,
        teacherPaymentNotes: data.teacherPaymentNotes ? data.teacherPaymentNotes.trim() : null,
        teacherPaymentApprovedAt: data.teacherPaymentStatus === "PAID" ? new Date() : null,
      },
      include: {
        match: {
          include: {
            student: { select: { id: true, name: true, email: true, studentProfile: true } },
            teacher: { select: { id: true, name: true, email: true, teacherProfile: true } },
          },
        },
        createdBy: { select: { id: true, name: true, role: true } },
        rejectedBy: { select: { id: true, name: true, role: true } },
        logs: {
          orderBy: { createdAt: "asc" },
          include: { user: { select: { id: true, name: true, role: true } } },
        },
        feedbacks: {
          include: { user: { select: { id: true, name: true, role: true } } },
        },
      },
    });

    // Log kaydı oluştur
    const logAction = data.teacherPaymentStatus === "PAID" ? "TEACHER_PAYMENT_SENT" : data.teacherPaymentStatus === "FAILED" ? "TEACHER_PAYMENT_FAILED" : "TEACHER_PAYMENT_RESET";
    const logMessage = data.teacherPaymentStatus === "PAID"
      ? `Eğitmene ders ücreti transferi gönderildi. Tutar: ${data.teacherPaidAmount || 0} TL (${lesson.match.teacher.name})`
      : data.teacherPaymentStatus === "FAILED"
      ? `Eğitmene ücret transferi onaylanmadı / bekletildi. Gerekçe: ${data.teacherPaymentNotes || "Belirtilmedi"}`
      : `Eğitmen ücret transfer durumu sıfırlandı (Bekleniyor).`;

    const adminUser = await db.user.findUnique({ where: { id: data.adminUserId } });
    const logUserId = adminUser ? adminUser.id : lesson.createdById;

    if (logUserId) {
      await db.lessonLog.create({
        data: {
          lessonId: data.lessonId,
          userId: logUserId,
          action: logAction,
          message: logMessage,
          reason: data.teacherPaymentNotes || null,
        },
      });
    }

    return updated;
  }
}
