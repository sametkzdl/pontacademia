"use client";

import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  UserMinus, 
  AlertCircle, 
  Send, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Sparkles,
  MessageSquare,
  FileText,
  GraduationCap
} from "lucide-react";
import Link from "next/link";

export default function StudentRequestsPage() {
  const [activeTab, setActiveTab] = useState<"lesson" | "drop" | "complaint" | "history">("lesson");
  const [teachers, setTeachers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [matchStatus, setMatchStatus] = useState<{
    requestedSubjects: string[];
    matchedSubjects: Array<{ id: string; type: string; subject: string; teacherName: string; teacherId: string }>;
    matchedRequestedSubjects: Array<{ subject: string; teacherName: string }>;
    unmatchedSubjects: string[];
    hasActiveCoaching: boolean;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form 1: New Lesson Request
  const [lessonSubject, setLessonSubject] = useState("");
  const [lessonLocationPref, setLessonLocationPref] = useState("YUZ_YUZE");
  const [lessonDesc, setLessonDesc] = useState("");

  // Form 2: Drop Teacher Match Request
  const [dropMatchId, setDropMatchId] = useState("");
  const [dropReasonTitle, setDropReasonTitle] = useState("Ders Anlatım / Uyum Uyuşmazlığı");
  const [dropDesc, setDropDesc] = useState("");

  // Form 3: General Complaint & Support
  const [complaintCategory, setComplaintCategory] = useState("Ders İşleyişi & Verimlilik");
  const [complaintDesc, setComplaintDesc] = useState("");

  // Feedback states
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [teachersRes, reqRes, statusRes] = await Promise.all([
        fetch("/api/student/teachers"),
        fetch("/api/requests"),
        fetch("/api/student/match-status"),
      ]);

      if (teachersRes.ok) {
        const teachersData = await teachersRes.json();
        if (teachersData.success) {
          setTeachers(teachersData.teachers || []);
        }
      }

      if (reqRes.ok) {
        const reqData = await reqRes.json();
        if (reqData.success) {
          setRequests(reqData.requests || []);
        }
      }

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        if (statusData.success) {
          setMatchStatus(statusData);
          if (statusData.unmatchedSubjects && statusData.unmatchedSubjects.length > 0) {
            setLessonSubject(statusData.unmatchedSubjects[0]);
          }
        }
      }
    } catch (err) {
      console.error("Fetch student requests data error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Submit Lesson Request
  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonSubject) {
      setErrorMessage("Lütfen talep ettiğiniz dersi seçiniz.");
      return;
    }
    if (!lessonDesc.trim()) {
      setErrorMessage("Lütfen ders hedefiniz ve detaylarınızı açıklayınız.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "STUDENT_LESSON_REQUEST",
          subject: lessonSubject,
          title: `Yeni Ders Talebi: ${lessonSubject} (${lessonLocationPref === "YUZ_YUZE" ? "Yüz Yüze" : "Online"})`,
          description: lessonDesc,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage("Ders talebiniz yöneticiye iletildi. En kısa sürede uygun eğitmen eşleştirmesi yapılacaktır.");
        setLessonDesc("");
        fetchData();
        setTimeout(() => setActiveTab("history"), 1500);
      } else {
        setErrorMessage(data.error || "Talep gönderilemedi.");
      }
    } catch (err) {
      setErrorMessage("Bağlantı hatası oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Drop Teacher Request
  const handleDropSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dropMatchId) {
      setErrorMessage("Lütfen bırakmak istediğiniz öğretmen ve dersi seçiniz.");
      return;
    }
    if (!dropDesc.trim()) {
      setErrorMessage("Lütfen gerekçenizi detaylı şekilde açıklayınız.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "STUDENT_DROP_TEACHER",
          matchId: dropMatchId,
          title: dropReasonTitle,
          description: dropDesc,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage("Eğitmen değişikliği / bırakma talebiniz yönetime iletildi.");
        setDropDesc("");
        fetchData();
        setTimeout(() => setActiveTab("history"), 1500);
      } else {
        setErrorMessage(data.error || "Talep gönderilemedi.");
      }
    } catch (err) {
      setErrorMessage("Bağlantı hatası oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit General Complaint
  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintDesc.trim()) {
      setErrorMessage("Lütfen açıklama giriniz.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "GENERAL_COMPLAINT",
          title: complaintCategory,
          description: complaintDesc,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage("Geri bildiriminiz / şikayetiniz yönetime güvenle iletildi.");
        setComplaintDesc("");
        fetchData();
        setTimeout(() => setActiveTab("history"), 1500);
      } else {
        setErrorMessage(data.error || "Bildirim gönderilemedi.");
      }
    } catch (err) {
      setErrorMessage("Bağlantı hatası oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", backgroundColor: "#FEF3C7", color: "#92400E", padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "700", border: "1px solid #FCD34D" }}>
            <Clock size={12} /> Beklemede
          </span>
        );
      case "IN_REVIEW":
        return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", backgroundColor: "#EFF6FF", color: "#1D4ED8", padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "700", border: "1px solid #BFDBFE" }}>
            <Sparkles size={12} /> İnceleniyor
          </span>
        );
      case "APPROVED":
        return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", backgroundColor: "#DCFCE7", color: "#15803D", padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "700", border: "1px solid #86EFAC" }}>
            <CheckCircle2 size={12} /> Onaylandı
          </span>
        );
      case "RESOLVED":
        return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", backgroundColor: "#EDE9FE", color: "#6D28D9", padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "700", border: "1px solid #DDD6FE" }}>
            <CheckCircle2 size={12} /> Çözümlendi
          </span>
        );
      case "REJECTED":
        return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", backgroundColor: "#FEE2E2", color: "#B91C1C", padding: "4px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "700", border: "1px solid #FCA5A5" }}>
            <XCircle size={12} /> Reddedildi
          </span>
        );
      default:
        return <span style={{ fontSize: "11px", color: "#64748B" }}>{status}</span>;
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#0F2645", marginBottom: "6px", display: "flex", alignItems: "center", gap: "10px" }}>
          <MessageSquare size={24} color="#C8952A" /> Talep & Destek Merkezi
        </h1>
        <p style={{ fontSize: "13px", color: "#64748B", margin: 0 }}>
          Yeni ders talebinde bulunabilir, eğitmen değişikliği isteyebilir veya süreçle ilgili destek/şikayet iletebilirsiniz.
        </p>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap", borderBottom: "1px solid #E2E8F0", paddingBottom: "12px" }}>
        <button
          onClick={() => { setActiveTab("lesson"); setErrorMessage(""); setSuccessMessage(""); }}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: "700",
            cursor: "pointer",
            border: activeTab === "lesson" ? "1.5px solid #2563EB" : "1px solid #CBD5E1",
            backgroundColor: activeTab === "lesson" ? "#EFF6FF" : "#FFFFFF",
            color: activeTab === "lesson" ? "#1D4ED8" : "#475569",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.15s ease",
          }}
        >
          <BookOpen size={16} color={activeTab === "lesson" ? "#2563EB" : "#64748B"} />
          Ders Talep Formu
        </button>

        <button
          onClick={() => { setActiveTab("drop"); setErrorMessage(""); setSuccessMessage(""); }}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: "700",
            cursor: "pointer",
            border: activeTab === "drop" ? "1.5px solid #EA580C" : "1px solid #CBD5E1",
            backgroundColor: activeTab === "drop" ? "#FFF7ED" : "#FFFFFF",
            color: activeTab === "drop" ? "#9A3412" : "#475569",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.15s ease",
          }}
        >
          <UserMinus size={16} color={activeTab === "drop" ? "#EA580C" : "#64748B"} />
          Hoca Bırakma / Değişiklik Talebi
        </button>

        <button
          onClick={() => { setActiveTab("complaint"); setErrorMessage(""); setSuccessMessage(""); }}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: "700",
            cursor: "pointer",
            border: activeTab === "complaint" ? "1.5px solid #DC2626" : "1px solid #CBD5E1",
            backgroundColor: activeTab === "complaint" ? "#FEF2F2" : "#FFFFFF",
            color: activeTab === "complaint" ? "#991B1B" : "#475569",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.15s ease",
          }}
        >
          <AlertCircle size={16} color={activeTab === "complaint" ? "#DC2626" : "#64748B"} />
          Genel Şikayet / Destek Formu
        </button>

        <button
          onClick={() => { setActiveTab("history"); setErrorMessage(""); setSuccessMessage(""); }}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: "700",
            cursor: "pointer",
            border: activeTab === "history" ? "1.5px solid #0F2645" : "1px solid #CBD5E1",
            backgroundColor: activeTab === "history" ? "#0F2645" : "#FFFFFF",
            color: activeTab === "history" ? "#FFFFFF" : "#475569",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            marginLeft: "auto",
            transition: "all 0.15s ease",
          }}
        >
          <FileText size={16} color={activeTab === "history" ? "#C8952A" : "#64748B"} />
          Taleplerim & Süreç Takibi ({requests.length})
        </button>
      </div>

      {/* Feedback Alert Messages */}
      {successMessage && (
        <div style={{ backgroundColor: "#DCFCE7", border: "1px solid #86EFAC", color: "#15803D", padding: "14px 18px", borderRadius: "10px", fontSize: "13px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <CheckCircle2 size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #FCA5A5", color: "#B91C1C", padding: "14px 18px", borderRadius: "10px", fontSize: "13px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* TAB 1: NEW LESSON REQUEST FORM */}
      {activeTab === "lesson" && (
        <div className="tab-pane-transition" style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E2E8F0", padding: "24px", boxShadow: "0 2px 6px rgba(0,0,0,0.03)" }}>
          <div style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: "14px", marginBottom: "18px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "800", color: "#1D4ED8", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <BookOpen size={20} color="#2563EB" /> Yeni Ders / Koçluk Talep Formu
            </h2>
            <p style={{ fontSize: "12px", color: "#64748B", marginTop: "4px", marginBottom: 0 }}>
              Takviye almak istediğiniz dersi seçerek yönetime iletiniz. Yönetim alanında uzman en uygun eğitmeni görevlendirecektir.
            </p>
          </div>

          {/* Profile Guidance Notice */}
          <div style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "10px", padding: "14px 16px", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", flex: 1, minWidth: "260px" }}>
              <Sparkles size={20} color="#16A34A" style={{ marginTop: "2px", flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#166534", marginBottom: "2px" }}>
                  Profilinizdeki Almak İstediğiniz Dersler
                </div>
                <div style={{ fontSize: "12px", color: "#15803D", lineHeight: "1.5" }}>
                  {matchStatus?.unmatchedSubjects && matchStatus.unmatchedSubjects.length > 0 ? (
                    <>
                      Profilinizde kayıtlı olup henüz bir eğitmenle eşleşmemiş dersleriniz (<strong>{matchStatus.unmatchedSubjects.join(", ")}</strong>) aşağıda öncelikli olarak gösterilmektedir.
                    </>
                  ) : (
                    <>
                      Profilinizde kayıtlı eşleşme bekleyen ders bulunmamaktadır.
                    </>
                  )}{" "}
                  <strong>Eğer başka bir ders almak istiyorsanız lütfen profilinizden derslerinizi güncelleyiniz.</strong>
                </div>
              </div>
            </div>
            <Link
              href="/student/profile"
              style={{
                backgroundColor: "#16A34A",
                color: "#FFFFFF",
                padding: "8px 14px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "700",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                whiteSpace: "nowrap",
              }}
            >
              Profilde Dersleri Güncelle →
            </Link>
          </div>

          <form onSubmit={handleLessonSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#0F2645", marginBottom: "6px" }}>
                  Almak İstediğiniz Ders / Branş *
                </label>
                {matchStatus?.unmatchedSubjects && matchStatus.unmatchedSubjects.length > 0 ? (
                  <select
                    value={lessonSubject}
                    onChange={(e) => setLessonSubject(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1.5px solid #2563EB", fontSize: "13px", color: "#0F2645", outline: "none", backgroundColor: "#F8FAFC", fontWeight: "700" }}
                  >
                    {matchStatus.unmatchedSubjects.map((sub) => (
                      <option key={`unmatched-${sub}`} value={sub}>
                        🎯 {sub}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div style={{ padding: "10px 12px", borderRadius: "8px", border: "1px dashed #CBD5E1", backgroundColor: "#F8FAFC", fontSize: "12px", color: "#64748B", display: "flex", alignItems: "center", gap: "6px" }}>
                    <AlertCircle size={14} color="#EA580C" />
                    <span>Eşleşme bekleyen ders bulunamadı</span>
                  </div>
                )}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#0F2645", marginBottom: "6px" }}>
                  Ders Tercihi *
                </label>
                <select
                  value={lessonLocationPref}
                  onChange={(e) => setLessonLocationPref(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", outline: "none", backgroundColor: "#FFFFFF" }}
                >
                  <option value="YUZ_YUZE">📍 Yüz Yüze Özel Ders (Ev / Belirlenen Lokasyon)</option>
                  <option value="ONLINE">💻 Online / Canlı Özel Ders</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#0F2645", marginBottom: "6px" }}>
                Ders Hedefiniz ve Özel Talepleriniz *
              </label>
              <textarea
                required
                rows={4}
                value={lessonDesc}
                onChange={(e) => setLessonDesc(e.target.value)}
                placeholder="Örn: TYT Matematik'te Problem ve Fonksiyonlar konusunda takviye almak istiyorum. Haftada 1 gün yüz yüze ders talep ediyorum..."
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", outline: "none", resize: "vertical" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "12px" }}>
              {(!matchStatus?.unmatchedSubjects || matchStatus.unmatchedSubjects.length === 0) && (
                <span style={{ fontSize: "12px", color: "#DC2626", fontWeight: "600" }}>
                  ⚠️ Talep iletmek için profilinizden ders eklemeniz gerekmektedir.
                </span>
              )}
              <button
                type="submit"
                disabled={submitting || !matchStatus?.unmatchedSubjects || matchStatus.unmatchedSubjects.length === 0}
                style={{
                  backgroundColor: (!matchStatus?.unmatchedSubjects || matchStatus.unmatchedSubjects.length === 0) ? "#94A3B8" : "#2563EB",
                  color: "#FFFFFF",
                  padding: "10px 22px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "700",
                  border: "none",
                  cursor: (!matchStatus?.unmatchedSubjects || matchStatus.unmatchedSubjects.length === 0) ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: (!matchStatus?.unmatchedSubjects || matchStatus.unmatchedSubjects.length === 0) ? "none" : "0 2px 6px rgba(37, 99, 235, 0.2)",
                  opacity: (!matchStatus?.unmatchedSubjects || matchStatus.unmatchedSubjects.length === 0) ? 0.7 : 1,
                }}
              >
                <Send size={15} />
                {submitting ? "Gönderiliyor..." : "Ders Talebini İlet"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: DROP TEACHER MATCH FORM */}
      {activeTab === "drop" && (
        <div className="tab-pane-transition" style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E2E8F0", padding: "24px", boxShadow: "0 2px 6px rgba(0,0,0,0.03)" }}>
          <div style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: "14px", marginBottom: "18px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "800", color: "#9A3412", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <UserMinus size={20} color="#EA580C" /> Hoca Bırakma / Eğitmen Değişikliği Talebi
            </h2>
            <p style={{ fontSize: "12px", color: "#64748B", marginTop: "4px", marginBottom: 0 }}>
              Eğitmeninizle yaşadığınız uyum sorunu veya program değişikliği sebebiyle yeni bir hoca talebinde bulunabilirsiniz.
            </p>
          </div>

          <div style={{ backgroundColor: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "10px", padding: "12px 16px", marginBottom: "18px", fontSize: "12px", color: "#92400E", lineHeight: "1.5" }}>
            ℹ️ <strong>Süreç Bilgisi:</strong> Talebiniz yönetici tarafından incelenecek ve onaylandığında mevcut eşleşme pasife alınarak dersiniz için yeni bir eğitmen yönlendirilecektir.
          </div>

          <form onSubmit={handleDropSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#0F2645", marginBottom: "6px" }}>
                Değiştirmek / Bırakmak İstediğiniz Eğitmeni Seçiniz *
              </label>
              <select
                required
                value={dropMatchId}
                onChange={(e) => setDropMatchId(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", outline: "none", backgroundColor: "#FFFFFF" }}
              >
                <option value="">-- Eğitmen Seçiniz --</option>
                {teachers.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.teacher?.name} • {item.type === "KOCLUK" ? "🎓 Eğitim Koçluğu" : `📚 ${item.subject || "Özel Ders"}`}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#0F2645", marginBottom: "6px" }}>
                Değişiklik Gerekçesi *
              </label>
              <select
                value={dropReasonTitle}
                onChange={(e) => setDropReasonTitle(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", outline: "none", backgroundColor: "#FFFFFF" }}
              >
                <option value="Ders Anlatım / Uyum Uyuşmazlığı">Ders Anlatım Tarzı / Öğrenme Uyuşmazlığı</option>
                <option value="Ders Saatleri ve Zaman Uyuşmazlığı">Ders Saatleri ve Zaman Uyuşmazlığı</option>
                <option value="İletişim / İlgi Yetersizliği">İletişim / İlgi Yetersizliği</option>
                <option value="Hedef / Seviye Değişikliği">Hedef / Seviye Değişikliği</option>
                <option value="Diğer Özel Sebep">Diğer Özel Sebep</option>
              </select>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#0F2645", marginBottom: "6px" }}>
                Yöneticiye İletilecek Detaylı Açıklama *
              </label>
              <textarea
                required
                rows={4}
                value={dropDesc}
                onChange={(e) => setDropDesc(e.target.value)}
                placeholder="Örn: Matematik konularında hocamızın anlatım hızına uyum sağlayamadım, daha temelden alan bir eğitmenle devam etmek istiyorum..."
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", outline: "none", resize: "vertical" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  backgroundColor: "#EA580C",
                  color: "#FFFFFF",
                  padding: "10px 22px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "700",
                  border: "none",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 2px 6px rgba(234, 88, 12, 0.2)",
                }}
              >
                <Send size={15} />
                {submitting ? "Gönderiliyor..." : "Değişiklik Talebini İlet"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: GENERAL COMPLAINT / SUPPORT FORM */}
      {activeTab === "complaint" && (
        <div className="tab-pane-transition" style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E2E8F0", padding: "24px", boxShadow: "0 2px 6px rgba(0,0,0,0.03)" }}>
          <div style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: "14px", marginBottom: "18px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "800", color: "#991B1B", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertCircle size={20} color="#DC2626" /> Genel Şikayet / Destek Bildirimi
            </h2>
            <p style={{ fontSize: "12px", color: "#64748B", marginTop: "4px", marginBottom: 0 }}>
              Eğitim süreci, platform veya genel konularla ilgili sorun ve geri bildirimlerinizi doğrudan yönetime iletiniz.
            </p>
          </div>

          <form onSubmit={handleComplaintSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#0F2645", marginBottom: "6px" }}>
                Şikayet / Destek Konusu *
              </label>
              <select
                value={complaintCategory}
                onChange={(e) => setComplaintCategory(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", outline: "none", backgroundColor: "#FFFFFF" }}
              >
                <option value="Ders İşleyişi & Verimlilik">Ders İşleyişi & Verimlilik</option>
                <option value="Eğitmen Tutumu & İletişim">Eğitmen Tutumu & İletişim</option>
                <option value="Ödeme & Muhasebe Sorunu">Ödeme & Muhasebe Konuları</option>
                <option value="Portal & Sistem Problemi">Portal / Sistem Kullanım Problemi</option>
                <option value="Diğer / Genel Geri Bildirim">Diğer / Genel Geri Bildirim</option>
              </select>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#0F2645", marginBottom: "6px" }}>
                Detaylı Açıklama & İlettiğiniz Durum *
              </label>
              <textarea
                required
                rows={4}
                value={complaintDesc}
                onChange={(e) => setComplaintDesc(e.target.value)}
                placeholder="Örn: Ders planlama takviminde saat uyuşmazlığı yaşıyoruz, yönetimin müdahalesini rica ediyorum..."
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", outline: "none", resize: "vertical" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  backgroundColor: "#DC2626",
                  color: "#FFFFFF",
                  padding: "10px 22px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "700",
                  border: "none",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 2px 6px rgba(220, 38, 38, 0.2)",
                }}
              >
                <Send size={15} />
                {submitting ? "Gönderiliyor..." : "Bildirimi Gönder"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: REQUEST HISTORY */}
      {activeTab === "history" && (
        <div className="tab-pane-transition">
          {isLoading ? (
            <div style={{ backgroundColor: "#FFFFFF", padding: "40px", borderRadius: "12px", textAlign: "center", color: "#64748B" }}>
              Yükleniyor...
            </div>
          ) : requests.length === 0 ? (
            <div style={{ backgroundColor: "#FFFFFF", padding: "40px", borderRadius: "12px", textAlign: "center", color: "#94A3B8", border: "1px solid #E2E8F0" }}>
              <MessageSquare size={36} color="#CBD5E1" style={{ margin: "0 auto 10px" }} />
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#475569" }}>Henüz oluşturulmuş bir talebiniz bulunmuyor.</div>
              <div style={{ fontSize: "12px", marginTop: "4px" }}>Ders taleplerinizi veya bildirimlerinizi yukarıdaki sekmelerden iletebilirsiniz.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {requests.map((req) => (
                <div
                  key={req.id}
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    padding: "18px 20px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px", marginBottom: "10px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <span style={{
                          padding: "3px 8px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: "800",
                          backgroundColor:
                            req.type === "STUDENT_LESSON_REQUEST" ? "#EFF6FF" :
                            req.type === "STUDENT_DROP_TEACHER" ? "#FFF7ED" : "#FEE2E2",
                          color:
                            req.type === "STUDENT_LESSON_REQUEST" ? "#1D4ED8" :
                            req.type === "STUDENT_DROP_TEACHER" ? "#9A3412" : "#991B1B",
                          border:
                            req.type === "STUDENT_LESSON_REQUEST" ? "1px solid #BFDBFE" :
                            req.type === "STUDENT_DROP_TEACHER" ? "1px solid #FDBA74" : "1px solid #FCA5A5",
                        }}>
                          {req.type === "STUDENT_LESSON_REQUEST" ? "📚 Ders Talebi" :
                           req.type === "STUDENT_DROP_TEACHER" ? "🔄 Hoca Bırakma / Değişiklik" : "⚠️ Şikayet & Destek"}
                        </span>
                        <span style={{ fontSize: "14px", fontWeight: "800", color: "#0F2645" }}>
                          {req.title || "Talep"}
                        </span>
                      </div>

                      {req.targetTeacher && (
                        <div style={{ fontSize: "12px", color: "#475569", marginTop: "4px" }}>
                          İlgili Eğitmen: <strong>{req.targetTeacher.name}</strong> {req.subject ? `• Branş: ${req.subject}` : ""}
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {getStatusBadge(req.status)}
                      <span style={{ fontSize: "12px", color: "#94A3B8" }}>
                        {new Date(req.createdAt).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <div style={{ backgroundColor: "#F8FAFC", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#334155", marginBottom: req.adminNotes ? "12px" : "0" }}>
                    <strong>Açıklamanız:</strong> {req.description}
                  </div>

                  {/* Admin Reply if exists */}
                  {req.adminNotes && (
                    <div style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "8px", padding: "10px 14px", fontSize: "12px", color: "#166534" }}>
                      <div style={{ fontWeight: "800", marginBottom: "3px", display: "flex", alignItems: "center", gap: "6px" }}>
                        <CheckCircle2 size={14} color="#16A34A" /> Yönetici Yanıtı & İşlem Notu:
                      </div>
                      <div>{req.adminNotes}</div>
                      {req.resolvedBy && (
                        <div style={{ fontSize: "11px", color: "#15803D", marginTop: "4px", fontStyle: "italic" }}>
                          İşlem Yapan: {req.resolvedBy.name} ({new Date(req.resolvedAt || req.updatedAt).toLocaleDateString("tr-TR")})
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
