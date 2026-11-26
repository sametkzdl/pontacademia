"use server";

import { sendMail, type MailField } from "@/lib/mail";

type Result = { success: boolean; error?: string };

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

function text(fd: FormData, key: string) {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

async function photoAttachment(fd: FormData) {
  const file = fd.get("photo");
  if (!file || typeof file === "string" || file.size === 0) return [];
  if (file.size > MAX_PHOTO_BYTES) throw new Error("Fotoğraf 5MB'dan büyük olamaz.");
  if (!file.type.startsWith("image/")) throw new Error("Fotoğraf bir görsel dosyası olmalı.");
  return [{ filename: file.name || "fotograf.jpg", content: Buffer.from(await file.arrayBuffer()), contentType: file.type }];
}

const TYT_LABELS: Record<string, string> = {
  tytTurkce: "TYT Türkçe", tytMat: "TYT Matematik", tytFizik: "TYT Fizik", tytKimya: "TYT Kimya",
  tytBiyoloji: "TYT Biyoloji", tytTarih: "TYT Tarih", tytCografya: "TYT Coğrafya",
};
const AYT_LABELS: Record<string, string> = {
  aytMat: "AYT Matematik", aytFizik: "AYT Fizik", aytKimya: "AYT Kimya", aytBiyoloji: "AYT Biyoloji",
  aytTurkce: "AYT Edebiyat", aytTarih: "AYT Tarih", aytCografya: "AYT Coğrafya", ydtIngilizce: "YDT İngilizce",
};

function scoreLines(fd: FormData, labels: Record<string, string>) {
  return Object.entries(labels)
    .map(([key, label]) => `${label}: ${text(fd, key) || "5"}/10`)
    .join("\n");
}

// Teacher, private lesson and coaching applications: mailed to MAIL_TO with the photo attached.
export async function submitBasvuruForm(fd: FormData): Promise<Result> {
  try {
    const formType = text(fd, "formType");
    const attachments = await photoAttachment(fd);

    if (formType === "teacher_application") {
      const fields: MailField[] = [
        { label: "Ad Soyad", value: text(fd, "fullName") },
        { label: "Telefon", value: text(fd, "phone") },
        { label: "E-posta", value: text(fd, "email") },
        { label: "Doğum Tarihi", value: text(fd, "birthDate") },
        { label: "Cinsiyet", value: text(fd, "gender") },
        { label: "Üniversite", value: text(fd, "school") },
        { label: "Bölüm", value: text(fd, "department") },
        { label: "Sınıf", value: text(fd, "classStatus") },
        { label: "Puan Türü", value: text(fd, "scoreType") },
        { label: "YKS Sıralaması", value: text(fd, "yksRank") },
        { label: "Yaşadığı İlçe", value: text(fd, "currentDistrict") },
        { label: "Adres", value: text(fd, "currentAddress") },
        { label: "Ders Verebileceği İlçeler", value: text(fd, "districts") },
        { label: "Online Ders", value: text(fd, "onlineAvailable") },
        { label: "IBAN", value: text(fd, "iban") },
        { label: "TYT Yetkinlikleri", value: scoreLines(fd, TYT_LABELS) },
        { label: "AYT/YDT Yetkinlikleri", value: scoreLines(fd, AYT_LABELS) },
        { label: "Notlar", value: text(fd, "notes") },
      ];
      await sendMail({
        subject: `Eğitmen Başvurusu — ${text(fd, "fullName") || "İsimsiz"}`,
        title: "Yeni Eğitmen / Koç Başvurusu",
        fields,
        replyTo: text(fd, "email"),
        attachments,
      });
      return { success: true };
    }

    const kind = formType === "kocluk" ? "Koçluk" : "Özel Ders";
    const fields: MailField[] = [
      { label: "Başvuru Türü", value: kind },
      { label: "Öğrenci", value: text(fd, "name") || text(fd, "fullName") },
      { label: "Telefon", value: text(fd, "phone") },
      { label: "E-posta", value: text(fd, "email") },
      { label: "Veli Adı", value: text(fd, "parentName") },
      { label: "Veli Telefonu", value: text(fd, "parentPhone") },
      { label: "Sınıf", value: text(fd, "grade") },
      { label: "Puan Türü", value: text(fd, "scoreType") },
      { label: "Dersler", value: text(fd, "selectedSubjects") || text(fd, "subject") },
      { label: "Hedef", value: text(fd, "target") },
      { label: "Şehir", value: text(fd, "city") },
      { label: "İlçe", value: text(fd, "currentDistrict") },
      { label: "Adres", value: text(fd, "currentAddress") },
      { label: "Koç", value: text(fd, "coachName") },
      { label: "Notlar", value: text(fd, "notes") },
    ];
    await sendMail({
      subject: `${kind} Başvurusu — ${fields[1].value || "İsimsiz"}`,
      title: `Yeni ${kind} Başvurusu`,
      fields,
      replyTo: text(fd, "email"),
      attachments,
    });
    return { success: true };
  } catch (error) {
    console.error("[basvuru] Mail gönderilemedi:", error);
    return { success: false, error: error instanceof Error ? error.message : "Form gönderilemedi" };
  }
}

// Contact form on the home page.
export async function submitContactForm(data: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}): Promise<Result> {
  try {
    if (!data.name?.trim() || !data.email?.trim() || !data.message?.trim()) {
      return { success: false, error: "Lütfen ad soyad, e-posta ve mesaj alanlarını doldurunuz." };
    }
    await sendMail({
      subject: `İletişim Formu — ${data.name.trim()}`,
      title: "Yeni İletişim Mesajı",
      replyTo: data.email.trim(),
      fields: [
        { label: "Ad Soyad", value: data.name },
        { label: "E-posta", value: data.email },
        { label: "Telefon", value: data.phone || "" },
        { label: "Konu", value: data.subject || "" },
        { label: "Mesaj", value: data.message },
      ],
    });
    return { success: true };
  } catch (error) {
    console.error("[iletisim] Mail gönderilemedi:", error);
    return { success: false, error: "Mesaj gönderilemedi. Lütfen tekrar deneyiniz." };
  }
}
