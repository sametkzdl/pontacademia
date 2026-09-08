import { NextResponse } from "next/server";
import db from "@/utils/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET() {
  try {
    const teachers = await db.user.findMany({
      where: {
        role: "TEACHER",
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        teacherProfile: {
          select: {
            school: true,
            department: true,
            scoreType: true,
            yksRank: true,
            classStatus: true,
            currentDistrict: true,
            districts: true,
            onlineAvailable: true,
            showPhotoOnWeb: true,
            photoUrl: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const coaches = teachers.map((t) => {
      const p = t.teacherProfile;
      const formattedUni = p?.school
        ? (p?.department ? `${p.school} • ${p.department}` : p.school)
        : (p?.department || "Üniversite Belirtilmedi");

      return {
        id: t.id,
        name: t.name,
        branch: p?.scoreType ? `${p.scoreType} Alanı / YKS Koçu` : "YKS Koçu",
        uni: formattedUni,
        school: p?.school || "",
        department: p?.department || "",
        badge: p?.yksRank ? `YKS ${p.scoreType ? `${p.scoreType} ` : ""}Sıralaması: ${p.yksRank}` : "Derece Eğitmeni",
        img: p?.showPhotoOnWeb !== false ? (p?.photoUrl || "") : "",
        showPhotoOnWeb: p?.showPhotoOnWeb !== false,
        districts: p?.districts || "",
        onlineAvailable: Boolean(p?.onlineAvailable),
      };
    });

    const response = NextResponse.json({ success: true, coaches });
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    return response;
  } catch (error: any) {
    console.error("Coaches fetch error:", error);
    return NextResponse.json({ success: false, error: "Koçlar alınamadı." }, { status: 500 });
  }
}
