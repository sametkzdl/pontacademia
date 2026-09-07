"use client";

import React, { useState, useEffect } from "react";
import { 
  MessageSquare, 
  BookOpen, 
  UserMinus, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Sparkles, 
  Eye, 
  Filter, 
  Search, 
  User, 
  GraduationCap, 
  Check, 
  AlertCircle,
  FileText,
  ShieldAlert,
  ArrowRight
} from "lucide-react";
import { Button, Input, Textarea, Badge, Modal } from "@/components";

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    pending: 0,
    inReview: 0,
    approved: 0,
    resolved: 0,
    rejected: 0,
    total: 0,
    lessonRequests: 0,
    dropRequests: 0,
    complaints: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [categoryTab, setCategoryTab] = useState<"ALL" | "LESSONS" | "DROPS" | "COMPLAINTS">("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State for inspecting & responding to a request
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [modalStatus, setModalStatus] = useState<string>("IN_REVIEW");
  const [modalAdminNotes, setModalAdminNotes] = useState<string>("");
  const [modalLoading, setModalLoading] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");
  const [actionErrorMsg, setActionErrorMsg] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/requests");
      const data = await res.json();
      if (res.ok && data.success) {
        setRequests(data.requests || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error("Fetch admin requests error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openInspectionModal = (req: any) => {
    setSelectedRequest(req);
    setModalStatus(req.status === "PENDING" ? "IN_REVIEW" : req.status);
    setModalAdminNotes(req.adminNotes || "");
    setActionSuccessMsg("");
    setActionErrorMsg("");
  };

  const handleUpdateStatus = async (targetStatus?: string) => {
    if (!selectedRequest) return;
    const finalStatus = targetStatus || modalStatus;

    setModalLoading(true);
    setActionErrorMsg("");
    setActionSuccessMsg("");

    try {
      const res = await fetch(`/api/admin/requests/${selectedRequest.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: finalStatus,
          adminNotes: modalAdminNotes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccessMsg(
          finalStatus === "APPROVED" && (selectedRequest.type === "TEACHER_DROP_STUDENT" || selectedRequest.type === "STUDENT_DROP_TEACHER")
            ? "Talep onaylandı ve ilgili eşleştirme başarıyla pasife alındı!"
            : "Talep durumu ve yanıt notu başarıyla güncellendi."
        );
        fetchData();
        setTimeout(() => {
          setSelectedRequest(null);
          setActionSuccessMsg("");
        }, 1400);
      } else {
        setActionErrorMsg(data.error || "Talep güncellenemedi.");
      }
    } catch (err) {
      setActionErrorMsg("Bağlantı hatası oluştu.");
    } finally {
      setModalLoading(false);
    }
  };

  // Filter requests according to categoryTab, statusFilter, roleFilter and searchQuery
  const filteredRequests = requests.filter((r) => {
    // 1. Category Tab Filter
    if (categoryTab === "LESSONS" && r.type !== "STUDENT_LESSON_REQUEST") return false;
    if (categoryTab === "DROPS" && r.type !== "TEACHER_DROP_STUDENT" && r.type !== "STUDENT_DROP_TEACHER") return false;
    if (categoryTab === "COMPLAINTS" && r.type !== "STUDENT_COMPLAINT" && r.type !== "GENERAL_COMPLAINT") return false;

    // 2. Status Filter
    if (statusFilter !== "ALL" && r.status !== statusFilter) return false;

    // 3. Role Filter
    if (roleFilter !== "ALL" && r.userRole !== roleFilter) return false;

    // 4. Search Query
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const userName = (r.user?.name || "").toLowerCase();
      const userEmail = (r.user?.email || "").toLowerCase();
      const title = (r.title || "").toLowerCase();
      const desc = (r.description || "").toLowerCase();
      const subject = (r.subject || "").toLowerCase();
      const targetStudent = (r.targetStudent?.name || "").toLowerCase();
      const targetTeacher = (r.targetTeacher?.name || "").toLowerCase();

      const matches = 
        userName.includes(q) || 
        userEmail.includes(q) || 
        title.includes(q) || 
        desc.includes(q) || 
        subject.includes(q) || 
        targetStudent.includes(q) || 
        targetTeacher.includes(q);

      if (!matches) return false;
    }

    return true;
  });

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "STUDENT_LESSON_REQUEST":
        return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", backgroundColor: "#EFF6FF", color: "#1D4ED8", padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "800", border: "1px solid #BFDBFE" }}>
            <BookOpen size={12} /> Ders Talebi
          </span>
        );
      case "TEACHER_DROP_STUDENT":
        return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", backgroundColor: "#FFF7ED", color: "#C2410C", padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "800", border: "1px solid #FED7AA" }}>
            <UserMinus size={12} /> Öğrenci Bırakma (Öğretmen)
          </span>
        );
      case "STUDENT_DROP_TEACHER":
        return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", backgroundColor: "#FFF7ED", color: "#EA580C", padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "800", border: "1px solid #FDBA74" }}>
            <UserMinus size={12} /> Hoca Değişikliği (Öğrenci)
          </span>
        );
      case "STUDENT_COMPLAINT":
        return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", backgroundColor: "#FEF2F2", color: "#B91C1C", padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "800", border: "1px solid #FCA5A5" }}>
            <AlertTriangle size={12} /> Öğrenci Şikayeti (Öğretmen)
          </span>
        );
      case "GENERAL_COMPLAINT":
        return (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", backgroundColor: "#FEF2F2", color: "#991B1B", padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "800", border: "1px solid #FECACA" }}>
            <AlertCircle size={12} /> Genel Şikayet / Destek (Öğrenci)
          </span>
        );
      default:
        return <span style={{ fontSize: "11px", color: "#64748B" }}>{type}</span>;
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
    <div>
      {/* Top Header & Overview Counters */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#0F2645", margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: "10px" }}>
              <MessageSquare size={24} color="#C8952A" /> Talepler & Şikayet Yönetim Merkezi
            </h1>
            <p style={{ fontSize: "13px", color: "#64748B", margin: 0 }}>
              Öğretmen ve öğrencilerden gelen ders isteklerini, eşleşme bırakma taleplerini ve şikayetleri tek merkezden yönetin.
            </p>
          </div>

          {/* Quick Counter Badges */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <div style={{ backgroundColor: "#FEF3C7", border: "1px solid #FCD34D", borderRadius: "10px", padding: "8px 14px", textAlign: "center" }}>
              <div style={{ fontSize: "18px", fontWeight: "800", color: "#92400E" }}>{stats.pending}</div>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#B45309" }}>Bekleyen Talep</div>
            </div>
            <div style={{ backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "10px", padding: "8px 14px", textAlign: "center" }}>
              <div style={{ fontSize: "18px", fontWeight: "800", color: "#1D4ED8" }}>{stats.inReview}</div>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#2563EB" }}>İncelenen</div>
            </div>
            <div style={{ backgroundColor: "#DCFCE7", border: "1px solid #86EFAC", borderRadius: "10px", padding: "8px 14px", textAlign: "center" }}>
              <div style={{ fontSize: "18px", fontWeight: "800", color: "#15803D" }}>{stats.approved + stats.resolved}</div>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#16A34A" }}>Sonuçlanan</div>
            </div>
          </div>
        </div>

        {/* 4 Category Navigation Tabs */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", borderBottom: "1px solid #E2E8F0", paddingBottom: "12px", marginBottom: "16px" }}>
          <button
            onClick={() => setCategoryTab("ALL")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              border: categoryTab === "ALL" ? "1.5px solid #0F2645" : "1px solid #CBD5E1",
              backgroundColor: categoryTab === "ALL" ? "#0F2645" : "#FFFFFF",
              color: categoryTab === "ALL" ? "#FFFFFF" : "#475569",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            📌 Tüm Talepler ({stats.total || requests.length})
          </button>

          <button
            onClick={() => setCategoryTab("LESSONS")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              border: categoryTab === "LESSONS" ? "1.5px solid #2563EB" : "1px solid #CBD5E1",
              backgroundColor: categoryTab === "LESSONS" ? "#EFF6FF" : "#FFFFFF",
              color: categoryTab === "LESSONS" ? "#1D4ED8" : "#475569",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <BookOpen size={15} color={categoryTab === "LESSONS" ? "#2563EB" : "#64748B"} />
            Ders Talepleri ({stats.lessonRequests || 0})
          </button>

          <button
            onClick={() => setCategoryTab("DROPS")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              border: categoryTab === "DROPS" ? "1.5px solid #EA580C" : "1px solid #CBD5E1",
              backgroundColor: categoryTab === "DROPS" ? "#FFF7ED" : "#FFFFFF",
              color: categoryTab === "DROPS" ? "#C2410C" : "#475569",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <UserMinus size={15} color={categoryTab === "DROPS" ? "#EA580C" : "#64748B"} />
            Eşleşme Bırakma Talepleri ({stats.dropRequests || 0})
          </button>

          <button
            onClick={() => setCategoryTab("COMPLAINTS")}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              border: categoryTab === "COMPLAINTS" ? "1.5px solid #DC2626" : "1px solid #CBD5E1",
              backgroundColor: categoryTab === "COMPLAINTS" ? "#FEF2F2" : "#FFFFFF",
              color: categoryTab === "COMPLAINTS" ? "#991B1B" : "#475569",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <AlertTriangle size={15} color={categoryTab === "COMPLAINTS" ? "#DC2626" : "#64748B"} />
            Şikayetler & Bildirimler ({stats.complaints || 0})
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center", backgroundColor: "#F8FAFC", padding: "12px 14px", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
          {/* Search Input */}
          <div style={{ flex: "1", minWidth: "220px", position: "relative" }}>
            <Search size={16} color="#94A3B8" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Öğrenci, öğretmen, ders veya açıklama ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: "100%", padding: "8px 12px 8px 34px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", outline: "none", backgroundColor: "#FFFFFF" }}
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "12px", color: "#0F2645", fontWeight: "700", backgroundColor: "#FFFFFF", outline: "none" }}
          >
            <option value="ALL">Tüm Durumlar</option>
            <option value="PENDING">⏳ Beklemede</option>
            <option value="IN_REVIEW">🔍 İnceleniyor</option>
            <option value="APPROVED">✅ Onaylandı</option>
            <option value="RESOLVED">🎯 Çözümlendi</option>
            <option value="REJECTED">❌ Reddedildi</option>
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "12px", color: "#0F2645", fontWeight: "700", backgroundColor: "#FFFFFF", outline: "none" }}
          >
            <option value="ALL">Tüm Roller</option>
            <option value="TEACHER">👨‍🏫 Eğitmenler</option>
            <option value="STUDENT">🎓 Öğrenciler</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="admin-table-container">
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#475569" }}>
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>Talep Eden</th>
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>Talep Türü & Konu</th>
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>İlgili Taraf / Ders</th>
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>Durum</th>
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>Tarih</th>
                <th style={{ padding: "14px 18px", fontWeight: "700", textAlign: "right" }}>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ padding: "40px 16px", textAlign: "center", color: "#94A3B8" }}>
                    Yükleniyor...
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "40px 16px", textAlign: "center", color: "#94A3B8" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                      <MessageSquare size={32} color="#CBD5E1" />
                      <span style={{ fontSize: "14px", fontWeight: "600" }}>Kriterlere uygun talep kaydı bulunamadı.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontWeight: "700", color: "#0F2645" }}>{req.user?.name || "Bilinmiyor"}</span>
                        <span style={{
                          fontSize: "10px",
                          fontWeight: "800",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          backgroundColor: req.userRole === "TEACHER" ? "#F3E8FF" : "#EFF6FF",
                          color: req.userRole === "TEACHER" ? "#7E22CE" : "#1D4ED8",
                        }}>
                          {req.userRole === "TEACHER" ? "Eğitmen" : "Öğrenci"}
                        </span>
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748B" }}>
                        {req.user?.email}
                      </div>
                    </td>

                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ marginBottom: "4px" }}>
                        {getTypeBadge(req.type)}
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: "700", color: "#1E293B" }}>
                        {req.title || "Bildirim"}
                      </div>
                    </td>

                    <td style={{ padding: "14px 18px" }}>
                      {req.targetStudent && (
                        <div style={{ fontSize: "12px", color: "#0F2645" }}>
                          🎓 Öğrenci: <strong>{req.targetStudent.name}</strong>
                        </div>
                      )}
                      {req.targetTeacher && (
                        <div style={{ fontSize: "12px", color: "#0F2645" }}>
                          👨‍🏫 Eğitmen: <strong>{req.targetTeacher.name}</strong>
                        </div>
                      )}
                      {req.subject && (
                        <div style={{ fontSize: "11px", color: "#2563EB", fontWeight: "700", marginTop: "2px" }}>
                          📚 {req.subject}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: "14px 18px" }}>
                      {getStatusBadge(req.status)}
                    </td>

                    <td style={{ padding: "14px 18px", fontSize: "12px", color: "#64748B" }}>
                      {new Date(req.createdAt).toLocaleDateString("tr-TR")}
                    </td>

                    <td style={{ padding: "14px 18px", textAlign: "right" }}>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<Eye size={13} />}
                        onClick={() => openInspectionModal(req)}
                      >
                        İncele & Yanıtla
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECTION & ACTION MODAL */}
      {selectedRequest && (
        <Modal
          isOpen={Boolean(selectedRequest)}
          onClose={() => setSelectedRequest(null)}
          title="Talep & Bildirim İnceleme"
          titleIcon={<MessageSquare size={20} color="#C8952A" />}
          footer={
            actionSuccessMsg ? null : (
              <>
                <Button variant="secondary" onClick={() => setSelectedRequest(null)}>
                  Kapat
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleUpdateStatus()}
                  loading={modalLoading}
                >
                  Değişiklikleri Kaydet
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

                {/* Request Overview Summary */}
                <div style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "14px", marginBottom: "16px", fontSize: "13px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span>Talebi Açan:</span>
                      <strong style={{ color: "#0F2645" }}>{selectedRequest.user?.name}</strong>
                      <span style={{ fontSize: "11px", color: "#64748B" }}>({selectedRequest.user?.email})</span>
                      <span style={{
                        fontSize: "10px",
                        fontWeight: "800",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        backgroundColor: selectedRequest.userRole === "TEACHER" ? "#F3E8FF" : "#EFF6FF",
                        color: selectedRequest.userRole === "TEACHER" ? "#7E22CE" : "#1D4ED8",
                      }}>
                        {selectedRequest.userRole === "TEACHER" ? "Eğitmen" : "Öğrenci"}
                      </span>
                    </div>

                    <div>
                      {getStatusBadge(selectedRequest.status)}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                    <span>Tür:</span>
                    {getTypeBadge(selectedRequest.type)}
                    <span style={{ fontWeight: "700", color: "#0F2645" }}>{selectedRequest.title}</span>
                  </div>

                  {(selectedRequest.targetStudent || selectedRequest.targetTeacher || selectedRequest.subject) && (
                    <div style={{ paddingTop: "8px", borderTop: "1px dashed #E2E8F0", fontSize: "12px", color: "#475569", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                      {selectedRequest.targetStudent && (
                        <span>🎓 Öğrenci: <strong>{selectedRequest.targetStudent.name}</strong></span>
                      )}
                      {selectedRequest.targetTeacher && (
                        <span>👨‍🏫 Eğitmen: <strong>{selectedRequest.targetTeacher.name}</strong></span>
                      )}
                      {selectedRequest.subject && (
                        <span>📚 Branş: <strong>{selectedRequest.subject}</strong></span>
                      )}
                    </div>
                  )}
                </div>

                {/* User Description Box */}
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "4px" }}>
                    📝 Kullanıcı Açıklaması / Gerekçesi:
                  </label>
                  <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: "8px", padding: "12px 14px", fontSize: "13px", color: "#0F2645", lineHeight: "1.5" }}>
                    {selectedRequest.description}
                  </div>
                </div>

                {/* Drop Request Special Action Banner */}
                {(selectedRequest.type === "TEACHER_DROP_STUDENT" || selectedRequest.type === "STUDENT_DROP_TEACHER") && selectedRequest.match && (
                  <div style={{ backgroundColor: "#FFF7ED", border: "1.5px solid #FDBA74", borderRadius: "10px", padding: "14px", marginBottom: "18px" }}>
                    <div style={{ fontSize: "13px", fontWeight: "800", color: "#9A3412", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <UserMinus size={16} /> Eşleşme Ayrılma İşlemi
                    </div>
                    <div style={{ fontSize: "12px", color: "#7C2D12", marginBottom: "10px" }}>
                      Bu talep onaylandığında <strong>{selectedRequest.match?.student?.name}</strong> ile <strong>{selectedRequest.match?.teacher?.name}</strong> arasındaki <strong>({selectedRequest.match?.subject || "Ders"})</strong> eşleştirmesi otomatik olarak <strong>PASİF</strong> duruma alınacaktır.
                    </div>
                    <button
                      type="button"
                      disabled={modalLoading}
                      onClick={() => handleUpdateStatus("APPROVED")}
                      style={{
                        backgroundColor: "#EA580C",
                        color: "#FFFFFF",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "700",
                        border: "none",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <CheckCircle2 size={14} /> Eşleşmeyi Pasife Al ve Talebi Onayla
                    </button>
                  </div>
                )}

                {/* Status Switcher Buttons */}
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#0F2645", marginBottom: "6px" }}>
                    Talep Durumunu Belirleyin *
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "6px" }}>
                    <button
                      type="button"
                      onClick={() => setModalStatus("IN_REVIEW")}
                      style={{
                        padding: "8px 6px",
                        borderRadius: "6px",
                        border: modalStatus === "IN_REVIEW" ? "2px solid #2563EB" : "1px solid #CBD5E1",
                        backgroundColor: modalStatus === "IN_REVIEW" ? "#EFF6FF" : "#FFFFFF",
                        color: modalStatus === "IN_REVIEW" ? "#1D4ED8" : "#475569",
                        fontWeight: "700",
                        fontSize: "11px",
                        cursor: "pointer",
                      }}
                    >
                      🔍 İnceleniyor
                    </button>

                    <button
                      type="button"
                      onClick={() => setModalStatus("APPROVED")}
                      style={{
                        padding: "8px 6px",
                        borderRadius: "6px",
                        border: modalStatus === "APPROVED" ? "2px solid #16A34A" : "1px solid #CBD5E1",
                        backgroundColor: modalStatus === "APPROVED" ? "#DCFCE7" : "#FFFFFF",
                        color: modalStatus === "APPROVED" ? "#15803D" : "#475569",
                        fontWeight: "700",
                        fontSize: "11px",
                        cursor: "pointer",
                      }}
                    >
                      ✅ Onayla
                    </button>

                    <button
                      type="button"
                      onClick={() => setModalStatus("RESOLVED")}
                      style={{
                        padding: "8px 6px",
                        borderRadius: "6px",
                        border: modalStatus === "RESOLVED" ? "2px solid #7C3AED" : "1px solid #CBD5E1",
                        backgroundColor: modalStatus === "RESOLVED" ? "#EDE9FE" : "#FFFFFF",
                        color: modalStatus === "RESOLVED" ? "#6D28D9" : "#475569",
                        fontWeight: "700",
                        fontSize: "11px",
                        cursor: "pointer",
                      }}
                    >
                      🎯 Çözümlendi
                    </button>

                    <button
                      type="button"
                      onClick={() => setModalStatus("REJECTED")}
                      style={{
                        padding: "8px 6px",
                        borderRadius: "6px",
                        border: modalStatus === "REJECTED" ? "2px solid #DC2626" : "1px solid #CBD5E1",
                        backgroundColor: modalStatus === "REJECTED" ? "#FEF2F2" : "#FFFFFF",
                        color: modalStatus === "REJECTED" ? "#991B1B" : "#475569",
                        fontWeight: "700",
                        fontSize: "11px",
                        cursor: "pointer",
                      }}
                    >
                      ❌ Reddet
                    </button>
                  </div>
                </div>

                {/* Admin Notes Field */}
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#0F2645", marginBottom: "4px" }}>
                    Yönetici Yanıt & İşlem Notu (Kullanıcı kendi panelinde görebilir)
                  </label>
                  <textarea
                    rows={3}
                    value={modalAdminNotes}
                    onChange={(e) => setModalAdminNotes(e.target.value)}
                    placeholder="Örn: Talebiniz incelendi. Eşleştirme sonlandırılarak yeni öğretmen ataması için süreç başlatılmıştır..."
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", outline: "none", resize: "vertical" }}
                  />
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
