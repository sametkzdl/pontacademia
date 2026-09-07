"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Key, 
  Power, 
  Check, 
  AlertCircle,
  Eye,
  BookOpen,
  Target,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Link2,
  Calendar,
  UserCheck
} from "lucide-react";
import { Button, Badge, PasswordInput, Modal, SearchFilterBar, Avatar, SubjectTagSlider } from "@/components";

export default function StudentsListPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name_asc" | "name_desc" | "status">("newest");

  // Modals
  const [modalType, setModalType] = useState<"reset_password" | "student_detail" | null>(null);
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

  const getStudentSubjects = (s: any): string[] => {
    const raw = s.studentProfile?.selectedSubjects || s.studentProfile?.subject || "";
    if (!raw || !raw.trim()) return [];
    return raw.split(",").map((item: string) => item.trim()).filter(Boolean);
  };

  const filteredStudents = students
    .filter(s => {
      const subjectsStr = (s.studentProfile?.selectedSubjects || s.studentProfile?.subject || "").toLowerCase();
      const targetStr = (s.studentProfile?.target || "").toLowerCase();
      const cityStr = (s.studentProfile?.city || s.studentProfile?.currentDistrict || "").toLowerCase();
      const matchesSearch = 
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subjectsStr.includes(searchQuery.toLowerCase()) ||
        targetStr.includes(searchQuery.toLowerCase()) ||
        cityStr.includes(searchQuery.toLowerCase());
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
        subtitle="Sistemde hesabı tanımlı olan öğrencilerin tam listesi, ders talepleri ve profil yönetimi"
        titleIcon={<Users size={22} color="#C8952A" />}
        searchPlaceholder="İsim, e-posta, ders veya hedef ara..."
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
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>Öğrenci Adı & İletişim</th>
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>Sınıf & İlçe</th>
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>Almak İstediği Dersler</th>
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>Hedeflenen Bölüm</th>
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>Eşleşmeler</th>
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>Durum</th>
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
                filteredStudents.map((s) => {
                  const subjects = getStudentSubjects(s);
                  const matchesCount = s.studentMatches?.length || 0;

                  return (
                    <tr key={s.id} style={{ borderBottom: "1px solid #F1F5F9", opacity: s.isActive === false ? 0.6 : 1 }}>
                      {/* Öğrenci Bilgisi */}
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <Avatar
                            src={s.studentProfile?.photoUrl}
                            name={s.name}
                            size={40}
                            showBorder
                            style={{ boxShadow: "0 2px 6px rgba(15, 38, 69, 0.12)", cursor: "pointer" }}
                            onClick={() => {
                              setSelectedStudent(s);
                              setModalType("student_detail");
                            }}
                          />
                          <div>
                            <div 
                              style={{ fontWeight: "700", color: "#0F2645", cursor: "pointer" }}
                              onClick={() => {
                                setSelectedStudent(s);
                                setModalType("student_detail");
                              }}
                            >
                              {s.name}
                            </div>
                            <div style={{ fontSize: "12px", color: "#64748B" }}>{s.email}</div>
                            {s.studentProfile?.phone && (
                              <div style={{ fontSize: "11px", color: "#94A3B8" }}>📞 {s.studentProfile.phone}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Sınıf & İlçe */}
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ fontWeight: "700", color: "#0F2645" }}>
                          {s.studentProfile?.grade || "Sınıf Belirtilmedi"}
                        </div>
                        <div style={{ fontSize: "12px", color: "#059669", fontWeight: "600", marginTop: "2px" }}>
                          📍 {s.studentProfile?.currentDistrict || s.studentProfile?.city || "İstanbul"}
                        </div>
                        {s.studentProfile?.scoreType && (
                          <span style={{ fontSize: "10px", fontWeight: "800", backgroundColor: "#FEF3C7", color: "#92400E", padding: "1px 6px", borderRadius: "10px", marginTop: "4px", display: "inline-block" }}>
                            {s.studentProfile.scoreType}
                          </span>
                        )}
                      </td>

                      {/* Almak İstediği Dersler (Slider) */}
                      <td style={{ padding: "14px 18px", maxWidth: "260px" }}>
                        <SubjectTagSlider 
                          subjects={s.studentProfile?.selectedSubjects || s.studentProfile?.subject} 
                          target={s.studentProfile?.target}
                          maxWidth="250px"
                        />
                      </td>

                      {/* Hedef / Üniversite */}
                      <td style={{ padding: "14px 18px", maxWidth: "200px" }}>
                        <div style={{ fontSize: "13px", fontWeight: "600", color: "#C8952A" }}>
                          {s.studentProfile?.target || "Genel Takviye / Koçluk"}
                        </div>
                      </td>

                      {/* Aktif Eşleşmeler */}
                      <td style={{ padding: "14px 18px" }}>
                        {matchesCount > 0 ? (
                          <span style={{ fontSize: "12px", fontWeight: "700", backgroundColor: "#DCFCE7", color: "#15803D", padding: "3px 8px", borderRadius: "12px", border: "1px solid #86EFAC" }}>
                            🔗 {matchesCount} Eğitmen
                          </span>
                        ) : (
                          <span style={{ fontSize: "12px", color: "#94A3B8" }}>Eşleşme Yok</span>
                        )}
                      </td>

                      {/* Durum */}
                      <td style={{ padding: "14px 18px" }}>
                        <Badge variant={s.isActive !== false ? "ACTIVE" : "PASSIVE"} />
                      </td>

                      {/* İşlemler */}
                      <td style={{ padding: "14px 18px", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: "6px" }}>
                          <Button
                            variant="primary"
                            size="sm"
                            icon={<Eye size={13} />}
                            onClick={() => {
                              setSelectedStudent(s);
                              setModalType("student_detail");
                            }}
                          >
                            Detay
                          </Button>

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
                            Şifre
                          </Button>

                          <Button
                            variant={s.isActive !== false ? "secondary" : "outline"}
                            size="sm"
                            icon={<Power size={13} />}
                            onClick={() => handleToggleUserStatus(s.id, s.isActive !== false, s.name)}
                          >
                            {s.isActive !== false ? "Dondur" : "Aktif"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Comprehensive Detail Modal */}
      <Modal
        isOpen={modalType === "student_detail" && Boolean(selectedStudent)}
        onClose={closeModal}
        title="Öğrenci Profil & Ders Talebi Detayları"
        titleIcon={<GraduationCap size={20} color="#C8952A" />}
        footer={
          <Button variant="primary" onClick={closeModal}>
            Kapat
          </Button>
        }
      >
        {selectedStudent && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Header Profil Banner */}
            <div style={{
              backgroundColor: "#F8FAFC",
              borderRadius: "12px",
              border: "1px solid #E2E8F0",
              padding: "20px",
              display: "flex",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap"
            }}>
              <Avatar
                src={selectedStudent.studentProfile?.photoUrl}
                name={selectedStudent.name}
                size={70}
                showBorder
                style={{ border: "2px solid #C8952A" }}
              />
              <div style={{ flex: 1, minWidth: "220px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "4px" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0F2645", margin: 0 }}>
                    {selectedStudent.name}
                  </h3>
                  <Badge variant={selectedStudent.isActive !== false ? "ACTIVE" : "PASSIVE"} />
                </div>
                <div style={{ fontSize: "13px", color: "#64748B", display: "flex", flexWrap: "wrap", gap: "12px" }}>
                  <span>📧 {selectedStudent.email}</span>
                  {selectedStudent.studentProfile?.phone && (
                    <span>📞 {selectedStudent.studentProfile.phone}</span>
                  )}
                  <span>📅 Kayıt: {new Date(selectedStudent.createdAt).toLocaleDateString("tr-TR")}</span>
                </div>
              </div>
            </div>

            {/* Grid: Hedef & İletişim Bilgileri */}
            <div className="admin-grid-2col">
              {/* Kart 1: Hedef & Akademik Durum */}
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", border: "1px solid #E2E8F0", padding: "16px" }}>
                <div style={{ fontSize: "14px", fontWeight: "800", color: "#0F2645", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px", borderBottom: "1px solid #F1F5F9", paddingBottom: "8px" }}>
                  <Target size={16} color="#C8952A" /> Hedef & Akademik Durum
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "#64748B", fontWeight: "700", display: "block" }}>Sınıf / Seviye</span>
                    <strong style={{ color: "#0F2645" }}>{selectedStudent.studentProfile?.grade || "Belirtilmedi"}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "#64748B", fontWeight: "700", display: "block" }}>Alan / Puan Türü</span>
                    <strong style={{ color: "#0F2645" }}>{selectedStudent.studentProfile?.scoreType || "Genel"}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "#64748B", fontWeight: "700", display: "block" }}>Hedeflenen Bölüm / Üniversite</span>
                    <strong style={{ color: "#C8952A" }}>{selectedStudent.studentProfile?.target || "Belirtilmedi"}</strong>
                  </div>
                </div>
              </div>

              {/* Kart 2: İletişim & Konum Bilgileri */}
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", border: "1px solid #E2E8F0", padding: "16px" }}>
                <div style={{ fontSize: "14px", fontWeight: "800", color: "#0F2645", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px", borderBottom: "1px solid #F1F5F9", paddingBottom: "8px" }}>
                  <MapPin size={16} color="#C8952A" /> İletişim & Konum
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "#64748B", fontWeight: "700", display: "block" }}>İkamet Edilen İlçe / Şehir</span>
                    <strong style={{ color: "#0F2645" }}>
                      📍 {selectedStudent.studentProfile?.currentDistrict || selectedStudent.studentProfile?.city || "İstanbul"}
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "#64748B", fontWeight: "700", display: "block" }}>Açık Adres / Mahalle</span>
                    <strong style={{ color: "#0F2645" }}>{selectedStudent.studentProfile?.currentAddress || "Belirtilmedi"}</strong>
                  </div>
                  {(selectedStudent.studentProfile?.parentName || selectedStudent.studentProfile?.parentPhone) && (
                    <div>
                      <span style={{ fontSize: "11px", color: "#64748B", fontWeight: "700", display: "block" }}>Veli Bilgisi</span>
                      <strong style={{ color: "#0F2645" }}>
                        {selectedStudent.studentProfile?.parentName || "Veli Adı Yok"} {selectedStudent.studentProfile?.parentPhone ? `(${selectedStudent.studentProfile.parentPhone})` : ""}
                      </strong>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Kart 3: Almak İstediği Dersler */}
            <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", border: "1px solid #E2E8F0", padding: "16px" }}>
              <div style={{ fontSize: "14px", fontWeight: "800", color: "#0F2645", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px", borderBottom: "1px solid #F1F5F9", paddingBottom: "8px" }}>
                <BookOpen size={16} color="#C8952A" /> Almak İstediği Dersler & Destek Talepleri
              </div>

              {getStudentSubjects(selectedStudent).length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {getStudentSubjects(selectedStudent).map((sub, idx) => {
                    const match = selectedStudent.studentMatches?.find((m: any) => 
                      (m.subject || "").toLowerCase().includes(sub.toLowerCase()) || sub.toLowerCase().includes((m.subject || "").toLowerCase())
                    );

                    return (
                      <div
                        key={idx}
                        style={{
                          padding: "8px 14px",
                          borderRadius: "10px",
                          backgroundColor: match ? "#DCFCE7" : "#EFF6FF",
                          border: match ? "1px solid #86EFAC" : "1px solid #BFDBFE",
                          display: "flex",
                          flexDirection: "column",
                          gap: "2px"
                        }}
                      >
                        <span style={{ fontSize: "13px", fontWeight: "800", color: match ? "#166534" : "#1D4ED8" }}>
                          📘 {sub}
                        </span>
                        <span style={{ fontSize: "11px", fontWeight: "600", color: match ? "#15803D" : "#64748B" }}>
                          {match ? `✓ Eşleşti: ${match.teacher?.name}` : "⏳ Eğitmen Ataması Bekliyor"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: "16px", textAlign: "center", color: "#94A3B8", fontSize: "13px" }}>
                  Öğrenci henüz belirli bir ders talebi kaydetmedi.
                </div>
              )}
            </div>

            {/* Kart 4: Aktif Eşleşen Eğitmenler */}
            {selectedStudent.studentMatches && selectedStudent.studentMatches.length > 0 && (
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", border: "1px solid #E2E8F0", padding: "16px" }}>
                <div style={{ fontSize: "14px", fontWeight: "800", color: "#0F2645", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px", borderBottom: "1px solid #F1F5F9", paddingBottom: "8px" }}>
                  <Link2 size={16} color="#C8952A" /> Atanan Eğitmenler ({selectedStudent.studentMatches.length})
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {selectedStudent.studentMatches.map((m: any) => (
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
                        <strong style={{ color: "#0F2645" }}>{m.teacher?.name}</strong>
                        <div style={{ fontSize: "12px", color: "#64748B" }}>
                          {m.type === "KOCLUK" ? "🎓 Eğitim Koçluğu" : "📚 Özel Ders"}: <strong>{m.subject}</strong>
                        </div>
                      </div>
                      <div style={{ textAlign: "right", fontSize: "12px", color: "#059669", fontWeight: "700" }}>
                        📍 {m.teacher?.teacherProfile?.currentDistrict || "İstanbul"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

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

