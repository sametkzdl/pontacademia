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
  AlertCircle
} from "lucide-react";
import { Button, Input, Select, Modal } from "@/components";

const ISTANBUL_DISTRICTS = {
  anadolu: [
    "Adalar", "Ataşehir", "Beykoz", "Çekmeköy", "Kadıköy", 
    "Kartal", "Maltepe", "Pendik", "Sancaktepe", "Sultanbeyli", 
    "Şile", "Tuzla", "Ümraniye", "Üsküdar"
  ],
  avrupa: [
    "Arnavutköy", "Avcılar", "Bağcılar", "Bahçelievler", "Bakırköy", 
    "Başakşehir", "Bayrampaşa", "Beşiktaş", "Beylikdüzü", "Beyoğlu", 
    "Büyükçekmece", "Çatalca", "Esenler", "Esenyurt", "Eyüpsultan", 
    "Fatih", "Gaziosmanpaşa", "Güngören", "Kağıthane", "Küçükçekmece", 
    "Sarıyer", "Silivri", "Sultangazi", "Şişli", "Zeytinburnu"
  ]
};

const ALL_DISTRICTS = [...ISTANBUL_DISTRICTS.avrupa, ...ISTANBUL_DISTRICTS.anadolu].sort((a, b) => a.localeCompare("tr"));

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
                {profile?.school || "Üniversite Belirtilmedi"}
              </span>
              {profile?.yksRank && (
                <span style={{ backgroundColor: "#FEF3C7", color: "#92400E", padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", border: "1px solid #FCD34D" }}>
                  🏆 YKS {profile.scoreType || "SAY"} {profile.yksRank}.
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
              <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", display: "block" }}>Sınıf Durumu</span>
              <strong style={{ color: "#0F2645" }}>{profile?.classStatus || "Belirtilmedi"}</strong>
            </div>
            <div>
              <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", display: "block" }}>YKS Derecesi & Puan Türü</span>
              <strong style={{ color: "#C8952A" }}>{profile?.scoreType || "SAY"} &bull; {profile?.yksRank ? `${profile.yksRank}. Sıralama` : "Belirtilmedi"}</strong>
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
              <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", display: "block" }}>Ödeme IBAN</span>
              <strong style={{ color: "#0F2645", fontFamily: "monospace" }}>{profile?.iban || "Belirtilmedi"}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Ders Verilebilen İlçeler */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1px solid #DDE6F0", padding: "20px", marginBottom: "24px", boxShadow: "0 4px 16px rgba(15, 38, 69, 0.04)" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0F2645", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
          <MapPin size={18} color="#C8952A" /> Yüz Yüze Ders Verilebilen İlçeler
        </h3>
        <p style={{ fontSize: "13px", color: "#64748B", margin: "0 0 16px 0" }}>
          Özel ders ve yüz yüze koçluk görüşmelerinde ders verebileceğiniz ilçeler
        </p>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {profile?.districts ? (
            profile.districts.split(",").map((d: string, idx: number) => (
              <span key={idx} style={{ backgroundColor: "#F1F5F9", color: "#0F2645", padding: "6px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "600", border: "1px solid #CBD5E1" }}>
                📍 {d.trim()}
              </span>
            ))
          ) : (
            <span style={{ color: "#94A3B8", fontSize: "13px" }}>Henüz ilçe seçilmedi (Tüm İstanbul / Online).</span>
          )}
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

            {/* Grid 2: Okul & Derece */}
            <div className="admin-grid-2col" style={{ marginBottom: "16px" }}>
              <Input
                label="Okul / Üniversite"
                value={editFormData.school}
                onChange={(e) => setEditFormData({ ...editFormData, school: e.target.value })}
                placeholder="Örn: ODTÜ - Bilgisayar Müh."
                required
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

            {/* Online Available Toggle */}
            <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                id="onlineAvailable"
                checked={editFormData.onlineAvailable}
                onChange={(e) => setEditFormData({ ...editFormData, onlineAvailable: e.target.checked })}
                style={{ width: "16px", height: "16px" }}
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
    </div>
  );
}
