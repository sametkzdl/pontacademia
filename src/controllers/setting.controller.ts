import { NextRequest } from "next/server";
import { SettingService } from "@/services/setting.service";
import { ApiResponse } from "@/utils/response";
import { getSessionUser } from "@/utils/auth";

export class SettingController {
  /**
   * GET /api/settings (Genel / Public)
   */
  static async getPublicSettings() {
    try {
      const settings = await SettingService.getSettings();
      return ApiResponse.success({ settings });
    } catch (err: any) {
      console.error("Settings fetch error:", err);
      return ApiResponse.error(err.message || "Ayarlar alınamadı.", 500);
    }
  }

  /**
   * POST /api/admin/settings (Admin)
   */
  static async updateSettings(req: NextRequest) {
    try {
      const session = await getSessionUser();
      if (!session || session.role !== "ADMIN") {
        return ApiResponse.forbidden("Bu işlemi yalnızca yöneticiler yapabilir.");
      }

      const body = await req.json();
      const updatedSettings = await SettingService.updateSettings(body);

      return ApiResponse.success({
        settings: updatedSettings,
        message: "Genel ayarlar başarıyla güncellendi.",
      });
    } catch (err: any) {
      console.error("Settings update error:", err);
      return ApiResponse.error(err.message || "Ayarlar güncellenemedi.", 400);
    }
  }
}
