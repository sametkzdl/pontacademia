import { NextResponse } from "next/server";
import db from "@/utils/db";

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
      return {
        id: t.id,
        name: t.name,
        branch: p?.scoreType ? `${p.scoreType} Alanı / YKS Koçu` : "YKS Koçu",
        uni: p?.school || "Üniversite Belirtilmedi",
        badge: p?.yksRank ? `YKS ${p.scoreType ? `${p.scoreType} ` : ""}Sıralaması: ${p.yksRank}` : "Derece Eğitmeni",
        img: p?.showPhotoOnWeb !== false ? (p?.photoUrl || "") : "",
        districts: p?.districts || "",
        onlineAvailable: Boolean(p?.onlineAvailable),
      };
    });

    return NextResponse.json({ success: true, coaches });
  } catch (error: any) {
    console.error("Coaches fetch error:", error);
    return NextResponse.json({ success: false, error: "Koçlar alınamadı." }, { status: 500 });
  }
}
