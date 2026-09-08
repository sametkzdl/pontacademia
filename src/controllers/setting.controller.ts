import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
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
      const response = ApiResponse.success({ settings });
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      response.headers.set("Pragma", "no-cache");
      response.headers.set("Expires", "0");
      return response;
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

      // Next.js sayfa önbelleklerini derhal temizle
      try {
        revalidatePath("/", "layout");
        revalidatePath("/", "page");
        revalidatePath("/admin/settings", "page");
        revalidatePath("/kocluk-basvuru", "page");
        revalidatePath("/ozel-ders-basvuru", "page");
      } catch (revErr) {
        console.error("Revalidate path error:", revErr);
      }

      return ApiResponse.success({
        settings: updatedSettings,
        message: "Genel ayarlar başarıyla kaydedildi ve önbellek güncellendi.",
      });
    } catch (err: any) {
      console.error("Settings update error:", err);
      return ApiResponse.error(err.message || "Ayarlar güncellenemedi.", 400);
    }
  }
}
