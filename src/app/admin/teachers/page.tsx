"use client";

import React, { useState, useEffect } from "react";
import { 
  UserCheck, 
  Key, 
  Check, 
  AlertCircle, 
  Power 
} from "lucide-react";
import { 
  Button, 
  Badge, 
  Modal, 
  PasswordInput, 
  SearchFilterBar 
} from "@/components";

export default function TeachersListPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name_asc" | "name_desc">("newest");

  // Password Reset Modal
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);
  const [resetPwdInput, setResetPwdInput] = useState("Pont2026!");
  const [copiedPwd, setCopiedPwd] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");
  const [actionErrorMsg, setActionErrorMsg] = useState("");

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
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {t.teacherProfile?.photoUrl ? (
                          <img src={t.teacherProfile.photoUrl} alt={t.name} style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#0F2645", color: "#C8952A", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800" }}>
                            {t.name?.charAt(0) || "Ö"}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: "700", color: "#0F2645" }}>{t.name}</div>
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
                      <div style={{ fontWeight: "600", color: "#0F2645" }}>{t.teacherProfile?.school || "Belirtilmedi"}</div>
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
    </div>
  );
}
