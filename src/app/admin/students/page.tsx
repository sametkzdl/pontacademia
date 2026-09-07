"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Key, 
  Power, 
  Check, 
  AlertCircle
} from "lucide-react";
import { Button, Badge, PasswordInput, Modal, SearchFilterBar } from "@/components";

export default function StudentsListPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name_asc" | "name_desc" | "status">("newest");

  // Password Reset Modal
  const [modalType, setModalType] = useState<"reset_password" | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
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
        setStudents(data.students || []);
      }
    } catch (err) {
      console.error("Fetch students error:", err);
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
    if (!confirm(`"${userName}" öğrencisini ${actionText} istediğinize emin misiniz?`)) return;

    try {
      const res = await fetch("/api/admin/users/toggle-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isActive: nextStatus }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStudents(prev => prev.map(s => s.id === userId ? { ...s, isActive: nextStatus } : s));
      } else {
        alert(data.error || "İşlem sırasında bir hata oluştu.");
      }
    } catch (err) {
      console.error(err);
      alert("Bağlantı hatası oluştu.");
    }
  };

  const handleResetPasswordSubmit = async () => {
    if (!selectedStudent || !resetPwdInput) return;
    setActionLoading(true);
    setActionErrorMsg("");
    setActionSuccessMsg("");

    try {
      const res = await fetch("/api/admin/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedStudent.id,
          newPassword: resetPwdInput,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setActionErrorMsg(data.error || "Şifre yenilenemedi.");
        setActionLoading(false);
        return;
      }

      setActionSuccessMsg(`"${selectedStudent.name}" için şifre güncellendi: ${resetPwdInput}`);
      fetchData();
    } catch (err) {
      console.error(err);
      setActionErrorMsg("Bağlantı hatası oluştu.");
    } finally {
      setActionLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedStudent(null);
    setModalType(null);
    setActionSuccessMsg("");
    setActionErrorMsg("");
  };

  const filteredStudents = students
    .filter(s => {
      const matchesSearch = 
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (statusFilter === "ALL") return true;
      if (statusFilter === "ACTIVE") return s.isActive !== false;
      if (statusFilter === "PASSIVE") return s.isActive === false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "name_asc") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "name_desc") return (b.name || "").localeCompare(a.name || "");
      if (sortBy === "status") return (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0);
      return 0;
    });

  return (
    <div>
      {/* Search & Filter Bar */}
      <SearchFilterBar
        title="Kayıtlı Öğrenciler"
        subtitle="Sistemde hesabı tanımlı olan öğrencilerin tam listesi ve hesap yönetimi"
        titleIcon={<Users size={22} color="#C8952A" />}
        searchPlaceholder="Öğrenci ara..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filterLabel="Durum"
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={[
          { value: "ALL", label: `Tümü (${students.length})` },
          { value: "ACTIVE", label: `🟢 Aktifler (${students.filter(s => s.isActive !== false).length})` },
          { value: "PASSIVE", label: `🔴 Pasifler (${students.filter(s => s.isActive === false).length})` },
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
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>Öğrenci Adı</th>
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>İletişim</th>
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>Sınıf & İlçe</th>
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>Hedef / Alan</th>
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>Durum</th>
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>Kayıt Tarihi</th>
                <th style={{ padding: "14px 18px", fontWeight: "700", textAlign: "right" }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ padding: "40px 16px", textAlign: "center", color: "#94A3B8" }}>
                    Yükleniyor...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "40px 16px", textAlign: "center", color: "#94A3B8" }}>
                    Kayıtlı öğrenci bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid #F1F5F9", opacity: s.isActive === false ? 0.6 : 1 }}>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {s.studentProfile?.photoUrl ? (
                          <img src={s.studentProfile.photoUrl} alt={s.name} style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#0F2645", color: "#C8952A", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800" }}>
                            {s.name?.charAt(0) || "Ö"}
                          </div>
                        )}
                        <div style={{ fontWeight: "700", color: "#0F2645" }}>{s.name}</div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ color: "#0F2645" }}>{s.email}</div>
                      <div style={{ fontSize: "12px", color: "#64748B" }}>{s.studentProfile?.phone || "Telefon yok"}</div>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ fontWeight: "600", color: "#0F2645" }}>{s.studentProfile?.grade || "Belirtilmedi"}</div>
                      <div style={{ fontSize: "12px", color: "#64748B" }}>{s.studentProfile?.city || "İstanbul"}</div>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ fontSize: "13px", color: "#0F2645" }}>{s.studentProfile?.target || s.studentProfile?.subject || "Genel Koçluk"}</div>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <Badge variant={s.isActive !== false ? "ACTIVE" : "PASSIVE"} />
                    </td>
                    <td style={{ padding: "14px 18px", fontSize: "12px", color: "#64748B" }}>
                      {new Date(s.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                    <td style={{ padding: "14px 18px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Key size={13} />}
                          onClick={() => {
                            setSelectedStudent(s);
                            setResetPwdInput(`Pont${Math.floor(1000 + Math.random() * 9000)}!`);
                            setModalType("reset_password");
                          }}
                        >
                          Şifre Yenile
                        </Button>

                        <Button
                          variant={s.isActive !== false ? "secondary" : "outline"}
                          size="sm"
                          icon={<Power size={13} />}
                          onClick={() => handleToggleUserStatus(s.id, s.isActive !== false, s.name)}
                        >
                          {s.isActive !== false ? "Dondur" : "Aktifleştir"}
                        </Button>
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
        isOpen={modalType === "reset_password" && Boolean(selectedStudent)}
        onClose={closeModal}
        title="Öğrenci Şifresi Sıfırla"
        titleIcon={<Key size={20} color="#C8952A" />}
        footer={
          actionSuccessMsg ? (
            <Button variant="primary" onClick={closeModal}>
              Tamam
            </Button>
          ) : (
            <>
              <Button variant="secondary" onClick={closeModal}>
                İptal
              </Button>
              <Button 
                variant="primary" 
                onClick={handleResetPasswordSubmit} 
                loading={actionLoading}
                disabled={!resetPwdInput}
              >
                Şifreyi Güncelle & Sıfırla
              </Button>
            </>
          )
        }
      >
        {selectedStudent && (
          <div>
            <div style={{ backgroundColor: "#F8FAFC", padding: "14px", borderRadius: "10px", border: "1px solid #E2E8F0", marginBottom: "16px" }}>
              <strong style={{ color: "#0F2645", fontSize: "15px", display: "block" }}>{selectedStudent.name}</strong>
              <div style={{ fontSize: "13px", color: "#64748B" }}>{selectedStudent.email}</div>
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
                    variant={copiedPwd ? "primary" : "secondary"}
                    onClick={() => {
                      navigator.clipboard.writeText(resetPwdInput);
                      setCopiedPwd(true);
                      setTimeout(() => setCopiedPwd(false), 2000);
                    }}
                  >
                    {copiedPwd ? "Kopyalandı ✓" : "Kopyala"}
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
                  showGenerateButton
                  onGeneratePassword={(newPwd) => setResetPwdInput(newPwd)}
                  helperText="Öğrenci bir sonraki girişinde bu şifreyi değiştirmeye zorlanacaktır."
                  required
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

