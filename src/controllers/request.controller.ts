import { NextRequest } from "next/server";
import { RequestService } from "@/services/request.service";
import { getSessionUser } from "@/utils/auth";
import { ApiResponse } from "@/utils/response";

export class RequestController {
  /**
   * Yeni Talep Oluştur (Öğretmen veya Öğrenci)
   */
  static async createRequest(req: NextRequest) {
    try {
      const user = await getSessionUser();
      if (!user || (user.role !== "TEACHER" && user.role !== "STUDENT" && user.role !== "ADMIN")) {
        return ApiResponse.forbidden("Yetkisiz erişim. Lütfen giriş yapınız.");
      }

      const body = await req.json();
      const { type, targetStudentId, targetTeacherId, matchId, subject, title, description } = body;

      if (!type || !description) {
        return ApiResponse.error("Talep türü ve açıklama alanı zorunludur.", 400);
      }

      const request = await RequestService.createRequest({
        userId: user.userId,
        userRole: user.role as "TEACHER" | "STUDENT",
        type,
        targetStudentId,
        targetTeacherId,
        matchId,
        subject,
        title,
        description,
      });

      return ApiResponse.success({
        request,
        message: "Talebiniz başarıyla oluşturuldu ve yönetici incelemesine iletildi.",
      }, 201);
    } catch (error: any) {
      console.error("Create request error:", error);
      return ApiResponse.error(error.message || "Talep oluşturulamadı", 400);
    }
  }

  /**
   * Kullanıcının Kendi Taleplerini Listele (Öğretmen / Öğrenci)
   */
  static async getMyRequests(req: NextRequest) {
    try {
      const user = await getSessionUser();
      if (!user) {
        return ApiResponse.unauthorized("Oturum açmanız gerekmektedir.");
      }

      const requests = await RequestService.getMyRequests(user.userId);
      return ApiResponse.success({ requests });
    } catch (error: any) {
      console.error("Get my requests error:", error);
      return ApiResponse.error(error.message || "Talepler alınamadı", 500);
    }
  }

  /**
   * Tüm Talepleri Listele (Admin)
   */
  static async getAllRequests(req: NextRequest) {
    try {
      const user = await getSessionUser();
      if (!user || user.role !== "ADMIN") {
        return ApiResponse.forbidden("Yetkisiz erişim. Sadece yöneticiler talepleri görüntüleyebilir.");
      }

      const { searchParams } = new URL(req.url);
      const type = searchParams.get("type") || undefined;
      const status = searchParams.get("status") || undefined;
      const userRole = searchParams.get("userRole") || undefined;

      const [requests, stats] = await Promise.all([
        RequestService.getAllRequests({ type, status, userRole }),
        RequestService.getRequestStats(),
      ]);

      return ApiResponse.success({ requests, stats });
    } catch (error: any) {
      console.error("Get all requests error:", error);
      return ApiResponse.error(error.message || "Talepler alınamadı", 500);
    }
  }

  /**
   * Talep Durumunu Güncelle (Admin - Onayla / İncele / Çöz / Reddet)
   */
  static async updateRequestStatus(req: NextRequest, params: { id: string }) {
    try {
      const user = await getSessionUser();
      if (!user || user.role !== "ADMIN") {
        return ApiResponse.forbidden("Yetkisiz erişim. Sadece yöneticiler talep durumunu güncelleyebilir.");
      }

      const requestId = params.id;
      if (!requestId) {
        return ApiResponse.error("Talep ID belirtilmelidir.", 400);
      }

      const body = await req.json();
      const { status, adminNotes } = body;

      if (!status) {
        return ApiResponse.error("Durum belirtilmelidir.", 400);
      }

      const updated = await RequestService.updateRequestStatus({
        requestId,
        status,
        adminNotes,
        adminUserId: user.userId,
      });

      return ApiResponse.success({
        request: updated,
        message: "Talep durumu ve yönetici notu başarıyla güncellendi.",
      });
    } catch (error: any) {
      console.error("Update request status error:", error);
      return ApiResponse.error(error.message || "Talep güncellenemedi", 400);
    }
  }
}
