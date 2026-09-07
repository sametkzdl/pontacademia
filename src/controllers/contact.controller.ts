import { NextRequest } from "next/server";
import { ContactService } from "@/services/contact.service";
import { getSessionUser } from "@/utils/auth";
import { ApiResponse } from "@/utils/response";

export class ContactController {
  static async createMessage(req: NextRequest) {
    try {
      const body = await req.json();
      const { name, email, phone, subject, message } = body;

      if (!name || !email || !message) {
        return ApiResponse.error("Lütfen ad soyad, e-posta ve mesaj alanlarını doldurunuz.", 400);
      }

      const result = await ContactService.createMessage({
        name,
        email,
        phone,
        subject,
        message,
      });

      return ApiResponse.success(result, 201, { message: "Mesajınız başarıyla iletildi." });
    } catch (error: any) {
      console.error("[ContactController.createMessage] Error:", error);
      return ApiResponse.error("Mesaj gönderilirken bir hata oluştu.", 500);
    }
  }

  static async getAllMessages(req: NextRequest) {
    try {
      const user = await getSessionUser();
      if (!user || user.role !== "ADMIN") {
        return ApiResponse.unauthorized("Yetkisiz işlem.");
      }

      const messages = await ContactService.getAllMessages();
      return ApiResponse.success(messages, 200, { message: "Mesajlar başarıyla getirildi." });
    } catch (error: any) {
      console.error("[ContactController.getAllMessages] Error:", error);
      return ApiResponse.error("Mesajlar alınırken bir hata oluştu.", 500);
    }
  }

  static async updateStatus(req: NextRequest) {
    try {
      const user = await getSessionUser();
      if (!user || user.role !== "ADMIN") {
        return ApiResponse.unauthorized("Yetkisiz işlem.");
      }

      const body = await req.json();
      const { id, status, notes } = body;

      if (!id || !status) {
        return ApiResponse.error("Mesaj ID ve durum zorunludur.", 400);
      }

      const updated = await ContactService.updateMessageStatus(id, status, notes);
      return ApiResponse.success(updated, 200, { message: "Mesaj durumu güncellendi." });
    } catch (error: any) {
      console.error("[ContactController.updateStatus] Error:", error);
      return ApiResponse.error("Mesaj güncellenirken bir hata oluştu.", 500);
    }
  }

  static async deleteMessage(req: NextRequest) {
    try {
      const user = await getSessionUser();
      if (!user || user.role !== "ADMIN") {
        return ApiResponse.unauthorized("Yetkisiz işlem.");
      }

      const { searchParams } = new URL(req.url);
      const id = searchParams.get("id");

      if (!id) {
        return ApiResponse.error("Mesaj ID belirtilmelidir.", 400);
      }

      const deleted = await ContactService.deleteMessage(id);
      return ApiResponse.success(deleted, 200, { message: "Mesaj başarıyla silindi." });
    } catch (error: any) {
      console.error("[ContactController.deleteMessage] Error:", error);
      return ApiResponse.error("Mesaj silinirken bir hata oluştu.", 500);
    }
  }
}
