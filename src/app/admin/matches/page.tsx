"use client";

import React, { useState, useEffect } from "react";
import { 
  Link2, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle,
  GraduationCap,
  BookOpen,
  Edit3,
  UserCheck,
  RefreshCw,
  PowerOff,
  Play,
  Pause
} from "lucide-react";
import { Button, Badge, Select, Input, Textarea, Modal, SearchFilterBar } from "@/components";
import { MATCH_SUBJECT_OPTIONS } from "@/constants";
export { MATCH_SUBJECT_OPTIONS };

export default function MatchesPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
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

  // Edit Match (Teacher Change) Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<any>(null);
  const [editTeacherId, setEditTeacherId] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editActionLoading, setEditActionLoading] = useState(false);
  const [editActionSuccessMsg, setEditActionSuccessMsg] = useState("");
  const [editActionErrorMsg, setEditActionErrorMsg] = useState("");

  // Student specific match status
  const [studentStatus, setStudentStatus] = useState<{
    requestedSubjects: string[];
    matchedSubjects: Array<{ id: string; type: string; subject: string; teacherName: string; teacherId: string }>;
    matchedRequestedSubjects: Array<{ subject: string; teacherName: string }>;
    unmatchedSubjects: string[];
    hasActiveCoaching: boolean;
  } | null>(null);
  const [loadingStudentStatus, setLoadingStudentStatus] = useState(false);

  // Selected student and teacher details
  const selectedStudent = students.find((s) => s.id === newMatchStudentId);
  const selectedTeacher = teachers.find((t) => t.id === newMatchTeacherId);

  // Edit modal selected teacher & conflict check
  const editSelectedTeacher = teachers.find((t) => t.id === editTeacherId);
  const isEditTeacherConflicting = Boolean(
    editingMatch &&
    editTeacherId &&
    editTeacherId !== editingMatch.teacherId &&
    matches.some(
      (m) =>
        m.id !== editingMatch.id &&
        m.studentId === editingMatch.studentId &&
        m.teacherId === editTeacherId &&
        m.type === editingMatch.type &&
        (editingMatch.type === "KOCLUK" || (m.subject || "").trim().toLowerCase() === (editingMatch.subject || "").trim().toLowerCase()) &&
        m.status === "ACTIVE"
    )
  );

  // Pending lessons check for the match being edited
  const pendingLessonsForEdit = editingMatch
    ? (editingMatch.lessons || []).filter(
        (l: any) => l.status === "PENDING_APPROVAL" || l.status === "SCHEDULED"
      )
    : [];
  const hasPendingLessons = pendingLessonsForEdit.length > 0;
  const isTeacherChanged = Boolean(editingMatch && editTeacherId && editTeacherId !== editingMatch.teacherId);
  const isEditBlockedByPendingLessons = isTeacherChanged && hasPendingLessons;

  // Normalization helper
  const normalize = (str: string) => (str || "").toLowerCase().replace(/[^a-z0-9ğüşıöç]/g, "");

  // Active matches between selected pair
  const activeMatchesForPair = (newMatchStudentId && newMatchTeacherId)
    ? matches.filter((m) => m.studentId === newMatchStudentId && m.teacherId === newMatchTeacherId && m.status === "ACTIVE")
    : [];

  const activeSubjectsForPair = new Set(
    activeMatchesForPair.map((m) => (m.subject || "").trim().toLowerCase())
  );
  const hasActiveCoachingForPair = activeMatchesForPair.some((m) => m.type === "KOCLUK");

  // Fetch student match status from server when student is selected
  useEffect(() => {
    if (!newMatchStudentId) {
      setStudentStatus(null);
      return;
    }

    const fetchStudentStatus = async () => {
      setLoadingStudentStatus(true);
      try {
        const res = await fetch(`/api/admin/matches?studentId=${newMatchStudentId}`);
        const data = await res.json();
        if (data.success && data.requestedSubjects) {
          setStudentStatus(data);

          // Auto-select first unmatched subject
          if (newMatchType === "OZEL_DERS") {
            const nonCoachingUnmatched = (data.unmatchedSubjects || []).filter(
              (s: string) => !s.toLowerCase().includes("koçluk") && !s.toLowerCase().includes("kocluk")
            );
            if (nonCoachingUnmatched.length > 0) {
              setNewMatchSubject(nonCoachingUnmatched[0]);
            }
          } else if (newMatchType === "KOCLUK") {
            const coachingReq = (data.requestedSubjects || []).find(
              (s: string) => s.toLowerCase().includes("koçluk") || s.toLowerCase().includes("kocluk")
            );
            if (coachingReq) {
              setNewMatchSubject(coachingReq);
            }
          }
        }
      } catch (err) {
        console.error("Student status fetch error:", err);
      } finally {
        setLoadingStudentStatus(false);
      }
    };

    fetchStudentStatus();
  }, [newMatchStudentId]);

  // Dynamic subject options with student's requested unmatched subjects prioritized at the top
  const dynamicSubjectOptions = React.useMemo(() => {
    if (!selectedStudent) {
      return MATCH_SUBJECT_OPTIONS.map((opt) => {
        const isAssigned = activeSubjectsForPair.has(opt.value.trim().toLowerCase());
        return {
          value: opt.value,
          label: isAssigned ? `${opt.label} 🚫 (Bu Öğretmenle Zaten Eşleşti)` : opt.label,
          disabled: isAssigned,
        };
      });
    }

    const options: Array<{ value: string; label: string; disabled?: boolean }> = [];

    // 1. Öğrencinin talep ettiği dersler (Eşleşmemiş olanlar üstte)
    const unmatchedReqList = (studentStatus?.unmatchedSubjects || []).filter(
      (s: string) => !s.toLowerCase().includes("koçluk") && !s.toLowerCase().includes("kocluk")
    );
    const matchedReqList = (studentStatus?.matchedRequestedSubjects || []).filter(
      (m) => !m.subject.toLowerCase().includes("koçluk") && !m.subject.toLowerCase().includes("kocluk")
    );

    if (unmatchedReqList.length > 0) {
      unmatchedReqList.forEach((sub) => {
        const isAssignedToThisTeacher = activeSubjectsForPair.has(sub.trim().toLowerCase());
        options.push({
          value: sub,
          label: isAssignedToThisTeacher
            ? `🎯 ${sub} (Öğrencinin Talebi) 🚫 (Bu Öğretmenle Eşleşti)`
            : `🎯 ${sub} (Öğrencinin Talebi - Eşleşme Bekliyor)`,
          disabled: isAssignedToThisTeacher,
        });
      });
    }

    if (matchedReqList.length > 0) {
      matchedReqList.forEach((item) => {
        options.push({
          value: item.subject,
          label: `🚫 ${item.subject} (Öğrencinin Talebi - Eşleşti: ${item.teacherName})`,
          disabled: true,
        });
      });
    }

    // 2. Diğer tüm standart branşlar
    const allReqNormSet = new Set(
      (studentStatus?.requestedSubjects || []).map((s) => normalize(s))
    );

    const otherOptions = MATCH_SUBJECT_OPTIONS.filter((opt) => {
      const normOpt = normalize(opt.value);
      return !allReqNormSet.has(normOpt);
    }).map((opt) => {
      const isAssigned = activeSubjectsForPair.has(opt.value.trim().toLowerCase());
      return {
        value: opt.value,
        label: isAssigned ? `${opt.label} 🚫 (Bu Öğretmenle Eşleşti)` : opt.label,
        disabled: isAssigned,
      };
    });

    if (options.length > 0 && otherOptions.length > 0) {
      options.push({
        value: "---",
        label: "────────── Diğer Tüm Branşlar ──────────",
        disabled: true,
      });
    }

    options.push(...otherOptions);
    return options;
  }, [selectedStudent, studentStatus, activeSubjectsForPair]);

  const availableSubjectOptions = dynamicSubjectOptions.filter((opt) => !opt.disabled && opt.value !== "---");
  const allSubjectsAssigned = newMatchType === "OZEL_DERS" && availableSubjectOptions.length === 0 && Boolean(newMatchStudentId && newMatchTeacherId);
  const isCoachingBlocked = newMatchType === "KOCLUK" && hasActiveCoachingForPair;
  const isSubmitDisabled = !newMatchStudentId || !newMatchTeacherId || allSubjectsAssigned || isCoachingBlocked;

  // Auto-switch to first available subject if current subject is disabled or already assigned
  useEffect(() => {
    if (newMatchType === "OZEL_DERS" && newMatchStudentId && newMatchTeacherId) {
      const isCurrentDisabled = activeSubjectsForPair.has(newMatchSubject.trim().toLowerCase());
      if (isCurrentDisabled && availableSubjectOptions.length > 0) {
        setNewMatchSubject(availableSubjectOptions[0].value);
      }
    }
  }, [newMatchStudentId, newMatchTeacherId, newMatchType, dynamicSubjectOptions]);

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

  const openEditModal = (match: any) => {
    setEditingMatch(match);
    setEditTeacherId(match.teacherId || "");
    setEditNotes(match.notes || "");
    setEditActionErrorMsg("");
    setEditActionSuccessMsg("");
    setIsEditModalOpen(true);
  };

  const handleUpdateMatch = async () => {
    if (!editingMatch || !editTeacherId) {
      setEditActionErrorMsg("Lütfen bir öğretmen / koç seçiniz.");
      return;
    }

    if (isEditBlockedByPendingLessons) {
      setEditActionErrorMsg(
        `Bu öğrenci ve öğretmen arasında henüz işlenmemiş ${pendingLessonsForEdit.length} adet planlı/onay bekleyen ders bulunmaktadır. Eğitmeni değiştirmeden önce mevcut derslerin tamamlanması veya iptal edilmesi gerekmektedir.`
      );
      return;
    }

    if (isEditTeacherConflicting) {
      setEditActionErrorMsg("Seçilen eğitmen ile bu öğrenci arasında bu ders için zaten aktif bir eşleştirme bulunmaktadır.");
      return;
    }

    setEditActionLoading(true);
    setEditActionErrorMsg("");
    setEditActionSuccessMsg("");

    try {
      const res = await fetch("/api/admin/matches", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: editingMatch.id,
          teacherId: editTeacherId,
          notes: editNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setEditActionErrorMsg(data.error || "Eşleştirme güncellenemedi.");
        setEditActionLoading(false);
        return;
      }

      setEditActionSuccessMsg("Eğitmen ve eşleştirme bilgileri başarıyla güncellendi!");
      fetchData();
      setTimeout(() => {
        setIsEditModalOpen(false);
        setEditingMatch(null);
        setEditActionSuccessMsg("");
      }, 1300);
    } catch (err) {
      console.error(err);
      setEditActionErrorMsg("Bağlantı hatası oluştu.");
    } finally {
      setEditActionLoading(false);
    }
  };

  const handleToggleMatchStatus = async (matchId: string, currentStatus: string, studentName: string, subject: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "PASSIVE" : "ACTIVE";
    const actionLabel = newStatus === "ACTIVE" ? "aktife almak" : "pasife almak";

    if (!confirm(`"${studentName}" için "${subject}" eşleştirmesini ${actionLabel} istediğinize emin misiniz?`)) return;

    try {
      const res = await fetch(`/api/admin/matches/${matchId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        fetchData();
      } else {
        alert(data.error || "Eşleştirme durumu güncellenemedi.");
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
      if (typeFilter !== "ALL" && m.type !== typeFilter) return false;
      if (statusFilter === "ACTIVE" && (m.status !== "ACTIVE" && m.status !== undefined)) return false;
      if (statusFilter === "PASSIVE" && m.status !== "PASSIVE") return false;
      return true;
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
          { value: "ALL", label: `Tüm Türler (${matches.length})` },
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
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #CBD5E1",
                fontSize: "12px",
                color: "#0F2645",
                fontWeight: "700",
                backgroundColor: "#FFFFFF",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="ALL">Tüm Durumlar ({matches.length})</option>
              <option value="ACTIVE">✓ Sadece Aktifler ({matches.filter(m => m.status === "ACTIVE" || !m.status).length})</option>
              <option value="PASSIVE">💤 Sadece Pasifler ({matches.filter(m => m.status === "PASSIVE").length})</option>
            </select>
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => { setActionSuccessMsg(""); setActionErrorMsg(""); setIsModalOpen(true); }}
            >
              Yeni Eşleştirme Yap
            </Button>
          </div>
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
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>Durum</th>
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>Eşleştirme Türü</th>
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>Atanan Ders / Branş</th>
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>Tarih</th>
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
                        {m.teacher?.email} {m.teacher?.teacherProfile?.school ? `• ${m.teacher.teacherProfile.school}${m.teacher.teacherProfile.department ? ` - ${m.teacher.teacherProfile.department}` : ""}` : ""}
                      </div>
                      {(m.teacher?.teacherProfile?.currentDistrict || m.teacher?.teacherProfile?.districts) && (
                        <div style={{ fontSize: "11px", color: "#2563EB", fontWeight: "600", marginTop: "2px" }}>
                          📍 {m.teacher.teacherProfile.currentDistrict || "İstanbul"} {m.teacher.teacherProfile.districts ? `• 🗺️ ${m.teacher.teacherProfile.districts}` : ""}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      {m.status === "PASSIVE" ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", backgroundColor: "#F1F5F9", color: "#64748B", padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "800", border: "1px solid #CBD5E1" }}>
                          💤 Pasif
                        </span>
                      ) : (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", backgroundColor: "#DCFCE7", color: "#15803D", padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "800", border: "1px solid #86EFAC" }}>
                          ✓ Aktif
                        </span>
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
                        backgroundColor: m.status === "PASSIVE" ? "#F1F5F9" : "#EFF6FF",
                        color: m.status === "PASSIVE" ? "#64748B" : "#1D4ED8",
                        border: m.status === "PASSIVE" ? "1px solid #CBD5E1" : "1px solid #BFDBFE",
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
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        {m.status === "PASSIVE" ? (
                          <button
                            onClick={() => handleToggleMatchStatus(m.id, m.status, m.student?.name || "Öğrenci", m.subject || "Ders")}
                            style={{
                              backgroundColor: "#DCFCE7",
                              color: "#15803D",
                              border: "1px solid #86EFAC",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: "700",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <Play size={11} /> Aktife Al
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleMatchStatus(m.id, m.status || "ACTIVE", m.student?.name || "Öğrenci", m.subject || "Ders")}
                            style={{
                              backgroundColor: "#FFF7ED",
                              color: "#C2410C",
                              border: "1px solid #FED7AA",
                              padding: "4px 8px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: "700",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <Pause size={11} /> Pasife Al
                          </button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Edit3 size={13} color="#2563EB" />}
                          onClick={() => openEditModal(m)}
                          style={{ borderColor: "#BFDBFE", color: "#1D4ED8", backgroundColor: "#EFF6FF", fontWeight: "700" }}
                        >
                          Eğitmeni Değiştir
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          icon={<Trash2 size={13} />}
                          onClick={() => handleDeleteMatch(m.id, m.student?.name || "Öğrenci", m.teacher?.name || "Öğretmen", m.subject || "Eşleştirme")}
                        >
                          Sil
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

              {/* Öğrenci Detay Bilgisi ve Talep Ettiği Dersler Durumu */}
              {selectedStudent && (
                <div style={{ fontSize: "13px", color: "#334155", marginTop: "-8px", marginBottom: "16px", backgroundColor: "#F8FAFC", padding: "12px 14px", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
                    <div>
                      🎯 <strong>Sınıf / Alan:</strong> <span style={{ color: "#0F2645", fontWeight: "700" }}>{selectedStudent.studentProfile?.grade || "Sınıf Belirtilmemiş"}</span>
                      {selectedStudent.studentProfile?.scoreType ? ` • Alan: ${selectedStudent.studentProfile.scoreType}` : ""}
                    </div>
                    {(selectedStudent.studentProfile?.currentDistrict || selectedStudent.studentProfile?.city) && (
                      <span style={{ color: "#059669", fontWeight: "700", backgroundColor: "#ECFDF5", padding: "2px 8px", borderRadius: "12px", border: "1px solid #A7F3D0", fontSize: "12px" }}>
                        📍 {selectedStudent.studentProfile.currentDistrict || selectedStudent.studentProfile.city}
                      </span>
                    )}
                  </div>

                  {/* Talep Edilen Derslerin Eşleşme Durumu */}
                  {loadingStudentStatus ? (
                    <div style={{ fontSize: "12px", color: "#64748B", fontStyle: "italic", marginTop: "4px" }}>
                      Öğrencinin ders talepleri ve eşleşme durumu yükleniyor...
                    </div>
                  ) : studentStatus && studentStatus.requestedSubjects.length > 0 ? (
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: "700", color: "#1E293B", marginBottom: "6px" }}>
                        📝 Öğrencinin Talep Ettiği Dersler ({studentStatus.unmatchedSubjects.length} Eşleşme Bekleyen):
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {studentStatus.requestedSubjects.map((reqSub, idx) => {
                          const isMatched = studentStatus.matchedRequestedSubjects.find(
                            m => normalize(m.subject) === normalize(reqSub) || normalize(reqSub).includes(normalize(m.subject))
                          );
                          return (
                            <span
                              key={idx}
                              style={{
                                fontSize: "11px",
                                fontWeight: "700",
                                padding: "4px 8px",
                                borderRadius: "6px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                backgroundColor: isMatched ? "#F1F5F9" : "#EFF6FF",
                                color: isMatched ? "#64748B" : "#1D4ED8",
                                border: isMatched ? "1px solid #CBD5E1" : "1px solid #BFDBFE",
                              }}
                            >
                              {isMatched ? (
                                <>🔗 {reqSub} <span style={{ fontSize: "10px", color: "#94A3B8" }}>({isMatched.teacherName})</span></>
                              ) : (
                                <>✓ {reqSub} <span style={{ fontSize: "10px", color: "#2563EB" }}>(Eşleşmedi)</span></>
                              )}
                            </span>
                          );
                        })}
                      </div>

                      {studentStatus.unmatchedSubjects.length === 0 && (
                        <div style={{ marginTop: "8px", fontSize: "12px", color: "#15803D", backgroundColor: "#DCFCE7", padding: "6px 10px", borderRadius: "6px", border: "1px solid #86EFAC", fontWeight: "700" }}>
                          🎉 Öğrencinin talep ettiği tüm dersler (%100) başarıyla eşleştirilmiştir. Dilerseniz ilave bir branş seçebilirsiniz.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
                      📝 Belirli bir ders talebi belirtilmedi (Tüm ders havuzundan seçim yapılabilir).
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
                  ...teachers.map((t) => {
                    const prof = t.teacherProfile;
                    const uniInfo = prof?.school ? (prof?.department ? `${prof.school} • ${prof.department}` : prof.school) : "";
                    return {
                      value: t.id,
                      label: `${t.name} (${t.email}) ${uniInfo ? `- ${uniInfo}` : ""}`
                    };
                  })
                ]}
                required
              />

              {/* Öğretmen Detay ve Konum Bilgisi */}
              {selectedTeacher && (
                <div style={{ fontSize: "12px", color: "#475569", marginTop: "-8px", marginBottom: "16px", backgroundColor: "#F8FAFC", padding: "8px 12px", borderRadius: "6px", border: "1px solid #E2E8F0" }}>
                  <div style={{ color: "#1E293B", fontWeight: "600" }}>
                    🏫 <strong>Üniversite / Bölüm:</strong> {selectedTeacher.teacherProfile?.school ? `${selectedTeacher.teacherProfile.school}${selectedTeacher.teacherProfile.department ? ` • ${selectedTeacher.teacherProfile.department}` : ""}` : "Belirtilmedi"}
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

      {/* Edit Match (Change Teacher) Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingMatch(null);
        }}
        title="Eşleştirmeyi Düzenle • Eğitmen Değiştir"
        titleIcon={<UserCheck size={20} color="#2563EB" />}
        footer={
          editActionSuccessMsg ? null : (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingMatch(null);
                }}
              >
                İptal
              </Button>
              <Button
                variant="primary"
                onClick={handleUpdateMatch}
                loading={editActionLoading}
                disabled={!editTeacherId || isEditTeacherConflicting || isEditBlockedByPendingLessons}
              >
                Değişiklikleri Kaydet
              </Button>
            </>
          )
        }
      >
        <div>
          {editActionSuccessMsg ? (
            <div style={{ backgroundColor: "#DCFCE7", border: "1px solid #86EFAC", color: "#15803D", padding: "16px", borderRadius: "8px", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Check size={18} /> {editActionSuccessMsg}
            </div>
          ) : editingMatch && (
            <div>
              {editActionErrorMsg && (
                <div style={{ backgroundColor: "#FEE2E2", border: "1px solid #FCA5A5", color: "#B91C1C", padding: "12px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
                  <AlertCircle size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
                  {editActionErrorMsg}
                </div>
              )}

              {/* Match Details Summary Card */}
              <div style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "14px", marginBottom: "16px", fontSize: "13px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
                  <div>
                    👤 <strong>Öğrenci:</strong> <span style={{ color: "#0F2645", fontWeight: "700" }}>{editingMatch.student?.name}</span>
                    <span style={{ fontSize: "12px", color: "#64748B" }}> ({editingMatch.student?.email})</span>
                  </div>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    {hasPendingLessons && (
                      <span style={{ color: "#D97706", fontWeight: "700", backgroundColor: "#FFFBEB", padding: "2px 8px", borderRadius: "12px", border: "1px solid #FDE68A", fontSize: "11px" }}>
                        ⏳ {pendingLessonsForEdit.length} İşlenmesi Beklenen Ders
                      </span>
                    )}
                    {(editingMatch.student?.studentProfile?.currentDistrict || editingMatch.student?.studentProfile?.city) && (
                      <span style={{ color: "#059669", fontWeight: "700", backgroundColor: "#ECFDF5", padding: "2px 8px", borderRadius: "12px", border: "1px solid #A7F3D0", fontSize: "11px" }}>
                        📍 {editingMatch.student?.studentProfile?.currentDistrict || editingMatch.student?.studentProfile?.city}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                  <span>Eşleştirme:</span>
                  <Badge variant={editingMatch.type as any} />
                  <span style={{
                    padding: "3px 8px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "700",
                    backgroundColor: "#EFF6FF",
                    color: "#1D4ED8",
                    border: "1px solid #BFDBFE",
                  }}>
                    {editingMatch.subject || (editingMatch.type === "KOCLUK" ? "Eğitim Koçluğu" : "Genel")}
                  </span>
                </div>

                <div style={{ paddingTop: "8px", borderTop: "1px dashed #E2E8F0", fontSize: "12px", color: "#475569" }}>
                  👨‍🏫 <strong>Mevcut Atanmış Eğitmen:</strong> <span style={{ color: "#0F2645", fontWeight: "700" }}>{editingMatch.teacher?.name}</span>
                  {editingMatch.teacher?.teacherProfile?.school ? ` • ${editingMatch.teacher.teacherProfile.school}` : ""}
                </div>
              </div>

              {/* Pending Lessons Warning Banner if Teacher Changed */}
              {isEditBlockedByPendingLessons && (
                <div style={{ backgroundColor: "#FEF2F2", border: "1.5px solid #FCA5A5", color: "#991B1B", padding: "12px 14px", borderRadius: "8px", fontSize: "12px", marginBottom: "16px", display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <AlertCircle size={18} color="#DC2626" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <div style={{ fontWeight: "800", marginBottom: "3px", color: "#991B1B" }}>
                      🚫 Eğitmen Değişikliği Yapılamaz: İşlenmesi Beklenen {pendingLessonsForEdit.length} Ders Bulunmaktadır
                    </div>
                    <div style={{ color: "#7F1D1D", lineHeight: "1.5" }}>
                      Bu öğrenci ve mevcut eğitmen ({editingMatch.teacher?.name}) arasında planlanmış veya onay bekleyen toplam <strong>{pendingLessonsForEdit.length} adet ders oturumu</strong> bulunmaktadır.
                      Eğitmeni değiştirebilmek için öncelikle bu derslerin işlenerek tamamlanması veya iptal edilmesi / reddedilmesi gerekmektedir.
                    </div>
                  </div>
                </div>
              )}

              {/* Teacher Selector */}
              <div style={{ marginBottom: "14px" }}>
                <Select
                  label="Yeni Eğitmen / Koç Seçiniz *"
                  value={editTeacherId}
                  onChange={(e) => setEditTeacherId(e.target.value)}
                  options={[
                    { value: "", label: "-- Eğitmen Seçiniz --" },
                    ...teachers.map((t) => {
                      const prof = t.teacherProfile;
                      const uniInfo = prof?.school ? (prof?.department ? `${prof.school} • ${prof.department}` : prof.school) : "";
                      return {
                        value: t.id,
                        label: `${t.name} (${t.email})${t.id === editingMatch.teacherId ? " 👈 (Mevcut Eğitmen)" : ""} ${uniInfo ? `- ${uniInfo}` : ""}`
                      };
                    })
                  ]}
                  required
                />
              </div>

              {/* Selected Teacher Preview */}
              {editSelectedTeacher && (
                <div style={{ fontSize: "12px", color: "#475569", marginTop: "-8px", marginBottom: "16px", backgroundColor: editTeacherId === editingMatch.teacherId ? "#F1F5F9" : "#EFF6FF", padding: "10px 12px", borderRadius: "8px", border: editTeacherId === editingMatch.teacherId ? "1px solid #CBD5E1" : "1px solid #BFDBFE" }}>
                  {editTeacherId === editingMatch.teacherId ? (
                    <div style={{ color: "#475569", fontWeight: "600" }}>
                      ℹ️ Halihazırda atanmış olan mevcut öğretmen seçili.
                    </div>
                  ) : (
                    <>
                      <div style={{ color: "#1E293B", fontWeight: "700", marginBottom: "3px" }}>
                        ✨ Yeni Seçilen Eğitmen: <span style={{ color: "#1D4ED8" }}>{editSelectedTeacher.name}</span>
                      </div>
                      <div style={{ color: "#475569" }}>
                        🏫 <strong>Üniversite / Bölüm:</strong> {editSelectedTeacher.teacherProfile?.school ? `${editSelectedTeacher.teacherProfile.school}${editSelectedTeacher.teacherProfile.department ? ` • ${editSelectedTeacher.teacherProfile.department}` : ""}` : "Belirtilmedi"}
                      </div>
                      {(editSelectedTeacher.teacherProfile?.currentDistrict || editSelectedTeacher.teacherProfile?.districts) && (
                        <div style={{ marginTop: "3px", color: "#2563EB", fontWeight: "600" }}>
                          📍 <strong>İkamet:</strong> {editSelectedTeacher.teacherProfile.currentDistrict || "İstanbul"}
                          {editSelectedTeacher.teacherProfile.districts ? ` • 🗺️ Ders Bölgeleri: ${editSelectedTeacher.teacherProfile.districts}` : ""}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Conflict Warning */}
              {isEditTeacherConflicting && (
                <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA", color: "#991B1B", padding: "10px 12px", borderRadius: "8px", fontSize: "12px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <AlertCircle size={16} />
                  <span>Seçtiğiniz eğitmen ({editSelectedTeacher?.name}) ile bu öğrenci arasında bu branş için zaten aktif bir eşleştirme bulunmaktadır. Lütfen farklı bir eğitmen seçiniz.</span>
                </div>
              )}

              {/* Notes Field */}
              <Textarea
                label="Yönetici Notu (Opsiyonel)"
                rows={2}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Eğitmen değişikliği gerekçesi veya özel notlar..."
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

