import { 
  S3Client, 
  PutObjectCommand, 
  DeleteObjectCommand, 
  GetObjectCommand 
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "";
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "pont-academy-storage";

export class R2StorageService {
  private static client: S3Client | null = null;

  /**
   * Aktif Ortam Klasörü (development / production)
   */
  static getEnvFolder(): string {
    const env = process.env.APP_ENV || process.env.NODE_ENV || "development";
    return env.toLowerCase() === "production" ? "production" : "development";
  }

  /**
   * S3 Client Singleton (Cloudflare R2 Endpoint)
   */
  private static getClient(): S3Client {
    if (!this.client) {
      this.client = new S3Client({
        region: "auto",
        endpoint: R2_ACCOUNT_ID 
          ? `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
          : undefined,
        credentials: {
          accessKeyId: R2_ACCESS_KEY_ID,
          secretAccessKey: R2_SECRET_ACCESS_KEY,
        },
      });
    }
    return this.client;
  }

  /**
   * R2 Kimlik Bilgilerinin Tanımlı Olup Olmadığını Kontrol Et
   */
  static isConfigured(): boolean {
    return Boolean(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY);
  }

  /**
   * Dosyayı Doğrudan R2'ye Yükle
   */
  static async uploadFile({
    key,
    file,
    contentType,
    metadata = {},
  }: {
    key: string;
    file: Buffer | Uint8Array;
    contentType: string;
    metadata?: Record<string, string>;
  }): Promise<{ key: string; url: string }> {
    if (!this.isConfigured()) {
      console.warn("⚠️ [R2StorageService] R2 kimlik bilgileri .env içinde eksik. Proxy URL dönülüyor.");
      return {
        key,
        url: this.getPublicUrl(key),
      };
    }

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
      Metadata: metadata,
    });

    await this.getClient().send(command);

    return {
      key,
      url: this.getPublicUrl(key),
    };
  }

  /**
   * Dosyayı R2'den Oku (Proxy endpoint için)
   */
  static async getFile(key: string): Promise<{
    body: Uint8Array | null;
    contentType: string;
    contentLength?: number;
    etag?: string;
  } | null> {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const command = new GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      });

      const response = await this.getClient().send(command);
      if (!response.Body) return null;

      const bytes = await response.Body.transformToByteArray();
      return {
        body: bytes,
        contentType: response.ContentType || "application/octet-stream",
        contentLength: response.ContentLength,
        etag: response.ETag,
      };
    } catch (err) {
      console.error("[R2StorageService] getFile hatası:", err);
      return null;
    }
  }

  /**
   * İstemci (Frontend) Tarafından Doğrudan Yükleme İçin Presigned URL Üret
   */
  static async getPresignedUploadUrl({
    key,
    contentType,
    expiresInSeconds = 3600,
  }: {
    key: string;
    contentType: string;
    expiresInSeconds?: number;
  }): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
    if (!this.isConfigured()) {
      return {
        uploadUrl: `mock-upload-url-for-${key}`,
        publicUrl: this.getPublicUrl(key),
        key,
      };
    }

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.getClient(), command, {
      expiresIn: expiresInSeconds,
    });

    return {
      uploadUrl,
      publicUrl: this.getPublicUrl(key),
      key,
    };
  }

  /**
   * İndirme / Görüntüleme İçin Presigned URL Üret (Özel dosyalar için)
   */
  static async getPresignedDownloadUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    if (!this.isConfigured()) {
      return this.getPublicUrl(key);
    }

    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    return await getSignedUrl(this.getClient(), command, {
      expiresIn: expiresInSeconds,
    });
  }

  /**
   * Dosya Sil
   */
  static async deleteFile(key: string): Promise<boolean> {
    if (!this.isConfigured()) {
      return true;
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      });

      await this.getClient().send(command);
      return true;
    } catch (err) {
      console.error("[R2StorageService] Dosya silme hatası:", err);
      return false;
    }
  }

  /**
   * Subdomain yerine Proxy URL Döndür (/api/storage/file?key=...)
   */
  static getPublicUrl(key: string): string {
    return `/api/storage/file?key=${encodeURIComponent(key)}`;
  }
}
