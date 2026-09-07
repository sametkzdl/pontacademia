"use client";

import React, { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  UserMinus, 
  Send, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  HelpCircle, 
  MessageSquare,
  Sparkles,
  AlertCircle,
  FileText
} from "lucide-react";
import { Button, Input, Textarea, Select, Badge } from "@/components";

export default function TeacherRequestsPage() {
  const [activeTab, setActiveTab] = useState<"complaint" | "drop" | "history">("complaint");
  const [students, setStudents] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form States - Student Complaint
  const [complaintStudentId, setComplaintStudentId] = useState("");
  const [complaintTitle, setComplaintTitle] = useState("Derse Katılmama / Devamsızlık");
  const [complaintDesc, setComplaintDesc] = useState("");

  // Form States - Drop Student
  const [dropMatchId, setDropMatchId] = useState("");
  const [dropReasonTitle, setDropReasonTitle] = useState("Zaman / Program Uyuşmazlığı");
  const [dropDesc, setDropDesc] = useState("");

  // Action feedback
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [studentsRes, reqRes] = await Promise.all([
        fetch("/api/teacher/students"),
        fetch("/api/requests"),
      ]);

      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        if (studentsData.success) {
          setStudents(studentsData.students || []);
        }
      }

      if (reqRes.ok) {
        const reqData = await reqRes.json();
        if (reqData.success) {
          setRequests(reqData.requests || []);
        }
      }
    } catch (err) {
      console.error("Fetch teacher requests data error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Student Complaint Submission
  const handleComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintStudentId) {
      setErrorMessage("Lütfen şikayet konusu öğrenciyi seçiniz.");
      return;
    }
    if (!complaintDesc.trim()) {
      setErrorMessage("Lütfen detaylı açıklama giriniz.");
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
          type: "STUDENT_COMPLAINT",
          targetStudentId: complaintStudentId,
          title: complaintTitle,
          description: complaintDesc,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage("Öğrenci şikayet bildiriminiz yönetime başarıyla iletildi.");
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

  // Handle Drop Student Match Submission
  const handleDropSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dropMatchId) {
      setErrorMessage("Lütfen bırakmak / sonlandırmak istediğiniz öğrenci ve dersi seçiniz.");
      return;
    }
    if (!dropDesc.trim()) {
      setErrorMessage("Lütfen bırakma gerekçenizi detaylı şekilde açıklayınız.");
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
          type: "TEACHER_DROP_STUDENT",
          matchId: dropMatchId,
          title: dropReasonTitle,
          description: dropDesc,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage("Öğrenci bırakma talebiniz yönetici onayına iletildi. Onaylandığında eşleşme pasife alınacaktır.");
        setDropDesc("");
        fetchData();
        setTimeout(() => setActiveTab("history"), 1500);
      } else {
        setErrorMessage(data.error || "Talep iletilemedi.");
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
            <CheckCircle2 size={12} /> Onaylandı (İşlem Yapıldı)
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
          <MessageSquare size={24} color="#C8952A" /> Talep & Bildirim Merkezi
        </h1>
        <p style={{ fontSize: "13px", color: "#64748B", margin: 0 }}>
          Öğrencilerinizle ilgili şikayet bildirimlerinizi, eşleşme bırakma taleplerinizi iletebilir ve yönetici geri dönüşlerini takip edebilirsiniz.
        </p>
      </div>

      {/* Sub-Navigation Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap", borderBottom: "1px solid #E2E8F0", paddingBottom: "12px" }}>
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
          <AlertTriangle size={16} color={activeTab === "complaint" ? "#DC2626" : "#64748B"} />
          Öğrenci Şikayet Formu
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
          Öğrenci Bırakma Talebi
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

      {/* Messages */}
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

      {/* TAB 1: STUDENT COMPLAINT FORM */}
      {activeTab === "complaint" && (
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E2E8F0", padding: "24px", boxShadow: "0 2px 6px rgba(0,0,0,0.03)" }}>
          <div style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: "14px", marginBottom: "18px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "800", color: "#991B1B", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertTriangle size={20} color="#DC2626" /> Öğrenci Şikayet & Uyarı Bildirimi
            </h2>
            <p style={{ fontSize: "12px", color: "#64748B", marginTop: "4px", marginBottom: 0 }}>
              Öğrencinin derse devamsızlığı, ödev yapmaması veya iletişim sorunlarını yönetime doğrudan iletiniz.
            </p>
          </div>

          <form onSubmit={handleComplaintSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#0F2645", marginBottom: "6px" }}>
                Şikayet Edilen Öğrenciyi Seçiniz *
              </label>
              <select
                required
                value={complaintStudentId}
                onChange={(e) => setComplaintStudentId(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", outline: "none", backgroundColor: "#FFFFFF" }}
              >
                <option value="">-- Öğrenci Seçiniz ({students.length} Eşleşen Öğrenci) --</option>
                {students.map((item) => (
                  <option key={item.id} value={item.student?.id || item.studentId}>
                    {item.student?.name} • ({item.type === "KOCLUK" ? "Koçluk" : item.subject || "Özel Ders"}) {item.student?.studentProfile?.grade ? `- ${item.student.studentProfile.grade}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#0F2645", marginBottom: "6px" }}>
                Şikayet Konusu / Başlık *
              </label>
              <select
                value={complaintTitle}
                onChange={(e) => setComplaintTitle(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", outline: "none", backgroundColor: "#FFFFFF" }}
              >
                <option value="Derse Katılmama / Devamsızlık">Derse Katılmama / Sürekli Devamsızlık</option>
                <option value="Derse Geç Kalma">Derse Geç Kalma / Zaman Disiplini</option>
                <option value="Ödev ve Görevleri Aksatma">Ödev ve Görevleri Aksatma / İlgisizlik</option>
                <option value="İletişim ve Tutum Sorunu">İletişim ve Tutum Sorunu</option>
                <option value="Ders Materyali ve Hazırlıksızlık">Ders Materyali Eksikliği ve Hazırlıksızlık</option>
                <option value="Diğer Özel Durum">Diğer Özel Durum</option>
              </select>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#0F2645", marginBottom: "6px" }}>
                Detaylı Açıklama & Somut Durum *
              </label>
              <textarea
                required
                rows={4}
                value={complaintDesc}
                onChange={(e) => setComplaintDesc(e.target.value)}
                placeholder="Örn: Öğrenci son 3 haftadır ödevlerini teslim etmedi ve planlanan ders saatlerine 20 dk geç kaldı..."
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
                {submitting ? "Gönderiliyor..." : "Şikayet Bildirimini Gönder"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: DROP STUDENT MATCH FORM */}
      {activeTab === "drop" && (
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E2E8F0", padding: "24px", boxShadow: "0 2px 6px rgba(0,0,0,0.03)" }}>
          <div style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: "14px", marginBottom: "18px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "800", color: "#9A3412", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <UserMinus size={20} color="#EA580C" /> Öğrenci Bırakma / Eşleşme Sonlandırma Talebi
            </h2>
            <p style={{ fontSize: "12px", color: "#64748B", marginTop: "4px", marginBottom: 0 }}>
              Devam edemeyeceğiniz bir ders veya koçluk eşleşmesini gerekçesiyle birlikte yönetime bildiriniz.
            </p>
          </div>

          <div style={{ backgroundColor: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "10px", padding: "12px 16px", marginBottom: "18px", fontSize: "12px", color: "#92400E", lineHeight: "1.5" }}>
            ℹ️ <strong>Önemli Bilgilendirme:</strong> Bırakma talebiniz yönetici tarafından incelenip onaylandığında ilgili ders eşleşmesi <strong>Pasif</strong> duruma alınacak ve öğrenciye yeni bir eğitmen atanacaktır.
          </div>

          <form onSubmit={handleDropSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#0F2645", marginBottom: "6px" }}>
                Bırakılmak İstenen Öğrenci ve Dersi Seçiniz *
              </label>
              <select
                required
                value={dropMatchId}
                onChange={(e) => setDropMatchId(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", outline: "none", backgroundColor: "#FFFFFF" }}
              >
                <option value="">-- Eşleşme Seçiniz --</option>
                {students.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.student?.name} • {item.type === "KOCLUK" ? "🎓 Eğitim Koçluğu" : `📚 ${item.subject || "Özel Ders"}`}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#0F2645", marginBottom: "6px" }}>
                Bırakma / Ayrılma Gerekçesi *
              </label>
              <select
                value={dropReasonTitle}
                onChange={(e) => setDropReasonTitle(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", outline: "none", backgroundColor: "#FFFFFF" }}
              >
                <option value="Zaman / Program Uyuşmazlığı">Zaman / Ders Saatleri Uyuşmazlığı</option>
                <option value="Lokasyon / Ulaşım Zorluğu">Lokasyon / Yüz Yüze Ulaşım Zorluğu</option>
                <option value="Öğrenci Seviye / İlerleme Uyumsuzluğu">Öğrenci Seviye / İlerleme Uyumsuzluğu</option>
                <option value="Yoğunluk / Kontenjan Azaltma">Eğitmen Kişisel Yoğunluğu / Kontenjan Azaltma</option>
                <option value="Sağlık veya Özel Mazeret">Sağlık veya Özel Mazeret</option>
                <option value="Diğer">Diğer</option>
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
                placeholder="Örn: Üniversite sınav takvimim ve haftalık ders programımın değişmesi sebebiyle bu dersi sürdüremiyorum..."
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
                {submitting ? "Gönderiliyor..." : "Bırakma Talebini İlet"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: REQUEST HISTORY */}
      {activeTab === "history" && (
        <div>
          {isLoading ? (
            <div style={{ backgroundColor: "#FFFFFF", padding: "40px", borderRadius: "12px", textAlign: "center", color: "#64748B" }}>
              Yükleniyor...
            </div>
          ) : requests.length === 0 ? (
            <div style={{ backgroundColor: "#FFFFFF", padding: "40px", borderRadius: "12px", textAlign: "center", color: "#94A3B8", border: "1px solid #E2E8F0" }}>
              <MessageSquare size={36} color="#CBD5E1" style={{ margin: "0 auto 10px" }} />
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#475569" }}>Henüz gönderilmiş bir talebiniz bulunmuyor.</div>
              <div style={{ fontSize: "12px", marginTop: "4px" }}>Şikayet veya bırakma taleplerinizi yukarıdaki sekmelerden oluşturabilirsiniz.</div>
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
                          backgroundColor: req.type === "STUDENT_COMPLAINT" ? "#FEE2E2" : "#FFF7ED",
                          color: req.type === "STUDENT_COMPLAINT" ? "#991B1B" : "#9A3412",
                          border: req.type === "STUDENT_COMPLAINT" ? "1px solid #FCA5A5" : "1px solid #FDBA74",
                        }}>
                          {req.type === "STUDENT_COMPLAINT" ? "⚠️ Öğrenci Şikayeti" : "🔄 Öğrenci Bırakma Talebi"}
                        </span>
                        <span style={{ fontSize: "14px", fontWeight: "800", color: "#0F2645" }}>
                          {req.title || "Bildirim"}
                        </span>
                      </div>

                      {req.targetStudent && (
                        <div style={{ fontSize: "12px", color: "#475569", marginTop: "4px" }}>
                          İlgili Öğrenci: <strong>{req.targetStudent.name}</strong> {req.subject ? `• Branş: ${req.subject}` : ""}
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
