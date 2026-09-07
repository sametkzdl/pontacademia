import db from "@/utils/db";

export class ProfileService {
  /**
   * Profil Bilgilerini Getir
   */
  static async getProfile(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        teacherProfile: true,
        studentProfile: true,
      },
    });

    if (!user) return null;
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Profil Güncelleme (Öğretmen veya Öğrenci)
   */
  static async updateProfile(userId: string, role: string, body: Record<string, any>) {
    // 1. İsim Güncellemesi
    if (body.name && typeof body.name === "string" && body.name.trim()) {
      await db.user.update({
        where: { id: userId },
        data: { name: body.name.trim() },
      });
    }

    // 2. Öğretmen Profili Güncelleme
    if (role === "TEACHER" || role === "ADMIN") {
      await db.teacherProfile.upsert({
        where: { userId },
        update: {
          phone: body.phone !== undefined ? String(body.phone).trim() : undefined,
          school: body.school !== undefined ? String(body.school).trim() : undefined,
          yksRank: body.yksRank !== undefined ? String(body.yksRank).trim() : undefined,
          classStatus: body.classStatus !== undefined ? String(body.classStatus).trim() : undefined,
          currentDistrict: body.currentDistrict !== undefined ? String(body.currentDistrict).trim() : undefined,
          currentAddress: body.currentAddress !== undefined ? String(body.currentAddress).trim() : undefined,
          districts: body.districts !== undefined ? (Array.isArray(body.districts) ? body.districts.join(", ") : String(body.districts)) : undefined,
          onlineAvailable: body.onlineAvailable !== undefined ? Boolean(body.onlineAvailable) : undefined,
          iban: body.iban !== undefined ? String(body.iban).trim() : undefined,
          notes: body.notes !== undefined ? String(body.notes) : undefined,
        },
        create: {
          userId,
          phone: String(body.phone || "").trim(),
          school: String(body.school || "").trim(),
          yksRank: String(body.yksRank || ""),
          classStatus: String(body.classStatus || ""),
          currentDistrict: String(body.currentDistrict || ""),
          currentAddress: String(body.currentAddress || ""),
          districts: Array.isArray(body.districts) ? body.districts.join(", ") : String(body.districts || ""),
          onlineAvailable: Boolean(body.onlineAvailable),
          iban: String(body.iban || "").trim(),
          notes: String(body.notes || ""),
        },
      });
    }

    // 3. Öğrenci Profili Güncelleme
    if (role === "STUDENT") {
      await db.studentProfile.upsert({
        where: { userId },
        update: {
          phone: body.phone !== undefined ? String(body.phone).trim() : undefined,
          city: body.city !== undefined ? String(body.city).trim() : undefined,
          grade: body.grade !== undefined ? String(body.grade).trim() : undefined,
          target: body.target !== undefined ? String(body.target).trim() : undefined,
          subject: body.subject !== undefined ? String(body.subject).trim() : undefined,
        },
        create: {
          userId,
          phone: String(body.phone || "").trim(),
          city: String(body.city || "").trim(),
          grade: String(body.grade || "").trim(),
          target: String(body.target || "").trim(),
          subject: String(body.subject || "").trim(),
        },
      });
    }

    return await this.getProfile(userId);
  }
}
