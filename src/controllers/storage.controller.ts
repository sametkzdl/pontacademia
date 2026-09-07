import { NextRequest } from "next/server";
import { StorageService, StorageCategory } from "@/services/storage.service";
import { ApiResponse } from "@/utils/response";
import { getSessionUser } from "@/utils/auth";

export class StorageController {
  /**
   * POST /api/storage/upload (Multipart/Form-Data ile doğrudan yükleme)
   */
  static async upload(req: NextRequest) {
    try {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const category = (formData.get("category") as StorageCategory) || "general";
      const prefix = (formData.get("prefix") as string) || "";

      if (!file) {
        return ApiResponse.error("Lütfen yüklenecek bir dosya seçiniz.", 400);
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const result = await StorageService.uploadFile({
        file: buffer,
        fileName: file.name,
        contentType: file.type,
        category,
        prefix,
      });

      return ApiResponse.success({
        message: "Dosya başarıyla yüklendi.",
        ...result,
      }, 201);
    } catch (err: any) {
      return ApiResponse.error(err.message || "Dosya yüklenemedi.", 400);
    }
  }

  /**
   * POST /api/storage/presigned-url (İstemci tarafı doğrudan R2 yükleme URL'i alma)
   */
  static async getPresignedUrl(req: NextRequest) {
    try {
      const body = await req.json();
      const { fileName, contentType, category = "general", prefix = "" } = body;

      if (!fileName || !contentType) {
        return ApiResponse.error("fileName ve contentType alanları zorunludur.", 400);
      }

      const result = await StorageService.getPresignedUploadUrl({
        fileName,
        contentType,
        category,
        prefix,
      });

      return ApiResponse.success(result);
    } catch (err: any) {
      return ApiResponse.error(err.message || "Presigned URL oluşturulamadı.", 400);
    }
  }

  /**
   * DELETE /api/storage/delete (Dosya silme)
   */
  static async delete(req: NextRequest) {
    try {
      const session = await getSessionUser();
      if (!session) {
        return ApiResponse.unauthorized("Bu işlem için oturum açmalısınız.");
      }

      const body = await req.json();
      const { key } = body;

      if (!key) {
        return ApiResponse.error("Silinecek dosya anahtarı (key) zorunludur.", 400);
      }

      await StorageService.deleteFile(key);
      return ApiResponse.success({ message: "Dosya başarıyla silindi." });
    } catch (err: any) {
      return ApiResponse.error(err.message || "Dosya silinemedi.", 400);
    }
  }
}
