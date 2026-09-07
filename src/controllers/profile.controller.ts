import { NextRequest } from "next/server";
import { ProfileService } from "@/services/profile.service";
import { ApiResponse } from "@/utils/response";
import { getSessionUser } from "@/utils/auth";

export class ProfileController {
  /**
   * PATCH /api/profile
   */
  static async updateProfile(req: NextRequest) {
    try {
      const session = await getSessionUser();
      if (!session) {
        return ApiResponse.unauthorized("Lütfen giriş yapınız.");
      }

      const body = await req.json();
      const updatedUser = await ProfileService.updateProfile(session.userId, session.role, body);

      return ApiResponse.success({
        user: updatedUser,
        message: "Profil bilgileriniz başarıyla güncellendi.",
      });
    } catch (err: any) {
      return ApiResponse.error(err.message || "Profil güncellenemedi.", 400);
    }
  }
}
