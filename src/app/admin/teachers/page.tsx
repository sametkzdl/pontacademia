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
  Avatar,
  TagSlider
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
                        <div style={{ fontSize: "12px", color: "#475569", fontWeight: "600", marginBottom: "4px" }}>{t.teacherProfile.department}</div>
                      )}
                      <TagSlider
                        items={t.teacherProfile?.districts}
                        variant="blue"
                        icon="map"
                        itemCountLabel="Bölge"
                        subtitle={t.teacherProfile?.currentDistrict ? `📍 İkamet: ${t.teacherProfile.currentDistrict}` : undefined}
                        emptyText={t.teacherProfile?.currentDistrict ? `📍 ${t.teacherProfile.currentDistrict} (Tüm İstanbul)` : undefined}
                        maxWidth="220px"
                        compact
                      />
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
        maxWidth="850px"
        title={`${detailTeacher?.name || ""} • Öğretmen Profil Detayları`}
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
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Header / Photo Banner */}
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "20px", 
              padding: "16px 20px", 
              backgroundColor: "#F8FAFC", 
              borderRadius: "12px", 
              border: "1px solid #E2E8F0",
              flexWrap: "wrap"
            }}>
              <div>
                <Avatar
                  src={detailTeacher.teacherProfile?.photoUrl}
                  name={detailTeacher.name}
                  size={88}
                  showBorder
                  style={{ boxShadow: "0 4px 12px rgba(15, 38, 69, 0.15)", border: "3px solid #C8952A" }}
                />
              </div>

              <div style={{ flex: 1, minWidth: "220px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#0F2645" }}>
                    {detailTeacher.name}
                  </h3>
                  <Badge variant={detailTeacher.isActive !== false ? "ACTIVE" : "PASSIVE"} />
                </div>

                <div style={{ marginTop: "6px", fontSize: "13px", color: "#64748B", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div>
                    <strong style={{ color: "#0F2645" }}>{detailTeacher.teacherProfile?.school}</strong>
                    {detailTeacher.teacherProfile?.department ? ` • ${detailTeacher.teacherProfile.department}` : ""}
                    {detailTeacher.teacherProfile?.classStatus ? ` (${detailTeacher.teacherProfile.classStatus})` : ""}
                  </div>
                  <div>
                    <span style={{ color: "#C8952A", fontWeight: "700" }}>{detailTeacher.teacherProfile?.scoreType}</span> &bull; {detailTeacher.teacherProfile?.yksRank ? `YKS Sıralaması: ${detailTeacher.teacherProfile.yksRank}` : "Derece Belirtilmedi"}
                  </div>
                  <div style={{ fontSize: "12px", color: "#94A3B8" }}>
                    Kayıt Tarihi: {new Date(detailTeacher.createdAt).toLocaleDateString("tr-TR")}
                  </div>
                </div>
              </div>
            </div>

            {/* Grid 1: Kişisel ve İletişim Bilgileri */}
            <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", border: "1px solid #E2E8F0", padding: "16px" }}>
              <div style={{ fontSize: "14px", fontWeight: "800", color: "#0F2645", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px", borderBottom: "1px solid #F1F5F9", paddingBottom: "8px" }}>
                <UserCheck size={16} color="#C8952A" /> 1. Kişisel ve İletişim Bilgileri
              </div>
              <div className="admin-grid-2col" style={{ fontSize: "13px" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "#64748B", fontWeight: "700", display: "block" }}>Ad Soyad</span>
                  <strong style={{ color: "#0F2645" }}>{detailTeacher.name}</strong>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#64748B", fontWeight: "700", display: "block" }}>Doğum Tarihi & Cinsiyet</span>
                  <strong style={{ color: "#0F2645" }}>
                    {detailTeacher.teacherProfile?.birthDate ? `${detailTeacher.teacherProfile.birthDate} • ` : ""}{detailTeacher.teacherProfile?.gender || "Belirtilmedi"}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#64748B", fontWeight: "700", display: "block" }}>E-Posta Adresi</span>
                  <strong style={{ color: "#0F2645" }}>{detailTeacher.email}</strong>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#64748B", fontWeight: "700", display: "block" }}>Telefon Numarası</span>
                  <strong style={{ color: "#0F2645" }}>{detailTeacher.teacherProfile?.phone || "Belirtilmedi"}</strong>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <span style={{ fontSize: "11px", color: "#64748B", fontWeight: "700", display: "block" }}>IBAN Numarası</span>
                  <code style={{ fontSize: "13px", fontWeight: "700", color: "#0F2645", backgroundColor: "#F8FAFC", padding: "4px 8px", borderRadius: "4px", border: "1px solid #E2E8F0" }}>
                    {detailTeacher.teacherProfile?.iban || "Belirtilmedi"}
                  </code>
                </div>
              </div>
            </div>

            {/* Grid 2: Akademik Bilgiler & YKS Derecesi */}
            <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", border: "1px solid #E2E8F0", padding: "16px" }}>
              <div style={{ fontSize: "14px", fontWeight: "800", color: "#0F2645", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px", borderBottom: "1px solid #F1F5F9", paddingBottom: "8px" }}>
                <GraduationCap size={16} color="#C8952A" /> 2. Akademik Bilgiler & YKS Derecesi
              </div>
              <div className="admin-grid-2col" style={{ fontSize: "13px" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "#64748B", fontWeight: "700", display: "block" }}>Üniversite / Okul</span>
                  <strong style={{ color: "#0F2645" }}>{detailTeacher.teacherProfile?.school || "Belirtilmedi"}</strong>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#64748B", fontWeight: "700", display: "block" }}>Bölüm</span>
                  <strong style={{ color: "#0F2645" }}>{detailTeacher.teacherProfile?.department || "Belirtilmedi"}</strong>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#64748B", fontWeight: "700", display: "block" }}>Aktif Sınıf Durumu</span>
                  <strong style={{ color: "#0F2645" }}>{detailTeacher.teacherProfile?.classStatus || "Belirtilmedi"}</strong>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#64748B", fontWeight: "700", display: "block" }}>YKS Sıralaması & Puan Türü</span>
                  <strong style={{ color: "#C8952A" }}>
                    {detailTeacher.teacherProfile?.scoreType} &bull; {detailTeacher.teacherProfile?.yksRank ? `Türkiye ${detailTeacher.teacherProfile.yksRank}.si` : "Belirtilmedi"}
                  </strong>
                </div>
              </div>
            </div>

            {/* Grid 3: Konum & Ders Verme Tercihleri */}
            <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", border: "1px solid #E2E8F0", padding: "16px" }}>
              <div style={{ fontSize: "14px", fontWeight: "800", color: "#0F2645", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px", borderBottom: "1px solid #F1F5F9", paddingBottom: "8px" }}>
                <MapPin size={16} color="#C8952A" /> 3. İkametgah & Ders Verme Tercihleri
              </div>
              <div className="admin-grid-2col" style={{ fontSize: "13px", marginBottom: "14px" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "#64748B", fontWeight: "700", display: "block" }}>İkamet Ettiği İlçe</span>
                  <strong style={{ color: "#0F2645" }}>📍 {detailTeacher.teacherProfile?.currentDistrict || "İstanbul"}</strong>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#64748B", fontWeight: "700", display: "block" }}>Online Ders Durumu</span>
                  <span style={{ 
                    fontSize: "12px", 
                    fontWeight: "700", 
                    padding: "2px 10px", 
                    borderRadius: "6px", 
                    backgroundColor: detailTeacher.teacherProfile?.onlineAvailable ? "#ECFDF5" : "#F1F5F9",
                    color: detailTeacher.teacherProfile?.onlineAvailable ? "#047857" : "#64748B"
                  }}>
                    {detailTeacher.teacherProfile?.onlineAvailable ? "✓ Online Ders Verebilir" : "Sadece Yüz Yüze"}
                  </span>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <span style={{ fontSize: "11px", color: "#64748B", fontWeight: "700", display: "block" }}>Açık Adres / Mahalle / Semt / Yurt Bilgisi</span>
                  <strong style={{ color: "#0F2645" }}>{detailTeacher.teacherProfile?.currentAddress || "Belirtilmedi"}</strong>
                </div>
              </div>

              {/* Yüz yüze ders verilebilecek ilçeler rozetleri */}
              <div style={{ backgroundColor: "#F8FAFC", padding: "14px 16px", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "700", display: "block", marginBottom: "8px" }}>
                  Yüz Yüze Ders Verilebilecek İstanbul İlçeleri:
                </span>
                <TagSlider
                  items={detailTeacher.teacherProfile?.districts}
                  variant="blue"
                  icon="map"
                  itemCountLabel="Hizmet Bölgesi"
                  emptyText="📍 Tüm İstanbul genelinde ders verebilir"
                  maxWidth="100%"
                />
              </div>
            </div>

            {/* Ek Notlar / Biyografi */}
            {detailTeacher.teacherProfile?.notes && (
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", border: "1px solid #E2E8F0", padding: "16px" }}>
                <div style={{ fontSize: "14px", fontWeight: "800", color: "#0F2645", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <BookOpen size={16} color="#C8952A" /> 4. Eğitmen Notları & Biyografi
                </div>
                <p style={{ backgroundColor: "#F8FAFC", padding: "12px", borderRadius: "8px", fontSize: "13px", color: "#334155", margin: 0, lineHeight: "1.6", border: "1px solid #E2E8F0" }}>
                  {detailTeacher.teacherProfile.notes}
                </p>
              </div>
            )}

            {/* Atanan Aktif Öğrenciler */}
            {detailTeacher.teacherMatches && detailTeacher.teacherMatches.length > 0 && (
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", border: "1px solid #E2E8F0", padding: "16px" }}>
                <div style={{ fontSize: "14px", fontWeight: "800", color: "#0F2645", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px", borderBottom: "1px solid #F1F5F9", paddingBottom: "8px" }}>
                  <UserCheck size={16} color="#C8952A" /> Atanan Aktif Öğrenciler ({detailTeacher.teacherMatches.length})
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {detailTeacher.teacherMatches.map((m: any) => (
                    <div 
                      key={m.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 14px",
                        backgroundColor: "#F8FAFC",
                        borderRadius: "8px",
                        border: "1px solid #E2E8F0",
                        fontSize: "13px"
                      }}
                    >
                      <div>
                        <strong style={{ color: "#0F2645" }}>{m.student?.name}</strong>
                        <div style={{ fontSize: "12px", color: "#64748B" }}>
                          {m.type === "KOCLUK" ? "🎓 Eğitim Koçluğu" : "📚 Özel Ders"}: <strong>{m.subject}</strong>
                        </div>
                      </div>
                      <div style={{ textAlign: "right", fontSize: "12px", color: "#059669", fontWeight: "700" }}>
                        📍 {m.student?.studentProfile?.currentDistrict || "İstanbul"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ders Yetkinlik Puanları Özeti */}
            <div style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "800", color: "#0F2645", display: "flex", alignItems: "center", gap: "6px" }}>
                  <GraduationCap size={16} color="#C8952A" /> 5. Ders Yetkinlik Puanları Özeti (1 - 10)
                </h4>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    const t = detailTeacher;
                    setDetailTeacher(null);
                    openCompetenciesModal(t);
                  }}
                >
                  ✏️ Puanları Düzenle
                </Button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "8px" }}>
                {[
                  { label: "TYT Türkçe", score: detailTeacher.teacherProfile?.tytTurkce },
                  { label: "TYT Mat", score: detailTeacher.teacherProfile?.tytMat },
                  { label: "TYT Fizik", score: detailTeacher.teacherProfile?.tytFizik },
                  { label: "TYT Kimya", score: detailTeacher.teacherProfile?.tytKimya },
                  { label: "TYT Biyoloji", score: detailTeacher.teacherProfile?.tytBiyoloji },
                  { label: "TYT Tarih", score: detailTeacher.teacherProfile?.tytTarih },
                  { label: "TYT Coğrafya", score: detailTeacher.teacherProfile?.tytCografya },
                  { label: "AYT Mat", score: detailTeacher.teacherProfile?.aytMat },
                  { label: "AYT Fizik", score: detailTeacher.teacherProfile?.aytFizik },
                  { label: "AYT Kimya", score: detailTeacher.teacherProfile?.aytKimya },
                  { label: "AYT Biyoloji", score: detailTeacher.teacherProfile?.aytBiyoloji },
                  { label: "AYT Edebiyat", score: detailTeacher.teacherProfile?.aytTurkce },
                  { label: "AYT Tarih", score: detailTeacher.teacherProfile?.aytTarih },
                  { label: "AYT Coğrafya", score: detailTeacher.teacherProfile?.aytCografya },
                  { label: "YDT İngilizce", score: detailTeacher.teacherProfile?.ydtIngilizce },
                ].map((item, idx) => {
                  const sc = item.score ?? 5;
                  return (
                    <div key={idx} style={{ backgroundColor: "#FFFFFF", padding: "8px 10px", borderRadius: "6px", border: "1px solid #E2E8F0", fontSize: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: "600", color: "#334155" }}>{item.label}</span>
                      <span style={{ fontWeight: "800", color: sc >= 8 ? "#16A34A" : sc >= 5 ? "#D97706" : "#DC2626" }}>
                        {sc}/10
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Direct High-Resolution Photo Preview if available */}
            {getPhotoUrl(detailTeacher.teacherProfile?.photoUrl) && (
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", border: "1px solid #E2E8F0", padding: "16px" }}>
                <div style={{ fontSize: "14px", fontWeight: "800", color: "#0F2645", marginBottom: "10px" }}>
                  🖼️ Profil Fotoğrafı Önizlemesi
                </div>
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
