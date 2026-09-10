import { NextRequest } from "next/server";
import { LessonService } from "@/services/lesson.service";
import { getSessionUser } from "@/utils/auth";
import { ApiResponse } from "@/utils/response";

export class LessonController {
  /**
   * Dersleri Listele
   */
  static async getLessons(req: NextRequest) {
    try {
      const user = await getSessionUser();
      if (!user) {
        return ApiResponse.unauthorized("Giriş yapmalısınız.");
      }

      const { searchParams } = new URL(req.url);
      const status = searchParams.get("status") || undefined;
      const matchId = searchParams.get("matchId") || undefined;

      const lessons = await LessonService.getLessons(
        { id: user.userId, role: user.role },
        { status, matchId }
      );

      return ApiResponse.success({ lessons });
    } catch (error: any) {
      console.error("Lessons fetch error:", error);
      return ApiResponse.error(error.message || "Dersler alınamadı", 500);
    }
  }

  /**
   * Yeni Ders Oluştur (Öğrenci, Öğretmen veya Admin)
   */
  static async createLesson(req: NextRequest) {
    try {
      const user = await getSessionUser();
      if (!user) {
        return ApiResponse.unauthorized("Giriş yapmalısınız.");
      }

      const body = await req.json();
      const lesson = await LessonService.createLesson({
        matchId: body.matchId,
        createdById: user.userId,
        userRole: user.role as any,
        scheduledDate: body.scheduledDate,
        durationMinutes: body.durationMinutes ? Number(body.durationMinutes) : 60,
        locationType: body.locationType,
        locationDetails: body.locationDetails,
        notes: body.notes,
      });

      return ApiResponse.success({ lesson, message: "Ders başarıyla oluşturuldu." }, 201);
    } catch (error: any) {
      console.error("Lesson create error:", error);
      return ApiResponse.error(error.message || "Ders oluşturulamadı", 400);
    }
  }

