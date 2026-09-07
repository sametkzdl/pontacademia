"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  User, 
  GraduationCap, 
  MapPin, 
  Star, 
  Lock, 
  LogOut, 
  Check, 
  AlertCircle, 
  BookOpen, 
  Sparkles,
  Phone,
  Mail,
  CreditCard,
  Home,
  Edit3,
  X,
  Save
} from "lucide-react";

export default function TeacherDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
    iban: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccessMsg, setEditSuccessMsg] = useState("");
  const [editErrorMsg, setEditErrorMsg] = useState("");

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState("");
  const [pwdError, setPwdError] = useState("");

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (data.success && data.user) {
        if (data.user.role !== "TEACHER" && data.user.role !== "ADMIN") {
          router.push("/login");
          return;
        }
        setUser(data.user);
        const p = data.user.teacherProfile;
        setEditFormData({
          name: data.user.name || "",
          phone: p?.phone || "",
          school: p?.school || "",
          yksRank: p?.yksRank || "",
          classStatus: p?.classStatus || "",
          currentDistrict: p?.currentDistrict || "",
          currentAddress: p?.currentAddress || "",
          districts: p?.districts || "",
          onlineAvailable: Boolean(p?.onlineAvailable),
          iban: p?.iban || "",
        });
      } else {
        router.push("/login");
      }
    } catch (err) {
      console.error(err);
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEditErrorMsg("");
    setEditSuccessMsg("");
    setEditLoading(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setEditErrorMsg(data.error || "Profil güncellenemedi.");
        setEditLoading(false);
        return;
      }

      setEditSuccessMsg("Profil bilgileriniz başarıyla güncellendi!");
      await fetchUser();
      setTimeout(() => {
        setIsEditModalOpen(false);
        setEditSuccessMsg("");
      }, 1200);
    } catch (err) {
      console.error(err);
      setEditErrorMsg("Bağlantı hatası oluştu.");
    } finally {
      setEditLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPwdError("");
    setPwdSuccess("");

    if (newPassword !== confirmPassword) {
      setPwdError("Yeni şifreleriniz birbiriyle eşleşmiyor.");
      return;
    }

    if (newPassword.length < 6) {
      setPwdError("Şifreniz en az 6 karakter olmalıdır.");
      return;
    }

    setPwdLoading(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setPwdError(data.error || "Şifre güncellenemedi.");
        setPwdLoading(false);
        return;
      }

      setPwdSuccess("Şifreniz başarıyla güncellendi!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      fetchUser();
    } catch (err) {
      console.error(err);
      setPwdError("Bağlantı hatası oluştu.");
    } finally {
      setPwdLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#F0F5FB" }}>
        <p style={{ color: "#0F2645", fontWeight: "700" }}>Yükleniyor...</p>
      </div>
    );
  }

  const profile = user?.teacherProfile;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F0F5FB", display: "flex", flexDirection: "column" }}>
      
      {/* Top Bar */}
      <header style={{ backgroundColor: "#0F2645", color: "#FFFFFF", padding: "16px 0", borderBottom: "2px solid #C8952A" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link href="/">
              <Image 
                src="/pont_logo.png" 
                alt="Pont Academy Logo" 
                width={130} 
                height={36} 
                style={{ objectFit: "contain" }}
                priority
              />
            </Link>
            <span style={{ 
              backgroundColor: "rgba(200, 149, 42, 0.2)", 
              color: "#F0DFA8", 
              padding: "4px 10px", 
              borderRadius: "6px", 
              fontSize: "12px", 
              fontWeight: "700",
              border: "1px solid rgba(200, 149, 42, 0.4)"
            }}>
              EĞİTMEN PORTALI
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ fontSize: "14px", color: "#E0E8F2", fontWeight: "600" }}>
              {user?.name}
            </span>
            <button 
              onClick={handleLogout}
              style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                gap: "6px", 
                backgroundColor: "rgba(255, 255, 255, 0.1)", 
                color: "#FFFFFF", 
                border: "1px solid rgba(255, 255, 255, 0.2)", 
                padding: "6px 14px", 
                borderRadius: "6px", 
                fontSize: "13px", 
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              <LogOut size={14} /> Çıkış Yap
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container" style={{ flexGrow: 1, padding: "32px 24px" }}>
        
        {/* Zorunlu Şifre Değiştirme Bildirimi */}
        {user?.mustChangePassword && (
          <div style={{ 
            backgroundColor: "#FEF3C7", 
            border: "1px solid #FCD34D", 
            borderRadius: "12px", 
            padding: "16px 20px", 
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "#92400E"
          }}>
            <AlertCircle size={24} color="#D97706" />
            <div>
              <strong>Güvenlik Uyarısı:</strong> Hesabınıza geçici şifre ile giriş yaptınız. Lütfen aşağıdaki formdan kalıcı şifrenizi belirleyiniz.
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
          
          {/* Sol Kolon: Eğitmen Profil Kartı */}
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", padding: "28px", border: "1px solid #DDE6F0", boxShadow: "0 4px 16px rgba(15, 38, 69, 0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid #E2E8F0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "#0F2645", display: "flex", alignItems: "center", justifyContent: "center", color: "#C8952A" }}>
                  <GraduationCap size={28} />
                </div>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0F2645", margin: 0 }}>
                    {user?.name}
                  </h2>
                  <span style={{ fontSize: "13px", color: "#64748B" }}>
                    Pont Academy Eğitmen & Koç
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsEditModalOpen(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "#F1F5F9",
                  color: "#0F2645",
                  border: "1px solid #CBD5E1",
                  borderRadius: "8px",
                  padding: "8px 14px",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.2s ease"
                }}
              >
                <Edit3 size={14} color="#C8952A" /> Profili Düzenle
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#334155" }}>
                <Mail size={16} color="#C8952A" /> <span>{user?.email}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#334155" }}>
                <Phone size={16} color="#C8952A" /> <span>{profile?.phone || "Belirtilmedi"}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#334155" }}>
                <GraduationCap size={16} color="#C8952A" /> <span>{profile?.school || "Belirtilmedi"}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#334155" }}>
                <Star size={16} color="#C8952A" /> <span>YKS Sıralaması: <strong>{profile?.yksRank || "Belirtilmedi"}</strong></span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#334155" }}>
                <Home size={16} color="#C8952A" /> <span>İkametgah: {profile?.currentDistrict || "İstanbul"}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#334155" }}>
                <CreditCard size={16} color="#C8952A" /> <span>IBAN: {profile?.iban || "Belirtilmedi"}</span>
              </div>
            </div>

            <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #E2E8F0" }}>
              <strong style={{ fontSize: "13px", color: "#0F2645" }}>Ders Verilebilecek İlçeler:</strong>
              <div style={{ marginTop: "6px", fontSize: "13px", color: "#475569", backgroundColor: "#F8FAFC", padding: "10px", borderRadius: "8px" }}>
                {profile?.districts || "Belirtilmedi"}
              </div>
            </div>
          </div>

          {/* Sağ Kolon: Şifre Değiştirme Kartı */}
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", padding: "28px", border: "1px solid #DDE6F0", boxShadow: "0 4px 16px rgba(15, 38, 69, 0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid #E2E8F0" }}>
              <Lock size={20} color="#C8952A" />
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0F2645", margin: 0 }}>
                Şifre Güncelleme
              </h3>
            </div>

            {pwdSuccess && (
              <div style={{ backgroundColor: "#DCFCE7", border: "1px solid #86EFAC", color: "#15803D", padding: "12px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px", fontWeight: "600" }}>
                <Check size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
                {pwdSuccess}
              </div>
            )}

            {pwdError && (
              <div style={{ backgroundColor: "#FEE2E2", border: "1px solid #FCA5A5", color: "#B91C1C", padding: "12px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px", fontWeight: "600" }}>
                <AlertCircle size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
                {pwdError}
              </div>
            )}

            <form onSubmit={handlePasswordChange}>
              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label className="form-label" style={{ color: "#0F2645", fontWeight: "700", fontSize: "13px" }}>
                  Mevcut / Geçici Şifreniz
                </label>
                <input 
                  className="form-input"
                  style={{ 
                    backgroundColor: "#FFFFFF", 
                    color: "#0F2645", 
                    border: "1px solid #CBD5E1", 
                    borderRadius: "8px", 
                    padding: "10px 14px", 
                    width: "100%", 
                    fontSize: "14px" 
                  }}
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label className="form-label" style={{ color: "#0F2645", fontWeight: "700", fontSize: "13px" }}>
                  Yeni Şifre
                </label>
                <input 
                  className="form-input"
                  style={{ 
                    backgroundColor: "#FFFFFF", 
                    color: "#0F2645", 
                    border: "1px solid #CBD5E1", 
                    borderRadius: "8px", 
                    padding: "10px 14px", 
                    width: "100%", 
                    fontSize: "14px" 
                  }}
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="En az 6 karakter"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label className="form-label" style={{ color: "#0F2645", fontWeight: "700", fontSize: "13px" }}>
                  Yeni Şifre (Tekrar)
                </label>
                <input 
                  className="form-input"
                  style={{ 
                    backgroundColor: "#FFFFFF", 
                    color: "#0F2645", 
                    border: "1px solid #CBD5E1", 
                    borderRadius: "8px", 
                    padding: "10px 14px", 
                    width: "100%", 
                    fontSize: "14px" 
                  }}
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Yeni şifrenizi tekrar giriniz"
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={pwdLoading}
                style={{ width: "100%", padding: "12px", fontWeight: "700" }}
              >
                {pwdLoading ? "Güncelleniyor..." : "Şifremi Güncelle"}
              </button>
            </form>
          </div>

        </div>

      </main>

      {/* Profil Düzenleme Modalı */}
      {isEditModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", padding: "28px", maxWidth: "620px", width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 50px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #E2E8F0", paddingBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Edit3 size={20} color="#C8952A" />
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0F2645", margin: 0 }}>
                  Eğitmen Profil Bilgilerini Güncelle
                </h3>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}>
                <X size={20} />
              </button>
            </div>

            {editSuccessMsg && (
              <div style={{ backgroundColor: "#DCFCE7", border: "1px solid #86EFAC", color: "#15803D", padding: "12px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px", fontWeight: "600" }}>
                <Check size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
                {editSuccessMsg}
              </div>
            )}

            {editErrorMsg && (
              <div style={{ backgroundColor: "#FEE2E2", border: "1px solid #FCA5A5", color: "#B91C1C", padding: "12px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px", fontWeight: "600" }}>
                <AlertCircle size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
                {editErrorMsg}
              </div>
            )}

            <form onSubmit={handleProfileUpdate}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                <div className="form-group" style={{ marginBottom: "0" }}>
                  <label className="form-label" style={{ color: "#0F2645", fontWeight: "700", fontSize: "12px" }}>
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", backgroundColor: "#FFFFFF" }}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: "0" }}>
                  <label className="form-label" style={{ color: "#0F2645", fontWeight: "700", fontSize: "12px" }}>
                    Telefon
                  </label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", backgroundColor: "#FFFFFF" }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                <div className="form-group" style={{ marginBottom: "0" }}>
                  <label className="form-label" style={{ color: "#0F2645", fontWeight: "700", fontSize: "12px" }}>
                    Üniversite & Bölüm
                  </label>
                  <input
                    type="text"
                    value={editFormData.school}
                    onChange={(e) => setEditFormData({ ...editFormData, school: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: "0" }}>
                  <label className="form-label" style={{ color: "#0F2645", fontWeight: "700", fontSize: "12px" }}>
                    YKS Sıralaması
                  </label>
                  <input
                    type="text"
                    value={editFormData.yksRank}
                    onChange={(e) => setEditFormData({ ...editFormData, yksRank: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
                <div className="form-group" style={{ marginBottom: "0" }}>
                  <label className="form-label" style={{ color: "#0F2645", fontWeight: "700", fontSize: "12px" }}>
                    İkametgah İlçesi
                  </label>
                  <input
                    type="text"
                    value={editFormData.currentDistrict}
                    onChange={(e) => setEditFormData({ ...editFormData, currentDistrict: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", backgroundColor: "#FFFFFF" }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: "0" }}>
                  <label className="form-label" style={{ color: "#0F2645", fontWeight: "700", fontSize: "12px" }}>
                    IBAN
                  </label>
                  <input
                    type="text"
                    value={editFormData.iban}
                    onChange={(e) => setEditFormData({ ...editFormData, iban: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", backgroundColor: "#FFFFFF" }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "14px" }}>
                <label className="form-label" style={{ color: "#0F2645", fontWeight: "700", fontSize: "12px" }}>
                  Ders Verilebilecek İlçeler
                </label>
                <input
                  type="text"
                  value={editFormData.districts}
                  onChange={(e) => setEditFormData({ ...editFormData, districts: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", backgroundColor: "#FFFFFF" }}
                  placeholder="Örn: Beşiktaş, Kadıköy, Üsküdar"
                />
              </div>

              <div className="form-group" style={{ marginBottom: "14px" }}>
                <label className="form-label" style={{ color: "#0F2645", fontWeight: "700", fontSize: "12px" }}>
                  Açık Adres
                </label>
                <textarea
                  rows={2}
                  value={editFormData.currentAddress}
                  onChange={(e) => setEditFormData({ ...editFormData, currentAddress: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", backgroundColor: "#FFFFFF", resize: "none" }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "600", color: "#0F2645", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={editFormData.onlineAvailable}
                    onChange={(e) => setEditFormData({ ...editFormData, onlineAvailable: e.target.checked })}
                    style={{ width: "16px", height: "16px", accentColor: "#C8952A" }}
                  />
                  Online Ders Verebilirim
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ padding: "8px 16px", fontSize: "13px" }}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="btn btn-primary"
                  style={{ padding: "8px 20px", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <Save size={14} />
                  {editLoading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer style={{ padding: "20px 0", textAlign: "center", fontSize: "12px", color: "#94A3B8" }}>
        © 2026 Pont Academy. Eğitmen Sistemi.
      </footer>
    </div>
  );
}
