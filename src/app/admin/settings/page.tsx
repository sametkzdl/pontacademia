"use client";

import React, { useState, useEffect } from "react";
import { 
  Settings, 
  Tag, 
  Sparkles, 
  Mail, 
  Save, 
  Check, 
  AlertCircle 
} from "lucide-react";
import { Button, Input } from "@/components";

export default function AdminSettingsPage() {
  const [settingsData, setSettingsData] = useState<any>({
    privateLessonPrice: "",
    coachingPrice: "",
    campaignBannerActive: false,
    campaignBannerText: "",
    contactPhone: "",
    contactEmail: "",
    contactAddress: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [saveErrorMsg, setSaveErrorMsg] = useState("");

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/settings", { cache: "no-store" });
      const data = await res.json();
      const loaded = data.settings || data.data;
      if (loaded && typeof loaded === "object") {
        setSettingsData(loaded);
      }
    } catch (err) {
      console.error("Fetch settings error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMsg("");
    setSaveErrorMsg("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.settings) {
          setSettingsData(data.settings);
        }
        setSaveSuccessMsg("Ayarlar başarıyla kaydedildi ve tüm sitede güncellendi!");
        setTimeout(() => setSaveSuccessMsg(""), 4000);
      } else {
        setSaveErrorMsg(data.error || "Ayarlar kaydedilemedi.");
      }
    } catch (err) {
      console.error(err);
      setSaveErrorMsg("Bağlantı hatası oluştu.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      <form onSubmit={handleSave}>
        {/* Header Box */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "24px", backgroundColor: "#FFFFFF", padding: "18px 20px", borderRadius: "12px", border: "1px solid #DDE6F0", boxShadow: "0 2px 8px rgba(15, 38, 69, 0.04)" }}>
          <div style={{ flex: "1 1 280px" }}>
            <h2 style={{ fontSize: "19px", fontWeight: "800", color: "#0F2645", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <Settings size={22} color="#C8952A" /> Sistem & Web Sitesi Genel Ayarları
            </h2>
            <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" }}>
              Ana sayfada gösterilen fiyatlandırma paketleri, kampanya duyuru çubuğu ve iletişim bilgilerini güncelleyin.
            </p>
          </div>

          <Button
            type="submit"
            loading={isSaving}
            variant="primary"
            icon={<Save size={16} />}
          >
            Ayarları Kaydet
          </Button>
        </div>

        {saveSuccessMsg && (
          <div style={{ backgroundColor: "#DCFCE7", border: "1px solid #86EFAC", color: "#15803D", padding: "14px 18px", borderRadius: "10px", fontSize: "14px", fontWeight: "700", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Check size={18} /> {saveSuccessMsg}
          </div>
        )}

        {saveErrorMsg && (
          <div style={{ backgroundColor: "#FEE2E2", border: "1px solid #FCA5A5", color: "#B91C1C", padding: "14px 18px", borderRadius: "10px", fontSize: "14px", fontWeight: "700", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertCircle size={18} /> {saveErrorMsg}
          </div>
        )}

        {/* Card 1: Fiyatlandırma Ayarları */}
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #DDE6F0", padding: "20px", marginBottom: "20px", boxShadow: "0 4px 16px rgba(15, 38, 69, 0.04)" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0F2645", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #F1F5F9", paddingBottom: "10px" }}>
            <Tag size={18} color="#C8952A" /> Fiyatlandırma Yönetimi (Ana Sayfa Kartları)
          </h3>
          
          <div className="admin-grid-2col">
            <Input
              label="Özel Ders Saat Ücreti"
              value={settingsData.privateLessonPrice || ""}
              onChange={(e) => setSettingsData({ ...settingsData, privateLessonPrice: e.target.value })}
              placeholder="Örn: 1.250 ₺ / saat"
              helperText="Ana sayfadaki Birebir Özel Ders paketinde gösterilir."
              required
            />

            <Input
              label="Eğitim Koçluğu Aylık Ücreti"
              value={settingsData.coachingPrice || ""}
              onChange={(e) => setSettingsData({ ...settingsData, coachingPrice: e.target.value })}
              placeholder="Örn: 4.500 ₺ / ay"
              helperText="Ana sayfadaki Birebir Eğitim Koçluğu paketinde gösterilir."
              required
            />
          </div>
        </div>

        {/* Card 2: Kampanya Bannerı */}
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #DDE6F0", padding: "20px", marginBottom: "20px", boxShadow: "0 4px 16px rgba(15, 38, 69, 0.04)" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0F2645", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #F1F5F9", paddingBottom: "10px" }}>
            <Sparkles size={18} color="#C8952A" /> Üst Kampanya Duyuru Bannerı
          </h3>

          <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
            <label style={{ position: "relative", display: "inline-block", width: "44px", height: "24px", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={settingsData.campaignBannerActive === true || settingsData.campaignBannerActive === "true"}
                onChange={(e) => setSettingsData({ ...settingsData, campaignBannerActive: e.target.checked })}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: (settingsData.campaignBannerActive === true || settingsData.campaignBannerActive === "true") ? "#16A34A" : "#CBD5E1",
                borderRadius: "24px",
                transition: "0.2s"
              }}>
                <span style={{
                  position: "absolute",
                  content: "",
                  height: "18px",
                  width: "18px",
                  left: (settingsData.campaignBannerActive === true || settingsData.campaignBannerActive === "true") ? "22px" : "3px",
                  bottom: "3px",
                  backgroundColor: "#FFFFFF",
                  borderRadius: "50%",
                  transition: "0.2s"
                }} />
              </span>
            </label>
            <span style={{ fontSize: "14px", fontWeight: "700", color: "#0F2645" }}>
              {(settingsData.campaignBannerActive === true || settingsData.campaignBannerActive === "true") ? "Kampanya Bannerı Yayında (Aktif)" : "Kampanya Bannerı Gizli (Pasif)"}
            </span>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <Input
              label="Banner Metni"
              value={settingsData.campaignBannerText || ""}
              onChange={(e) => setSettingsData({ ...settingsData, campaignBannerText: e.target.value })}
              placeholder="Örn: ✨ 2026 Sezonu: İlk Seviye Tespiti ve Tanışma Dersi Tamamen Ücretsiz! Kontenjanlar Sınırlıdır."
            />
          </div>

          {/* Banner Önizleme */}
          <div style={{ backgroundColor: "#0F2645", border: "1px solid #C8952A", borderRadius: "8px", padding: "10px 14px", color: "#F0DFA8", fontSize: "13px", fontWeight: "600", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={16} color="#C8952A" />
              Önizleme: {settingsData.campaignBannerText || "Kampanya metni buraya gelecek"}
            </span>
            <span style={{ backgroundColor: "#C8952A", color: "#0F2645", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "800" }}>
              ÜCRETSİZ BAŞVUR
            </span>
          </div>
        </div>

        {/* Card 3: İletişim Bilgileri */}
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #DDE6F0", padding: "20px", marginBottom: "20px", boxShadow: "0 4px 16px rgba(15, 38, 69, 0.04)" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0F2645", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #F1F5F9", paddingBottom: "10px" }}>
            <Mail size={18} color="#C8952A" /> İletişim & Kurumsal Bilgiler
          </h3>

          <div className="admin-grid-2col" style={{ marginBottom: "16px" }}>
            <Input
              label="Telefon Numarası"
              value={settingsData.contactPhone || ""}
              onChange={(e) => setSettingsData({ ...settingsData, contactPhone: e.target.value })}
              placeholder="+90 (212) 000 00 00"
            />

            <Input
              label="E-Posta Adresi"
              type="email"
              value={settingsData.contactEmail || ""}
              onChange={(e) => setSettingsData({ ...settingsData, contactEmail: e.target.value })}
              placeholder="info@pontakademi.com"
            />
          </div>

          <div>
            <Input
              label="Adres / Konum"
              value={settingsData.contactAddress || ""}
              onChange={(e) => setSettingsData({ ...settingsData, contactAddress: e.target.value })}
              placeholder="Beşiktaş / İstanbul"
            />
          </div>
        </div>

        {/* Bottom Submit */}
        <div style={{ textAlign: "right", marginTop: "16px" }}>
          <Button
            type="submit"
            loading={isSaving}
            variant="primary"
            size="lg"
            icon={<Save size={18} />}
          >
            Tüm Değişiklikleri Kaydet
          </Button>
        </div>
      </form>
    </div>
  );
}
