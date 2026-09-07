import { NextRequest } from "next/server";
import { MatchService } from "@/services/match.service";
import { getSessionUser } from "@/utils/auth";
import { ApiResponse } from "@/utils/response";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return ApiResponse.forbidden("Yetkisiz erişim. Sadece yöneticiler eşleşme durumunu değiştirebilir.");
    }

    const resolvedParams = await params;
    const matchId = resolvedParams.id;
    const body = await req.json();
    const { status } = body;

    if (!matchId || !status || (status !== "ACTIVE" && status !== "PASSIVE")) {
      return ApiResponse.error("Geçersiz istek. 'ACTIVE' veya 'PASSIVE' durumu belirtilmelidir.", 400);
    }

    const updated = await MatchService.toggleMatchStatus(matchId, status);
    return ApiResponse.success({
      match: updated,
      message: status === "ACTIVE" ? "Eşleştirme başarıyla aktife alındı." : "Eşleştirme başarıyla pasife alındı.",
    });
  } catch (error: any) {
    console.error("Match status toggle error:", error);
    return ApiResponse.error(error.message || "Eşleştirme durumu güncellenemedi", 400);
  }
}
