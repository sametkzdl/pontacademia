import db from "@/utils/db";

export interface CreateContactMessageDTO {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

export class ContactService {
  /**
   * Yeni İletişim Mesajı Kaydet (Ziyaretçi)
   */
  static async createMessage(data: CreateContactMessageDTO) {
    if (!data.name || !data.email || !data.message) {
      throw new Error("İsim, e-posta ve mesaj alanları zorunludur.");
    }

    const contactModel = (db as any).contactMessage;
    if (!contactModel) {
      throw new Error("İletişim servisi şu anda hazır değil.");
    }

    return await contactModel.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        phone: data.phone?.trim() || null,
        subject: data.subject?.trim() || "Genel İletişim & Bilgi Talebi",
        message: data.message.trim(),
        status: "UNREAD",
      },
    });
  }

  /**
   * Tüm İletişim Mesajlarını Getir (Admin)
   */
  static async getAllMessages() {
    try {
      const contactModel = (db as any).contactMessage;
      if (!contactModel) {
        return [];
      }

      return await contactModel.findMany({
        orderBy: { createdAt: "desc" },
      });
    } catch (err) {
      console.error("ContactService.getAllMessages error:", err);
      return [];
    }
  }

  /**
   * Mesaj Durumunu Güncelle (Admin: UNREAD, READ, REPLIED)
   */
  static async updateMessageStatus(id: string, status: "UNREAD" | "READ" | "REPLIED", notes?: string) {
    const contactModel = (db as any).contactMessage;
    if (!contactModel) {
      throw new Error("İletişim servisi henüz hazır değil.");
    }

    return await contactModel.update({
      where: { id },
      data: {
        status,
        ...(notes !== undefined ? { notes } : {}),
      },
    });
  }

  /**
   * Mesajı Sil (Admin)
   */
  static async deleteMessage(id: string) {
    const contactModel = (db as any).contactMessage;
    if (!contactModel) {
      throw new Error("İletişim servisi henüz hazır değil.");
    }

    return await contactModel.delete({
      where: { id },
    });
  }
}