  /**
   * Dersi Onayla
   */
  static async approveLesson(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
      const user = await getSessionUser();
      if (!user) {
        return ApiResponse.unauthorized("Giriş yapmalısınız.");
      }

      const resolvedParams = await params;
      const lessonId = resolvedParams.id;

      const lesson = await LessonService.approveLesson(lessonId, {
        id: user.userId,
        name: user.name || user.email,
        role: user.role,
      });

      return ApiResponse.success({ lesson, message: "Ders başarıyla onaylandı." });
    } catch (error: any) {
      console.error("Lesson approve error:", error);
      return ApiResponse.error(error.message || "Ders onaylanamadı", 400);
    }
  }

  /**
   * Dersi Reddet (Gerekçeli)
   */
  static async rejectLesson(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
      const user = await getSessionUser();
      if (!user) {
        return ApiResponse.unauthorized("Giriş yapmalısınız.");
      }

      const resolvedParams = await params;
      const lessonId = resolvedParams.id;
      const body = await req.json();

      if (!body.reason || !body.reason.trim()) {
        return ApiResponse.error("Reddetme gerekçesi belirtilmelidir.", 400);
      }

      const lesson = await LessonService.rejectLesson(
        lessonId,
        {
          id: user.userId,
          name: user.name || user.email,
          role: user.role,
        },
        body.reason
      );

      return ApiResponse.success({ lesson, message: "Ders reddedildi." });
    } catch (error: any) {
      console.error("Lesson reject error:", error);
      return ApiResponse.error(error.message || "Ders reddedilemedi", 400);
    }
  }

  /**
   * Dersi 'İşlenmedi' Olarak Bildir
   */
  static async markUnattended(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
      const user = await getSessionUser();
      if (!user) {
        return ApiResponse.unauthorized("Giriş yapmalısınız.");
      }

      const resolvedParams = await params;
      const lessonId = resolvedParams.id;
      const body = await req.json();

      if (!body.reason || !body.reason.trim()) {
        return ApiResponse.error("İşlenmedi bildirim gerekçesi belirtilmelidir.", 400);
      }

      const lesson = await LessonService.markLessonUnattended(
        lessonId,
        {
          id: user.userId,
          name: user.name || user.email,
          role: user.role,
        },
        body.reason
      );

      return ApiResponse.success({ lesson, message: "Dersin işlenmediği bildirildi." });
    } catch (error: any) {
      console.error("Lesson unattended error:", error);
      return ApiResponse.error(error.message || "İşlem gerçekleştirilemedi", 400);
    }
  }

  /**
   * Ders Sonu İşlendi Onayı
   */
  static async completeLesson(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
      const user = await getSessionUser();
      if (!user) {
        return ApiResponse.unauthorized("Giriş yapmalısınız.");
      }

      const resolvedParams = await params;
      const lessonId = resolvedParams.id;

      const lesson = await LessonService.completeLesson(lessonId, {
        id: user.userId,
        name: user.name || user.email,
        role: user.role,
      });

      return ApiResponse.success({ lesson, message: "Dersin işlendiği onaylandı." });
    } catch (error: any) {
      console.error("Lesson complete error:", error);
      return ApiResponse.error(error.message || "Ders tamamlanamadı", 400);
    }
  }

  /**
   * Gizli Yönetici Yorumu Bırak (Yalnızca Admin Okur)
   */
  static async addFeedback(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
      const user = await getSessionUser();
      if (!user) {
        return ApiResponse.unauthorized("Giriş yapmalısınız.");
      }

      const resolvedParams = await params;
      const lessonId = resolvedParams.id;
      const body = await req.json();

      if (!body.comment || !body.comment.trim()) {
        return ApiResponse.error("Görüş ve değerlendirme metni zorunludur.", 400);
      }

      const feedback = await LessonService.addFeedback(
        lessonId,
        {
          id: user.userId,
          name: user.name || user.email,
          role: user.role,
        },
        {
          rating: body.rating ? Number(body.rating) : undefined,
          comment: body.comment,
        }
      );

      return ApiResponse.success({ feedback, message: "Yönetici geri bildiriminiz başarıyla kaydedildi." });
    } catch (error: any) {
      console.error("Lesson feedback error:", error);
      return ApiResponse.error(error.message || "Yorum kaydedilemedi", 400);
    }
  }

  /**
   * Ders Ödemesi Güncelle / Onayla (Admin)
   */
  static async updatePayment(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
      const user = await getSessionUser();
      if (!user || user.role !== "ADMIN") {
        return ApiResponse.forbidden("Yetkisiz erişim. Sadece yöneticiler ödeme onaylayabilir.");
      }

      const resolvedParams = await params;
      const lessonId = resolvedParams.id;
      const body = await req.json();

      const lesson = await LessonService.updateLessonPayment({
        lessonId,
        adminUserId: user.userId,
        paymentStatus: body.paymentStatus,
        paidAmount: body.paidAmount ? Number(body.paidAmount) : null,
        paidBy: body.paidBy,
        paymentDate: body.paymentDate,
        paymentMethod: body.paymentMethod,
        paymentNotes: body.paymentNotes,
      });

      return ApiResponse.success({ lesson, message: "Ödeme kaydı başarıyla güncellendi." });
    } catch (error: any) {
      console.error("Payment update error:", error);
      return ApiResponse.error(error.message || "Ödeme güncellenemedi", 400);
    }
  }

  /**
   * Eğitmen Ücreti / Transferini Güncelle / Onayla (Admin -> Teacher)
   */
  static async updateTeacherPayment(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
      const user = await getSessionUser();
      if (!user || user.role !== "ADMIN") {
        return ApiResponse.forbidden("Yetkisiz erişim. Sadece yöneticiler eğitmen ücretini onaylayabilir.");
      }

      const resolvedParams = await params;
      const lessonId = resolvedParams.id;
      const body = await req.json();

      const lesson = await LessonService.updateTeacherPayment({
        lessonId,
        adminUserId: user.userId,
        teacherPaymentStatus: body.teacherPaymentStatus,
        teacherPaidAmount: body.teacherPaidAmount ? Number(body.teacherPaidAmount) : null,
        teacherPaidDate: body.teacherPaidDate,
        teacherPaymentMethod: body.teacherPaymentMethod,
        teacherPaymentNotes: body.teacherPaymentNotes,
      });

      return ApiResponse.success({ lesson, message: "Eğitmen ücret transfer kaydı başarıyla güncellendi." });
    } catch (error: any) {
      console.error("Teacher payment update error:", error);
      return ApiResponse.error(error.message || "Eğitmen ücret kaydı güncellenemedi", 400);
    }
  }
}

