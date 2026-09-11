"use client";

import React, { useState, useEffect } from "react";
import { 
  User, 
  MapPin, 
  BookOpen, 
  CreditCard, 
  Edit3, 
  Camera, 
  Trash2, 
  Check, 
  AlertCircle,
  GraduationCap
} from "lucide-react";
import { Button, Input, Select, Modal, Avatar, TagSlider } from "@/components";
import { ISTANBUL_DISTRICTS, ALL_ISTANBUL_DISTRICTS as ALL_DISTRICTS } from "@/constants";

export default function TeacherProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    phone: "",
    school: "",
    department: "",
    yksRank: "",
    classStatus: "",
    currentDistrict: "",
    currentAddress: "",
    districts: "",
    onlineAvailable: false,
    showPhotoOnWeb: true,
    photoUrl: "",
    iban: "",
    scoreType: "SAY",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccessMsg, setEditSuccessMsg] = useState("");
  const [editErrorMsg, setEditErrorMsg] = useState("");

  // Competencies Modal State
  const [isCompModalOpen, setIsCompModalOpen] = useState(false);
  const [compScores, setCompScores] = useState<Record<string, number>>({});
  const [compSaveLoading, setCompSaveLoading] = useState(false);
  const [compSuccessMsg, setCompSuccessMsg] = useState("");
  const [compErrorMsg, setCompErrorMsg] = useState("");

  const fetchUser = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          const p = data.user.teacherProfile;
          setEditFormData({
            name: data.user.name || "",
            phone: p?.phone || "",
            school: p?.school || "",
            department: p?.department || "",
            yksRank: p?.yksRank ? String(p.yksRank) : "",
            classStatus: p?.classStatus || "",
            currentDistrict: p?.currentDistrict || "",
            currentAddress: p?.currentAddress || "",
            districts: p?.districts || "",
            onlineAvailable: p?.onlineAvailable ?? false,
            showPhotoOnWeb: p?.showPhotoOnWeb ?? true,
            photoUrl: p?.photoUrl || "",
            iban: p?.iban || "",
            scoreType: p?.scoreType || "SAY",
          });
        }
      }
    } catch (err) {
      console.error("Fetch profile error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const openCompetenciesModal = () => {
    const prof = user?.teacherProfile || {};
    setCompScores({
      tytTurkce: prof.tytTurkce ?? 5,
      tytMat: prof.tytMat ?? 5,
      tytFizik: prof.tytFizik ?? 5,
      tytKimya: prof.tytKimya ?? 5,
      tytBiyoloji: prof.tytBiyoloji ?? 5,
      tytTarih: prof.tytTarih ?? 5,
      tytCografya: prof.tytCografya ?? 5,
      aytMat: prof.aytMat ?? 5,
      aytFizik: prof.aytFizik ?? 5,
      aytKimya: prof.aytKimya ?? 5,
      aytBiyoloji: prof.aytBiyoloji ?? 5,
      aytTurkce: prof.aytTurkce ?? 5,
      aytTarih: prof.aytTarih ?? 5,
      aytCografya: prof.aytCografya ?? 5,
      ydtIngilizce: prof.ydtIngilizce ?? 5,
    });
    setCompSuccessMsg("");
    setCompErrorMsg("");
    setIsCompModalOpen(true);
  };

  const handleSaveCompetencies = async () => {
    setCompSaveLoading(true);
    setCompSuccessMsg("");
    setCompErrorMsg("");
    try {
      const res = await fetch("/api/teacher/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(compScores),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCompSuccessMsg("Ders yetkinlik puanlarınız başarıyla kaydedildi!");
        setUser((prev: any) => ({
          ...prev,
          teacherProfile: {
            ...(prev?.teacherProfile || {}),
            ...compScores,
          },
        }));
        setTimeout(() => {
          setIsCompModalOpen(false);
          setCompSuccessMsg("");
        }, 1200);
      } else {
        setCompErrorMsg(data.error || "Puanlar güncellenemedi.");
      }
    } catch (err) {
      console.error("Save competencies error:", err);
      setCompErrorMsg("Bir hata oluştu.");
    } finally {
      setCompSaveLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Lütfen sadece resim dosyası seçiniz.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Fotoğraf boyutu 5 MB'dan küçük olmalıdır.");
      return;
    }

    setIsUploadingPhoto(true);
    const data = new FormData();
    data.append("file", file);
    data.append("category", "avatars");

    try {
      const res = await fetch("/api/storage/upload", {
        method: "POST",
        body: data,
      });

      const result = await res.json();
      if (res.ok && result.success && result.url) {
        setEditFormData(prev => ({ ...prev, photoUrl: result.url }));
      } else {
        alert(result.error || "Fotoğraf yüklenemedi.");
      }
    } catch (err) {
      console.error(err);
      alert("Fotoğraf yükleme sırasında bir hata oluştu.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    setEditFormData(prev => ({ ...prev, photoUrl: "" }));
  };

  const handleDistrictToggle = (districtName: string) => {
    const currentList = editFormData.districts ? editFormData.districts.split(",").map(d => d.trim()).filter(Boolean) : [];
    let updatedList: string[];
    if (currentList.includes(districtName)) {
      updatedList = currentList.filter(d => d !== districtName);
    } else {
      updatedList = [...currentList, districtName];
    }
    setEditFormData(prev => ({ ...prev, districts: updatedList.join(", ") }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setEditErrorMsg("");
    setEditSuccessMsg("");

    try {
      const res = await fetch("/api/teacher/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setEditErrorMsg(data.error || "Profil güncellenemedi.");
        setEditLoading(false);
        return;
      }

      setEditSuccessMsg("Profiliniz başarıyla güncellendi!");
      fetchUser();
      setTimeout(() => {
        setIsEditModalOpen(false);
        setEditSuccessMsg("");
      }, 1500);
    } catch (err) {
      console.error(err);
      setEditErrorMsg("Bağlantı hatası oluştu.");
    } finally {
      setEditLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", padding: "40px", textAlign: "center", color: "#94A3B8" }}>
        Yükleniyor...
      </div>
    );
  }

  const profile = user?.teacherProfile;

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
      {/* Profile Card Header */}
      <div style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "16px",
        border: "1px solid #DDE6F0",
        padding: "28px",
        marginBottom: "24px",
        boxShadow: "0 4px 20px rgba(15, 38, 69, 0.04)",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {profile?.photoUrl ? (
            <img 
              src={profile.photoUrl} 
              alt={user?.name} 
              style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", border: "3px solid #C8952A" }}
            />
          ) : (
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#0F2645", color: "#C8952A", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "32px", border: "3px solid #C8952A" }}>
              {user?.name?.charAt(0) || "Ö"}
            </div>
          )}

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0F2645", margin: "0 0 4px 0" }}>
              {user?.name}
            </h2>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ backgroundColor: "#EFF6FF", color: "#1D4ED8", padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", border: "1px solid #BFDBFE" }}>
                {profile?.school ? (profile?.department ? `${profile.school} • ${profile.department}` : profile.school) : "Üniversite Belirtilmedi"}
              </span>
              {profile?.yksRank && (
                <span style={{ backgroundColor: "#FEF3C7", color: "#92400E", padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", border: "1px solid #FCD34D" }}>
                  🏆 YKS {profile.scoreType || "SAY"} {profile.yksRank}.
                </span>
              )}
              {profile?.showPhotoOnWeb !== false ? (
                <span style={{ backgroundColor: "#ECFDF5", color: "#047857", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", border: "1px solid #A7F3D0" }}>
                  👁️ Sitede Fotoğraf Görünüyor
                </span>
              ) : (
                <span style={{ backgroundColor: "#F1F5F9", color: "#475569", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", border: "1px solid #CBD5E1" }}>
                  🙈 Sitede Fotoğraf Gizli
                </span>
              )}
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          icon={<Edit3 size={16} />}
          onClick={() => { setEditSuccessMsg(""); setEditErrorMsg(""); setIsEditModalOpen(true); }}
        >
          Profili Düzenle
        </Button>
      </div>

      {/* Profile Details Grid */}
      <div className="admin-grid-2col" style={{ marginBottom: "24px" }}>
        {/* Card 1: Akademik & Ders Bilgileri */}
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1px solid #DDE6F0", padding: "20px", boxShadow: "0 4px 16px rgba(15, 38, 69, 0.04)" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0F2645", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #F1F5F9", paddingBottom: "10px" }}>
            <BookOpen size={18} color="#C8952A" /> Akademik & Ders Tercihleri
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
            <div>
              <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", display: "block" }}>Okul / Üniversite</span>
              <strong style={{ color: "#0F2645" }}>{profile?.school || "Belirtilmedi"}</strong>
            </div>
            <div>
              <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", display: "block" }}>Bölüm</span>
              <strong style={{ color: "#0F2645" }}>{profile?.department || "Belirtilmedi"}</strong>
            </div>
            <div>
              <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", display: "block" }}>Sınıf Durumu</span>
              <strong style={{ color: "#0F2645" }}>{profile?.classStatus || "Belirtilmedi"}</strong>
            </div>
            <div>
              <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", display: "block" }}>YKS Derecesi & Puan Türü</span>
              <strong style={{ color: "#C8952A" }}>{profile?.scoreType || "SAY"} &bull; {profile?.yksRank ? `${profile.yksRank}. Sıralama` : "Belirtilmedi"}</strong>
            </div>
            <div>
              <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", display: "block" }}>Web Sitesinde Fotoğraf Görünürlüğü</span>
              <strong style={{ color: profile?.showPhotoOnWeb !== false ? "#16A34A" : "#D97706" }}>
                {profile?.showPhotoOnWeb !== false ? "✅ Ön yüzde fotoğraf açık" : "🔒 Ön yüzde fotoğraf gizli (monogram gösterilir)"}
              </strong>
            </div>
            <div>
              <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", display: "block" }}>Online Ders Durumu</span>
              <span style={{ color: "#0F2645", fontWeight: "600" }}>{profile?.onlineAvailable ? "✅ Online Ders Verebilir" : "❌ Sadece Yüz Yüze"}</span>
            </div>
          </div>
        </div>

        {/* Card 2: İletişim & Konum Bilgileri */}
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1px solid #DDE6F0", padding: "20px", boxShadow: "0 4px 16px rgba(15, 38, 69, 0.04)" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0F2645", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #F1F5F9", paddingBottom: "10px" }}>
            <MapPin size={18} color="#C8952A" /> İletişim & Konum
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
            <div>
              <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", display: "block" }}>E-Posta</span>
              <strong style={{ color: "#0F2645" }}>{user?.email}</strong>
            </div>
            <div>
              <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", display: "block" }}>Telefon</span>
              <strong style={{ color: "#0F2645" }}>{profile?.phone || "Belirtilmedi"}</strong>
            </div>
            <div>
              <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", display: "block" }}>İkamet Edilen İlçe</span>
              <strong style={{ color: "#0F2645" }}>{profile?.currentDistrict || "İstanbul"}</strong>
            </div>
            <div>
              <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", display: "block" }}>Açık Adres / Mahalle</span>
              <strong style={{ color: "#0F2645" }}>{profile?.currentAddress || "Belirtilmedi"}</strong>
            </div>
            <div>
              <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", display: "block" }}>Ödeme IBAN</span>
              <strong style={{ color: "#0F2645", fontFamily: "monospace" }}>{profile?.iban || "Belirtilmedi"}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Ders Verilebilen İlçeler */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1px solid #DDE6F0", padding: "20px", marginBottom: "24px", boxShadow: "0 4px 16px rgba(15, 38, 69, 0.04)" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0F2645", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
          <MapPin size={18} color="#C8952A" /> Yüz Yüze Ders Verilebilen İlçeler
        </h3>
        <p style={{ fontSize: "13px", color: "#64748B", margin: "0 0 14px 0" }}>
          Özel ders ve yüz yüze koçluk görüşmelerinde ders verebileceğiniz ilçeler
        </p>

        <TagSlider
          items={profile?.districts}
          variant="blue"
          icon="map"
          itemCountLabel="Hizmet Bölgesi"
          emptyText="Henüz ilçe seçilmedi (Tüm İstanbul / Online)."
          maxWidth="100%"
        />
      </div>

      {/* Card 4: Ders Yetkinlik Puanlarım (1 - 10) */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1px solid #DDE6F0", padding: "20px", marginBottom: "24px", boxShadow: "0 4px 16px rgba(15, 38, 69, 0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px", borderBottom: "1px solid #F1F5F9", paddingBottom: "12px" }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0F2645", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <GraduationCap size={20} color="#C8952A" /> Ders Bilgisi & Yetkinlik Puanlarım (1 - 10)
            </h3>
            <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" }}>
              Öğrenci eşleştirmelerinde dikkate alınan branş bazlı yetkinlik değerlendirmeleriniz
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={openCompetenciesModal}
            leftIcon={<Edit3 size={14} />}
          >
            Puanlarımı Düzenle
          </Button>
        </div>

        {/* TYT & AYT Preview Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
          {/* TYT Puanları */}
          <div style={{ backgroundColor: "#F8FAFC", padding: "16px", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
            <div style={{ fontSize: "13px", fontWeight: "800", color: "#0F2645", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "6px" }}>
              📘 TYT Branşları
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { label: "TYT Türkçe", val: profile?.tytTurkce ?? 5 },
                { label: "TYT Temel Matematik", val: profile?.tytMat ?? 5 },
                { label: "TYT Fizik", val: profile?.tytFizik ?? 5 },
                { label: "TYT Kimya", val: profile?.tytKimya ?? 5 },
                { label: "TYT Biyoloji", val: profile?.tytBiyoloji ?? 5 },
                { label: "TYT Tarih", val: profile?.tytTarih ?? 5 },
                { label: "TYT Coğrafya", val: profile?.tytCografya ?? 5 },
              ].map((item, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", padding: "4px 0", borderBottom: idx < 6 ? "1px dashed #E2E8F0" : "none" }}>
                  <span style={{ color: "#334155", fontWeight: "600" }}>{item.label}</span>
                  <span style={{ 
                    fontWeight: "800", 
                    color: item.val >= 8 ? "#16A34A" : item.val >= 5 ? "#D97706" : "#DC2626",
                    backgroundColor: item.val >= 8 ? "#DCFCE7" : item.val >= 5 ? "#FEF3C7" : "#FEE2E2",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontSize: "12px"
                  }}>
                    {item.val} / 10
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AYT & YDT Puanları */}
          <div style={{ backgroundColor: "#F8FAFC", padding: "16px", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
            <div style={{ fontSize: "13px", fontWeight: "800", color: "#7E22CE", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "6px" }}>
              📙 AYT & YDT Branşları
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { label: "AYT Matematik", val: profile?.aytMat ?? 5 },
                { label: "AYT Fizik", val: profile?.aytFizik ?? 5 },
                { label: "AYT Kimya", val: profile?.aytKimya ?? 5 },
                { label: "AYT Biyoloji", val: profile?.aytBiyoloji ?? 5 },
                { label: "AYT Edebiyat", val: profile?.aytTurkce ?? 5 },
                { label: "AYT Tarih", val: profile?.aytTarih ?? 5 },
                { label: "AYT Coğrafya", val: profile?.aytCografya ?? 5 },
                { label: "YDT İngilizce", val: profile?.ydtIngilizce ?? 5 },
              ].map((item, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", padding: "4px 0", borderBottom: idx < 7 ? "1px dashed #E2E8F0" : "none" }}>
                  <span style={{ color: "#334155", fontWeight: "600" }}>{item.label}</span>
                  <span style={{ 
                    fontWeight: "800", 
                    color: item.val >= 8 ? "#16A34A" : item.val >= 5 ? "#D97706" : "#DC2626",
                    backgroundColor: item.val >= 8 ? "#DCFCE7" : item.val >= 5 ? "#FEF3C7" : "#FEE2E2",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontSize: "12px"
                  }}>
                    {item.val} / 10
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Eğitmen Profilini Düzenle"
        titleIcon={<Edit3 size={20} color="#C8952A" />}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              İptal
            </Button>
            <Button
              variant="primary"
              onClick={(e) => handleEditSubmit(e as any)}
              loading={editLoading}
            >
              Kaydet
            </Button>
          </>
        }
      >
        <div>
          {editSuccessMsg && (
            <div style={{ backgroundColor: "#DCFCE7", border: "1px solid #86EFAC", color: "#15803D", padding: "14px", borderRadius: "8px", fontSize: "14px", fontWeight: "700", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Check size={18} /> {editSuccessMsg}
            </div>
          )}

          {editErrorMsg && (
            <div style={{ backgroundColor: "#FEE2E2", border: "1px solid #FCA5A5", color: "#B91C1C", padding: "14px", borderRadius: "8px", fontSize: "14px", fontWeight: "700", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertCircle size={18} /> {editErrorMsg}
            </div>
          )}

          <form onSubmit={handleEditSubmit}>
            {/* Photo Upload Section */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px", marginBottom: "20px", padding: "16px", backgroundColor: "#F8FAFC", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
              {editFormData.photoUrl ? (
                <img src={editFormData.photoUrl} alt="Avatar" style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", border: "2px solid #C8952A" }} />
              ) : (
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#0F2645", color: "#C8952A", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "24px" }}>
                  {editFormData.name?.charAt(0) || "Ö"}
                </div>
              )}

              <div style={{ flex: "1 1 200px" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                  <label style={{
                    backgroundColor: "#0F2645",
                    color: "#FFFFFF",
                    padding: "6px 14px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    <Camera size={14} /> {isUploadingPhoto ? "Yükleniyor..." : "Fotoğraf Yükle"}
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: "none" }} disabled={isUploadingPhoto} />
                  </label>
                  {editFormData.photoUrl && (
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      icon={<Trash2 size={13} />}
                      onClick={handleRemovePhoto}
                    >
                      Kaldır
                    </Button>
                  )}
                </div>
                <span style={{ fontSize: "11px", color: "#64748B", marginTop: "4px", display: "block" }}>
                  Maksimum 5 MB, JPG veya PNG formatında.
                </span>
              </div>
            </div>

            {/* Grid 1: Temel Bilgiler */}
            <div className="admin-grid-2col" style={{ marginBottom: "16px" }}>
              <Input
                label="Ad Soyad"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                required
              />
              <Input
                label="Telefon"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                required
              />
            </div>

            {/* Grid 2: Okul, Bölüm & Derece */}
            <div className="admin-grid-2col" style={{ marginBottom: "16px" }}>
              <Input
                label="Okul / Üniversite"
                value={editFormData.school}
                onChange={(e) => setEditFormData({ ...editFormData, school: e.target.value })}
                placeholder="Örn: Boğaziçi Üniversitesi / ODTÜ"
                required
              />
              <Input
                label="Okuduğunuz / Mezun Olduğunuz Bölüm"
                value={editFormData.department}
                onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                placeholder="Örn: Bilgisayar Mühendisliği"
              />
            </div>

            {/* Grid 2.5: Sınıf & Sıralama */}
            <div className="admin-grid-2col" style={{ marginBottom: "16px" }}>
              <Select
                label="Sınıf / Mezuniyet Durumu"
                value={editFormData.classStatus}
                onChange={(e) => setEditFormData({ ...editFormData, classStatus: e.target.value })}
                options={[
                  { value: "", label: "Seçiniz" },
                  { value: "Hazırlık", label: "Hazırlık Sınıfı" },
                  { value: "1. Sınıf", label: "1. Sınıf" },
                  { value: "2. Sınıf", label: "2. Sınıf" },
                  { value: "3. Sınıf", label: "3. Sınıf" },
                  { value: "4. Sınıf", label: "4. Sınıf" },
                  { value: "Yüksek Lisans / Doktora", label: "Yüksek Lisans / Doktora" },
                  { value: "Mezun", label: "Mezun" },
                ]}
              />
              <Input
                label="YKS Sıralaması"
                value={editFormData.yksRank}
                onChange={(e) => setEditFormData({ ...editFormData, yksRank: e.target.value })}
                placeholder="Örn: 245"
              />
            </div>

            {/* Grid 3: İlçe & IBAN */}
            <div className="admin-grid-2col" style={{ marginBottom: "16px" }}>
              <Select
                label="İkamet Edilen İlçe"
                value={editFormData.currentDistrict}
                onChange={(e) => setEditFormData({ ...editFormData, currentDistrict: e.target.value })}
                options={[
                  { value: "", label: "İlçe Seçiniz" },
                  ...ALL_DISTRICTS.map(d => ({ value: d, label: d }))
                ]}
              />
              <Input
                label="Ödeme IBAN"
                value={editFormData.iban}
                onChange={(e) => setEditFormData({ ...editFormData, iban: e.target.value })}
                placeholder="TR..."
              />
            </div>

            {/* Açık Adres */}
            <div style={{ marginBottom: "16px" }}>
              <Input
                label="Açık Adres / Mahalle / Semt"
                value={editFormData.currentAddress}
                onChange={(e) => setEditFormData({ ...editFormData, currentAddress: e.target.value })}
                placeholder="Örn: Fenerbahçe Mah. Bağdat Cad. No: 44 Kadıköy"
              />
            </div>

            {/* Web Sitesinde Fotoğraf Görünürlüğü Toggle Switch (Önemli Özellik) */}
            <div style={{ 
              marginBottom: "16px", 
              padding: "14px 16px", 
              backgroundColor: editFormData.showPhotoOnWeb ? "#F0FDF4" : "#F8FAFC", 
              borderRadius: "10px", 
              border: editFormData.showPhotoOnWeb ? "1.5px solid #86EFAC" : "1.5px solid #CBD5E1",
              transition: "all 0.2s ease"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#0F2645", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>{editFormData.showPhotoOnWeb ? "👁️" : "🙈"}</span> Profil Fotoğrafımı Web Sitesinde Göster
                  </div>
                  <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748B", lineHeight: "1.4" }}>
                    {editFormData.showPhotoOnWeb 
                      ? "Fotoğrafınız ana sayfadaki 'Uzman Kadromuz' bölümünde ziyaretçilere açık olarak sergilenir." 
                      : "Fotoğrafınız web sitesinde gizlenir, ziyaretçilere sadece adınızın baş harfleri ve şık avatar rozeti gösterilir (Adminler fotoğrafınızı görebilir)."}
                  </p>
                </div>
                <label style={{ position: "relative", display: "inline-block", width: "48px", height: "26px", flexShrink: 0, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={editFormData.showPhotoOnWeb}
                    onChange={(e) => setEditFormData({ ...editFormData, showPhotoOnWeb: e.target.checked })}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: "absolute",
                    cursor: "pointer",
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: editFormData.showPhotoOnWeb ? "#16A34A" : "#CBD5E1",
                    transition: "0.2s",
                    borderRadius: "26px",
                  }}>
                    <span style={{
                      position: "absolute",
                      height: "20px",
                      width: "20px",
                      left: editFormData.showPhotoOnWeb ? "24px" : "3px",
                      bottom: "3px",
                      backgroundColor: "white",
                      transition: "0.2s",
                      borderRadius: "50%",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                    }} />
                  </span>
                </label>
              </div>
            </div>

            {/* Online Available Toggle */}
            <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                id="onlineAvailable"
                checked={editFormData.onlineAvailable}
                onChange={(e) => setEditFormData({ ...editFormData, onlineAvailable: e.target.checked })}
                style={{ width: "16px", height: "16px", cursor: "pointer" }}
              />
              <label htmlFor="onlineAvailable" style={{ fontSize: "13px", fontWeight: "600", color: "#0F2645", cursor: "pointer" }}>
                Online (Zoom/Meet üzerinden) ders ve koçluk verebilirim.
              </label>
            </div>

            {/* Districts Picker */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                Ders Verebileceğiniz İlçeler
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", maxHeight: "150px", overflowY: "auto", padding: "10px", backgroundColor: "#F8FAFC", borderRadius: "8px", border: "1px solid #CBD5E1" }}>
                {ALL_DISTRICTS.map((d) => {
                  const selected = editFormData.districts?.includes(d);
                  return (
                    <button
                      type="button"
                      key={d}
                      onClick={() => handleDistrictToggle(d)}
                      style={{
                        padding: "4px 10px",
                        borderRadius: "14px",
                        fontSize: "12px",
                        fontWeight: "600",
                        backgroundColor: selected ? "#0F2645" : "#FFFFFF",
                        color: selected ? "#FFFFFF" : "#475569",
                        border: selected ? "1px solid #0F2645" : "1px solid #CBD5E1",
                        cursor: "pointer"
                      }}
                    >
                      {selected ? `✓ ${d}` : d}
                    </button>
                  );
                })}
              </div>
            </div>
          </form>
        </div>
      </Modal>

      {/* Competencies Edit Modal */}
      <Modal
        isOpen={isCompModalOpen}
        onClose={() => setIsCompModalOpen(false)}
        title="Ders Yetkinlik Puanlarımı Düzenle"
        titleIcon={<GraduationCap size={20} color="#C8952A" />}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsCompModalOpen(false)}>
              İptal
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveCompetencies}
              loading={compSaveLoading}
            >
              💾 Puanları Kaydet
            </Button>
          </>
        }
      >
        <div>
          {compSuccessMsg && (
            <div style={{ backgroundColor: "#DCFCE7", border: "1px solid #86EFAC", color: "#15803D", padding: "14px", borderRadius: "8px", fontSize: "14px", fontWeight: "700", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Check size={18} /> {compSuccessMsg}
            </div>
          )}

          {compErrorMsg && (
            <div style={{ backgroundColor: "#FEE2E2", border: "1px solid #FCA5A5", color: "#B91C1C", padding: "14px", borderRadius: "8px", fontSize: "14px", fontWeight: "700", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertCircle size={18} /> {compErrorMsg}
            </div>
          )}

          <p style={{ fontSize: "13px", color: "#64748B", margin: "0 0 16px 0" }}>
            Öğretmenliğini ve koçluğunu yapabileceğiniz derslerdeki kendinize ait yetkinlik puanlarını (1 - 10) aşağıdaki sürgülerle belirleyebilirsiniz.
          </p>

          {/* TYT Section */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "12px", fontWeight: "800", color: "#0F2645", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              📘 TYT Branş Puanları
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
              {[
                { key: "tytTurkce", label: "TYT Türkçe" },
                { key: "tytMat", label: "TYT Matematik" },
                { key: "tytFizik", label: "TYT Fizik" },
                { key: "tytKimya", label: "TYT Kimya" },
                { key: "tytBiyoloji", label: "TYT Biyoloji" },
                { key: "tytTarih", label: "TYT Tarih" },
                { key: "tytCografya", label: "TYT Coğrafya" },
              ].map((sub) => {
                const score = compScores[sub.key] ?? 5;
                return (
                  <div key={sub.key} style={{ backgroundColor: "#F8FAFC", padding: "10px 12px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{ fontSize: "12px", fontWeight: "700", color: "#0F2645" }}>{sub.label}</span>
                      <span style={{ fontSize: "12px", fontWeight: "800", color: score >= 8 ? "#16A34A" : score >= 5 ? "#D97706" : "#DC2626" }}>
                        {score} / 10
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={score}
                      onChange={(e) => setCompScores({ ...compScores, [sub.key]: Number(e.target.value) })}
                      style={{ width: "100%", accentColor: "#0F2645", cursor: "pointer" }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* AYT Section */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "12px", fontWeight: "800", color: "#7E22CE", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              📙 AYT & YDT Branş Puanları
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
              {[
                { key: "aytMat", label: "AYT Matematik" },
                { key: "aytFizik", label: "AYT Fizik" },
                { key: "aytKimya", label: "AYT Kimya" },
                { key: "aytBiyoloji", label: "AYT Biyoloji" },
                { key: "aytTurkce", label: "AYT Edebiyat" },
                { key: "aytTarih", label: "AYT Tarih" },
                { key: "aytCografya", label: "AYT Coğrafya" },
                { key: "ydtIngilizce", label: "YDT İngilizce" },
              ].map((sub) => {
                const score = compScores[sub.key] ?? 5;
                return (
                  <div key={sub.key} style={{ backgroundColor: "#F8FAFC", padding: "10px 12px", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{ fontSize: "12px", fontWeight: "700", color: "#0F2645" }}>{sub.label}</span>
                      <span style={{ fontSize: "12px", fontWeight: "800", color: score >= 8 ? "#16A34A" : score >= 5 ? "#D97706" : "#DC2626" }}>
                        {score} / 10
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={score}
                      onChange={(e) => setCompScores({ ...compScores, [sub.key]: Number(e.target.value) })}
                      style={{ width: "100%", accentColor: "#7E22CE", cursor: "pointer" }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
