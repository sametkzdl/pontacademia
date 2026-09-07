"use client";

import React, { useState, useEffect } from "react";
import { 
  User, 
  Target, 
  MapPin, 
  BookOpen, 
  Phone, 
  Mail, 
  Edit3, 
  Camera, 
  Trash2, 
  Check, 
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Sparkles,
  GraduationCap
} from "lucide-react";
import { Button, Input, Select, Modal, Avatar } from "@/components";
import { ISTANBUL_DISTRICTS, ALL_ISTANBUL_DISTRICTS as ALL_DISTRICTS } from "@/constants";

const ALL_AVAILABLE_SUBJECTS = [
  // TYT
  { id: "tytMat", label: "TYT Matematik", category: "TYT" },
  { id: "tytTurkce", label: "TYT Türkçe", category: "TYT" },
  { id: "tytFizik", label: "TYT Fizik", category: "TYT" },
  { id: "tytKimya", label: "TYT Kimya", category: "TYT" },
  { id: "tytBiyoloji", label: "TYT Biyoloji", category: "TYT" },
  { id: "tytTarih", label: "TYT Tarih", category: "TYT" },
  { id: "tytCografya", label: "TYT Coğrafya", category: "TYT" },
  { id: "tytFelsefe", label: "TYT Felsefe", category: "TYT" },
  // AYT
  { id: "aytMat", label: "AYT Matematik & Geometri", category: "AYT" },
  { id: "aytFizik", label: "AYT Fizik", category: "AYT" },
  { id: "aytKimya", label: "AYT Kimya", category: "AYT" },
  { id: "aytBiyoloji", label: "AYT Biyoloji", category: "AYT" },
  { id: "aytTurkce", label: "AYT Edebiyat / Türkçe", category: "AYT" },
  { id: "aytTarih", label: "AYT Tarih", category: "AYT" },
  { id: "aytCografya", label: "AYT Coğrafya", category: "AYT" },
  { id: "ydtIngilizce", label: "YDT İngilizce (Dil)", category: "DİL" },
  // ORTAOKUL & LGS
  { id: "lgsMat", label: "LGS / Ortaokul Matematik", category: "ORTAOKUL" },
  { id: "lgsFen", label: "LGS / Ortaokul Fen Bilimleri", category: "ORTAOKUL" },
  { id: "lgsTurkce", label: "LGS / Ortaokul Türkçe", category: "ORTAOKUL" },
  { id: "lgsInkilap", label: "LGS T.C. İnkılap Tarihi", category: "ORTAOKUL" },
  { id: "lgsDin", label: "LGS Din Kültürü ve Ahlak Bil.", category: "ORTAOKUL" },
  { id: "lgsIngilizce", label: "LGS / Ortaokul İngilizce", category: "ORTAOKUL" },
  { id: "ortaokulGenel", label: "Ortaokul Tüm Dersler / Takip", category: "ORTAOKUL" },
  // KOÇLUK
  { id: "yksKocluk", label: "YKS Koçluğu", category: "KOÇLUK" },
  { id: "lgsKocluk", label: "LGS Koçluğu", category: "KOÇLUK" },
  { id: "araSinifKocluk", label: "Ara Sınıf Koçluğu", category: "KOÇLUK" },
];

