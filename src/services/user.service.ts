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
        include: { studentProfile: true },
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
}
