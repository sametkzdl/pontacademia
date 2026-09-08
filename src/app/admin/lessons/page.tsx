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
  Lock,
  Star,
  User,
  GraduationCap,
  History,
  Video,
  ExternalLink,
  Shield,
  MessageSquare,
  Sparkles,
  Link2,
  CreditCard,
  Check,
  X
} from "lucide-react";

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [paymentFilter, setPaymentFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTeacherPaymentModal, setShowTeacherPaymentModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [paymentLesson, setPaymentLesson] = useState<any>(null);
  const [teacherPaymentLesson, setTeacherPaymentLesson] = useState<any>(null);

  // Expanded logs & feedbacks state
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

  // Student Payment Form State
  const [paymentForm, setPaymentForm] = useState({
    paymentStatus: "PAID" as "PAID" | "UNPAID" | "FAILED",
    paidAmount: "" as number | string,
    paidBy: "",
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "HAVALE_EFT",
    paymentNotes: "",
  });

  // Teacher Payment Form State
  const [teacherPaymentForm, setTeacherPaymentForm] = useState({
    teacherPaymentStatus: "PAID" as "PAID" | "UNPAID" | "FAILED",
    teacherPaidAmount: "" as number | string,
    teacherPaidDate: new Date().toISOString().split("T")[0],
    teacherPaymentMethod: "HAVALE_EFT",
    teacherPaymentNotes: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [lessonsRes, matchesRes] = await Promise.all([
        fetch("/api/lessons"),
        fetch("/api/admin/matches"),
      ]);

      if (lessonsRes.ok) {
        const lData = await lessonsRes.json();
        if (lData.success) setLessons(lData.lessons || []);
      }

      if (matchesRes.ok) {
        const mData = await matchesRes.json();
        if (mData.success) {
          // Only active matches
          const activeMatches = (mData.matches || []).filter((m: any) => m.status === "ACTIVE");
          setMatches(activeMatches);
        }
      }
    } catch (err) {
      console.error("Admin fetch lessons error:", err);
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
      setActionMessage({ type: "error", text: "Lütfen eşleştirme ve ders tarihi seçiniz." });
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
        setActionMessage({ type: "success", text: "Ders yönetici tarafından doğrudan planlandı ve onaylandı." });
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
    if (!confirm("Yönetici yetkisiyle bu dersi doğrudan onaylamak istiyor musunuz?")) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/approve`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage({ type: "success", text: "Ders yönetici tarafından onaylandı." });
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
        setActionMessage({ type: "success", text: "Ders yönetici tarafından reddedildi." });
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
    if (!confirm("Yönetici olarak bu dersin tamamlandığını / işlendiğini onaylıyor musunuz?")) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/complete`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage({ type: "success", text: "Ders tamamlandı olarak işaretlendi." });
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

  const openPaymentModal = (lesson: any) => {
    setPaymentLesson(lesson);
    setPaymentForm({
      paymentStatus: (lesson.paymentStatus as any) || "PAID",
      paidAmount: lesson.paidAmount !== null && lesson.paidAmount !== undefined ? lesson.paidAmount : (lesson.match?.hourlyRate || ""),
      paidBy: lesson.paidBy || lesson.match?.student?.name || "",
      paymentDate: lesson.paymentDate
        ? new Date(lesson.paymentDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      paymentMethod: lesson.paymentMethod || "HAVALE_EFT",
      paymentNotes: lesson.paymentNotes || "",
    });
    setShowPaymentModal(true);
  };

  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentLesson) return;

    if (paymentForm.paymentStatus === "FAILED" && !paymentForm.paymentNotes.trim()) {
      setActionMessage({ type: "error", text: "Ödeme onaylanmadı durumunda lütfen nedenini belirten bir açıklama giriniz." });
      return;
    }

    if (paymentForm.paymentStatus === "PAID" && (paymentForm.paidAmount === "" || Number(paymentForm.paidAmount) <= 0)) {
      setActionMessage({ type: "error", text: "Lütfen geçerli bir ödeme tutarı (TL) giriniz." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/lessons/${paymentLesson.id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage({
          type: "success",
          text: paymentForm.paymentStatus === "PAID"
            ? "Ödeme kaydı başarıyla onaylandı ve ders kartına işlendi."
            : paymentForm.paymentStatus === "FAILED"
            ? "Ders ödemesi 'Onaylanmadı / Alınamadı' olarak işaretlendi."
            : "Ders ödeme durumu güncellendi.",
        });
        setShowPaymentModal(false);
        setPaymentLesson(null);
        fetchData();
      } else {
        setActionMessage({ type: "error", text: data.message || "Ödeme kaydı güncellenemedi." });
      }
    } catch (err) {
      setActionMessage({ type: "error", text: "Ödeme güncellenirken bir hata oluştu." });
    } finally {
      setSubmitting(false);
    }
  };

  const openTeacherPaymentModal = (lesson: any) => {
    setTeacherPaymentLesson(lesson);
    setTeacherPaymentForm({
      teacherPaymentStatus: (lesson.teacherPaymentStatus as any) || "PAID",
      teacherPaidAmount: lesson.teacherPaidAmount !== null && lesson.teacherPaidAmount !== undefined
        ? lesson.teacherPaidAmount
        : (lesson.match?.hourlyRate || ""),
      teacherPaidDate: lesson.teacherPaidDate
        ? new Date(lesson.teacherPaidDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      teacherPaymentMethod: lesson.teacherPaymentMethod || "HAVALE_EFT",
      teacherPaymentNotes: lesson.teacherPaymentNotes || "",
    });
    setShowTeacherPaymentModal(true);
  };

  const handleUpdateTeacherPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherPaymentLesson) return;

    if (teacherPaymentForm.teacherPaymentStatus === "FAILED" && !teacherPaymentForm.teacherPaymentNotes.trim()) {
      setActionMessage({ type: "error", text: "Eğitmen ödemesi bekletildi/onaylanmadı durumunda lütfen nedenini belirten bir açıklama giriniz." });
      return;
    }

    if (teacherPaymentForm.teacherPaymentStatus === "PAID" && (teacherPaymentForm.teacherPaidAmount === "" || Number(teacherPaymentForm.teacherPaidAmount) <= 0)) {
      setActionMessage({ type: "error", text: "Lütfen eğitmene aktarılan geçerli bir tutar (TL) giriniz." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/lessons/${teacherPaymentLesson.id}/teacher-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(teacherPaymentForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMessage({
          type: "success",
          text: teacherPaymentForm.teacherPaymentStatus === "PAID"
            ? "Eğitmen ücret transferi onaylandı ve ders kartına işlendi."
            : teacherPaymentForm.teacherPaymentStatus === "FAILED"
            ? "Eğitmen ödemesi 'Bekletildi / Onaylanmadı' olarak işaretlendi."
            : "Eğitmen ödeme durumu güncellendi.",
        });
        setShowTeacherPaymentModal(false);
        setTeacherPaymentLesson(null);
        fetchData();
      } else {
        setActionMessage({ type: "error", text: data.message || "Eğitmen ödeme kaydı güncellenemedi." });
      }
    } catch (err) {
      setActionMessage({ type: "error", text: "Eğitmen ödemesi güncellenirken bir hata oluştu." });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLogs = (lessonId: string) => {
    setExpandedLogs((prev) => ({ ...prev, [lessonId]: !prev[lessonId] }));
  };

  // Filtered Lessons
  const filteredLessons = lessons.filter((l) => {
    const sName = l.match?.student?.name?.toLowerCase() || "";
    const tName = l.match?.teacher?.name?.toLowerCase() || "";
    const subject = l.match?.subject?.toLowerCase() || "";
    const notes = l.notes?.toLowerCase() || "";
    const matchesSearch =
      sName.includes(searchQuery.toLowerCase()) ||
      tName.includes(searchQuery.toLowerCase()) ||
      subject.includes(searchQuery.toLowerCase()) ||
      notes.includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter !== "ALL" && l.status !== statusFilter) return false;
    if (typeFilter !== "ALL" && l.match?.type !== typeFilter) return false;
    if (paymentFilter !== "ALL" && (l.paymentStatus || "UNPAID") !== paymentFilter) return false;
    return true;
  });

  // Summary counts
  const pendingCount = lessons.filter((l) => l.status === "PENDING_APPROVAL").length;
  const scheduledCount = lessons.filter((l) => l.status === "SCHEDULED").length;
  const completedCount = lessons.filter((l) => l.status === "COMPLETED").length;
  const rejectedCount = lessons.filter((l) => l.status === "REJECTED").length;
  const paidCount = lessons.filter((l) => l.paymentStatus === "PAID").length;

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

      {/* Top Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0F2645", margin: 0 }}>
            Ders Yönetimi & Ödeme Takibi
          </h1>
          <p style={{ fontSize: "14px", color: "#64748B", margin: "4px 0 0 0" }}>
            Planlanan, onay bekleyen, tamamlanan ve reddedilen tüm dersleri ve tahsilat/ödeme kayıtlarını yönetin.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            backgroundColor: "#0F2645",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "8px",
            padding: "10px 18px",
            fontSize: "13px",
            fontWeight: "700",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 2px 8px rgba(15, 38, 69, 0.2)",
          }}
        >
          <Plus size={16} color="#C8952A" /> Yeni Ders Planla (Admin)
        </button>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
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

        <div style={{ backgroundColor: "#F0FDF4", padding: "14px 16px", borderRadius: "10px", border: "1.5px solid #86EFAC" }}>
          <div style={{ fontSize: "12px", color: "#166534", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
            <CreditCard size={13} color="#16A34A" /> Ödemesi Alınan
          </div>
          <div style={{ fontSize: "22px", fontWeight: "800", color: "#15803D", marginTop: "2px" }}>{paidCount}</div>
        </div>

        <div style={{ backgroundColor: "#FEF2F2", padding: "14px 16px", borderRadius: "10px", border: "1px solid #FECACA" }}>
          <div style={{ fontSize: "12px", color: "#991B1B", fontWeight: "600" }}>Reddedilen</div>
          <div style={{ fontSize: "22px", fontWeight: "800", color: "#DC2626", marginTop: "2px" }}>{rejectedCount}</div>
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
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
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
              <option value="REJECTED">❌ Reddedilenler ({rejectedCount})</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#FFFFFF", padding: "7px 12px", borderRadius: "8px", border: "1px solid #CBD5E1" }}>
            <Link2 size={14} color="#64748B" />
            <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600" }}>Tür:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ border: "none", outline: "none", fontSize: "13px", fontWeight: "600", color: "#0F2645", backgroundColor: "transparent", cursor: "pointer" }}
            >
              <option value="ALL">Tüm Eşleşmeler</option>
              <option value="KOCLUK">🎓 Eğitim Koçluğu</option>
              <option value="OZEL_DERS">📚 Özel Ders</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#FFFFFF", padding: "7px 12px", borderRadius: "8px", border: "1px solid #CBD5E1" }}>
            <CreditCard size={14} color="#16A34A" />
            <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600" }}>Ödeme:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              style={{ border: "none", outline: "none", fontSize: "13px", fontWeight: "600", color: "#0F2645", backgroundColor: "transparent", cursor: "pointer" }}
            >
              <option value="ALL">Tüm Ödeme Durumları</option>
              <option value="PAID">🟢 Ödemesi Alınanlar ({paidCount})</option>
              <option value="UNPAID">⏳ Ödeme Bekleyenler</option>
              <option value="FAILED">🔴 Onaylanmadı / Alınamadı</option>
            </select>
          </div>
        </div>

        <div style={{ position: "relative", minWidth: "280px" }}>
          <input
            type="text"
            placeholder="Öğrenci, öğretmen veya konu ara..."
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
            Filtreye uygun ders bulunamadı
          </h3>
          <p style={{ fontSize: "13px", color: "#64748B", margin: "0 0 16px 0" }}>
            Sistemde henüz ders oluşturulmamış veya arama kriterinizle eşleşen kayıt bulunamadı.
          </p>
          {matches.length > 0 && (
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
              + Yeni Ders Planla
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredLessons.map((lesson) => {
            // Status Badge Styling
            let statusBadge = { bg: "#FEF3C7", color: "#92400E", border: "#FCD34D", text: "⏳ Onay Bekliyor" };
            if (lesson.status === "SCHEDULED") {
              statusBadge = { bg: "#EFF6FF", color: "#1E40AF", border: "#BFDBFE", text: "📅 Planlandı" };
            } else if (lesson.status === "COMPLETED") {
              statusBadge = { bg: "#ECFDF5", color: "#065F46", border: "#A7F3D0", text: "✅ Ders İşlendi (Tamamlandı)" };
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
                {/* Top Row: Status + Match Type + Creator + Admin Actions */}
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

                    {/* Student Payment Status Badge */}
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "800",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        backgroundColor:
                          lesson.paymentStatus === "PAID"
                            ? "#ECFDF5"
                            : lesson.paymentStatus === "FAILED"
                            ? "#FEF2F2"
                            : "#FFFBEB",
                        color:
                          lesson.paymentStatus === "PAID"
                            ? "#065F46"
                            : lesson.paymentStatus === "FAILED"
                            ? "#991B1B"
                            : "#92400E",
                        border: `1px solid ${
                          lesson.paymentStatus === "PAID"
                            ? "#A7F3D0"
                            : lesson.paymentStatus === "FAILED"
                            ? "#FECACA"
                            : "#FDE68A"
                        }`,
                      }}
                    >
                      <CreditCard size={13} color={lesson.paymentStatus === "PAID" ? "#10B981" : lesson.paymentStatus === "FAILED" ? "#EF4444" : "#F59E0B"} />
                      {lesson.paymentStatus === "PAID"
                        ? `Tahsilat Alındı (${lesson.paidAmount ? Number(lesson.paidAmount).toLocaleString("tr-TR") + " ₺" : "Onaylı"})`
                        : lesson.paymentStatus === "FAILED"
                        ? "Tahsilat Onaylanmadı"
                        : "Tahsilat Bekliyor"}
                    </span>

                    {/* Teacher Payout Status Badge */}
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "800",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        backgroundColor:
                          lesson.teacherPaymentStatus === "PAID"
                            ? "#F5F3FF"
                            : lesson.teacherPaymentStatus === "FAILED"
                            ? "#FEF2F2"
                            : "#F8FAFC",
                        color:
                          lesson.teacherPaymentStatus === "PAID"
                            ? "#6D28D9"
                            : lesson.teacherPaymentStatus === "FAILED"
                            ? "#991B1B"
                            : "#64748B",
                        border: `1px solid ${
                          lesson.teacherPaymentStatus === "PAID"
                            ? "#DDD6FE"
                            : lesson.teacherPaymentStatus === "FAILED"
                            ? "#FECACA"
                            : "#E2E8F0"
                        }`,
                      }}
                    >
                      <Sparkles size={13} color={lesson.teacherPaymentStatus === "PAID" ? "#7C3AED" : lesson.teacherPaymentStatus === "FAILED" ? "#EF4444" : "#94A3B8"} />
                      {lesson.teacherPaymentStatus === "PAID"
                        ? `Ücret Ödendi (${lesson.teacherPaidAmount ? Number(lesson.teacherPaidAmount).toLocaleString("tr-TR") + " ₺" : "Aktarıldı"})`
                        : lesson.teacherPaymentStatus === "FAILED"
                        ? "Ücret Bekletildi"
                        : "Ücret Bekliyor"}
                    </span>
                  </div>

                  <div style={{ fontSize: "12px", color: "#64748B", display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>Oluşturan: <strong>{lesson.createdBy?.name} ({lesson.createdBy?.role})</strong></span>
                  </div>
                </div>

                {/* Main Info Grid (Teacher & Student & Schedule) */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "16px" }}>
                  {/* Student & Teacher Info */}
                  <div style={{ backgroundColor: "#F8FAFC", padding: "12px 16px", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                      <User size={15} color="#2563EB" />
                      <div>
                        <span style={{ fontSize: "11px", color: "#64748B" }}>Öğrenci: </span>
                        <strong style={{ fontSize: "13px", color: "#0F2645" }}>{lesson.match?.student?.name}</strong>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <GraduationCap size={15} color="#C8952A" />
                      <div>
                        <span style={{ fontSize: "11px", color: "#64748B" }}>Eğitmen: </span>
                        <strong style={{ fontSize: "13px", color: "#0F2645" }}>{lesson.match?.teacher?.name}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Date, Duration, Location */}
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
                        Tür: <strong>{lesson.locationType === "ONLINE" ? "Online" : "Yüz Yüze"}</strong>
                      </span>
                    </div>

                    {lesson.locationDetails && (
                      <div style={{ fontSize: "12px", color: "#1E40AF", marginTop: "6px", wordBreak: "break-all" }}>
                        📍 <strong>Detay:</strong> {lesson.locationDetails}
                      </div>
                    )}
                  </div>
                </div>

                {/* STUDENT PAYMENT (TAHSİLAT) STATUS DETAIL STRIP */}
                {lesson.paymentStatus === "PAID" && (
                  <div
                    style={{
                      backgroundColor: "#F0FDF4",
                      border: "1px solid #BBF7D0",
                      borderRadius: "10px",
                      padding: "12px 16px",
                      marginBottom: "10px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap", fontSize: "12px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: "800", color: "#166534" }}>
                        <CreditCard size={15} color="#16A34A" />
                        Öğrenci Tahsilatı: <span style={{ fontSize: "14px", color: "#065F46" }}>{lesson.paidAmount ? Number(lesson.paidAmount).toLocaleString("tr-TR") + " ₺" : "Tutar Belirtilmedi"}</span>
                      </span>
                      {lesson.paidBy && (
                        <span style={{ color: "#374151" }}>
                          Kimden: <strong>{lesson.paidBy}</strong>
                        </span>
                      )}
                      {lesson.paymentMethod && (
                        <span style={{ color: "#374151" }}>
                          Yöntem: <strong>{
                            lesson.paymentMethod === "HAVALE_EFT" ? "Havale / EFT" :
                            lesson.paymentMethod === "FAST" ? "FAST" :
                            lesson.paymentMethod === "KREDI_KARTI" ? "Kredi Kartı" :
                            lesson.paymentMethod === "NAKIT" ? "Nakit" : lesson.paymentMethod
                          }</strong>
                        </span>
                      )}
                      {lesson.paymentDate && (
                        <span style={{ color: "#64748B" }}>
                          Tarih: <strong>{new Date(lesson.paymentDate).toLocaleDateString("tr-TR")}</strong>
                        </span>
                      )}
                      {lesson.paymentNotes && (
                        <span style={{ color: "#475569", fontStyle: "italic" }}>
                          (Not: {lesson.paymentNotes})
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => openPaymentModal(lesson)}
                      style={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #86EFAC",
                        color: "#15803D",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: "700",
                        cursor: "pointer",
                      }}
                    >
                      Tahsilatı Düzenle
                    </button>
                  </div>
                )}

                {lesson.paymentStatus === "FAILED" && (
                  <div
                    style={{
                      backgroundColor: "#FEF2F2",
                      border: "1.5px solid #FCA5A5",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      marginBottom: "10px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    <div style={{ fontSize: "12px", color: "#991B1B" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "800", marginBottom: "3px" }}>
                        <XCircle size={15} color="#DC2626" />
                        Öğrenci Tahsilatı Onaylanmadı / Alınamadı
                      </div>
                      <div style={{ color: "#7F1D1D" }}>
                        <strong>Gerekçe:</strong> {lesson.paymentNotes || "Açıklama girilmedi"}
                      </div>
                    </div>
                    <button
                      onClick={() => openPaymentModal(lesson)}
                      style={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #FECACA",
                        color: "#DC2626",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: "700",
                        cursor: "pointer",
                      }}
                    >
                      Tahsilatı Güncelle
                    </button>
                  </div>
                )}

                {/* TEACHER PAYOUT (HAKEDİŞ) STATUS DETAIL STRIP */}
                {lesson.teacherPaymentStatus === "PAID" && (
                  <div
                    style={{
                      backgroundColor: "#F5F3FF",
                      border: "1px solid #DDD6FE",
                      borderRadius: "10px",
                      padding: "12px 16px",
                      marginBottom: "14px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap", fontSize: "12px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: "800", color: "#6D28D9" }}>
                        <Sparkles size={15} color="#7C3AED" />
                        Eğitmen Ücreti Ödendi: <span style={{ fontSize: "14px", color: "#5B21B6" }}>{lesson.teacherPaidAmount ? Number(lesson.teacherPaidAmount).toLocaleString("tr-TR") + " ₺" : "Tutar Belirtilmedi"}</span>
                      </span>
                      <span style={{ color: "#374151" }}>
                        Kime: <strong>{lesson.match?.teacher?.name}</strong>
                      </span>
                      {lesson.teacherPaymentMethod && (
                        <span style={{ color: "#374151" }}>
                          Yöntem: <strong>{
                            lesson.teacherPaymentMethod === "HAVALE_EFT" ? "Havale / EFT" :
                            lesson.teacherPaymentMethod === "FAST" ? "FAST" :
                            lesson.teacherPaymentMethod === "KREDI_KARTI" ? "Kredi Kartı" :
                            lesson.teacherPaymentMethod === "NAKIT" ? "Nakit" : lesson.teacherPaymentMethod
                          }</strong>
                        </span>
                      )}
                      {lesson.teacherPaidDate && (
                        <span style={{ color: "#64748B" }}>
                          Tarih: <strong>{new Date(lesson.teacherPaidDate).toLocaleDateString("tr-TR")}</strong>
                        </span>
                      )}
                      {lesson.teacherPaymentNotes && (
                        <span style={{ color: "#6B21A8", fontStyle: "italic" }}>
                          (Dekont/Not: {lesson.teacherPaymentNotes})
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => openTeacherPaymentModal(lesson)}
                      style={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #C4B5FD",
                        color: "#6D28D9",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: "700",
                        cursor: "pointer",
                      }}
                    >
                      Ücreti Düzenle
                    </button>
                  </div>
                )}

                {lesson.teacherPaymentStatus === "FAILED" && (
                  <div
                    style={{
                      backgroundColor: "#FEF2F2",
                      border: "1.5px solid #FCA5A5",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      marginBottom: "14px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    <div style={{ fontSize: "12px", color: "#991B1B" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: "800", marginBottom: "3px" }}>
                        <XCircle size={15} color="#DC2626" />
                        Eğitmen Ücreti Bekletildi / Gönderilmedi
                      </div>
                      <div style={{ color: "#7F1D1D" }}>
                        <strong>Gerekçe:</strong> {lesson.teacherPaymentNotes || "Açıklama girilmedi"}
                      </div>
                    </div>
                    <button
                      onClick={() => openTeacherPaymentModal(lesson)}
                      style={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #FECACA",
                        color: "#DC2626",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: "700",
                        cursor: "pointer",
                      }}
                    >
                      Ücreti Güncelle
                    </button>
                  </div>
                )}

                {/* Notes if any */}
                {lesson.notes && (
                  <div style={{ backgroundColor: "#FFFBEB", border: "1px solid #FEF3C7", padding: "10px 14px", borderRadius: "8px", fontSize: "12px", color: "#92400E", marginBottom: "14px" }}>
                    <strong>📝 Ders Notu / Açıklama:</strong> {lesson.notes}
                  </div>
                )}

                {/* Rejection box if REJECTED */}
                {lesson.status === "REJECTED" && (
                  <div style={{ backgroundColor: "#FEF2F2", border: "1.5px solid #FCA5A5", padding: "14px 18px", borderRadius: "10px", marginBottom: "14px", boxShadow: "0 1px 4px rgba(220, 38, 38, 0.05)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", flexWrap: "wrap", gap: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#991B1B", fontWeight: "800", fontSize: "13px" }}>
                        <XCircle size={16} color="#DC2626" /> Reddedildi • {lesson.rejectedBy?.name || "Kullanıcı"} ({lesson.rejectedBy?.role === "TEACHER" ? "Eğitmen" : lesson.rejectedBy?.role === "STUDENT" ? "Öğrenci" : "Yönetici"})
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

                {/* CONFIDENTIAL FEEDBACKS (ONLY ADMIN CAN SEE) */}
                {lesson.status === "COMPLETED" && (
                  <div style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "10px", padding: "14px 16px", marginBottom: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "800", color: "#166534", marginBottom: "10px" }}>
                      <Lock size={15} color="#16A34A" /> 🔒 Yalnızca Yöneticiye Özel Değerlendirme & Yorumlar
                    </div>

                    {(!lesson.feedbacks || lesson.feedbacks.length === 0) ? (
                      <div style={{ fontSize: "12px", color: "#64748B", fontStyle: "italic" }}>
                        Henüz öğrenci veya eğitmen tarafından bu derse özel yorum bırakılmamış.
                      </div>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
                        {lesson.feedbacks.map((f: any) => (
                          <div key={f.id} style={{ backgroundColor: "#FFFFFF", padding: "12px", borderRadius: "8px", border: "1px solid #DCFCE7", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                              <span style={{ fontSize: "12px", fontWeight: "800", color: "#0F2645", display: "flex", alignItems: "center", gap: "4px" }}>
                                {f.userRole === "STUDENT" ? "🎓 Öğrenci Görüşü:" : "👨‍🏫 Eğitmen Görüşü:"} {f.user?.name}
                              </span>
                              {f.rating && (
                                <span style={{ fontSize: "11px", fontWeight: "800", color: "#D97706", display: "flex", alignItems: "center", gap: "2px" }}>
                                  <Star size={12} fill="#F59E0B" color="#F59E0B" /> {f.rating}/5
                                </span>
                              )}
                            </div>
                            <p style={{ fontSize: "12px", color: "#334155", margin: 0, lineHeight: "1.5" }}>
                              "{f.comment}"
                            </p>
                            <div style={{ fontSize: "10px", color: "#94A3B8", marginTop: "6px", textAlign: "right" }}>
                              {new Date(f.createdAt).toLocaleString("tr-TR")}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom Row: Status Checkers & Admin Controls */}
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "10px", paddingTop: "12px", borderTop: "1px solid #F1F5F9" }}>
                  {/* Approval / Completion Flags based on Status */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", fontSize: "12px" }}>
                    {lesson.status === "PENDING_APPROVAL" && (
                      <>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: lesson.studentApproved ? "#16A34A" : "#D97706", fontWeight: "600" }}>
                          {lesson.studentApproved ? <CheckCircle2 size={13} /> : <Clock size={13} />} Öğrenci Planlama Onayı: {lesson.studentApproved ? "Verildi" : "Bekleniyor"}
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: lesson.teacherApproved ? "#16A34A" : "#D97706", fontWeight: "600" }}>
                          {lesson.teacherApproved ? <CheckCircle2 size={13} /> : <Clock size={13} />} Eğitmen Planlama Onayı: {lesson.teacherApproved ? "Verildi" : "Bekleniyor"}
                        </span>
                      </>
                    )}

                    {lesson.status === "SCHEDULED" && (
                      <>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#16A34A", fontWeight: "700" }}>
                          <CheckCircle2 size={13} /> Karşılıklı Planlama Onaylandı
                        </span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: (lesson.studentCompleted && lesson.teacherCompleted) ? "#16A34A" : "#475569" }}>
                          Ders Sonu Onayları: Öğrenci ({lesson.studentCompleted ? "✅" : "⏳"}) • Eğitmen ({lesson.teacherCompleted ? "✅" : "⏳"})
                        </span>
                      </>
                    )}

                    {lesson.status === "COMPLETED" && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#16A34A", fontWeight: "700" }}>
                        <CheckCircle2 size={14} /> Karşılıklı İşlendi & Tamamlandı ({new Date(lesson.completedAt || lesson.updatedAt).toLocaleDateString("tr-TR")})
                      </span>
                    )}

                    {lesson.status === "REJECTED" && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#DC2626", fontWeight: "700" }}>
                        <XCircle size={14} /> Oturum Reddedildi • {lesson.rejectedBy?.name || "Kullanıcı"} ({lesson.rejectedBy?.role === "TEACHER" ? "Eğitmen" : lesson.rejectedBy?.role === "STUDENT" ? "Öğrenci" : "Yönetici"}) tarafından reddedildi
                      </span>
                    )}
                  </div>

                  {/* Admin Intervention Buttons */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    {/* Student Payment Action Button */}
                    <button
                      onClick={() => openPaymentModal(lesson)}
                      style={{
                        backgroundColor:
                          lesson.paymentStatus === "PAID"
                            ? "#ECFDF5"
                            : lesson.paymentStatus === "FAILED"
                            ? "#FEF2F2"
                            : "#FFFBEB",
                        color:
                          lesson.paymentStatus === "PAID"
                            ? "#065F46"
                            : lesson.paymentStatus === "FAILED"
                            ? "#991B1B"
                            : "#92400E",
                        border: `1px solid ${
                          lesson.paymentStatus === "PAID"
                            ? "#A7F3D0"
                            : lesson.paymentStatus === "FAILED"
                            ? "#FECACA"
                            : "#FDE68A"
                        }`,
                        borderRadius: "6px",
                        padding: "6px 12px",
                        fontSize: "12px",
                        fontWeight: "700",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                      }}
                    >
                      <CreditCard size={13} color={lesson.paymentStatus === "PAID" ? "#10B981" : lesson.paymentStatus === "FAILED" ? "#EF4444" : "#F59E0B"} />
                      {lesson.paymentStatus === "PAID" ? "Tahsilatı Düzenle" : "💳 Öğrenci Tahsilatı"}
                    </button>

                    {/* Teacher Payout Action Button */}
                    <button
                      onClick={() => openTeacherPaymentModal(lesson)}
                      style={{
                        backgroundColor:
                          lesson.teacherPaymentStatus === "PAID"
                            ? "#F5F3FF"
                            : lesson.teacherPaymentStatus === "FAILED"
                            ? "#FEF2F2"
                            : "#F8FAFC",
                        color:
                          lesson.teacherPaymentStatus === "PAID"
                            ? "#6D28D9"
                            : lesson.teacherPaymentStatus === "FAILED"
                            ? "#991B1B"
                            : "#475569",
                        border: `1px solid ${
                          lesson.teacherPaymentStatus === "PAID"
                            ? "#DDD6FE"
                            : lesson.teacherPaymentStatus === "FAILED"
                            ? "#FECACA"
                            : "#CBD5E1"
                        }`,
                        borderRadius: "6px",
                        padding: "6px 12px",
                        fontSize: "12px",
                        fontWeight: "700",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                      }}
                    >
                      <Sparkles size={13} color={lesson.teacherPaymentStatus === "PAID" ? "#7C3AED" : lesson.teacherPaymentStatus === "FAILED" ? "#EF4444" : "#64748B"} />
                      {lesson.teacherPaymentStatus === "PAID" ? "Ücreti Düzenle" : "💰 Eğitmen Ücreti Gönder"}
                    </button>

                    {lesson.status === "PENDING_APPROVAL" && (
                      <>
                        <button
                          onClick={() => handleApprove(lesson.id)}
                          disabled={submitting}
                          style={{
                            backgroundColor: "#16A34A",
                            color: "#FFFFFF",
                            border: "none",
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
                          <CheckCircle2 size={13} /> Admin Onayla
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
                            padding: "6px 10px",
                            fontSize: "12px",
                            fontWeight: "700",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <XCircle size={13} /> Reddet
                        </button>
                      </>
                    )}

                    {lesson.status === "SCHEDULED" && (
                      <button
                        onClick={() => handleComplete(lesson.id)}
                        disabled={submitting}
                        style={{
                          backgroundColor: "#0F2645",
                          color: "#FFFFFF",
                          border: "none",
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
                        <CheckCircle2 size={13} color="#C8952A" /> Tamamlandı Olarak İşaretle
                      </button>
                    )}

                    {/* History Button */}
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
                      {expandedLogs[lesson.id] ? "Gizle" : "İşlem Logları"}
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

      {/* CREATE LESSON MODAL (ADMIN) */}
      {showCreateModal && (
        <div className="fixed-modal-overlay">
          <div className="modal-container-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #E2E8F0", paddingBottom: "12px" }}>
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800", color: "#0F2645", display: "flex", alignItems: "center", gap: "8px" }}>
                <Calendar size={20} color="#C8952A" /> Yönetici Ders Planlama
              </h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#94A3B8" }}>
                ✕
              </button>
            </div>

            <p style={{ fontSize: "12px", color: "#64748B", marginTop: 0 }}>
              Yönetici olarak oluşturulan dersler <strong>doğrudan onaylı ve planlanmış (SCHEDULED)</strong> olarak açılır.
            </p>

            <form onSubmit={handleCreateLesson}>
              {/* Match Select */}
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#0F2645", marginBottom: "4px" }}>
                  Eşleştirme Seçiniz *
                </label>
                <select
                  value={createForm.matchId}
                  onChange={(e) => setCreateForm({ ...createForm, matchId: e.target.value })}
                  required
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", outline: "none" }}
                >
                  <option value="">-- Öğrenci & Eğitmen Eşleştirmesi Seçiniz --</option>
                  {matches.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.student?.name} ↔ {m.teacher?.name} ({m.type === "KOCLUK" ? "Koçluk" : `Özel Ders - ${m.subject || "Genel"}`})
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#0F2645" }}>
                    {createForm.locationType === "ONLINE" ? "Toplantı Linki veya Platformu (Opsiyonel)" : "Buluşma Yeri / Adresi (Opsiyonel)"}
                  </label>
                  {createForm.locationType === "YUZ_YUZE" && (() => {
                    const selMatch = matches.find((m) => m.id === createForm.matchId);
                    const prof = selMatch?.student?.studentProfile;
                    const addr = [prof?.currentDistrict, prof?.currentAddress].filter(Boolean).join(" - ");
                    if (!addr) return null;
                    return (
                      <button
                        type="button"
                        onClick={() => setCreateForm({ ...createForm, locationDetails: addr })}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#2563EB",
                          fontSize: "11px",
                          fontWeight: "700",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "3px",
                        }}
                      >
                        <MapPin size={12} /> Öğrencinin Adresini Getir ({prof?.currentDistrict || "Ev"})
                      </button>
                    );
                  })()}
                </div>
                <input
                  type="text"
                  placeholder={createForm.locationType === "ONLINE" ? "Örn: Zoom / Meet linki" : "Örn: Pont Akademi Merkez, Öğrenci Evi..."}
                  value={createForm.locationDetails}
                  onChange={(e) => setCreateForm({ ...createForm, locationDetails: e.target.value })}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", outline: "none" }}
                />
              </div>

              {/* Notes */}
              <div style={{ marginBottom: "18px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#0F2645", marginBottom: "4px" }}>
                  Ders Notu / Yönetici Açıklaması
                </label>
                <textarea
                  rows={2}
                  placeholder="Ders hakkında yöneticinin eklemek istediği not..."
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
                  {submitting ? "Planlanıyor..." : "Dersi Planla ve Onayla"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT MODAL (ADMIN) */}
      {showRejectModal && selectedLesson && (
        <div className="fixed-modal-overlay">
          <div className="modal-container-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", borderBottom: "1px solid #E2E8F0", paddingBottom: "10px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#DC2626", display: "flex", alignItems: "center", gap: "8px" }}>
                <XCircle size={18} /> Dersi Reddet / İptal Et (Admin)
              </h3>
              <button onClick={() => setShowRejectModal(false)} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#94A3B8" }}>
                ✕
              </button>
            </div>

            <p style={{ fontSize: "13px", color: "#64748B", marginTop: 0 }}>
              Ders talebini yönetici yetkisiyle reddetmek üzeresiniz. Lütfen tarafların göreceği bir <strong>ret gerekçesi</strong> belirtiniz.
            </p>

            <form onSubmit={handleReject}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#0F2645", marginBottom: "4px" }}>
                  Reddetme Gerekçesi *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Yönetici ret sebebi..."
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
                  {submitting ? "İşleniyor..." : "Reddi Onayla"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL (ADMIN) */}
      {showPaymentModal && paymentLesson && (
        <div className="fixed-modal-overlay">
          <div className="modal-container-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", borderBottom: "1px solid #E2E8F0", paddingBottom: "10px" }}>
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800", color: "#0F2645", display: "flex", alignItems: "center", gap: "8px" }}>
                <CreditCard size={20} color="#C8952A" /> Ders Ödeme Onayı & Tahsilat Kaydı
              </h3>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentLesson(null);
                }}
                style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#94A3B8" }}
              >
                ✕
              </button>
            </div>

            {/* Lesson summary banner */}
            <div style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "12px 14px", marginBottom: "16px", fontSize: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ color: "#64748B" }}>Öğrenci: <strong style={{ color: "#0F2645" }}>{paymentLesson.match?.student?.name}</strong></span>
                <span style={{ color: "#64748B" }}>Eğitmen: <strong style={{ color: "#0F2645" }}>{paymentLesson.match?.teacher?.name}</strong></span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#64748B" }}>
                <span>Ders: <strong style={{ color: "#0F2645" }}>{paymentLesson.match?.type === "KOCLUK" ? "Koçluk" : "Özel Ders"} • {paymentLesson.match?.subject || "Genel"}</strong></span>
                <span>Tarih: <strong style={{ color: "#0F2645" }}>{new Date(paymentLesson.scheduledDate).toLocaleDateString("tr-TR")}</strong></span>
              </div>
            </div>

            <form onSubmit={handleUpdatePayment}>
              {/* Payment Status Switcher */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#0F2645", marginBottom: "6px" }}>
                  Ödeme Durumu Seçiniz *
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => setPaymentForm({ ...paymentForm, paymentStatus: "PAID" })}
                    style={{
                      padding: "10px 6px",
                      borderRadius: "8px",
                      border: paymentForm.paymentStatus === "PAID" ? "2px solid #16A34A" : "1px solid #CBD5E1",
                      backgroundColor: paymentForm.paymentStatus === "PAID" ? "#ECFDF5" : "#FFFFFF",
                      color: paymentForm.paymentStatus === "PAID" ? "#065F46" : "#475569",
                      fontWeight: "700",
                      fontSize: "12px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                      textAlign: "center",
                    }}
                  >
                    <CheckCircle2 size={16} color={paymentForm.paymentStatus === "PAID" ? "#16A34A" : "#94A3B8"} />
                    <span>Ödeme Alındı</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentForm({ ...paymentForm, paymentStatus: "FAILED" })}
                    style={{
                      padding: "10px 6px",
                      borderRadius: "8px",
                      border: paymentForm.paymentStatus === "FAILED" ? "2px solid #DC2626" : "1px solid #CBD5E1",
                      backgroundColor: paymentForm.paymentStatus === "FAILED" ? "#FEF2F2" : "#FFFFFF",
                      color: paymentForm.paymentStatus === "FAILED" ? "#991B1B" : "#475569",
                      fontWeight: "700",
                      fontSize: "12px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                      textAlign: "center",
                    }}
                  >
                    <XCircle size={16} color={paymentForm.paymentStatus === "FAILED" ? "#DC2626" : "#94A3B8"} />
                    <span>Onaylanmadı / Alınamadı</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentForm({ ...paymentForm, paymentStatus: "UNPAID" })}
                    style={{
                      padding: "10px 6px",
                      borderRadius: "8px",
                      border: paymentForm.paymentStatus === "UNPAID" ? "2px solid #D97706" : "1px solid #CBD5E1",
                      backgroundColor: paymentForm.paymentStatus === "UNPAID" ? "#FFFBEB" : "#FFFFFF",
                      color: paymentForm.paymentStatus === "UNPAID" ? "#92400E" : "#475569",
                      fontWeight: "700",
                      fontSize: "12px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                      textAlign: "center",
                    }}
                  >
                    <Clock size={16} color={paymentForm.paymentStatus === "UNPAID" ? "#D97706" : "#94A3B8"} />
                    <span>Ödeme Bekliyor</span>
                  </button>
                </div>
              </div>

              {/* PAID Form Fields */}
              {paymentForm.paymentStatus === "PAID" && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#0F2645", marginBottom: "4px" }}>
                        Kimden Alındı? *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Örn: Samet Kazdal (Öğrenci/Veli)"
                        value={paymentForm.paidBy}
                        onChange={(e) => setPaymentForm({ ...paymentForm, paidBy: e.target.value })}
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", outline: "none" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#0F2645", marginBottom: "4px" }}>
                        Tahsil Edilen Tutar (₺) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        required
                        placeholder="Örn: 1500"
                        value={paymentForm.paidAmount}
                        onChange={(e) => setPaymentForm({ ...paymentForm, paidAmount: e.target.value })}
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", outline: "none" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#0F2645", marginBottom: "4px" }}>
                        Ödeme Alınma Tarihi *
                      </label>
                      <input
                        type="date"
                        required
                        value={paymentForm.paymentDate}
                        onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", outline: "none" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#0F2645", marginBottom: "4px" }}>
                        Ödeme Yöntemi *
                      </label>
                      <select
                        value={paymentForm.paymentMethod}
                        onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", outline: "none" }}
                      >
                        <option value="HAVALE_EFT">Havale / EFT</option>
                        <option value="FAST">FAST</option>
                        <option value="KREDI_KARTI">Kredi Kartı / Banka Kartı</option>
                        <option value="NAKIT">Nakit</option>
                        <option value="DIGER">Diğer</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: "18px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#0F2645", marginBottom: "4px" }}>
                      Ödeme Notu / Dekont Açıklaması (Opsiyonel)
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: Garanti Bankası dekont no: #98231"
                      value={paymentForm.paymentNotes}
                      onChange={(e) => setPaymentForm({ ...paymentForm, paymentNotes: e.target.value })}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", outline: "none" }}
                    />
                  </div>
                </>
              )}

              {/* FAILED Form Fields */}
              {paymentForm.paymentStatus === "FAILED" && (
                <div style={{ marginBottom: "18px" }}>
                  <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", padding: "10px 12px", fontSize: "12px", color: "#991B1B", marginBottom: "12px" }}>
                    ⚠️ Özel bir durumdan kaynaklı olarak ödeme alınamadıysa ve süreç <strong>Onaylanmadı / Alınamadı</strong> durumuna çekilmek isteniyorsa, lütfen sebebini açıklayınız.
                  </div>

                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#DC2626", marginBottom: "4px" }}>
                    Ödemenin Alınamama / Onaylanmama Sebebi *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Örn: Öğrenci dersi mazeretsiz iptal etti, veli ile iletişime geçildiğinde ödeme yapılmayacağı iletildi..."
                    value={paymentForm.paymentNotes}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentNotes: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1.5px solid #FCA5A5", fontSize: "13px", color: "#0F2645", outline: "none", resize: "vertical" }}
                  />
                </div>
              )}

              {/* UNPAID Notice */}
              {paymentForm.paymentStatus === "UNPAID" && (
                <div style={{ backgroundColor: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "8px", padding: "12px", fontSize: "12px", color: "#92400E", marginBottom: "18px" }}>
                  ℹ️ Bu seçim yapıldığında ders kartının ödeme durumu <strong>Ödeme Bekliyor</strong> olarak ayarlanır ve önceki tahsilat bilgileri temizlenir.
                </div>
              )}

              {/* Modal Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentLesson(null);
                  }}
                  style={{ padding: "8px 14px", borderRadius: "6px", border: "1px solid #CBD5E1", backgroundColor: "#FFFFFF", color: "#475569", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: paymentForm.paymentStatus === "FAILED" ? "#DC2626" : "#0F2645",
                    color: "#FFFFFF",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <CreditCard size={14} color="#C8952A" />
                  {submitting ? "Kaydediliyor..." : "Tahsilat Kaydını Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEACHER PAYOUT MODAL (ADMIN -> TEACHER) */}
      {showTeacherPaymentModal && teacherPaymentLesson && (
        <div className="fixed-modal-overlay">
          <div className="modal-container-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", borderBottom: "1px solid #E2E8F0", paddingBottom: "10px" }}>
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800", color: "#6D28D9", display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={20} color="#7C3AED" /> Eğitmen Ücret Transferi
              </h3>
              <button
                onClick={() => {
                  setShowTeacherPaymentModal(false);
                  setTeacherPaymentLesson(null);
                }}
                style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#94A3B8" }}
              >
                ✕
              </button>
            </div>

            {/* Lesson summary banner */}
            <div style={{ backgroundColor: "#F5F3FF", border: "1px solid #DDD6FE", borderRadius: "10px", padding: "12px 14px", marginBottom: "16px", fontSize: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ color: "#6B21A8" }}>Eğitmen: <strong style={{ color: "#5B21B6" }}>{teacherPaymentLesson.match?.teacher?.name}</strong></span>
                <span style={{ color: "#6B21A8" }}>Öğrenci: <strong style={{ color: "#0F2645" }}>{teacherPaymentLesson.match?.student?.name}</strong></span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#6B21A8" }}>
                <span>Ders: <strong style={{ color: "#0F2645" }}>{teacherPaymentLesson.match?.type === "KOCLUK" ? "Koçluk" : "Özel Ders"} • {teacherPaymentLesson.match?.subject || "Genel"}</strong></span>
                <span>Tarih: <strong style={{ color: "#0F2645" }}>{new Date(teacherPaymentLesson.scheduledDate).toLocaleDateString("tr-TR")}</strong></span>
              </div>
              {teacherPaymentLesson.paidAmount && (
                <div style={{ marginTop: "6px", paddingTop: "6px", borderTop: "1px dashed #DDD6FE", fontSize: "11px", color: "#065F46", fontWeight: "700" }}>
                  💳 Öğrenciden Tahsil Edilen Tutar: {Number(teacherPaymentLesson.paidAmount).toLocaleString("tr-TR")} ₺ ({teacherPaymentLesson.paidBy || "Öğrenci"})
                </div>
              )}
            </div>

            <form onSubmit={handleUpdateTeacherPayment}>
              {/* Payment Status Switcher */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#0F2645", marginBottom: "6px" }}>
                  Ücret Transfer Durumu *
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                  <button
                    type="button"
                    onClick={() => setTeacherPaymentForm({ ...teacherPaymentForm, teacherPaymentStatus: "PAID" })}
                    style={{
                      padding: "10px 6px",
                      borderRadius: "8px",
                      border: teacherPaymentForm.teacherPaymentStatus === "PAID" ? "2px solid #7C3AED" : "1px solid #CBD5E1",
                      backgroundColor: teacherPaymentForm.teacherPaymentStatus === "PAID" ? "#F5F3FF" : "#FFFFFF",
                      color: teacherPaymentForm.teacherPaymentStatus === "PAID" ? "#5B21B6" : "#475569",
                      fontWeight: "700",
                      fontSize: "12px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                      textAlign: "center",
                    }}
                  >
                    <CheckCircle2 size={16} color={teacherPaymentForm.teacherPaymentStatus === "PAID" ? "#7C3AED" : "#94A3B8"} />
                    <span>Ücret Ödendi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTeacherPaymentForm({ ...teacherPaymentForm, teacherPaymentStatus: "FAILED" })}
                    style={{
                      padding: "10px 6px",
                      borderRadius: "8px",
                      border: teacherPaymentForm.teacherPaymentStatus === "FAILED" ? "2px solid #DC2626" : "1px solid #CBD5E1",
                      backgroundColor: teacherPaymentForm.teacherPaymentStatus === "FAILED" ? "#FEF2F2" : "#FFFFFF",
                      color: teacherPaymentForm.teacherPaymentStatus === "FAILED" ? "#991B1B" : "#475569",
                      fontWeight: "700",
                      fontSize: "12px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                      textAlign: "center",
                    }}
                  >
                    <XCircle size={16} color={teacherPaymentForm.teacherPaymentStatus === "FAILED" ? "#DC2626" : "#94A3B8"} />
                    <span>Bekletildi / İptal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTeacherPaymentForm({ ...teacherPaymentForm, teacherPaymentStatus: "UNPAID" })}
                    style={{
                      padding: "10px 6px",
                      borderRadius: "8px",
                      border: teacherPaymentForm.teacherPaymentStatus === "UNPAID" ? "2px solid #D97706" : "1px solid #CBD5E1",
                      backgroundColor: teacherPaymentForm.teacherPaymentStatus === "UNPAID" ? "#FFFBEB" : "#FFFFFF",
                      color: teacherPaymentForm.teacherPaymentStatus === "UNPAID" ? "#92400E" : "#475569",
                      fontWeight: "700",
                      fontSize: "12px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                      textAlign: "center",
                    }}
                  >
                    <Clock size={16} color={teacherPaymentForm.teacherPaymentStatus === "UNPAID" ? "#D97706" : "#94A3B8"} />
                    <span>Transfer Bekliyor</span>
                  </button>
                </div>
              </div>

              {/* PAID Form Fields */}
              {teacherPaymentForm.teacherPaymentStatus === "PAID" && (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#0F2645", marginBottom: "4px" }}>
                        Eğitmene Aktarılan Tutar (₺) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        required
                        placeholder="Örn: 1000"
                        value={teacherPaymentForm.teacherPaidAmount}
                        onChange={(e) => setTeacherPaymentForm({ ...teacherPaymentForm, teacherPaidAmount: e.target.value })}
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", outline: "none" }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#0F2645", marginBottom: "4px" }}>
                        Transfer Yöntemi *
                      </label>
                      <select
                        value={teacherPaymentForm.teacherPaymentMethod}
                        onChange={(e) => setTeacherPaymentForm({ ...teacherPaymentForm, teacherPaymentMethod: e.target.value })}
                        style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", outline: "none" }}
                      >
                        <option value="HAVALE_EFT">Banka Havalesi / EFT</option>
                        <option value="FAST">FAST (Anlık Transfer)</option>
                        <option value="KREDI_KARTI">Kredi / Banka Kartı</option>
                        <option value="NAKIT">Elden / Nakit</option>
                        <option value="DIGER">Diğer</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: "14px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#0F2645", marginBottom: "4px" }}>
                      Transfer / Gönderim Tarihi *
                    </label>
                    <input
                      type="date"
                      required
                      value={teacherPaymentForm.teacherPaidDate}
                      onChange={(e) => setTeacherPaymentForm({ ...teacherPaymentForm, teacherPaidDate: e.target.value })}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", outline: "none" }}
                    />
                  </div>

                  <div style={{ marginBottom: "18px" }}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#0F2645", marginBottom: "4px" }}>
                      Dekont No / Transfer Kanıtı Açıklaması (Öğretmen Görebilir)
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: Garanti BBVA Dekont No: #TR98321"
                      value={teacherPaymentForm.teacherPaymentNotes}
                      onChange={(e) => setTeacherPaymentForm({ ...teacherPaymentForm, teacherPaymentNotes: e.target.value })}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", outline: "none" }}
                    />
                  </div>
                </>
              )}

              {/* FAILED Form Fields */}
              {teacherPaymentForm.teacherPaymentStatus === "FAILED" && (
                <div style={{ marginBottom: "18px" }}>
                  <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", padding: "10px 12px", fontSize: "12px", color: "#991B1B", marginBottom: "12px" }}>
                    ⚠️ Eğitmen ödemesi yapılmadıysa veya bekletildiyse lütfen sebebini açıklayınız.
                  </div>

                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#DC2626", marginBottom: "4px" }}>
                    Ücretin Gönderilmeme / Bekletilme Gerekçesi *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Örn: Ders henüz tamamlanmadı, IBAN bilgisi güncellenmesi bekleniyor..."
                    value={teacherPaymentForm.teacherPaymentNotes}
                    onChange={(e) => setTeacherPaymentForm({ ...teacherPaymentForm, teacherPaymentNotes: e.target.value })}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1.5px solid #FCA5A5", fontSize: "13px", color: "#0F2645", outline: "none", resize: "vertical" }}
                  />
                </div>
              )}

              {/* UNPAID Notice */}
              {teacherPaymentForm.teacherPaymentStatus === "UNPAID" && (
                <div style={{ backgroundColor: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "8px", padding: "12px", fontSize: "12px", color: "#92400E", marginBottom: "18px" }}>
                  ℹ️ Bu seçim yapıldığında ders kartının eğitmen ücreti durumu <strong>Transfer Bekliyor</strong> olarak ayarlanır ve önceki transfer bilgileri sıfırlanır.
                </div>
              )}

              {/* Modal Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowTeacherPaymentModal(false);
                    setTeacherPaymentLesson(null);
                  }}
                  style={{ padding: "8px 14px", borderRadius: "6px", border: "1px solid #CBD5E1", backgroundColor: "#FFFFFF", color: "#475569", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: teacherPaymentForm.teacherPaymentStatus === "FAILED" ? "#DC2626" : "#6D28D9",
                    color: "#FFFFFF",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <Sparkles size={14} color="#DDD6FE" />
                  {submitting ? "Kaydediliyor..." : "Ücret Kaydını Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global CSS for modals */}
      <style jsx>{`
        .fixed-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(15, 38, 69, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          padding: 16px;
        }
        .modal-container-card {
          background-color: #ffffff;
          border-radius: 14px;
          padding: 24px;
          width: 100%;
          max-width: 550px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </div>
  );
}
