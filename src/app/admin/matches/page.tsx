"use client";

import React, { useState, useEffect } from "react";
import { 
  Link2, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle,
  GraduationCap,
  BookOpen
} from "lucide-react";
import { Button, Badge, Select, Input, Textarea, Modal, SearchFilterBar } from "@/components";

export const MATCH_SUBJECT_OPTIONS = [
  // --- TYT DERSLERİ ---
  { value: "TYT Matematik", label: "📘 TYT Matematik" },
  { value: "TYT Geometri", label: "📐 TYT Geometri" },
  { value: "TYT Türkçe", label: "📖 TYT Türkçe" },
  { value: "TYT Fizik", label: "⚡ TYT Fizik" },
  { value: "TYT Kimya", label: "🧪 TYT Kimya" },
  { value: "TYT Biyoloji", label: "🧬 TYT Biyoloji" },
  { value: "TYT Tarih", label: "🏛️ TYT Tarih" },
  { value: "TYT Coğrafya", label: "🌍 TYT Coğrafya" },
  { value: "TYT Felsefe & Din", label: "💭 TYT Felsefe & Din" },

  // --- AYT DERSLERİ ---
  { value: "AYT Matematik", label: "📚 AYT Matematik" },
  { value: "AYT Geometri", label: "📐 AYT Geometri" },
  { value: "AYT Fizik", label: "⚡ AYT Fizik" },
  { value: "AYT Kimya", label: "🧪 AYT Kimya" },
  { value: "AYT Biyoloji", label: "🧬 AYT Biyoloji" },
  { value: "AYT Edebiyat", label: "📜 AYT Türk Dili & Edebiyatı" },
  { value: "AYT Tarih", label: "🏛️ AYT Tarih" },
  { value: "AYT Coğrafya", label: "🌍 AYT Coğrafya" },
  { value: "AYT Felsefe Grubu", label: "💭 AYT Felsefe Grubu" },

  // --- YABANCI DİL ---
  { value: "İngilizce", label: "🇬🇧 İngilizce" },
  { value: "YDT İngilizce", label: "🇬🇧 YDT İngilizce" },

  // --- LGS DERSLERİ ---
  { value: "LGS Matematik", label: "🎯 LGS Matematik" },
  { value: "LGS Fen Bilimleri", label: "🎯 LGS Fen Bilimleri" },
  { value: "LGS Türkçe", label: "🎯 LGS Türkçe" },
  { value: "LGS T.C. İnkılap Tarihi", label: "🎯 LGS T.C. İnkılap Tarihi" },
  { value: "LGS İngilizce", label: "🎯 LGS İngilizce" },

  // --- DİĞER ---
  { value: "Diğer", label: "✨ Diğer / Özel Takviye" },
];

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

  // Create Match Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMatchStudentId, setNewMatchStudentId] = useState("");
  const [newMatchTeacherId, setNewMatchTeacherId] = useState("");
  const [newMatchType, setNewMatchType] = useState<"KOCLUK" | "OZEL_DERS">("OZEL_DERS");
  const [newMatchSubject, setNewMatchSubject] = useState("TYT Matematik");
  const [newMatchNotes, setNewMatchNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");
  const [actionErrorMsg, setActionErrorMsg] = useState("");

  // Selected student and teacher details
  const selectedStudent = students.find((s) => s.id === newMatchStudentId);
  const selectedTeacher = teachers.find((t) => t.id === newMatchTeacherId);

  // Active matches between selected pair
  const activeMatchesForPair = (newMatchStudentId && newMatchTeacherId)
    ? matches.filter((m) => m.studentId === newMatchStudentId && m.teacherId === newMatchTeacherId && m.status === "ACTIVE")
    : [];

  const activeSubjectsForPair = new Set(
    activeMatchesForPair.map((m) => (m.subject || "").trim().toLowerCase())
  );
  const hasActiveCoachingForPair = activeMatchesForPair.some((m) => m.type === "KOCLUK");

  // Dynamic subject options with already matched subjects marked and disabled
  const dynamicSubjectOptions = MATCH_SUBJECT_OPTIONS.map((opt) => {
    const isAssigned = activeSubjectsForPair.has(opt.value.trim().toLowerCase());
    return {
      value: opt.value,
      label: isAssigned ? `${opt.label} 🚫 (Zaten Eşleşti)` : opt.label,
      disabled: isAssigned,
    };
  });

  const availableSubjectOptions = dynamicSubjectOptions.filter((opt) => !opt.disabled);
  const allSubjectsAssigned = newMatchType === "OZEL_DERS" && availableSubjectOptions.length === 0 && Boolean(newMatchStudentId && newMatchTeacherId);
  const isCoachingBlocked = newMatchType === "KOCLUK" && hasActiveCoachingForPair;
  const isSubmitDisabled = !newMatchStudentId || !newMatchTeacherId || allSubjectsAssigned || isCoachingBlocked;

  // Auto-switch to first available subject if current subject is already assigned
  useEffect(() => {
    if (newMatchType === "OZEL_DERS" && newMatchStudentId && newMatchTeacherId) {
      const isCurrentDisabled = activeSubjectsForPair.has(newMatchSubject.trim().toLowerCase());
      if (isCurrentDisabled && availableSubjectOptions.length > 0) {
        setNewMatchSubject(availableSubjectOptions[0].value);
      }
    }
  }, [newMatchStudentId, newMatchTeacherId, newMatchType, matches]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [matchesRes, usersRes] = await Promise.all([
        fetch("/api/admin/matches"),
        fetch("/api/admin/users"),
      ]);

      const matchesData = await matchesRes.json();
      const usersData = await usersRes.json();

      if (matchesData.success) {
        setMatches(matchesData.matches || []);
      }
      if (usersData.success) {
        setStudents(usersData.students || []);
        setTeachers(usersData.teachers || []);
      }
    } catch (err) {
      console.error("Fetch matches error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateMatch = async () => {
    if (!newMatchStudentId || !newMatchTeacherId) {
      setActionErrorMsg("Lütfen bir öğrenci ve öğretmen seçiniz.");
      return;
    }

    if (newMatchType === "OZEL_DERS" && activeSubjectsForPair.has(newMatchSubject.trim().toLowerCase())) {
      setActionErrorMsg(`Bu öğrenci ve öğretmen arasında "${newMatchSubject}" dersi için zaten aktif bir eşleştirme bulunmaktadır.`);
      return;
    }

    if (newMatchType === "KOCLUK" && hasActiveCoachingForPair) {
      setActionErrorMsg("Bu öğrenci ve öğretmen arasında zaten aktif bir Eğitim Koçluğu eşleştirmesi bulunmaktadır.");
      return;
    }

    setActionLoading(true);
    setActionErrorMsg("");
    setActionSuccessMsg("");

    try {
      const res = await fetch("/api/admin/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: newMatchStudentId,
          teacherId: newMatchTeacherId,
          type: newMatchType,
          subject: newMatchType === "KOCLUK" ? (newMatchSubject || "Eğitim Koçluğu") : newMatchSubject,
          notes: newMatchNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setActionErrorMsg(data.error || "Eşleştirme oluşturulamadı.");
        setActionLoading(false);
        return;
      }

      setActionSuccessMsg("Eşleştirme başarıyla tamamlandı!");
      fetchData();
      setNewMatchStudentId("");
      setNewMatchTeacherId("");
      setNewMatchNotes("");
      setTimeout(() => {
        setIsModalOpen(false);
        setActionSuccessMsg("");
      }, 1500);
    } catch (err) {
      console.error(err);
      setActionErrorMsg("Bağlantı hatası oluştu.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMatch = async (matchId: string, studentName: string, teacherName: string, subject: string) => {
    if (!confirm(`"${studentName}" ile "${teacherName}" arasındaki "${subject}" eşleştirmesini silmek istediğinize emin misiniz?`)) return;

    try {
      const res = await fetch(`/api/admin/matches?matchId=${matchId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        setMatches(prev => prev.filter(m => m.id !== matchId));
      } else {
        alert(data.error || "Eşleştirme silinemedi.");
      }
    } catch (err) {
      console.error(err);
      alert("Bağlantı hatası oluştu.");
    }
  };

  const filteredMatches = matches
    .filter(m => {
      const studentName = m.student?.name?.toLowerCase() || "";
      const teacherName = m.teacher?.name?.toLowerCase() || "";
      const subject = m.subject?.toLowerCase() || "";
      const matchesSearch = 
        studentName.includes(searchQuery.toLowerCase()) ||
        teacherName.includes(searchQuery.toLowerCase()) ||
        subject.includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (typeFilter === "ALL") return true;
      return m.type === typeFilter;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return 0;
    });

  return (
    <div>
      {/* Search & Filter Bar */}
      <SearchFilterBar
        title="Öğrenci - Öğretmen Eşleştirmeleri"
        subtitle="Eğitim koçluğu ve branş bazlı özel ders atamaları (Matematik, Fizik, İngilizce vb. her ders için bağımsız öğretmen atanabilir)"
        titleIcon={<Link2 size={22} color="#C8952A" />}
        searchPlaceholder="Öğrenci, öğretmen veya ders ara..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filterLabel="Tür"
        filterValue={typeFilter}
        onFilterChange={setTypeFilter}
        filterOptions={[
          { value: "ALL", label: `Tümü (${matches.length})` },
          { value: "KOCLUK", label: `🎓 Eğitim Koçluğu (${matches.filter(m => m.type === "KOCLUK").length})` },
          { value: "OZEL_DERS", label: `📚 Özel Ders (${matches.filter(m => m.type === "OZEL_DERS").length})` },
        ]}
        sortValue={sortBy}
        onSortChange={(val) => setSortBy(val as any)}
        sortOptions={[
          { value: "newest", label: "En Yeni" },
          { value: "oldest", label: "En Eski" },
        ]}
        extraActions={
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => { setActionSuccessMsg(""); setActionErrorMsg(""); setIsModalOpen(true); }}
          >
            Yeni Eşleştirme Yap
          </Button>
        }
      />

      {/* Table */}
      <div className="admin-table-container">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#475569" }}>
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>Öğrenci</th>
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>Öğretmen / Koç</th>
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>Eşleştirme Türü</th>
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>Atanan Ders / Branş</th>
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>Tarih</th>
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
              ) : filteredMatches.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "40px 16px", textAlign: "center", color: "#94A3B8" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                      <Link2 size={32} color="#CBD5E1" />
                      <span style={{ fontSize: "14px", fontWeight: "600" }}>Henüz eşleştirme bulunamadı.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredMatches.map((m) => (
                  <tr key={m.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ fontWeight: "700", color: "#0F2645" }}>{m.student?.name || "Bilinmiyor"}</div>
                      <div style={{ fontSize: "12px", color: "#64748B" }}>
                        {m.student?.email} {m.student?.studentProfile?.phone ? `• ${m.student.studentProfile.phone}` : ""}
                      </div>
                      {(m.student?.studentProfile?.currentDistrict || m.student?.studentProfile?.city) && (
                        <div style={{ fontSize: "11px", color: "#059669", fontWeight: "600", marginTop: "2px" }}>
                          📍 {m.student.studentProfile.currentDistrict} {m.student.studentProfile.city ? `(${m.student.studentProfile.city})` : ""}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ fontWeight: "700", color: "#0F2645" }}>{m.teacher?.name || "Bilinmiyor"}</div>
                      <div style={{ fontSize: "12px", color: "#64748B" }}>
                        {m.teacher?.email} {m.teacher?.teacherProfile?.school ? `• ${m.teacher.teacherProfile.school}` : ""}
                      </div>
                      {(m.teacher?.teacherProfile?.currentDistrict || m.teacher?.teacherProfile?.districts) && (
                        <div style={{ fontSize: "11px", color: "#2563EB", fontWeight: "600", marginTop: "2px" }}>
                          📍 {m.teacher.teacherProfile.currentDistrict || "İstanbul"} {m.teacher.teacherProfile.districts ? `• 🗺️ ${m.teacher.teacherProfile.districts}` : ""}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <Badge variant={m.type as any} />
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <span style={{
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "700",
                        backgroundColor: "#EFF6FF",
                        color: "#1D4ED8",
                        border: "1px solid #BFDBFE",
                        display: "inline-block"
                      }}>
                        {m.subject || (m.type === "KOCLUK" ? "Eğitim Koçluğu" : "Genel Özel Ders")}
                      </span>
                      {m.notes && (
                        <div style={{ fontSize: "11px", color: "#64748B", marginTop: "4px", fontStyle: "italic" }}>
                          Not: {m.notes}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "14px 18px", fontSize: "12px", color: "#64748B" }}>
                      {new Date(m.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                    <td style={{ padding: "14px 18px", textAlign: "right" }}>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<Trash2 size={13} />}
                        onClick={() => handleDeleteMatch(m.id, m.student?.name || "Öğrenci", m.teacher?.name || "Öğretmen", m.subject || "Eşleştirme")}
                      >
                        Eşleştirmeyi Sil
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Match Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Yeni Öğrenci - Öğretmen Eşleştirmesi"
        titleIcon={<Link2 size={20} color="#C8952A" />}
        footer={
          actionSuccessMsg ? null : (
            <>
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                İptal
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateMatch}
                loading={actionLoading}
                disabled={isSubmitDisabled}
              >
                Eşleştirmeyi Kaydet
              </Button>
            </>
          )
        }
      >
        <div>
          {actionSuccessMsg ? (
            <div style={{ backgroundColor: "#DCFCE7", border: "1px solid #86EFAC", color: "#15803D", padding: "16px", borderRadius: "8px", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Check size={18} /> {actionSuccessMsg}
            </div>
          ) : (
            <div>
              {actionErrorMsg && (
                <div style={{ backgroundColor: "#FEE2E2", border: "1px solid #FCA5A5", color: "#B91C1C", padding: "12px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
                  <AlertCircle size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
                  {actionErrorMsg}
                </div>
              )}

              {/* 1. Eşleştirme Türü */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#0F2645", marginBottom: "6px" }}>
                  Eşleştirme Türü
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <Button
                    type="button"
                    variant={newMatchType === "OZEL_DERS" ? "primary" : "outline"}
                    icon={<BookOpen size={16} />}
                    onClick={() => { setNewMatchType("OZEL_DERS"); setNewMatchSubject("TYT Matematik"); }}
                    style={{ justifyContent: "center" }}
                  >
                    Branş Özel Ders
                  </Button>
                  <Button
                    type="button"
                    variant={newMatchType === "KOCLUK" ? "primary" : "outline"}
                    icon={<GraduationCap size={16} />}
                    onClick={() => { setNewMatchType("KOCLUK"); setNewMatchSubject("Eğitim Koçluğu"); }}
                    style={{ justifyContent: "center" }}
                  >
                    Eğitim Koçluğu
                  </Button>
                </div>
              </div>

              {/* 2. Öğrenci Seçimi */}
              <Select
                label="Öğrenci Seçiniz"
                value={newMatchStudentId}
                onChange={(e) => setNewMatchStudentId(e.target.value)}
                options={[
                  { value: "", label: `-- Öğrenci Seçin (${students.length} Kayıtlı Öğrenci) --` },
                  ...students.map((s) => ({
                    value: s.id,
                    label: `${s.name} (${s.email}) ${s.studentProfile?.grade ? `- ${s.studentProfile.grade}` : ""}`
                  }))
                ]}
                required
              />

              {/* Öğrenci Detay Bilgisi */}
              {selectedStudent && (
                <div style={{ fontSize: "12px", color: "#475569", marginTop: "-8px", marginBottom: "16px", backgroundColor: "#F8FAFC", padding: "8px 12px", borderRadius: "6px", border: "1px solid #E2E8F0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>🎯 <strong>Öğrenci:</strong> {selectedStudent.studentProfile?.grade || "Sınıf Belirtilmemiş"} {selectedStudent.studentProfile?.scoreType ? `• Alan: ${selectedStudent.studentProfile.scoreType}` : ""}</span>
                    {(selectedStudent.studentProfile?.currentDistrict || selectedStudent.studentProfile?.city) && (
                      <span style={{ color: "#059669", fontWeight: "700" }}>
                        📍 {selectedStudent.studentProfile.currentDistrict} {selectedStudent.studentProfile.city ? `(${selectedStudent.studentProfile.city})` : ""}
                      </span>
                    )}
                  </div>
                  {selectedStudent.studentProfile?.selectedSubjects && (
                    <div style={{ marginTop: "4px", color: "#1D4ED8", fontWeight: "600" }}>
                      📝 Talep Ettiği Dersler: {selectedStudent.studentProfile.selectedSubjects}
                    </div>
                  )}
                </div>
              )}

              {/* 3. Öğretmen Seçimi */}
              <Select
                label="Öğretmen / Koç Seçiniz"
                value={newMatchTeacherId}
                onChange={(e) => setNewMatchTeacherId(e.target.value)}
                options={[
                  { value: "", label: `-- Öğretmen Seçin (${teachers.length} Kayıtlı Eğitmen) --` },
                  ...teachers.map((t) => ({
                    value: t.id,
                    label: `${t.name} (${t.email}) ${t.teacherProfile?.school ? `- ${t.teacherProfile.school}` : ""}`
                  }))
                ]}
                required
              />

              {/* Öğretmen Detay ve Konum Bilgisi */}
              {selectedTeacher && (
                <div style={{ fontSize: "12px", color: "#475569", marginTop: "-8px", marginBottom: "16px", backgroundColor: "#F8FAFC", padding: "8px 12px", borderRadius: "6px", border: "1px solid #E2E8F0" }}>
                  <div style={{ color: "#1E293B", fontWeight: "600" }}>
                    🏫 <strong>Üniversite / Bölüm:</strong> {selectedTeacher.teacherProfile?.school || "Belirtilmedi"}
                  </div>
                  {(selectedTeacher.teacherProfile?.currentDistrict || selectedTeacher.teacherProfile?.districts) && (
                    <div style={{ marginTop: "4px", color: "#2563EB", fontWeight: "600" }}>
                      📍 <strong>İkamet:</strong> {selectedTeacher.teacherProfile.currentDistrict || "İstanbul"} 
                      {selectedTeacher.teacherProfile.districts ? ` • 🗺️ Ders Bölgeleri: ${selectedTeacher.teacherProfile.districts}` : ""}
                    </div>
                  )}
                </div>
              )}

              {/* İkili Arasındaki Mevcut Eşleştirmeler Özeti */}
              {newMatchStudentId && newMatchTeacherId && activeMatchesForPair.length > 0 && (
                <div style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "8px", padding: "10px 12px", marginBottom: "16px" }}>
                  <div style={{ fontSize: "12px", fontWeight: "700", color: "#166534", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Link2 size={14} /> Bu İkili Arasındaki Mevcut Aktif Eşleştirmeler ({activeMatchesForPair.length})
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {activeMatchesForPair.map((m) => (
                      <span key={m.id} style={{ fontSize: "11px", fontWeight: "700", backgroundColor: "#DCFCE7", color: "#15803D", padding: "3px 8px", borderRadius: "6px", border: "1px solid #86EFAC" }}>
                        {m.type === "KOCLUK" ? "🎓 Koçluk" : "📚"} {m.subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Koçluk Zaten Varsa Uyarı */}
              {isCoachingBlocked && (
                <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA", color: "#991B1B", padding: "10px 12px", borderRadius: "8px", fontSize: "12px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <AlertCircle size={16} />
                  <span>Bu öğrenci ve öğretmen arasında zaten aktif bir <strong>Eğitim Koçluğu</strong> bulunmaktadır. Tekrar koçluk eşleştirmesi yapılamaz.</span>
                </div>
              )}

              {/* Tüm Branşlar Doluysa Uyarı */}
              {allSubjectsAssigned && (
                <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA", color: "#991B1B", padding: "10px 12px", borderRadius: "8px", fontSize: "12px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <AlertCircle size={16} />
                  <span>Bu öğrenci ve öğretmen arasında listelenen tüm branşlar için aktif eşleştirme bulunmaktadır.</span>
                </div>
              )}

              {/* 4. Branş / Ders Adı */}
              {newMatchType === "OZEL_DERS" ? (
                <Select
                  label="Ders / Branş Seçiniz (TYT / AYT / Dil)"
                  value={newMatchSubject}
                  onChange={(e) => setNewMatchSubject(e.target.value)}
                  options={dynamicSubjectOptions}
                  required
                />
              ) : (
                <Input
                  label="Koçluk Program Türü"
                  value={newMatchSubject}
                  onChange={(e) => setNewMatchSubject(e.target.value)}
                  placeholder="Örn: YKS Sayısal Koçluğu / LGS Takip"
                  disabled={isCoachingBlocked}
                  required
                />
              )}

              {/* 5. Yönetici Notu */}
              <Textarea
                label="Yönetici Notu (Opsiyonel)"
                rows={2}
                value={newMatchNotes}
                onChange={(e) => setNewMatchNotes(e.target.value)}
                placeholder="Eşleştirme detayları, ders saati veya özel notlar..."
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

