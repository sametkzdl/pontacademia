import db from "@/utils/db";

export interface SystemSettingsData {
  privateLessonPrice: string;
  coachingPrice: string;
  campaignBannerActive: boolean;
  campaignBannerText: string;
  contactPhone?: string;
  contactEmail?: string;
  contactAddress?: string;
}

export class SettingService {
  /**
   * Tüm Sistem Ayarlarını Getir (Veritabanından Doğrudan)
   */
  static async getSettings(): Promise<SystemSettingsData> {
    try {
      const systemSettingModel = (db as any).systemSetting;
      if (!systemSettingModel) {
        return {
          privateLessonPrice: "",
          coachingPrice: "",
          campaignBannerActive: false,
          campaignBannerText: "",
          contactPhone: "",
          contactEmail: "",
          contactAddress: "",
        };
      }

      const settings = await systemSettingModel.findMany();
      if (!settings || !Array.isArray(settings) || settings.length === 0) {
        return {
          privateLessonPrice: "",
          coachingPrice: "",
          campaignBannerActive: false,
          campaignBannerText: "",
          contactPhone: "",
          contactEmail: "",
          contactAddress: "",
        };
      }

      const map = new Map(settings.map((s: any) => [s.key, s.value]));

      return {
        privateLessonPrice: (map.get("private_lesson_price") as string) || "",
        coachingPrice: (map.get("coaching_price") as string) || "",
        campaignBannerActive: map.get("campaign_banner_active") === "true",
        campaignBannerText: (map.get("campaign_banner_text") as string) || "",
        contactPhone: (map.get("contact_phone") as string) || "",
        contactEmail: (map.get("contact_email") as string) || "",
        contactAddress: (map.get("contact_address") as string) || "",
      };
    } catch (err) {
      console.error("Settings fetch error:", err);
      return {
        privateLessonPrice: "",
        coachingPrice: "",
        campaignBannerActive: false,
        campaignBannerText: "",
        contactPhone: "",
        contactEmail: "",
        contactAddress: "",
      };
    }
  }

  /**
   * Sistem Ayarlarını Toplu Güncelle (Admin)
   */
  static async updateSettings(data: Partial<SystemSettingsData>): Promise<SystemSettingsData> {
    const systemSettingModel = (db as any).systemSetting;
    if (!systemSettingModel) {
      throw new Error("Veritabanı modeli henüz hazır değil. Lütfen geliştirme sunucusunu yeniden başlatın.");
    }

    const updates: { key: string; value: string; description?: string }[] = [];

    if (data.privateLessonPrice !== undefined) {
      updates.push({
        key: "private_lesson_price",
        value: data.privateLessonPrice.trim(),
        description: "Birebir Özel Ders Saatlik Ücreti",
      });
    }

    if (data.coachingPrice !== undefined) {
      updates.push({
        key: "coaching_price",
        value: data.coachingPrice.trim(),
        description: "Birebir Eğitim Koçluğu Aylık Ücreti",
      });
    }

    if (data.campaignBannerActive !== undefined) {
      updates.push({
        key: "campaign_banner_active",
        value: String(data.campaignBannerActive),
        description: "Ana Sayfa Kampanya Bannerı Aktiflik Durumu",
      });
    }

    if (data.campaignBannerText !== undefined) {
      updates.push({
        key: "campaign_banner_text",
        value: data.campaignBannerText.trim(),
        description: "Ana Sayfa Kampanya Bannerı Metni",
      });
    }

    if (data.contactPhone !== undefined) {
      updates.push({
        key: "contact_phone",
        value: data.contactPhone.trim(),
        description: "İletişim Telefon Numarası",
      });
    }

    if (data.contactEmail !== undefined) {
      updates.push({
        key: "contact_email",
        value: data.contactEmail.toLowerCase().trim(),
        description: "İletişim E-Posta Adresi",
      });
    }

    if (data.contactAddress !== undefined) {
      updates.push({
        key: "contact_address",
        value: data.contactAddress.trim(),
        description: "İletişim / Ofis Adresi",
      });
    }

    for (const item of updates) {
      await systemSettingModel.upsert({
        where: { key: item.key },
        update: { value: item.value, description: item.description },
        create: item,
      });
    }

    return await this.getSettings();
  }
}
