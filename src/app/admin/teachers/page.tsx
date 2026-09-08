"use client";

import React, { useState, useEffect } from "react";
import { 
  UserCheck, 
  Key, 
  Check, 
  AlertCircle, 
  Power,
  GraduationCap,
  Eye,
  Camera,
  MapPin,
  Mail,
  Phone,
  BookOpen
} from "lucide-react";
import { 
  Button, 
  Badge, 
  Modal, 
  PasswordInput, 
  SearchFilterBar,
  Avatar
} from "@/components";
import { getPhotoUrl } from "@/utils/media";

export default function TeachersListPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name_asc" | "name_desc">("newest");

  // Profile Detail & Photo Modal
  const [detailTeacher, setDetailTeacher] = useState<any | null>(null);

  // Password Reset Modal
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);
  const [resetPwdInput, setResetPwdInput] = useState("Pont2026!");
  const [copiedPwd, setCopiedPwd] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");
  const [actionErrorMsg, setActionErrorMsg] = useState("");

  // Competencies Modal
  const [isCompetenciesModalOpen, setIsCompetenciesModalOpen] = useState(false);
  const [compScores, setCompScores] = useState<Record<string, number>>({});
  const [compSaveLoading, setCompSaveLoading] = useState(false);
  const [compSuccessMsg, setCompSuccessMsg] = useState("");

  const openCompetenciesModal = (teacher: any) => {
    setSelectedTeacher(teacher);
    const prof = teacher.teacherProfile || {};
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
    setIsCompetenciesModalOpen(true);
  };

  const handleSaveCompetencies = async () => {
    if (!selectedTeacher) return;
    setCompSaveLoading(true);
    setCompSuccessMsg("");
    try {
      const res = await fetch("/api/admin/users/update-competencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedTeacher.id,
          scores: compScores,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCompSuccessMsg("Yetkinlik puanları başarıyla kaydedildi!");
        // Update local teacher state
        setTeachers(prev => prev.map(t => t.id === selectedTeacher.id ? {
          ...t,
          teacherProfile: {
            ...(t.teacherProfile || {}),
            ...compScores,
          }
        } : t));
        setTimeout(() => {
          setIsCompetenciesModalOpen(false);
          setCompSuccessMsg("");
        }, 1200);
      } else {
        alert(data.error || "Puanlar güncellenemedi.");
      }
    } catch (err) {
      console.error(err);
      alert("Bir hata oluştu.");
    } finally {
      setCompSaveLoading(false);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success) {
        setTeachers(data.teachers || []);
      }
    } catch (err) {
      console.error("Fetch teachers error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean, userName: string) => {
    const nextStatus = currentStatus === false ? true : false;
    const actionText = nextStatus ? "aktif etmek" : "pasife almak (oturumu sonlandırılır)";
    if (!confirm(`"${userName}" öğretmenini ${actionText} istediğinize emin misiniz?`)) return;

    try {
      const res = await fetch("/api/admin/users/toggle-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isActive: nextStatus }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTeachers(prev => prev.map(t => t.id === userId ? { ...t, isActive: nextStatus } : t));
      } else {
        alert(data.error || "İşlem sırasında bir hata oluştu.");
      }
    } catch (err) {
      console.error(err);
      alert("Bağlantı hatası oluştu.");
    }
  };

  const handleResetPasswordSubmit = async () => {
    if (!selectedTeacher || !resetPwdInput) return;
    setActionLoading(true);
    setActionErrorMsg("");
    setActionSuccessMsg("");

    try {
      const res = await fetch("/api/admin/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedTeacher.id,
          newPassword: resetPwdInput,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setActionErrorMsg(data.error || "Şifre yenilenemedi.");
        setActionLoading(false);
        return;
      }

      setActionSuccessMsg(`"${selectedTeacher.name}" için şifre güncellendi: ${resetPwdInput}`);
      fetchData();
    } catch (err) {
      console.error(err);
      setActionErrorMsg("Bağlantı hatası oluştu.");
    } finally {
      setActionLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedTeacher(null);
    setIsResetModalOpen(false);
    setActionSuccessMsg("");
    setActionErrorMsg("");
  };

  const filteredTeachers = teachers
    .filter(t => {
      const matchesSearch = 
        t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.email?.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (statusFilter === "ALL") return true;
      if (statusFilter === "ACTIVE") return t.isActive !== false;
      if (statusFilter === "PASSIVE") return t.isActive === false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "name_asc") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "name_desc") return (b.name || "").localeCompare(a.name || "");
      return 0;
    });

  return (
    <div>
      {/* Header Info */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", backgroundColor: "#FFFFFF", padding: "16px 20px", borderRadius: "12px", border: "1px solid #DDE6F0", boxShadow: "0 2px 8px rgba(15, 38, 69, 0.04)" }}>
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#0F2645", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <UserCheck size={22} color="#C8952A" /> Kayıtlı Öğretmenler
          </h2>
          <p style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 0 0" }}>
            Sistemde hesabı aktif olan veya dondurulan eğitmenlerin tam listesi ve şifre yönetimi
          </p>
        </div>
        <div style={{ fontSize: "14px", fontWeight: "700", color: "#0F2645" }}>
          Toplam: <span style={{ color: "#C8952A" }}>{teachers.length}</span> Eğitmen
        </div>
      </div>

      {/* Controls Bar */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Öğretmen adı veya e-posta ara..."
        filterLabel="Durum:"
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={[
          { value: "ALL", label: `Tümü (${teachers.length})` },
          { value: "ACTIVE", label: `🟢 Aktifler (${teachers.filter(t => t.isActive !== false).length})` },
          { value: "PASSIVE", label: `🔴 Pasifler (${teachers.filter(t => t.isActive === false).length})` },
        ]}
        sortValue={sortBy}
        onSortChange={(val) => setSortBy(val as any)}
        sortOptions={[
          { value: "newest", label: "En Yeni" },
          { value: "oldest", label: "En Eski" },
          { value: "name_asc", label: "İsim (A → Z)" },
          { value: "name_desc", label: "İsim (Z → A)" },
        ]}
      />

      {/* Table */}
      <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #DDE6F0", overflow: "hidden", boxShadow: "0 4px 16px rgba(15, 38, 69, 0.04)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#475569" }}>
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>Öğretmen Adı</th>
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>İletişim</th>
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>Üniversite & İlçe</th>
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>Durum</th>
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>Kayıt Tarihi</th>
                <th style={{ padding: "14px 18px", fontWeight: "700", textAlign: "right" }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ padding: "40px 16px", textAlign: "center", color: "#94A3B8" }}>
                    Yükleniyor...
                  </td>
                </tr>
              ) : filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "40px 16px", textAlign: "center", color: "#94A3B8" }}>
                    Kayıtlı öğretmen bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((t) => (
                  <tr key={t.id} style={{ borderBottom: "1px solid #F1F5F9", opacity: t.isActive === false ? 0.6 : 1 }}>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <Avatar
                          src={t.teacherProfile?.photoUrl}
                          name={t.name}
                          size={42}
                          showBorder
                          onClick={() => setDetailTeacher(t)}
                          style={{ cursor: "pointer", boxShadow: "0 2px 6px rgba(15, 38, 69, 0.12)" }}
                        />
                        <div style={{ cursor: "pointer" }} onClick={() => setDetailTeacher(t)}>
                          <div style={{ fontWeight: "700", color: "#0F2645", display: "flex", alignItems: "center", gap: "6px" }}>
                            {t.name}
                          </div>
                          {t.teacherProfile?.yksRank && (
                            <div style={{ fontSize: "11px", color: "#C8952A", fontWeight: "700" }}>
                              YKS {t.teacherProfile.yksRank}.
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ color: "#0F2645" }}>{t.email}</div>
                      <div style={{ fontSize: "12px", color: "#64748B" }}>{t.teacherProfile?.phone || "Telefon yok"}</div>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ fontWeight: "700", color: "#0F2645" }}>{t.teacherProfile?.school || "Belirtilmedi"}</div>
                      {t.teacherProfile?.department && (
                        <div style={{ fontSize: "12px", color: "#475569", fontWeight: "600" }}>{t.teacherProfile.department}</div>
                      )}
                      <div style={{ fontSize: "12px", color: "#64748B" }}>{t.teacherProfile?.currentDistrict || "İstanbul"}</div>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <Badge variant={t.isActive !== false ? "ACTIVE" : "PASSIVE"} />
                    </td>
                    <td style={{ padding: "14px 18px", fontSize: "12px", color: "#64748B" }}>
                      {new Date(t.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                    <td style={{ padding: "14px 18px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setDetailTeacher(t)}
                          leftIcon={<Eye size={13} color="#0F2645" />}
                        >
                          Detay & Foto
                        </Button>

                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => openCompetenciesModal(t)}
                          leftIcon={<GraduationCap size={13} color="#C8952A" />}
                        >
                          Ders Puanları
                        </Button>

                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setSelectedTeacher(t);
                            setResetPwdInput(`Pont${Math.floor(1000 + Math.random() * 9000)}!`);
                            setIsResetModalOpen(true);
                          }}
                          leftIcon={<Key size={13} color="#1D4ED8" />}
                        >
                          Şifre Yenile
                        </Button>

                        <button
                          onClick={() => handleToggleUserStatus(t.id, t.isActive !== false, t.name)}
                          style={{
                            padding: "6px 10px",
                            borderRadius: "6px",
                            backgroundColor: t.isActive !== false ? "#FFFBEB" : "#F0FDF4",
                            color: t.isActive !== false ? "#B45309" : "#15803D",
                            border: t.isActive !== false ? "1px solid #FDE68A" : "1px solid #BBF7D0",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "700",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                          title={t.isActive !== false ? "Hesabı Dondur / Pasif Yap" : "Hesabı Aktif Et"}
                        >
                          <Power size={13} /> {t.isActive !== false ? "Dondur" : "Aktifleştir"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Password Reset Modal */}
      <Modal
        isOpen={isResetModalOpen && !!selectedTeacher}
        onClose={closeModal}
        title="Öğretmen Şifresi Sıfırla"
        icon={<Key size={20} color="#C8952A" />}
      >
        {selectedTeacher && (
          <div>
            <div style={{ backgroundColor: "#F8FAFC", padding: "14px", borderRadius: "10px", border: "1px solid #E2E8F0", marginBottom: "16px" }}>
              <strong style={{ color: "#0F2645", fontSize: "15px", display: "block" }}>{selectedTeacher.name}</strong>
              <div style={{ fontSize: "13px", color: "#64748B" }}>{selectedTeacher.email}</div>
            </div>

            {actionSuccessMsg ? (
              <div style={{ backgroundColor: "#DCFCE7", border: "1px solid #86EFAC", color: "#15803D", padding: "16px", borderRadius: "8px", fontSize: "14px" }}>
                <div style={{ fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                  <Check size={18} /> Şifre Başarıyla Yenilendi!
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#FFFFFF", padding: "10px 14px", borderRadius: "6px", border: "1px solid #86EFAC", marginTop: "8px" }}>
                  <code style={{ fontSize: "15px", fontWeight: "800", color: "#0F2645", letterSpacing: "1px" }}>{resetPwdInput}</code>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      navigator.clipboard.writeText(resetPwdInput);
                      setCopiedPwd(true);
                      setTimeout(() => setCopiedPwd(false), 2000);
                    }}
                  >
                    {copiedPwd ? "Kopyalandı ✓" : "Kopyala"}
                  </Button>
                </div>
                <div style={{ marginTop: "16px", textAlign: "right" }}>
                  <Button size="sm" variant="primary" onClick={closeModal}>
                    Tamam
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                {actionErrorMsg && (
                  <div style={{ backgroundColor: "#FEE2E2", border: "1px solid #FCA5A5", color: "#B91C1C", padding: "12px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
                    <AlertCircle size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
                    {actionErrorMsg}
                  </div>
                )}

                <PasswordInput
                  label="Yeni Geçici Şifre"
                  value={resetPwdInput}
                  onChange={(e) => setResetPwdInput(e.target.value)}
                  showGenerator
                  onGenerate={(pwd) => setResetPwdInput(pwd)}
                  helperText="Öğretmen bir sonraki girişinde bu şifreyi değiştirmeye zorlanacaktır."
                  required
                />

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                  <Button variant="secondary" onClick={closeModal}>
                    İptal
                  </Button>
                  <Button
                    variant="primary"
                    loading={actionLoading}
                    disabled={!resetPwdInput}
                    onClick={handleResetPasswordSubmit}
                  >
                    Şifreyi Güncelle & Sıfırla
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Competencies Modal (Admin View & Edit Subject Scores) */}
      <Modal
        isOpen={isCompetenciesModalOpen && !!selectedTeacher}
        onClose={() => setIsCompetenciesModalOpen(false)}
        title="Eğitmen Ders Yetkinlik Puanları"
        icon={<GraduationCap size={20} color="#C8952A" />}
      >
        {selectedTeacher && (
          <div>
            <div style={{ backgroundColor: "#F8FAFC", padding: "14px", borderRadius: "10px", border: "1px solid #E2E8F0", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ color: "#0F2645", fontSize: "15px", display: "block" }}>{selectedTeacher.name}</strong>
                  <div style={{ fontSize: "12px", color: "#64748B" }}>
                    {selectedTeacher.teacherProfile?.school} • {selectedTeacher.teacherProfile?.yksRank ? `YKS ${selectedTeacher.teacherProfile.yksRank}. Derece` : ""}
                  </div>
                </div>
                <span style={{ padding: "4px 10px", borderRadius: "12px", backgroundColor: "#F3E8FF", color: "#7E22CE", border: "1px solid #E9D5FF", fontSize: "11px", fontWeight: "800" }}>
                  🎓 Eğitmen
                </span>
              </div>
            </div>

            {compSuccessMsg && (
              <div style={{ backgroundColor: "#DCFCE7", color: "#166534", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: "700", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Check size={16} /> {compSuccessMsg}
              </div>
            )}

            <p style={{ fontSize: "13px", color: "#64748B", marginTop: 0, marginBottom: "16px" }}>
              Eğitmenin ders ve branş bazlı yetkinlik puanlarını (1 - 10) aşağıdan inceleyebilir ve güncelleyebilirsiniz.
            </p>

            {/* TYT Section */}
            <div style={{ marginBottom: "18px" }}>
              <div style={{ fontSize: "12px", fontWeight: "800", color: "#1D4ED8", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                📘 TYT Branş Puanları
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "10px" }}>
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "10px" }}>
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

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", borderTop: "1px solid #E2E8F0", paddingTop: "14px" }}>
              <Button variant="secondary" onClick={() => setIsCompetenciesModalOpen(false)}>
                Kapat
              </Button>
              <Button
                variant="primary"
                loading={compSaveLoading}
                onClick={handleSaveCompetencies}
              >
                💾 Değişiklikleri Kaydet
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Teacher Detail & Large Photo Modal */}
      <Modal
        isOpen={Boolean(detailTeacher)}
        onClose={() => setDetailTeacher(null)}
        title={`${detailTeacher?.name || ""} • Öğretmen Profili`}
        titleIcon={<GraduationCap size={20} color="#C8952A" />}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", width: "100%" }}>
            <Button variant="secondary" onClick={() => setDetailTeacher(null)}>
              Kapat
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                const t = detailTeacher;
                setDetailTeacher(null);
                openCompetenciesModal(t);
              }}
              leftIcon={<GraduationCap size={14} />}
            >
              Ders Puanlarını Düzenle
            </Button>
          </div>
        }
      >
        {detailTeacher && (
          <div>
            {/* Header / Photo Banner */}
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "20px", 
              padding: "16px", 
              backgroundColor: "#F8FAFC", 
              borderRadius: "12px", 
              border: "1px solid #E2E8F0",
              marginBottom: "20px",
              flexWrap: "wrap"
            }}>
              <div style={{ position: "relative" }}>
                <Avatar
                  src={detailTeacher.teacherProfile?.photoUrl}
                  name={detailTeacher.name}
                  size={96}
                  showBorder
                  style={{ boxShadow: "0 4px 12px rgba(15, 38, 69, 0.15)", border: "3px solid #C8952A" }}
                />
              </div>

              <div style={{ flex: 1, minWidth: "220px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#0F2645" }}>
                    {detailTeacher.name}
                  </h3>
                  <Badge variant={detailTeacher.isActive !== false ? "ACTIVE" : "PASSIVE"} />
                </div>

                <div style={{ marginTop: "6px", fontSize: "13px", color: "#64748B", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Mail size={14} color="#C8952A" /> {detailTeacher.email}
                  </div>
                  {detailTeacher.teacherProfile?.phone && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Phone size={14} color="#C8952A" /> {detailTeacher.teacherProfile.phone}
                    </div>
                  )}
                  {detailTeacher.teacherProfile?.currentDistrict && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <MapPin size={14} color="#C8952A" /> {detailTeacher.teacherProfile.currentDistrict}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Info Grid */}
            <div className="admin-grid-2col" style={{ marginBottom: "20px", fontSize: "14px" }}>
              <div>
                <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", display: "block" }}>Okul / Üniversite</span>
                <strong style={{ color: "#0F2645" }}>{detailTeacher.teacherProfile?.school || "Belirtilmedi"}</strong>
              </div>
              <div>
                <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", display: "block" }}>Bölüm</span>
                <strong style={{ color: "#0F2645" }}>{detailTeacher.teacherProfile?.department || "Belirtilmedi"}</strong>
              </div>
              <div>
                <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", display: "block" }}>YKS Sıralaması</span>
                <strong style={{ color: "#C8952A" }}>
                  {detailTeacher.teacherProfile?.yksRank ? `Türkiye ${detailTeacher.teacherProfile.yksRank}.si` : "Belirtilmedi"}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", display: "block" }}>Ders Verebileceği İlçeler</span>
                <span style={{ color: "#0F2645", fontSize: "13px" }}>{detailTeacher.teacherProfile?.districts || "Tüm İstanbul / Online"}</span>
              </div>
              <div>
                <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", display: "block" }}>Hizmet Türleri</span>
                <span style={{ color: "#0F2645", fontSize: "13px" }}>
                  {[
                    detailTeacher.teacherProfile?.koclukAvailable ? "Koçluk" : null,
                    detailTeacher.teacherProfile?.ozelDersAvailable ? "Özel Ders" : null,
                    detailTeacher.teacherProfile?.onlineAvailable ? "Online" : null
                  ].filter(Boolean).join(" • ") || "Belirtilmedi"}
                </span>
              </div>
              <div>
                <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", display: "block" }}>Kayıt Tarihi</span>
                <span style={{ color: "#0F2645", fontSize: "13px" }}>
                  {new Date(detailTeacher.createdAt).toLocaleDateString("tr-TR")}
                </span>
              </div>
            </div>

            {/* Bio */}
            {detailTeacher.teacherProfile?.bio && (
              <div style={{ marginBottom: "20px" }}>
                <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", display: "block", marginBottom: "4px" }}>
                  Hakkında / Biyografi
                </span>
                <p style={{ backgroundColor: "#F8FAFC", padding: "12px", borderRadius: "8px", fontSize: "14px", color: "#334155", margin: 0, lineHeight: "1.5" }}>
                  {detailTeacher.teacherProfile.bio}
                </p>
              </div>
            )}

            {/* Direct High-Resolution Photo Preview if available */}
            {getPhotoUrl(detailTeacher.teacherProfile?.photoUrl) && (
              <div style={{ marginBottom: "20px" }}>
                <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                  Profil Fotoğrafı Önizlemesi
                </span>
                <div style={{ 
                  borderRadius: "10px", 
                  overflow: "hidden", 
                  border: "1px solid #E2E8F0", 
                  maxHeight: "300px", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  backgroundColor: "#0F2645"
                }}>
                  <img
                    src={getPhotoUrl(detailTeacher.teacherProfile?.photoUrl)!}
                    alt={detailTeacher.name}
                    style={{ maxWidth: "100%", maxHeight: "300px", objectFit: "contain" }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );

}
