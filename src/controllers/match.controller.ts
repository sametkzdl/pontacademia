import { NextRequest } from "next/server";
import { MatchService } from "@/services/match.service";
import { getSessionUser } from "@/utils/auth";
import { ApiResponse } from "@/utils/response";

export class MatchController {
  /**
   * Tüm Eşleştirmeleri Getir (Admin)
   */
  static async getAllMatches(req: NextRequest) {
    try {
      const user = await getSessionUser();
      if (!user || user.role !== "ADMIN") {
        return ApiResponse.forbidden("Yetkisiz erişim. Sadece yöneticiler eşleştirmeleri görüntüleyebilir.");
      }

      const matches = await MatchService.getAllMatches();
      return ApiResponse.success({ matches });
    } catch (error: any) {
      console.error("Matches fetch error:", error);
      return ApiResponse.error(error.message || "Eşleştirmeler alınamadı", 500);
    }
  }

  /**
   * Yeni Eşleştirme Oluştur (Admin)
   */
  static async createMatch(req: NextRequest) {
    try {
      const user = await getSessionUser();
      if (!user || user.role !== "ADMIN") {
        return ApiResponse.forbidden("Yetkisiz erişim. Sadece yöneticiler eşleştirme yapabilir.");
      }

      const body = await req.json();
      const match = await MatchService.createMatch(body);
      return ApiResponse.success({ match, message: "Eşleştirme başarıyla oluşturuldu." }, 201);
    } catch (error: any) {
      console.error("Match create error:", error);
      return ApiResponse.error(error.message || "Eşleştirme oluşturulamadı", 400);
    }
  }

  /**
   * Eşleştirmeyi Sil (Admin)
   */
  static async deleteMatch(req: NextRequest) {
    try {
      const user = await getSessionUser();
      if (!user || user.role !== "ADMIN") {
        return ApiResponse.forbidden("Yetkisiz erişim.");
      }

      const { searchParams } = new URL(req.url);
      const matchId = searchParams.get("matchId") || searchParams.get("id");
      if (!matchId) {
        return ApiResponse.error("Eşleştirme ID'si belirtilmelidir.", 400);
      }

      await MatchService.deleteMatch(matchId);
      return ApiResponse.success({ message: "Eşleştirme başarıyla silindi." });
    } catch (error: any) {
      console.error("Match delete error:", error);
      return ApiResponse.error(error.message || "Eşleştirme silinemedi", 500);
    }
  }

  /**
   * Öğretmenin Öğrencilerini Getir (Öğretmen Portalı)
   */
  static async getTeacherStudents(req: NextRequest) {
    try {
      const user = await getSessionUser();
      if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) {
        return ApiResponse.forbidden("Yetkisiz erişim.");
      }

      const students = await MatchService.getTeacherMatches(user.userId);
      return ApiResponse.success({ students });
    } catch (error: any) {
      console.error("Teacher students fetch error:", error);
      return ApiResponse.error(error.message || "Öğrenciler alınamadı", 500);
    }
  }

  /**
   * Öğrencinin Öğretmenlerini Getir (Öğrenci Portalı)
   */
  static async getStudentTeachers(req: NextRequest) {
    try {
      const user = await getSessionUser();
      if (!user || user.role !== "STUDENT") {
        return ApiResponse.forbidden("Yetkisiz erişim.");
      }

      const teachers = await MatchService.getStudentMatches(user.userId);
      return ApiResponse.success({ teachers });
    } catch (error: any) {
      console.error("Student teachers fetch error:", error);
      return ApiResponse.error(error.message || "Eğitmenler alınamadı", 500);
    }
  }
}
