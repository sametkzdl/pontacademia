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
          showPhotoOnWeb: body.showPhotoOnWeb !== undefined ? Boolean(body.showPhotoOnWeb) : undefined,
          photoUrl: body.photoUrl !== undefined ? (body.photoUrl ? String(body.photoUrl) : null) : undefined,
          iban: body.iban !== undefined ? String(body.iban).trim() : undefined,
          scoreType: body.scoreType !== undefined ? (body.scoreType ? String(body.scoreType).trim() : null) : undefined,
          notes: body.notes !== undefined ? String(body.notes) : undefined,
          tytTurkce: body.tytTurkce !== undefined ? Number(body.tytTurkce) : undefined,
          tytMat: body.tytMat !== undefined ? Number(body.tytMat) : undefined,
          tytFizik: body.tytFizik !== undefined ? Number(body.tytFizik) : undefined,
          tytKimya: body.tytKimya !== undefined ? Number(body.tytKimya) : undefined,
          tytBiyoloji: body.tytBiyoloji !== undefined ? Number(body.tytBiyoloji) : undefined,
          tytTarih: body.tytTarih !== undefined ? Number(body.tytTarih) : undefined,
          tytCografya: body.tytCografya !== undefined ? Number(body.tytCografya) : undefined,
          aytMat: body.aytMat !== undefined ? Number(body.aytMat) : undefined,
          aytFizik: body.aytFizik !== undefined ? Number(body.aytFizik) : undefined,
          aytKimya: body.aytKimya !== undefined ? Number(body.aytKimya) : undefined,
          aytBiyoloji: body.aytBiyoloji !== undefined ? Number(body.aytBiyoloji) : undefined,
          aytTurkce: body.aytTurkce !== undefined ? Number(body.aytTurkce) : undefined,
          aytTarih: body.aytTarih !== undefined ? Number(body.aytTarih) : undefined,
          aytCografya: body.aytCografya !== undefined ? Number(body.aytCografya) : undefined,
          ydtIngilizce: body.ydtIngilizce !== undefined ? Number(body.ydtIngilizce) : undefined,
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
          showPhotoOnWeb: body.showPhotoOnWeb !== undefined ? Boolean(body.showPhotoOnWeb) : true,
          photoUrl: body.photoUrl ? String(body.photoUrl) : null,
          iban: String(body.iban || "").trim(),
          scoreType: body.scoreType ? String(body.scoreType).trim() : null,
          notes: String(body.notes || ""),
          tytTurkce: body.tytTurkce !== undefined ? Number(body.tytTurkce) : 5,
          tytMat: body.tytMat !== undefined ? Number(body.tytMat) : 5,
          tytFizik: body.tytFizik !== undefined ? Number(body.tytFizik) : 5,
          tytKimya: body.tytKimya !== undefined ? Number(body.tytKimya) : 5,
          tytBiyoloji: body.tytBiyoloji !== undefined ? Number(body.tytBiyoloji) : 5,
          tytTarih: body.tytTarih !== undefined ? Number(body.tytTarih) : 5,
          tytCografya: body.tytCografya !== undefined ? Number(body.tytCografya) : 5,
          aytMat: body.aytMat !== undefined ? Number(body.aytMat) : 5,
          aytFizik: body.aytFizik !== undefined ? Number(body.aytFizik) : 5,
          aytKimya: body.aytKimya !== undefined ? Number(body.aytKimya) : 5,
          aytBiyoloji: body.aytBiyoloji !== undefined ? Number(body.aytBiyoloji) : 5,
          aytTurkce: body.aytTurkce !== undefined ? Number(body.aytTurkce) : 5,
          aytTarih: body.aytTarih !== undefined ? Number(body.aytTarih) : 5,
          aytCografya: body.aytCografya !== undefined ? Number(body.aytCografya) : 5,
          ydtIngilizce: body.ydtIngilizce !== undefined ? Number(body.ydtIngilizce) : 5,
        },
      });
    }

    // 3. Öğrenci Profili Güncelleme
    if (role === "STUDENT") {
      // Eğer ders listesi güncelleniyorsa, kaldırılan dersler için işlenmemiş randevu kontrolü yap
      if (body.selectedSubjects !== undefined) {
        const currentProfile = await db.studentProfile.findUnique({
          where: { userId },
        });

        if (currentProfile?.selectedSubjects) {
          const currentSubjects = currentProfile.selectedSubjects
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

          const newSubjects = (
            Array.isArray(body.selectedSubjects)
              ? body.selectedSubjects
              : String(body.selectedSubjects || "").split(",")
          )
            .map((s) => s.trim())
            .filter(Boolean);

          const removedSubjects = currentSubjects.filter((sub) => !newSubjects.includes(sub));

          for (const removedSub of removedSubjects) {
            const isCoaching =
              removedSub.toLowerCase().includes("koçluk") ||
              removedSub.toLowerCase().includes("kocluk");

            const activeMatchWithPendingLessons = await db.studentTeacherMatch.findFirst({
              where: {
                studentId: userId,
                status: "ACTIVE",
                OR: isCoaching
                  ? [{ type: "KOCLUK" }, { subject: removedSub }]
                  : [{ subject: removedSub }],
                lessons: {
                  some: {
                    status: { in: ["PENDING_APPROVAL", "SCHEDULED"] },
                  },
                },
              },
              include: {
                teacher: true,
                lessons: {
                  where: {
                    status: { in: ["PENDING_APPROVAL", "SCHEDULED"] },
                  },
                },
              },
            });

            if (activeMatchWithPendingLessons) {
              const teacherName = activeMatchWithPendingLessons.teacher?.name || "eğitmeniniz";
              const pendingCount = activeMatchWithPendingLessons.lessons.length;
              throw new Error(
                `"${removedSub}" dersine ait ${teacherName} ile onay bekleyen veya henüz işlenmemiş ${pendingCount} adet ders randevunuz bulunmaktadır. Bu dersi profilinizden kaldırmadan önce lütfen ders oturumunu tamamlayınız veya iptal ediniz.`
              );
            }
          }
        }
      }

      await db.studentProfile.upsert({
        where: { userId },
        update: {
          phone: body.phone !== undefined ? String(body.phone).trim() : undefined,
          parentName: body.parentName !== undefined ? (body.parentName ? String(body.parentName).trim() : null) : undefined,
          parentPhone: body.parentPhone !== undefined ? (body.parentPhone ? String(body.parentPhone).trim() : null) : undefined,
          scoreType: body.scoreType !== undefined ? (body.scoreType ? String(body.scoreType).trim() : null) : undefined,
          city: body.city !== undefined ? String(body.city).trim() : undefined,
          currentDistrict: body.currentDistrict !== undefined ? String(body.currentDistrict).trim() : undefined,
          currentAddress: body.currentAddress !== undefined ? String(body.currentAddress).trim() : undefined,
          grade: body.grade !== undefined ? String(body.grade).trim() : undefined,
          target: body.target !== undefined ? String(body.target).trim() : undefined,
          subject: body.subject !== undefined ? String(body.subject).trim() : undefined,
          selectedSubjects: body.selectedSubjects !== undefined ? (Array.isArray(body.selectedSubjects) ? body.selectedSubjects.join(", ") : String(body.selectedSubjects)) : undefined,
          photoUrl: body.photoUrl !== undefined ? (body.photoUrl ? String(body.photoUrl) : null) : undefined,
        },
        create: {
          userId,
          phone: String(body.phone || "").trim(),
          parentName: body.parentName ? String(body.parentName).trim() : null,
          parentPhone: body.parentPhone ? String(body.parentPhone).trim() : null,
          scoreType: body.scoreType ? String(body.scoreType).trim() : null,
          city: String(body.city || "").trim(),
          currentDistrict: String(body.currentDistrict || "").trim(),
          currentAddress: String(body.currentAddress || "").trim(),
          grade: String(body.grade || "").trim(),
          target: String(body.target || "").trim(),
          subject: String(body.subject || "").trim(),
          selectedSubjects: Array.isArray(body.selectedSubjects) ? body.selectedSubjects.join(", ") : String(body.selectedSubjects || ""),
          photoUrl: body.photoUrl ? String(body.photoUrl) : null,
        },
      });
    }

    return await this.getProfile(userId);
  }
}
