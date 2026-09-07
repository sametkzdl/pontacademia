import { R2StorageService } from "@/utils/third-party/r2.service";

export type StorageCategory = "avatars" | "applications" | "documents" | "general";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_DOCUMENT_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export class StorageService {
  /**
   * Dosya İsim ve Uzantısını Temizle
   */
  private static sanitizeFileName(fileName: string): string {
    return fileName
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, "_")
      .replace(/_+/g, "_");
  }

  /**
   * Benzersiz Storage Key Üret (development / production ana klasörü altında)
   */
  static generateKey(category: StorageCategory, fileName: string, prefix = ""): string {
    const envFolder = R2StorageService.getEnvFolder(); // "development" veya "production"
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const sanitized = this.sanitizeFileName(fileName);
    const subFolder = prefix ? `${prefix}/` : "";
    return `${envFolder}/${category}/${subFolder}${timestamp}_${randomSuffix}_${sanitized}`;
  }

  /**
   * Doğrudan Dosya Yükleme (Buffer/ArrayBuffer)
   */
  static async uploadFile({
    file,
    fileName,
    contentType,
    category = "general",
    prefix = "",
  }: {
    file: Buffer | Uint8Array;
    fileName: string;
    contentType: string;
    category?: StorageCategory;
    prefix?: string;
  }) {
    if (file.byteLength > MAX_FILE_SIZE_BYTES) {
      throw new Error("Dosya boyutu maksimum 10MB olabilir.");
    }

    if (![...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES].includes(contentType)) {
      throw new Error("Desteklenmeyen dosya formatı. (Desteklenenler: JPEG, PNG, WEBP, PDF)");
    }

    const key = this.generateKey(category, fileName, prefix);
    return await R2StorageService.uploadFile({
      key,
      file,
      contentType,
      metadata: { originalName: encodeURIComponent(fileName), category },
    });
  }

  /**
   * İstemciden Doğrudan R2'ye Yükleme İçin Presigned URL Üret
   */
  static async getPresignedUploadUrl({
    fileName,
    contentType,
    category = "general",
    prefix = "",
  }: {
    fileName: string;
    contentType: string;
    category?: StorageCategory;
    prefix?: string;
  }) {
    if (![...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES].includes(contentType)) {
      throw new Error("Desteklenmeyen dosya formatı. (Desteklenenler: JPEG, PNG, WEBP, PDF)");
    }

    const key = this.generateKey(category, fileName, prefix);
    return await R2StorageService.getPresignedUploadUrl({
      key,
      contentType,
      expiresInSeconds: 3600, // 1 saat geçerli
    });
  }

  /**
   * Dosya Getir (Proxy için)
   */
  static async getFile(key: string) {
    if (!key) throw new Error("Dosya anahtarı (key) zorunludur.");
    return await R2StorageService.getFile(key);
  }

  /**
   * Dosya Silme
   */
  static async deleteFile(key: string) {
    if (!key) throw new Error("Dosya anahtarı (key) zorunludur.");
    return await R2StorageService.deleteFile(key);
  }
}