export default function StudentProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    phone: "",
    city: "",
    currentDistrict: "",
    currentAddress: "",
    grade: "",
    target: "",
    photoUrl: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccessMsg, setEditSuccessMsg] = useState("");
  const [editErrorMsg, setEditErrorMsg] = useState("");

  // Subject Management Modal State
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [tempSubjects, setTempSubjects] = useState<string[]>([]);
  const [subjectSaveLoading, setSubjectSaveLoading] = useState(false);
  const [subjectSuccessMsg, setSubjectSuccessMsg] = useState("");
  const [subjectErrorMsg, setSubjectErrorMsg] = useState("");
  const [cardSubjectError, setCardSubjectError] = useState("");
  const [cardSubjectSuccess, setCardSubjectSuccess] = useState("");

  const fetchUser = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          const p = data.user.studentProfile;
          setEditFormData({
            name: data.user.name || "",
            phone: p?.phone || "",
            city: p?.city || p?.currentDistrict || "İstanbul",
            currentDistrict: p?.currentDistrict || p?.city || "",
            currentAddress: p?.currentAddress || "",
            grade: p?.grade || "",
            target: p?.target || p?.subject || "",
            photoUrl: p?.photoUrl || "",
          });
        }
      }
    } catch (err) {
      console.error("Fetch student profile error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitialSubjects = (): string[] => {
    const p = user?.studentProfile;
    const raw = p?.selectedSubjects || p?.subject || "";
    if (!raw || !raw.trim()) return [];
    return raw.split(",").map((s: string) => s.trim()).filter(Boolean);
  };

  const openSubjectModal = () => {
    setTempSubjects(getInitialSubjects());
    setSubjectSuccessMsg("");
    setSubjectErrorMsg("");
    setCardSubjectError("");
    setCardSubjectSuccess("");
    setIsSubjectModalOpen(true);
  };

  const handleToggleSubject = (subjectLabel: string) => {
    setTempSubjects(prev => 
      prev.includes(subjectLabel)
        ? prev.filter(s => s !== subjectLabel)
        : [...prev, subjectLabel]
    );
  };

  const handleSaveSubjects = async () => {
    setSubjectSaveLoading(true);
    setSubjectSuccessMsg("");
    setSubjectErrorMsg("");
    try {
      const formatted = tempSubjects.join(", ");
      const res = await fetch("/api/student/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedSubjects: formatted,
          subject: formatted,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubjectSuccessMsg("Almak istediğiniz dersler başarıyla güncellendi!");
        setUser((prev: any) => ({
          ...prev,
          studentProfile: {
            ...(prev?.studentProfile || {}),
            selectedSubjects: formatted,
            subject: formatted,
          },
        }));
        setTimeout(() => {
          setIsSubjectModalOpen(false);
          setSubjectSuccessMsg("");
        }, 1200);
      } else {
        setSubjectErrorMsg(data.error || "Dersler güncellenemedi.");
      }
    } catch (err) {
      console.error("Save subjects error:", err);
      setSubjectErrorMsg("Bir hata oluştu.");
    } finally {
      setSubjectSaveLoading(false);
    }
  };

  const handleRemoveSubjectDirectly = async (subjectToRemove: string) => {
    setCardSubjectError("");
    setCardSubjectSuccess("");
    const current = getInitialSubjects();
    const next = current.filter(s => s !== subjectToRemove);
    const formatted = next.join(", ");
    try {
      const res = await fetch("/api/student/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedSubjects: formatted,
          subject: formatted,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCardSubjectSuccess(`"${subjectToRemove}" ders talebi profilinizden kaldırıldı.`);
        setUser((prev: any) => ({
          ...prev,
          studentProfile: {
            ...(prev?.studentProfile || {}),
            selectedSubjects: formatted,
            subject: formatted,
          },
        }));
        setTimeout(() => setCardSubjectSuccess(""), 3500);
      } else {
        setCardSubjectError(data.error || `"${subjectToRemove}" dersi kaldırılamadı.`);
      }
    } catch (err) {
      console.error("Direct remove subject error:", err);
      setCardSubjectError("Bağlantı hatası oluştu.");
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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setEditErrorMsg("");
    setEditSuccessMsg("");

    try {
      const res = await fetch("/api/student/profile", {
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

  const profile = user?.studentProfile;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
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
          <Avatar 
            src={profile?.photoUrl} 
            name={user?.name} 
            size={80} 
            showBorder 
            style={{ boxShadow: "0 4px 12px rgba(15, 38, 69, 0.15)", border: "3px solid #C8952A" }}
          />

          <div>
            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#0F2645", margin: "0 0 4px 0" }}>
              {user?.name}
            </h2>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ backgroundColor: "#EFF6FF", color: "#1D4ED8", padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", border: "1px solid #BFDBFE" }}>
                {profile?.grade || "Sınıf Belirtilmedi"}
              </span>
              <span style={{ backgroundColor: "#FEF3C7", color: "#92400E", padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", border: "1px solid #FCD34D" }}>
                📍 {profile?.city || "İstanbul"}
              </span>
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

      {/* Profile Details Cards */}
      <div className="admin-grid-2col" style={{ marginBottom: "24px" }}>
        {/* Card 1: Hedef & Akademik Durum */}
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1px solid #DDE6F0", padding: "20px", boxShadow: "0 4px 16px rgba(15, 38, 69, 0.04)" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0F2645", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #F1F5F9", paddingBottom: "10px" }}>
            <Target size={18} color="#C8952A" /> Hedef & Sınıf Bilgisi
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
            <div>
              <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", display: "block" }}>Sınıf / Seviye</span>
              <strong style={{ color: "#0F2645" }}>{profile?.grade || "Belirtilmedi"}</strong>
            </div>
            <div>
              <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", display: "block" }}>Hedeflenen Bölüm / Üniversite</span>
              <strong style={{ color: "#C8952A" }}>{profile?.target || "Belirtilmedi"}</strong>
            </div>
          </div>
        </div>

        {/* Card 2: İletişim & Konum Bilgileri */}
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1px solid #DDE6F0", padding: "20px", boxShadow: "0 4px 16px rgba(15, 38, 69, 0.04)" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0F2645", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", borderBottom: "1px solid #F1F5F9", paddingBottom: "10px" }}>
            <Phone size={18} color="#C8952A" /> İletişim & Konum Bilgileri
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
              <strong style={{ color: "#0F2645" }}>{profile?.currentDistrict || profile?.city || "İstanbul"}</strong>
            </div>
            <div>
              <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", display: "block" }}>Açık Adres / Mahalle</span>
              <strong style={{ color: "#0F2645" }}>{profile?.currentAddress || "Belirtilmedi"}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Almak İstediğim Dersler & Destek Taleplerim */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1px solid #DDE6F0", padding: "24px", marginBottom: "24px", boxShadow: "0 4px 16px rgba(15, 38, 69, 0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px", borderBottom: "1px solid #F1F5F9", paddingBottom: "12px" }}>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0F2645", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <BookOpen size={20} color="#C8952A" /> Almak İstediğim Dersler & Destek Taleplerim
            </h3>
            <p style={{ fontSize: "13px", color: "#64748B", margin: "4px 0 0 0" }}>
              Özel ders veya koçluk desteği almak istediğiniz branşları ekleyip çıkarabilirsiniz
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={openSubjectModal}
            leftIcon={<Plus size={14} />}
          >
            Ders Ekle / Düzenle
          </Button>
        </div>

        {/* Feedback Banners for Direct Removal */}
        {cardSubjectError && (
          <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #FCA5A5", color: "#B91C1C", padding: "12px 16px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px", lineHeight: "1.4" }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{cardSubjectError}</span>
          </div>
        )}

        {cardSubjectSuccess && (
          <div style={{ backgroundColor: "#DCFCE7", border: "1px solid #86EFAC", color: "#15803D", padding: "12px 16px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px" }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{cardSubjectSuccess}</span>
          </div>
        )}

        {/* Selected Subjects Badges */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          {getInitialSubjects().length > 0 ? (
            getInitialSubjects().map((sub, idx) => (
              <span
                key={idx}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  backgroundColor: "#F0F5FB",
                  color: "#0F2645",
                  border: "1px solid #CBD5E1",
                  fontSize: "13px",
                  fontWeight: "700",
                  boxShadow: "0 1px 3px rgba(15, 38, 69, 0.05)"
                }}
              >
                <span>📘 {sub}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSubjectDirectly(sub)}
                  title={`"${sub}" dersini kaldır`}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "2px",
                    display: "flex",
                    alignItems: "center",
                    color: "#94A3B8",
                    borderRadius: "50%",
                    transition: "color 0.15s ease"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#DC2626")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#94A3B8")}
                >
                  <X size={14} />
                </button>
              </span>
            ))
          ) : (
            <div style={{ padding: "20px 0", color: "#94A3B8", fontSize: "14px", textAlign: "center", width: "100%" }}>
              Henüz destek almak istediğiniz bir ders eklemediniz. <strong>&ldquo;Ders Ekle / Düzenle&rdquo;</strong> butonuna tıklayarak istediğiniz branşları ekleyebilirsiniz.
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Öğrenci Profilini Düzenle"
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

            {/* Form inputs */}
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

            <div className="admin-grid-2col" style={{ marginBottom: "16px" }}>
              <Select
                label="İlçe (İstanbul)"
                value={editFormData.currentDistrict}
                onChange={(e) => {
                  const dist = e.target.value;
                  setEditFormData({ 
                    ...editFormData, 
                    currentDistrict: dist,
                    city: dist ? `İstanbul / ${dist}` : "İstanbul"
                  });
                }}
                options={[
                  { value: "", label: "İlçe Seçiniz" },
                  ...ALL_DISTRICTS.map((d) => ({ value: d, label: d })),
                ]}
              />
              <Input
                label="Sınıf / Seviye"
                value={editFormData.grade}
                onChange={(e) => setEditFormData({ ...editFormData, grade: e.target.value })}
                placeholder="Örn: 12. Sınıf / Mezun / 8. Sınıf"
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <Input
                label="Açık Adres / Mahalle / Semt (Ev / Görüşme Adresi)"
                value={editFormData.currentAddress}
                onChange={(e) => setEditFormData({ ...editFormData, currentAddress: e.target.value })}
                placeholder="Örn: Caferağa Mah. Moda Cad. No: 12 D: 4, Kadıköy / İstanbul"
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <Input
                label="Hedeflenen Bölüm / Üniversite"
                value={editFormData.target}
                onChange={(e) => setEditFormData({ ...editFormData, target: e.target.value })}
                placeholder="Örn: Boğaziçi Bilgisayar Müh. / Cerrahpaşa Tıp"
              />
            </div>
          </form>
        </div>
      </Modal>

      {/* Subject Selection Modal */}
      <Modal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        title="Almak İstediğiniz Dersleri Düzenleyin"
        titleIcon={<BookOpen size={20} color="#C8952A" />}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsSubjectModalOpen(false)}>
              İptal
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveSubjects}
              loading={subjectSaveLoading}
            >
              💾 Ders Listesini Kaydet
            </Button>
          </>
        }
      >
        <div>
          {subjectSuccessMsg && (
            <div style={{ backgroundColor: "#DCFCE7", border: "1px solid #86EFAC", color: "#15803D", padding: "14px", borderRadius: "8px", fontSize: "14px", fontWeight: "700", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Check size={18} /> {subjectSuccessMsg}
            </div>
          )}

          {subjectErrorMsg && (
            <div style={{ backgroundColor: "#FEE2E2", border: "1px solid #FCA5A5", color: "#B91C1C", padding: "14px", borderRadius: "8px", fontSize: "14px", fontWeight: "700", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertCircle size={18} /> {subjectErrorMsg}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
            <span style={{ fontSize: "13px", color: "#64748B" }}>
              Özel ders veya koçluk talep ettiğiniz branşları tıklayarak seçebilir veya kaldırabilirsiniz:
            </span>
            <span style={{ fontSize: "12px", fontWeight: "800", color: "#0F2645", backgroundColor: "#FEF3C7", padding: "4px 10px", borderRadius: "12px", border: "1px solid #FCD34D" }}>
              Seçili: {tempSubjects.length} Ders
            </span>
          </div>

          {/* Categorized Subject Grid */}
          <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxHeight: "420px", overflowY: "auto", paddingRight: "4px" }}>
            {[
              { cat: "TYT", title: "📘 TYT Dersleri", color: "#0F2645" },
              { cat: "AYT", title: "📙 AYT & Alan Dersleri", color: "#7E22CE" },
              { cat: "DİL", title: "🌍 Yabancı Dil", color: "#0284C7" },
              { cat: "ORTAOKUL", title: "📗 Ortaokul & LGS Dersleri", color: "#16A34A" },
              { cat: "KOÇLUK", title: "✨ Rehberlik & Koçluk", color: "#C8952A" },
            ].map((section) => {
              const items = ALL_AVAILABLE_SUBJECTS.filter(s => s.category === section.cat);
              if (items.length === 0) return null;
              return (
                <div key={section.cat} style={{ backgroundColor: "#F8FAFC", padding: "14px", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                  <div style={{ fontSize: "12px", fontWeight: "800", color: section.color, marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {section.title}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {items.map((sub) => {
                      const isSelected = tempSubjects.includes(sub.label);
                      return (
                        <button
                          type="button"
                          key={sub.id}
                          onClick={() => handleToggleSubject(sub.label)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 12px",
                            borderRadius: "16px",
                            fontSize: "13px",
                            fontWeight: isSelected ? "700" : "500",
                            backgroundColor: isSelected ? "#0F2645" : "#FFFFFF",
                            color: isSelected ? "#FFFFFF" : "#334155",
                            border: isSelected ? "2px solid #C8952A" : "1px solid #CBD5E1",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            boxShadow: isSelected ? "0 2px 6px rgba(15, 38, 69, 0.2)" : "none"
                          }}
                        >
                          {isSelected ? `✓ ${sub.label}` : sub.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>
    </div>
  );
}
