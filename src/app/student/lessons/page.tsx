"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Lock,
  Star,
  User,
  GraduationCap,
  History,
  Send,
  Video,
  ExternalLink,
  Info
} from "lucide-react";
import { Modal } from "@/components";

export default function StudentLessonsPage() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [studentProfile, setStudentProfile] = useState<any>(null);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  // Expanded logs state
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});

  // Form States
  const [createForm, setCreateForm] = useState({
    matchId: "",
    scheduledDate: "",
    durationMinutes: 60,
    locationType: "ONLINE" as "ONLINE" | "YUZ_YUZE",
    locationDetails: "",
    notes: "",
  });
  const [rejectReason, setRejectReason] = useState("");
  const [feedbackForm, setFeedbackForm] = useState({
    rating: 5,
    comment: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [userRes, lessonsRes, matchesRes, profileRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/lessons"),
        fetch("/api/student/teachers"),
        fetch("/api/student/profile"),
      ]);

      if (userRes.ok) {
        const uData = await userRes.json();
        if (uData.success && uData.user) {
          setCurrentUser(uData.user);
          if (uData.user.studentProfile) {
            setStudentProfile(uData.user.studentProfile);
          }
        }
      }

      if (lessonsRes.ok) {
        const lData = await lessonsRes.json();
        if (lData.success) setLessons(lData.lessons || []);
      }

      if (matchesRes.ok) {
        const mData = await matchesRes.json();
        if (mData.success) setMatches(mData.teachers || []);
      }

      if (profileRes.ok) {
        const pData = await profileRes.json();
        if (pData.success && pData.user?.studentProfile) {
          setStudentProfile(pData.user.studentProfile);
        } else if (pData.success && pData.profile) {
          setStudentProfile(pData.profile);
        }
      }
    } catch (err) {
      console.error("Fetch lessons error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.matchId || !createForm.scheduledDate) {
      setActionMessage({ type: "error", text: "Lütfen eğitmen ve ders tarihi seçiniz." });
      return;
    }

    setSubmitting(true);
    setActionMessage(null);
    try {
      const res = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage({ type: "success", text: "Ders talebiniz başarıyla oluşturuldu. Eğitmenin onayı bekleniyor." });
        setShowCreateModal(false);
        setCreateForm({
          matchId: "",
          scheduledDate: "",
          durationMinutes: 60,
          locationType: "ONLINE",
          locationDetails: "",
          notes: "",
        });
        fetchData();
      } else {
        setActionMessage({ type: "error", text: data.message || "Ders oluşturulamadı." });
      }
    } catch (err: any) {
      setActionMessage({ type: "error", text: "Bir hata meydana geldi." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (lessonId: string) => {
    if (!confirm("Bu ders saatini ve detaylarını onaylamak istiyor musunuz?")) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/approve`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage({ type: "success", text: "Ders başarıyla onaylandı." });
        fetchData();
      } else {
        setActionMessage({ type: "error", text: data.message || "Onaylanamadı." });
      }
    } catch (err) {
      setActionMessage({ type: "error", text: "Bir hata oluştu." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      setActionMessage({ type: "error", text: "Lütfen reddetme gerekçesi belirtiniz." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/lessons/${selectedLesson.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage({ type: "success", text: "Ders talebi reddedildi." });
        setShowRejectModal(false);
        setRejectReason("");
        setSelectedLesson(null);
        fetchData();
      } else {
        setActionMessage({ type: "error", text: data.message || "İşlem başarısız." });
      }
    } catch (err) {
      setActionMessage({ type: "error", text: "Bir hata oluştu." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async (lessonId: string) => {
    if (!confirm("Bu dersin işlendiğini ve tamamlandığını onaylıyor musunuz?")) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/complete`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage({ type: "success", text: "Ders tamamlanma onayınız kaydedildi." });
        fetchData();
      } else {
        setActionMessage({ type: "error", text: data.message || "Onaylanamadı." });
      }
    } catch (err) {
      setActionMessage({ type: "error", text: "Bir hata oluştu." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackForm.comment.trim()) {
      setActionMessage({ type: "error", text: "Lütfen değerlendirmenizi yazınız." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/lessons/${selectedLesson.id}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedbackForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage({ type: "success", text: "Yöneticiye özel değerlendirmeniz başarıyla iletildi." });
        setShowFeedbackModal(false);
        setFeedbackForm({ rating: 5, comment: "" });
        setSelectedLesson(null);
        fetchData();
      } else {
        setActionMessage({ type: "error", text: data.message || "Yorum kaydedilemedi." });
      }
    } catch (err) {
      setActionMessage({ type: "error", text: "Bir hata oluştu." });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLogs = (lessonId: string) => {
    setExpandedLogs((prev) => ({ ...prev, [lessonId]: !prev[lessonId] }));
  };

  // Filtered Lessons
  const filteredLessons = lessons.filter((l) => {
    const tName = l.match?.teacher?.name?.toLowerCase() || "";
    const subject = l.match?.subject?.toLowerCase() || "";
    const notes = l.notes?.toLowerCase() || "";
    const matchesSearch = tName.includes(searchQuery.toLowerCase()) || subject.includes(searchQuery.toLowerCase()) || notes.includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === "ALL") return true;
    return l.status === statusFilter;
  });

  // Summary counts
  const pendingCount = lessons.filter((l) => l.status === "PENDING_APPROVAL").length;
  const scheduledCount = lessons.filter((l) => l.status === "SCHEDULED").length;
  const completedCount = lessons.filter((l) => l.status === "COMPLETED").length;

  return (
    <div>
      {/* Action Notification */}
      {actionMessage && (
        <div
          style={{
            backgroundColor: actionMessage.type === "success" ? "#ECFDF5" : "#FEF2F2",
            border: `1px solid ${actionMessage.type === "success" ? "#A7F3D0" : "#FECACA"}`,
            color: actionMessage.type === "success" ? "#065F46" : "#991B1B",
            padding: "12px 16px",
            borderRadius: "10px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "14px",
            fontWeight: "600",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {actionMessage.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontWeight: "bold" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Header Info */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "20px",
          backgroundColor: "#FFFFFF",
          padding: "18px 22px",
          borderRadius: "14px",
          border: "1px solid #DDE6F0",
          boxShadow: "0 2px 8px rgba(15, 38, 69, 0.04)",
        }}
      >
        <div>
          <h2 style={{ fontSize: "19px", fontWeight: "800", color: "#0F2645", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <Calendar size={22} color="#C8952A" /> Derslerim & Randevularım
          </h2>
          <p style={{ fontSize: "13px", color: "#64748B", margin: "3px 0 0 0" }}>
            Eğitmenlerinizle planlanan ders oturumları, onay süreçleri ve tamamlanan ders kayıtları
          </p>
        </div>

        <button
          onClick={() => {
            if (matches.length === 0) {
              alert("Ders talebi oluşturabilmek için önce atanmış aktif bir koç veya özel ders hocanız bulunmalıdır.");
              return;
            }
            setShowCreateModal(true);
          }}
          style={{
            backgroundColor: "#0F2645",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "8px",
            padding: "10px 18px",
            fontSize: "13px",
            fontWeight: "700",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(15, 38, 69, 0.2)",
          }}
        >
          <Plus size={16} color="#C8952A" /> Yeni Ders Talep Et
        </button>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <div style={{ backgroundColor: "#FFFFFF", padding: "14px 16px", borderRadius: "10px", border: "1px solid #DDE6F0" }}>
          <div style={{ fontSize: "12px", color: "#64748B", fontWeight: "600" }}>Toplam Oturum</div>
          <div style={{ fontSize: "22px", fontWeight: "800", color: "#0F2645", marginTop: "2px" }}>{lessons.length}</div>
        </div>

        <div style={{ backgroundColor: "#FFFBEB", padding: "14px 16px", borderRadius: "10px", border: "1px solid #FDE68A" }}>
          <div style={{ fontSize: "12px", color: "#92400E", fontWeight: "600" }}>Onay Bekleyen</div>
          <div style={{ fontSize: "22px", fontWeight: "800", color: "#D97706", marginTop: "2px" }}>{pendingCount}</div>
        </div>

        <div style={{ backgroundColor: "#EFF6FF", padding: "14px 16px", borderRadius: "10px", border: "1px solid #BFDBFE" }}>
          <div style={{ fontSize: "12px", color: "#1E40AF", fontWeight: "600" }}>Planlanan (Aktif)</div>
          <div style={{ fontSize: "22px", fontWeight: "800", color: "#2563EB", marginTop: "2px" }}>{scheduledCount}</div>
        </div>

        <div style={{ backgroundColor: "#ECFDF5", padding: "14px 16px", borderRadius: "10px", border: "1px solid #A7F3D0" }}>
          <div style={{ fontSize: "12px", color: "#065F46", fontWeight: "600" }}>Tamamlanan Ders</div>
          <div style={{ fontSize: "22px", fontWeight: "800", color: "#059669", marginTop: "2px" }}>{completedCount}</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#FFFFFF", padding: "7px 12px", borderRadius: "8px", border: "1px solid #CBD5E1" }}>
          <Filter size={14} color="#64748B" />
          <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600" }}>Durum:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ border: "none", outline: "none", fontSize: "13px", fontWeight: "600", color: "#0F2645", backgroundColor: "transparent", cursor: "pointer" }}
          >
            <option value="ALL">Tüm Durumlar ({lessons.length})</option>
            <option value="PENDING_APPROVAL">⏳ Onay Bekleyenler ({pendingCount})</option>
            <option value="SCHEDULED">📅 Planlananlar ({scheduledCount})</option>
            <option value="COMPLETED">✅ Tamamlananlar ({completedCount})</option>
            <option value="REJECTED">❌ Reddedilenler ({lessons.filter((l) => l.status === "REJECTED").length})</option>
          </select>
        </div>

        <div style={{ position: "relative", minWidth: "260px" }}>
          <input
            type="text"
            placeholder="Eğitmen veya konu ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 14px 8px 36px",
              borderRadius: "8px",
              border: "1px solid #CBD5E1",
              backgroundColor: "#FFFFFF",
              color: "#0F2645",
              fontSize: "13px",
              outline: "none",
            }}
          />
          <Search size={15} color="#94A3B8" style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)" }} />
        </div>
      </div>

      {/* Lessons List */}
      {isLoading ? (
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", padding: "40px", textAlign: "center", color: "#94A3B8" }}>
          Dersler yükleniyor...
        </div>
      ) : filteredLessons.length === 0 ? (
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "14px", padding: "50px 20px", textAlign: "center", border: "1px solid #DDE6F0" }}>
          <Calendar size={42} color="#CBD5E1" style={{ marginBottom: "12px" }} />
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#0F2645", margin: "0 0 6px 0" }}>
            {statusFilter !== "ALL" ? "Bu filtreye uygun ders bulunamadı" : "Henüz oluşturulmuş bir ders bulunmuyor"}
          </h3>
          <p style={{ fontSize: "13px", color: "#64748B", margin: "0 0 16px 0" }}>
            Eğitmeninizle yeni bir oturum planlamak için "Yeni Ders Talep Et" butonunu kullanabilirsiniz.
          </p>
          {matches.length > 0 && statusFilter === "ALL" && (
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                backgroundColor: "#0F2645",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              + Ders Talep Et
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredLessons.map((lesson) => {
            const isWaitingMyApproval = lesson.status === "PENDING_APPROVAL" && !lesson.studentApproved;
            const isWaitingTeacherApproval = lesson.status === "PENDING_APPROVAL" && !lesson.teacherApproved;
            const myCompleted = lesson.studentCompleted;
            const teacherCompleted = lesson.teacherCompleted;

            // Status Badge Styling
            let statusBadge = { bg: "#FEF3C7", color: "#92400E", border: "#FCD34D", text: "⏳ Onay Bekliyor" };
            if (lesson.status === "SCHEDULED") {
              statusBadge = { bg: "#EFF6FF", color: "#1E40AF", border: "#BFDBFE", text: "📅 Planlandı" };
            } else if (lesson.status === "COMPLETED") {
              statusBadge = { bg: "#ECFDF5", color: "#065F46", border: "#A7F3D0", text: "✅ Ders İşlendi" };
            } else if (lesson.status === "REJECTED") {
              statusBadge = { bg: "#FEF2F2", color: "#991B1B", border: "#FECACA", text: "❌ Reddedildi" };
            }

            const schedDate = new Date(lesson.scheduledDate);

            return (
              <div
                key={lesson.id}
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "14px",
                  border: "1px solid #DDE6F0",
                  padding: "20px",
                  boxShadow: "0 4px 16px rgba(15, 38, 69, 0.04)",
                }}
              >
                {/* Top Row: Status + Match Badge + Date */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "800",
                        backgroundColor: statusBadge.bg,
                        color: statusBadge.color,
                        border: `1px solid ${statusBadge.border}`,
                      }}
                    >
                      {statusBadge.text}
                    </span>

                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "700",
                        backgroundColor: lesson.match?.type === "KOCLUK" ? "#F3E8FF" : "#EFF6FF",
                        color: lesson.match?.type === "KOCLUK" ? "#7E22CE" : "#1D4ED8",
                        border: lesson.match?.type === "KOCLUK" ? "1px solid #E9D5FF" : "1px solid #BFDBFE",
                      }}
                    >
                      {lesson.match?.type === "KOCLUK" ? "🎓 Koçluk" : "📚 Özel Ders"} • {lesson.match?.subject || "Genel"}
                    </span>
                  </div>

                  <div style={{ fontSize: "12px", color: "#64748B", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>Oluşturan: <strong>{lesson.createdBy?.name}</strong></span>
                  </div>
                </div>

                {/* Main Info Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", marginBottom: "16px" }}>
                  {/* Left: Teacher Info */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {lesson.match?.teacher?.teacherProfile?.photoUrl ? (
                      <img
                        src={lesson.match.teacher.teacherProfile.photoUrl}
                        alt={lesson.match.teacher.name}
                        style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover", border: "2px solid #C8952A" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "50%",
                          backgroundColor: "#0F2645",
                          color: "#C8952A",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "800",
                          fontSize: "18px",
                          border: "2px solid #C8952A",
                        }}
                      >
                        {lesson.match?.teacher?.name?.charAt(0) || "E"}
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: "11px", color: "#64748B", fontWeight: "600" }}>Eğitmen / Koç:</div>
                      <div style={{ fontSize: "15px", fontWeight: "800", color: "#0F2645" }}>{lesson.match?.teacher?.name}</div>
                      <div style={{ fontSize: "12px", color: "#64748B" }}>{lesson.match?.teacher?.teacherProfile?.school || "Pont Akademi Eğitmeni"}</div>
                    </div>
                  </div>

                  {/* Right: Date, Duration, Location */}
                  <div style={{ backgroundColor: "#F8FAFC", padding: "12px 16px", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "700", color: "#0F2645", marginBottom: "6px" }}>
                      <Calendar size={15} color="#C8952A" />
                      <span>{schedDate.toLocaleDateString("tr-TR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "12px", color: "#475569" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={13} color="#64748B" />
                        Saat: <strong>{schedDate.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</strong> ({lesson.durationMinutes} dk)
                      </span>

                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        {lesson.locationType === "ONLINE" ? <Video size={13} color="#2563EB" /> : <MapPin size={13} color="#DC2626" />}
                        Tür: <strong>{lesson.locationType === "ONLINE" ? "Online Toplantı" : "Yüz Yüze"}</strong>
                      </span>
                    </div>

                    {lesson.locationDetails && (
                      <div style={{ fontSize: "12px", color: "#1E40AF", marginTop: "6px", wordBreak: "break-all" }}>
                        📍 <strong>Detay / Link:</strong> {lesson.locationDetails}
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes if any */}
                {lesson.notes && (
                  <div style={{ backgroundColor: "#FFFBEB", border: "1px solid #FEF3C7", padding: "10px 14px", borderRadius: "8px", fontSize: "12px", color: "#92400E", marginBottom: "14px" }}>
                    <strong>📝 Not / Konu:</strong> {lesson.notes}
                  </div>
                )}

                {/* Rejection box if REJECTED */}
                {lesson.status === "REJECTED" && (
                  <div style={{ backgroundColor: "#FEF2F2", border: "1.5px solid #FCA5A5", padding: "14px 18px", borderRadius: "10px", marginBottom: "14px", boxShadow: "0 1px 4px rgba(220, 38, 38, 0.05)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", flexWrap: "wrap", gap: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#991B1B", fontWeight: "800", fontSize: "13px" }}>
                        <XCircle size={16} color="#DC2626" /> Ders Talebi Reddedildi • {lesson.rejectedBy?.name || "Kullanıcı"} ({lesson.rejectedBy?.role === "TEACHER" ? "Eğitmen" : lesson.rejectedBy?.role === "STUDENT" ? "Öğrenci" : "Yönetici"})
                      </div>
                      <span style={{ fontSize: "11px", color: "#991B1B", fontWeight: "600" }}>
                        {new Date(lesson.updatedAt).toLocaleString("tr-TR")}
                      </span>
                    </div>
                    <div style={{ fontSize: "13px", color: "#7F1D1D", backgroundColor: "#FFFFFF", padding: "8px 12px", borderRadius: "6px", border: "1px solid #FECACA" }}>
                      <strong>Reddetme Gerekçesi:</strong> {lesson.rejectionReason || "Gerekçe belirtilmedi"}
                    </div>
                  </div>
                )}

                {/* Action Controls based on Status */}
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "10px", paddingTop: "12px", borderTop: "1px solid #F1F5F9" }}>
                  {/* Status Helper Text */}
                  <div style={{ fontSize: "12px", color: "#64748B" }}>
                    {lesson.status === "PENDING_APPROVAL" && (
                      isWaitingTeacherApproval ? (
                        <span style={{ color: "#D97706", fontWeight: "600" }}>⏳ Eğitmenin onayı bekleniyor.</span>
                      ) : isWaitingMyApproval ? (
                        <span style={{ color: "#2563EB", fontWeight: "700" }}>👉 Eğitmen bu oturumu oluşturdu. Onayınız bekleniyor.</span>
                      ) : null
                    )}

                    {lesson.status === "SCHEDULED" && (
                      <div>
                        {myCompleted && !teacherCompleted && (
                          <span style={{ color: "#059669", fontWeight: "600" }}>✅ Tamamlama onayınız verildi. Eğitmenin onayı bekleniyor.</span>
                        )}
                        {!myCompleted && teacherCompleted && (
                          <span style={{ color: "#D97706", fontWeight: "700" }}>⚡ Eğitmen dersi işlendi olarak onayladı! Lütfen ders yapıldıysa onaylayınız veya yapılmadıysa itiraz/ret bildiriniz.</span>
                        )}
                        {!myCompleted && !teacherCompleted && (
                          <span style={{ color: "#475569" }}>Ders yapıldıktan sonra "Dersi İşlendi Olarak Onayla" butonuna basınız. Ders yapılmadıysa ret bildirimi yapabilirsiniz.</span>
                        )}
                      </div>
                    )}

                    {lesson.status === "COMPLETED" && (
                      <span style={{ color: "#059669", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <CheckCircle2 size={14} /> Karşılıklı tamamlandı ({new Date(lesson.completedAt).toLocaleDateString("tr-TR")})
                      </span>
                    )}

                    {lesson.status === "ISLENMEDI" && (
                      <span style={{ color: "#DC2626", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <XCircle size={14} /> Dersin işlenmediği bildirildi (İnceleme sürecinde)
                      </span>
                    )}

                    {lesson.status === "REJECTED" && (
                      <span style={{ color: "#DC2626", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <XCircle size={14} /> Oturum Talebi Reddedildi / İptal Edildi
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    {/* Approve / Reject buttons for Pending Approval */}
                    {isWaitingMyApproval && (
                      <>
                        <button
                          onClick={() => handleApprove(lesson.id)}
                          disabled={submitting}
                          style={{
                            backgroundColor: "#16A34A",
                            color: "#FFFFFF",
                            border: "none",
                            borderRadius: "6px",
                            padding: "6px 14px",
                            fontSize: "12px",
                            fontWeight: "700",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <CheckCircle2 size={14} /> Onayla
                        </button>

                        <button
                          onClick={() => {
                            setSelectedLesson(lesson);
                            setShowRejectModal(true);
                          }}
                          disabled={submitting}
                          style={{
                            backgroundColor: "#FFFFFF",
                            color: "#DC2626",
                            border: "1px solid #FECACA",
                            borderRadius: "6px",
                            padding: "6px 12px",
                            fontSize: "12px",
                            fontWeight: "700",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <XCircle size={14} /> Reddet
                        </button>
                      </>
                    )}

                    {/* Complete & Reject/Dispute Buttons for Scheduled Lessons */}
                    {lesson.status === "SCHEDULED" && !myCompleted && (
                      <>
                        <button
                          onClick={() => handleComplete(lesson.id)}
                          disabled={submitting}
                          style={{
                            backgroundColor: "#0F2645",
                            color: "#FFFFFF",
                            border: "none",
                            borderRadius: "6px",
                            padding: "7px 14px",
                            fontSize: "12px",
                            fontWeight: "700",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          <CheckCircle2 size={14} color="#C8952A" /> Dersi İşlendi Olarak Onayla
                        </button>

                        <button
                          onClick={() => {
                            setSelectedLesson(lesson);
                            setShowRejectModal(true);
                          }}
                          disabled={submitting}
                          style={{
                            backgroundColor: "#FFFFFF",
                            color: "#DC2626",
                            border: "1px solid #FECACA",
                            borderRadius: "6px",
                            padding: "6px 12px",
                            fontSize: "12px",
                            fontWeight: "700",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <XCircle size={14} /> {teacherCompleted ? "Ders İşlenmedi / İtiraz Et" : "Ders Yapılmadı / Reddet"}
                        </button>
                      </>
                    )}

                    {/* Feedback Button for Completed Lessons */}
                    {lesson.status === "COMPLETED" && (
                      <button
                        onClick={() => {
                          setSelectedLesson(lesson);
                          if (lesson.myFeedback) {
                            setFeedbackForm({
                              rating: lesson.myFeedback.rating || 5,
                              comment: lesson.myFeedback.comment || "",
                            });
                          } else {
                            setFeedbackForm({ rating: 5, comment: "" });
                          }
                          setShowFeedbackModal(true);
                        }}
                        style={{
                          backgroundColor: lesson.myFeedback ? "#F8FAFC" : "#EFF6FF",
                          color: lesson.myFeedback ? "#475569" : "#1D4ED8",
                          border: lesson.myFeedback ? "1px solid #CBD5E1" : "1px solid #BFDBFE",
                          borderRadius: "6px",
                          padding: "6px 12px",
                          fontSize: "12px",
                          fontWeight: "700",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <Lock size={12} color="#C8952A" />
                        {lesson.myFeedback ? "Yorumumu Gör / Güncelle" : "🔒 Yöneticiye Özel Görüş Bırak"}
                      </button>
                    )}

                    {/* Toggle History Button */}
                    <button
                      onClick={() => toggleLogs(lesson.id)}
                      style={{
                        backgroundColor: "#F1F5F9",
                        color: "#475569",
                        border: "none",
                        borderRadius: "6px",
                        padding: "6px 10px",
                        fontSize: "11px",
                        fontWeight: "700",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <History size={13} />
                      {expandedLogs[lesson.id] ? "Geçmişi Gizle" : "İşlem Geçmişi"}
                      {expandedLogs[lesson.id] ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                  </div>
                </div>

                {/* Collapsible Action Logs History */}
                {expandedLogs[lesson.id] && (
                  <div style={{ marginTop: "14px", backgroundColor: "#F8FAFC", borderRadius: "8px", padding: "14px", border: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: "12px", fontWeight: "800", color: "#0F2645", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <History size={14} color="#C8952A" /> Ders Tarihçesi & Log Kayıtları
                    </div>
                    {(!lesson.logs || lesson.logs.length === 0) ? (
                      <div style={{ fontSize: "12px", color: "#94A3B8" }}>Henüz log kaydı bulunmuyor.</div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {lesson.logs.map((log: any) => (
                          <div key={log.id} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12px" }}>
                            <span style={{ color: "#94A3B8", minWidth: "120px", fontSize: "11px" }}>
                              {new Date(log.createdAt).toLocaleString("tr-TR")}
                            </span>
                            <div style={{ flex: 1 }}>
                              <span style={{ color: "#0F2645", fontWeight: "600" }}>{log.message}</span>
                              {log.reason && (
                                <div style={{ color: "#DC2626", fontStyle: "italic", marginTop: "2px" }}>
                                  Gerekçe: {log.reason}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE LESSON MODAL */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Yeni Ders Talep Et"
        icon={<Calendar size={20} color="#C8952A" />}
        maxWidth="540px"
      >
        <form onSubmit={handleCreateLesson}>
          {/* Match Select */}
          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#0F2645", marginBottom: "4px" }}>
              Eğitmen / Koç Seçiniz *
            </label>
            <select
              value={createForm.matchId}
              onChange={(e) => setCreateForm({ ...createForm, matchId: e.target.value })}
              required
              style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", outline: "none" }}
            >
              <option value="">-- Eğitmen ve Branş Seçiniz --</option>
              {matches.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.teacher?.name} ({m.type === "KOCLUK" ? "Eğitim Koçluğu" : `Özel Ders - ${m.subject || "Genel"}`})
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#0F2645", marginBottom: "4px" }}>
              Tarih ve Saat *
            </label>
            <input
              type="datetime-local"
              value={createForm.scheduledDate}
              onChange={(e) => setCreateForm({ ...createForm, scheduledDate: e.target.value })}
              required
              style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", outline: "none" }}
            />
          </div>

          {/* Duration */}
          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#0F2645", marginBottom: "4px" }}>
              Ders Süresi
            </label>
            <select
              value={createForm.durationMinutes}
              onChange={(e) => setCreateForm({ ...createForm, durationMinutes: Number(e.target.value) })}
              style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", outline: "none" }}
            >
              <option value={40}>40 Dakika</option>
              <option value={60}>60 Dakika (1 Saat)</option>
              <option value={90}>90 Dakika (1.5 Saat)</option>
              <option value={120}>120 Dakika (2 Saat)</option>
            </select>
          </div>

          {/* Location Type */}
          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#0F2645", marginBottom: "6px" }}>
              Ders Konumu *
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setCreateForm({ ...createForm, locationType: "ONLINE" })}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  border: createForm.locationType === "ONLINE" ? "2px solid #2563EB" : "1px solid #CBD5E1",
                  backgroundColor: createForm.locationType === "ONLINE" ? "#EFF6FF" : "#FFFFFF",
                  color: createForm.locationType === "ONLINE" ? "#1E40AF" : "#475569",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <Video size={16} /> Online Görüşme
              </button>
              <button
                type="button"
                onClick={() => setCreateForm({ ...createForm, locationType: "YUZ_YUZE" })}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  border: createForm.locationType === "YUZ_YUZE" ? "2px solid #DC2626" : "1px solid #CBD5E1",
                  backgroundColor: createForm.locationType === "YUZ_YUZE" ? "#FEF2F2" : "#FFFFFF",
                  color: createForm.locationType === "YUZ_YUZE" ? "#991B1B" : "#475569",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <MapPin size={16} /> Yüz Yüze
              </button>
            </div>
          </div>

          {/* Location Details */}
          <div style={{ marginBottom: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", flexWrap: "wrap", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "#0F2645" }}>
                {createForm.locationType === "ONLINE" ? "Toplantı Linki veya Platformu (Opsiyonel)" : "Buluşma Yeri / Adresi (Opsiyonel)"}
              </label>
              {createForm.locationType === "YUZ_YUZE" && (() => {
                const prof = studentProfile || currentUser?.studentProfile;
                const addr = [prof?.currentDistrict, prof?.currentAddress].filter(Boolean).join(" - ") || prof?.city || "";
                if (!addr) return null;
                return (
                  <button
                    type="button"
                    onClick={() => setCreateForm({ ...createForm, locationDetails: addr })}
                    style={{
                      background: "#EFF6FF",
                      border: "1px solid #BFDBFE",
                      color: "#1D4ED8",
                      fontSize: "11px",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "3px 8px",
                      borderRadius: "6px",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <MapPin size={12} color="#2563EB" /> 📍 Kayıtlı Adresimi Getir ({prof?.currentDistrict || "Ev Adresim"})
                  </button>
                );
              })()}
            </div>
            <input
              type="text"
              placeholder={createForm.locationType === "ONLINE" ? "Örn: Zoom linki, Google Meet vb." : "Örn: Kütüphane, Ev, Çalışma Salonu..."}
              value={createForm.locationDetails}
              onChange={(e) => setCreateForm({ ...createForm, locationDetails: e.target.value })}
              style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", outline: "none" }}
            />
          </div>

          {/* Notes */}
          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#0F2645", marginBottom: "4px" }}>
              İşlenecek Konu veya Not
            </label>
            <textarea
              rows={2}
              placeholder="Örn: Limit ve Süreklilik soru çözümü..."
              value={createForm.notes}
              onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
              style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", outline: "none", resize: "vertical" }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              style={{ padding: "8px 14px", borderRadius: "6px", border: "1px solid #CBD5E1", backgroundColor: "#FFFFFF", color: "#475569", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{ padding: "8px 18px", borderRadius: "6px", border: "none", backgroundColor: "#0F2645", color: "#FFFFFF", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}
            >
              {submitting ? "Gönderiliyor..." : "Talebi Gönder"}
            </button>
          </div>
        </form>
      </Modal>

      {/* REJECT / DISPUTE MODAL */}
      <Modal
        isOpen={showRejectModal && !!selectedLesson}
        onClose={() => setShowRejectModal(false)}
        title={
          selectedLesson?.status === "SCHEDULED"
            ? (selectedLesson?.teacherCompleted ? "Ders İşlenmedi / İtiraz Bildirimi" : "Ders Yapılmadı / Ret Bildirimi")
            : "Ders Talebini Reddet"
        }
        icon={<XCircle size={18} color="#DC2626" />}
        maxWidth="480px"
      >
        <p style={{ fontSize: "13px", color: "#64748B", marginTop: 0 }}>
          {selectedLesson?.status === "SCHEDULED" ? (
            <>
              Dersin işlenmediğini veya yapılmadığını bildirmek üzeresiniz. Lütfen eğitmenin ve yöneticinin görebileceği bir <strong>gerekçe</strong> belirtiniz (İşlem yönetici paneline yansıtılacaktır).
            </>
          ) : (
            <>
              Ders talebini reddetmek üzeresiniz. Lütfen karşı tarafın ve yöneticinin görebileceği bir <strong>ret gerekçesi</strong> belirtiniz.
            </>
          )}
        </p>

        <form onSubmit={handleReject}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#0F2645", marginBottom: "4px" }}>
              {selectedLesson?.status === "SCHEDULED" ? "Dersin Yapılmama / İtiraz Gerekçesi *" : "Reddetme Gerekçesi *"}
            </label>
            <textarea
              rows={3}
              required
              placeholder={
                selectedLesson?.status === "SCHEDULED"
                  ? "Örn: Belirtilen saatte ders yapılmadı, eğitmen ile bağlantı kurulamadı..."
                  : "Örn: Belirtilen saatte sınavım var, ertesi güne alabilir miyiz?"
              }
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", outline: "none", resize: "vertical" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button
              type="button"
              onClick={() => setShowRejectModal(false)}
              style={{ padding: "8px 14px", borderRadius: "6px", border: "1px solid #CBD5E1", backgroundColor: "#FFFFFF", color: "#475569", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{ padding: "8px 18px", borderRadius: "6px", border: "none", backgroundColor: "#DC2626", color: "#FFFFFF", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}
            >
              {submitting ? "İşleniyor..." : selectedLesson?.status === "SCHEDULED" ? "Ders İşlenmedi Olarak Kaydet" : "Reddi Onayla"}
            </button>
          </div>
        </form>
      </Modal>

      {/* FEEDBACK (CONFIDENTIAL ADMIN EVALUATION) MODAL */}
      <Modal
        isOpen={showFeedbackModal && !!selectedLesson}
        onClose={() => setShowFeedbackModal(false)}
        title="Yöneticiye Özel Derse Dair Görüş Bırak"
        icon={<Lock size={18} color="#C8952A" />}
        maxWidth="540px"
      >
        {/* Privacy Warning */}
        <div style={{ backgroundColor: "#FEF3C7", border: "1px solid #FCD34D", padding: "10px 14px", borderRadius: "8px", fontSize: "12px", color: "#92400E", marginBottom: "16px", display: "flex", alignItems: "flex-start", gap: "8px" }}>
          <Lock size={16} color="#D97706" style={{ flexShrink: 0, marginTop: "2px" }} />
          <div>
            <strong>Tam Gizlilik Garantisi:</strong> Bu derse yapacağınız değerlendirme ve yorumları <u>eğitmeniniz kesinlikle göremez</u>. Sadece Pont Akademi yönetimi tarafından kalite takibi amacıyla incelenir.
          </div>
        </div>

        <form onSubmit={handleFeedback}>
          {/* Rating */}
          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#0F2645", marginBottom: "6px" }}>
              Ders / Eğitmen Memnuniyet Puanı
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Star
                    size={24}
                    fill={star <= feedbackForm.rating ? "#F59E0B" : "none"}
                    color={star <= feedbackForm.rating ? "#F59E0B" : "#CBD5E1"}
                  />
                </button>
              ))}
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#0F2645", marginLeft: "6px", alignSelf: "center" }}>
                {feedbackForm.rating} / 5 Yıldız
              </span>
            </div>
          </div>

          {/* Comment */}
          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#0F2645", marginBottom: "4px" }}>
              Görüş ve Değerlendirmeniz *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Ders verimliliği, eğitmenin ilgisi veya geliştirmemizi istediğiniz konular..."
              value={feedbackForm.comment}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", outline: "none", resize: "vertical" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button
              type="button"
              onClick={() => setShowFeedbackModal(false)}
              style={{ padding: "8px 14px", borderRadius: "6px", border: "1px solid #CBD5E1", backgroundColor: "#FFFFFF", color: "#475569", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}
            >
              Kapat
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{ padding: "8px 18px", borderRadius: "6px", border: "none", backgroundColor: "#0F2645", color: "#FFFFFF", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}
            >
              {submitting ? "Kaydediliyor..." : "Gizli Yorumu Kaydet"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
