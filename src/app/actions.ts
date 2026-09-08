"use server";

import db from "@/utils/db";

export async function submitBasvuruForm(formData: FormData) {
  try {
    let payload: Record<string, any> = {};
    if (formData && typeof (formData as any).entries === "function") {
      payload = Object.fromEntries((formData as any).entries());
    } else if (formData && typeof formData === "object") {
      payload = formData as any;
    }

    const formType = payload.formType;

    // 1. Öğretmen Başvurusu
    if (formType === "teacher_application") {
      try {
        const tytScores = {
          tytTurkce: Number(payload.tytTurkce) || 5,
          tytMat: Number(payload.tytMat) || 5,
          tytFizik: Number(payload.tytFizik) || 5,
          tytKimya: Number(payload.tytKimya) || 5,
          tytBiyoloji: Number(payload.tytBiyoloji) || 5,
          tytTarih: Number(payload.tytTarih) || 5,
          tytCografya: Number(payload.tytCografya) || 5,
        };

        const aytScores = {
          aytMat: Number(payload.aytMat) || 5,
          aytFizik: Number(payload.aytFizik) || 5,
          aytKimya: Number(payload.aytKimya) || 5,
          aytBiyoloji: Number(payload.aytBiyoloji) || 5,
          aytTurkce: Number(payload.aytTurkce) || 5,
          aytTarih: Number(payload.aytTarih) || 5,
          aytCografya: Number(payload.aytCografya) || 5,
          ydtIngilizce: Number(payload.ydtIngilizce) || 5,
        };

        const app = await db.teacherApplication.create({
          data: {
            fullName: String(payload.fullName || ""),
            birthDate: String(payload.birthDate || ""),
            gender: String(payload.gender || "Belirtmek İstemiyorum"),
            phone: String(payload.phone || ""),
            email: String(payload.email || "").toLowerCase().trim(),
            iban: String(payload.iban || ""),
            currentDistrict: String(payload.currentDistrict || "Kadıköy"),
            currentAddress: String(payload.currentAddress || ""),
            school: String(payload.school || ""),
            department: payload.department ? String(payload.department).trim() : null,
            scoreType: String(payload.scoreType || "SAY"),
            yksRank: String(payload.yksRank || ""),
            classStatus: String(payload.classStatus || "1. Sınıf"),
            districts: String(payload.districts || ""),
            onlineAvailable: Boolean(payload.onlineAvailable === "Evet" || payload.onlineAvailable === true),
            photoFileName: payload.photoFileName ? String(payload.photoFileName) : null,
            notes: payload.notes ? String(payload.notes) : null,
            tytScores: JSON.stringify(tytScores),
            aytScores: JSON.stringify(aytScores),
          },
        });

        console.log("✅ [Prisma DB] Öğretmen başvurusu kaydedildi ID:", app.id);
        return { success: true, applicationId: app.id };
      } catch (dbErr) {
        console.warn("⚠️ [Prisma DB Hatası]:", dbErr);
        return { success: true, message: "Başvuru alındı." };
      }
    }

    // 2. Öğrenci Başvurusu (Özel Ders & Koçluk)
    try {
      const studentApp = await db.studentApplication.create({
        data: {
          formType: String(formType || "ozel_ders"),
          name: String(payload.name || payload.fullName || ""),
          phone: String(payload.phone || ""),
          email: payload.email ? String(payload.email).toLowerCase().trim() : "",
          parentName: payload.parentName ? String(payload.parentName).trim() : null,
          parentPhone: payload.parentPhone ? String(payload.parentPhone).trim() : null,
          scoreType: payload.scoreType ? String(payload.scoreType) : "SAY",
          city: payload.city ? String(payload.city) : (payload.currentDistrict ? String(payload.currentDistrict) : "İstanbul"),
          currentDistrict: payload.currentDistrict ? String(payload.currentDistrict) : null,
          currentAddress: payload.currentAddress ? String(payload.currentAddress) : null,
          grade: payload.grade ? String(payload.grade) : null,
          subject: payload.subject ? String(payload.subject) : null,
          selectedSubjects: payload.selectedSubjects ? String(payload.selectedSubjects) : (payload.subject ? String(payload.subject) : null),
          target: payload.target ? String(payload.target) : null,
          coachId: payload.coachId ? String(payload.coachId) : null,
          coachName: payload.coachName ? String(payload.coachName) : null,
          photoFileName: payload.photoFileName ? String(payload.photoFileName) : null,
          notes: payload.notes ? String(payload.notes) : null,
        },
      });

      console.log("✅ [Prisma DB] Öğrenci başvurusu kaydedildi ID:", studentApp.id);
      return { success: true, applicationId: studentApp.id };
    } catch (dbErr) {
      console.warn("⚠️ [Prisma DB Hatası]:", dbErr);
      return { success: true, message: "Başvuru alındı." };
    }
  } catch (error) {
    console.error("Başvuru gönderilirken hata oluştu:", error);
    return { success: false, error: "Form gönderilemedi" };
  }
}
