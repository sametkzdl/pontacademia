import { NextRequest } from "next/server";
import { UserService } from "@/services/user.service";
import { ApiResponse } from "@/utils/response";
import { getSessionUser } from "@/utils/auth";

export class UserController {
  /**
   * GET /api/admin/users
   */
  static async getAllUsers() {
    try {
      const session = await getSessionUser();
      if (!session || session.role !== "ADMIN") {
        return ApiResponse.forbidden("Bu alana yalnızca yöneticiler erişebilir.");
      }

      const users = await UserService.getAllUsers();
      return ApiResponse.success(users);
    } catch (err: any) {
      return ApiResponse.serverError("Kullanıcılar yüklenirken hata oluştu.", err);
    }
  }

  /**
   * POST /api/admin/users/toggle-status
   */
  static async toggleStatus(req: NextRequest) {
    try {
      const session = await getSessionUser();
      if (!session || session.role !== "ADMIN") {
        return ApiResponse.forbidden("Bu işlemi yalnızca yöneticiler yapabilir.");
      }

      const body = await req.json();
      const { userId, isActive } = body;

      if (!userId || typeof isActive !== "boolean") {
        return ApiResponse.error("Geçersiz parametreler.", 400);
      }

      const updatedUser = await UserService.toggleUserStatus(userId, isActive);
      return ApiResponse.success({
        user: updatedUser,
        message: `Kullanıcı durumu başarıyla ${isActive ? "aktif" : "pasif"} yapıldı.`,
      });
    } catch (err: any) {
      return ApiResponse.error(err.message || "Kullanıcı durumu güncellenemedi.", 400);
    }
  }

  /**
   * POST /api/admin/users/reset-password
   */
  static async resetPassword(req: NextRequest) {
    try {
      const session = await getSessionUser();
      if (!session || session.role !== "ADMIN") {
        return ApiResponse.forbidden("Bu işlemi yalnızca yöneticiler yapabilir.");
      }

      const body = await req.json();
      const { userId, newPassword } = body;

      if (!userId) {
        return ApiResponse.error("Kullanıcı ID zorunludur.", 400);
      }

      const result = await UserService.resetUserPassword(userId, newPassword);
      return ApiResponse.success({
        message: "Kullanıcı şifresi başarıyla yenilendi.",
        ...result,
      });
    } catch (err: any) {
      return ApiResponse.error(err.message || "Şifre yenilenemedi.", 400);
    }
  }
}
