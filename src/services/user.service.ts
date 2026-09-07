import db from "@/utils/db";

export class UserService {
  /**
   * Tüm Öğretmen ve Öğrenci Kullanıcılarını Getir (Admin için)
   */
  static async getAllUsers() {
    const [teachers, students] = await Promise.all([
      db.user.findMany({
        where: { role: "TEACHER" },
        include: { teacherProfile: true },
        orderBy: { createdAt: "desc" },
      }),
      db.user.findMany({
        where: { role: "STUDENT" },
        include: { 
          studentProfile: true,
          studentMatches: {
            where: { status: "ACTIVE" },
            include: {
              teacher: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  teacherProfile: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const safeTeachers = teachers.map(({ passwordHash: _, ...rest }) => rest);
    const safeStudents = students.map(({ passwordHash: _, ...rest }) => rest);

    return {
      teachers: safeTeachers,
      students: safeStudents,
    };
  }

  /**
   * Kullanıcı Aktif / Pasif Durumunu Güncelle
   */
  static async toggleUserStatus(userId: string, isActive: boolean) {
    if (!userId) {
      throw new Error("Kullanıcı ID'si gereklidir.");
    }

    return await db.user.update({
      where: { id: userId },
      data: { isActive },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });
  }

  /**
   * Kullanıcı Şifresini Sıfırla / Yenile (Admin için)
   */
  static async resetUserPassword(userId: string, newPassword?: string) {
    if (!userId) {
      throw new Error("Kullanıcı ID'si gereklidir.");
    }

    const finalPassword = newPassword && newPassword.trim().length >= 6 
      ? newPassword.trim() 
      : `Pont${Math.floor(1000 + Math.random() * 9000)}!`;

    const { hashPassword } = await import("@/utils/hash");
    const passwordHash = await hashPassword(finalPassword);

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        mustChangePassword: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    return {
      user: updatedUser,
      newPassword: finalPassword,
    };
  }

  /**
   * Öğretmen Ders Yetkinlik Puanlarını Güncelle (Admin için)
   */
  static async updateTeacherCompetencies(userId: string, scores: Record<string, number>) {
    if (!userId) {
      throw new Error("Kullanıcı ID'si gereklidir.");
    }

    const teacherProfile = await db.teacherProfile.findUnique({
      where: { userId },
    });

    if (!teacherProfile) {
      throw new Error("Öğretmen profili bulunamadı.");
    }

    const dataToUpdate: any = {};
    const validKeys = [
      "tytTurkce", "tytMat", "tytFizik", "tytKimya", "tytBiyoloji", "tytTarih", "tytCografya",
      "aytMat", "aytFizik", "aytKimya", "aytBiyoloji", "aytTurkce", "aytTarih", "aytCografya", "ydtIngilizce"
    ];

    for (const key of validKeys) {
      if (scores[key] !== undefined) {
        dataToUpdate[key] = Math.max(1, Math.min(10, Number(scores[key])));
      }
    }

    return await db.teacherProfile.update({
      where: { userId },
      data: dataToUpdate,
    });
  }
}

