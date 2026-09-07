"use client";

import React, { useState, useEffect } from "react";
import { 
  GraduationCap, 
  Check, 
  Eye, 
  UserCheck, 
  X,
  AlertCircle, 
  Sparkles
} from "lucide-react";
import { Button, Badge, PasswordInput, Modal, SearchFilterBar, Avatar } from "@/components";
import { getPhotoUrl } from "@/utils/media";

export default function TeacherApplicationsPage() {
  const [teacherApps, setTeacherApps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name_asc" | "name_desc" | "status">("newest");

  // Modals
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [modalType, setModalType] = useState<"detail" | "approve" | null>(null);
  const [tempPassword, setTempPassword] = useState("Pont2026!");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");
  const [actionErrorMsg, setActionErrorMsg] = useState("");

  // Score Editing States
  const [isEditingScores, setIsEditingScores] = useState(false);
  const [scoreSaveLoading, setScoreSaveLoading] = useState(false);
  const [scoreSaveMsg, setScoreSaveMsg] = useState("");
  const [appTytScores, setAppTytScores] = useState<Record<string, number>>({});
  const [appAytScores, setAppAytScores] = useState<Record<string, number>>({});

  const initScoresFromApp = (app: any) => {
    if (!app) return;
    let tyt: Record<string, number> = {};
    let ayt: Record<string, number> = {};
    try {
      if (typeof app.tytScores === "string") tyt = JSON.parse(app.tytScores);
      else if (app.tytScores) tyt = app.tytScores;
    } catch {}
    try {
      if (typeof app.aytScores === "string") ayt = JSON.parse(app.aytScores);
      else if (app.aytScores) ayt = app.aytScores;
    } catch {}

    setAppTytScores({
      tytTurkce: tyt.tytTurkce ?? tyt["Türkçe"] ?? 5,
      tytMat: tyt.tytMat ?? tyt["Temel Matematik"] ?? 5,
      tytFizik: tyt.tytFizik ?? tyt["Fizik"] ?? 5,
      tytKimya: tyt.tytKimya ?? tyt["Kimya"] ?? 5,
      tytBiyoloji: tyt.tytBiyoloji ?? tyt["Biyoloji"] ?? 5,
      tytTarih: tyt.tytTarih ?? tyt["Tarih"] ?? 5,
      tytCografya: tyt.tytCografya ?? tyt["Coğrafya"] ?? 5,
    });

    setAppAytScores({
      aytMat: ayt.aytMat ?? ayt["Matematik"] ?? 5,
      aytFizik: ayt.aytFizik ?? ayt["Fizik"] ?? 5,
      aytKimya: ayt.aytKimya ?? ayt["Kimya"] ?? 5,
      aytBiyoloji: ayt.aytBiyoloji ?? ayt["Biyoloji"] ?? 5,
      aytTurkce: ayt.aytTurkce ?? ayt["Edebiyat"] ?? 5,
      aytTarih: ayt.aytTarih ?? ayt["Tarih-1"] ?? ayt["Tarih"] ?? 5,
      aytCografya: ayt.aytCografya ?? ayt["Coğrafya-1"] ?? ayt["Coğrafya"] ?? 5,
      ydtIngilizce: ayt.ydtIngilizce ?? ayt["İngilizce (YDT)"] ?? ayt["İngilizce"] ?? 5,
    });
  };

  const handleSaveApplicationScores = async () => {
    if (!selectedApp) return;
    setScoreSaveLoading(true);
    setScoreSaveMsg("");
    try {
      const res = await fetch("/api/admin/applications/teacher/update-scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: selectedApp.id,
          tytScores: appTytScores,
          aytScores: appAytScores,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setScoreSaveMsg("Ders yetkinlik puanları başarıyla güncellendi!");
        setIsEditingScores(false);
        // update local list
        setTeacherApps(prev => prev.map(a => a.id === selectedApp.id ? {
          ...a,
          tytScores: JSON.stringify(appTytScores),
          aytScores: JSON.stringify(appAytScores),
        } : a));
        setSelectedApp((prev: any) => ({
          ...prev,
          tytScores: JSON.stringify(appTytScores),
          aytScores: JSON.stringify(appAytScores),
        }));
      } else {
        alert(data.error || "Puanlar güncellenemedi.");
      }
    } catch (err) {
      console.error("Score save error:", err);
      alert("Bir hata oluştu.");
    } finally {
      setScoreSaveLoading(false);
    }
  };

  const openDetailModal = (app: any) => {
    setSelectedApp(app);
    initScoresFromApp(app);
    setIsEditingScores(false);
    setScoreSaveMsg("");
    setModalType("detail");
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/applications");
      const data = await res.json();
      if (data.success) {
        setTeacherApps(data.teacherApplications || []);
      }
    } catch (err) {
      console.error("Fetch teacher apps error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveTeacher = async () => {
    if (!selectedApp || !tempPassword) return;
    setActionLoading(true);
    setActionErrorMsg("");
    setActionSuccessMsg("");

    try {
      const res = await fetch("/api/admin/applications/teacher/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: selectedApp.id,
          temporaryPassword: tempPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setActionErrorMsg(data.error || "Onaylama başarısız oldu.");
        setActionLoading(false);
        return;
      }

      setActionSuccessMsg(`Öğretmen hesabı başarıyla oluşturuldu! E-posta: ${selectedApp.email} | Şifre: ${tempPassword}`);
      fetchData();
    } catch (err) {
      console.error(err);
      setActionErrorMsg("Bağlantı hatası oluştu.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectTeacher = async (id: string) => {
    if (!confirm("Bu öğretmen başvurusunu reddetmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch("/api/admin/applications/teacher/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: id }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const closeModal = () => {
    setSelectedApp(null);
    setModalType(null);
    setActionSuccessMsg("");
    setActionErrorMsg("");
  };

  const filteredApps = teacherApps
    .filter(app => {
      const matchesSearch = 
        app.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.school?.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (statusFilter === "ALL") return true;
      return app.status === statusFilter;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "name_asc") return (a.fullName || "").localeCompare(b.fullName || "");
      if (sortBy === "name_desc") return (b.fullName || "").localeCompare(a.fullName || "");
      if (sortBy === "status") return (a.status || "").localeCompare(b.status || "");
      return 0;
    });

  return (
    <div>
      {/* Search & Filter Bar */}
      <SearchFilterBar
        title="Öğretmen & Koç Başvuruları"
        subtitle="Eğitmen başvuru formunu dolduran üniversiteli adayların listesi ve onay süreci"
        titleIcon={<GraduationCap size={22} color="#C8952A" />}
        searchPlaceholder="İsim, e-posta veya okul ara..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filterLabel="Durum"
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={[
          { value: "ALL", label: `Tümü (${teacherApps.length})` },
          { value: "PENDING", label: `⏳ Bekleyen (${teacherApps.filter(a => a.status === "PENDING").length})` },
          { value: "APPROVED", label: `✓ Onaylanan (${teacherApps.filter(a => a.status === "APPROVED").length})` },
          { value: "REJECTED", label: `✕ Reddedilen (${teacherApps.filter(a => a.status === "REJECTED").length})` },
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
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>Aday</th>
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>İletişim</th>
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>Üniversite & Derece</th>
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>Tercihler</th>
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>Durum</th>
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
              ) : filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "40px 16px", textAlign: "center", color: "#94A3B8" }}>
                    Eşleşen öğretmen başvurusu bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => (
                  <tr key={app.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <Avatar
                          src={app.photoFileName || app.photoUrl}
                          name={app.fullName}
                          size={40}
                          showBorder
                          style={{ boxShadow: "0 2px 6px rgba(15, 38, 69, 0.12)" }}
                        />
                        <div>
                          <div style={{ fontWeight: "700", color: "#0F2645" }}>{app.fullName}</div>
                          <div style={{ fontSize: "12px", color: "#64748B" }}>{app.classStatus || "Öğrenci"}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ color: "#0F2645" }}>{app.email}</div>
                      <div style={{ fontSize: "12px", color: "#64748B" }}>{app.phone}</div>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ fontWeight: "600", color: "#0F2645" }}>{app.school}</div>
                      <div style={{ fontSize: "12px", color: "#C8952A", fontWeight: "700" }}>
                        {app.scoreType} &bull; {app.yksRank ? `${app.yksRank}. Sıralama` : "Derece Belirtilmedi"}
                      </div>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                        {app.koclukAvailable && (
                          <Badge variant="KOCLUK" />
                        )}
                        {app.ozelDersAvailable && (
                          <Badge variant="OZEL_DERS" />
                        )}
                        {app.onlineAvailable && (
                          <span style={{ fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "12px", backgroundColor: "#ECFDF5", color: "#047857" }}>
                            Online
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <Badge variant={app.status as any} />
                    </td>
                    <td style={{ padding: "14px 18px", fontSize: "12px", color: "#64748B" }}>
                      {new Date(app.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                    <td style={{ padding: "14px 18px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<Eye size={13} />}
                          onClick={() => openDetailModal(app)}
                        >
                          Detay
                        </Button>
                        {app.status === "PENDING" && (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              icon={<UserCheck size={13} />}
                              onClick={() => { setSelectedApp(app); setModalType("approve"); setTempPassword("Pont2026!"); }}
                            >
                              Onayla
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              icon={<X size={13} />}
                              onClick={() => handleRejectTeacher(app.id)}
                            />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={modalType === "detail" && Boolean(selectedApp)}
        onClose={closeModal}
        title={`${selectedApp?.fullName || ""} • Başvuru Detayı`}
        titleIcon={<GraduationCap size={20} color="#C8952A" />}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", width: "100%" }}>
            <Button variant="secondary" onClick={closeModal}>
              Kapat
            </Button>
            {selectedApp?.status === "PENDING" && (
              <Button
                variant="primary"
                onClick={() => { setModalType("approve"); setTempPassword("Pont2026!"); }}
              >
                Onayla ve Hesap Oluştur
              </Button>
            )}
          </div>
        }
      >
        {selectedApp && (
          <div>
            {/* Header / Photo Banner */}
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "20px", 
              padding: "16px", 
              backgroundColor: "#F8FAFC", 
              borderRadius: "12px", 
              border: "1px solid #E2E8F0",
              marginBottom: "20px",
              flexWrap: "wrap"
            }}>
              <div>
                <Avatar
                  src={selectedApp.photoFileName || selectedApp.photoUrl}
                  name={selectedApp.fullName}
                  size={88}
                  showBorder
                  style={{ boxShadow: "0 4px 12px rgba(15, 38, 69, 0.15)", border: "3px solid #C8952A" }}
                />
              </div>

              <div style={{ flex: 1, minWidth: "220px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#0F2645" }}>
                    {selectedApp.fullName}
                  </h3>
                  <Badge variant={selectedApp.status as any} />
                </div>

                <div style={{ marginTop: "6px", fontSize: "13px", color: "#64748B", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div>
                    <strong style={{ color: "#0F2645" }}>{selectedApp.school}</strong> • {selectedApp.classStatus}
                  </div>
                  <div>
                    <span style={{ color: "#C8952A", fontWeight: "700" }}>{selectedApp.scoreType}</span> &bull; {selectedApp.yksRank ? `YKS Sıralaması: ${selectedApp.yksRank}` : "Derece Belirtilmedi"}
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-grid-2col" style={{ marginBottom: "20px", fontSize: "14px" }}>
              <div>
                <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", display: "block" }}>E-Posta</span>
                <strong style={{ color: "#0F2645" }}>{selectedApp.email}</strong>
              </div>
              <div>
                <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", display: "block" }}>Telefon</span>
                <strong style={{ color: "#0F2645" }}>{selectedApp.phone}</strong>
              </div>
              <div>
                <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", display: "block" }}>Okul / Üniversite</span>
                <strong style={{ color: "#0F2645" }}>{selectedApp.school}</strong>
              </div>
              <div>
                <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", display: "block" }}>Sınıf Durumu</span>
                <strong style={{ color: "#0F2645" }}>{selectedApp.classStatus}</strong>
              </div>
              <div>
                <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", display: "block" }}>YKS Sıralaması & Puan Türü</span>
                <strong style={{ color: "#C8952A" }}>{selectedApp.scoreType} - {selectedApp.yksRank || "Belirtilmedi"}</strong>
              </div>
              <div>
                <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", display: "block" }}>İkamet / İlçe</span>
                <strong style={{ color: "#0F2645" }}>{selectedApp.currentDistrict || selectedApp.currentAddress || "İstanbul"}</strong>
              </div>
              <div>
                <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", display: "block" }}>Ders Verebileceği İlçeler</span>
                <span style={{ color: "#0F2645", fontSize: "13px" }}>{selectedApp.districts || "Tüm İstanbul / Online"}</span>
              </div>
              <div>
                <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", display: "block" }}>Ders Tercihleri</span>
                <span style={{ color: "#0F2645", fontSize: "13px" }}>
                  {[
                    selectedApp.koclukAvailable ? "Koçluk" : null,
                    selectedApp.ozelDersAvailable ? "Özel Ders" : null,
                    selectedApp.onlineAvailable ? "Online" : null
                  ].filter(Boolean).join(" • ") || "Belirtilmedi"}
                </span>
              </div>
            </div>

            {selectedApp.about && (
              <div style={{ marginBottom: "20px" }}>
                <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", display: "block", marginBottom: "4px" }}>Hakkında / Kendini Tanıtımı</span>
                <p style={{ backgroundColor: "#F8FAFC", padding: "12px", borderRadius: "8px", fontSize: "14px", color: "#334155", margin: 0, lineHeight: "1.5" }}>
                  {selectedApp.about}
                </p>
              </div>
            )}

            {/* Direct High-Resolution Photo Preview if available */}
            {getPhotoUrl(selectedApp.photoFileName || selectedApp.photoUrl) && (
              <div style={{ marginBottom: "20px" }}>
                <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                  Adayın Yüklediği Profil Fotoğrafı
                </span>
                <div style={{ 
                  borderRadius: "10px", 
                  overflow: "hidden", 
                  border: "1px solid #E2E8F0", 
                  maxHeight: "300px", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  backgroundColor: "#0F2645"
                }}>
                  <img
                    src={getPhotoUrl(selectedApp.photoFileName || selectedApp.photoUrl)!}
                    alt={selectedApp.fullName}
                    style={{ maxWidth: "100%", maxHeight: "300px", objectFit: "contain" }}
                  />
                </div>
              </div>
            )}

            {/* SUBJECT COMPETENCY EVALUATIONS (ADMIN VIEW & EDIT) */}
            <div style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "16px", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "800", color: "#0F2645", display: "flex", alignItems: "center", gap: "6px" }}>
                    <GraduationCap size={16} color="#C8952A" /> Adayın Girdiği Ders Bilgisi & Yetkinlik Puanları (1 - 10)
                  </h4>
                  <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#64748B" }}>
                    Adayın başvuru sırasında beyan ettiği ders puanları. Yönetici olarak bu puanları düzenleyebilirsiniz.
                  </p>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  {!isEditingScores ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsEditingScores(true)}
                    >
                      ✏️ Puanları Düzenle
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setIsEditingScores(false);
                          initScoresFromApp(selectedApp);
                        }}
                      >
                        Vazgeç
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        loading={scoreSaveLoading}
                        onClick={handleSaveApplicationScores}
                      >
                        💾 Puanları Kaydet
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {scoreSaveMsg && (
                <div style={{ backgroundColor: "#DCFCE7", color: "#166534", padding: "8px 12px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", marginBottom: "12px" }}>
                  {scoreSaveMsg}
                </div>
              )}

              {/* TYT Scores */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "12px", fontWeight: "800", color: "#1D4ED8", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  📘 TYT Yetkinlik Puanları
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
                  {[
                    { key: "tytTurkce", label: "TYT Türkçe" },
                    { key: "tytMat", label: "TYT Matematik" },
                    { key: "tytFizik", label: "TYT Fizik" },
                    { key: "tytKimya", label: "TYT Kimya" },
                    { key: "tytBiyoloji", label: "TYT Biyoloji" },
                    { key: "tytTarih", label: "TYT Tarih" },
                    { key: "tytCografya", label: "TYT Coğrafya" },
                  ].map((sub) => {
                    const score = appTytScores[sub.key] ?? 5;
                    return (
                      <div key={sub.key} style={{ backgroundColor: "#FFFFFF", padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "700", color: "#0F2645", marginBottom: "4px" }}>
                          <span>{sub.label}</span>
                          <span style={{ color: score >= 8 ? "#16A34A" : score >= 5 ? "#D97706" : "#DC2626" }}>
                            {score} / 10
                          </span>
                        </div>
                        {isEditingScores ? (
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={score}
                            onChange={(e) => setAppTytScores({ ...appTytScores, [sub.key]: Number(e.target.value) })}
                            style={{ width: "100%", accentColor: "#0F2645", cursor: "pointer" }}
                          />
                        ) : (
                          <div style={{ height: "6px", width: "100%", backgroundColor: "#E2E8F0", borderRadius: "4px", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${score * 10}%`, backgroundColor: score >= 8 ? "#16A34A" : score >= 5 ? "#F59E0B" : "#EF4444" }} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AYT Scores */}
              <div>
                <div style={{ fontSize: "12px", fontWeight: "800", color: "#7E22CE", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  📙 AYT & YDT Yetkinlik Puanları
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
                  {[
                    { key: "aytMat", label: "AYT Matematik" },
                    { key: "aytFizik", label: "AYT Fizik" },
                    { key: "aytKimya", label: "AYT Kimya" },
                    { key: "aytBiyoloji", label: "AYT Biyoloji" },
                    { key: "aytTurkce", label: "AYT Edebiyat" },
                    { key: "aytTarih", label: "AYT Tarih-1/2" },
                    { key: "aytCografya", label: "AYT Coğrafya-1/2" },
                    { key: "ydtIngilizce", label: "YDT İngilizce" },
                  ].map((sub) => {
                    const score = appAytScores[sub.key] ?? 5;
                    return (
                      <div key={sub.key} style={{ backgroundColor: "#FFFFFF", padding: "10px", borderRadius: "8px", border: "1px solid #CBD5E1" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "700", color: "#0F2645", marginBottom: "4px" }}>
                          <span>{sub.label}</span>
                          <span style={{ color: score >= 8 ? "#16A34A" : score >= 5 ? "#D97706" : "#DC2626" }}>
                            {score} / 10
                          </span>
                        </div>
                        {isEditingScores ? (
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={score}
                            onChange={(e) => setAppAytScores({ ...appAytScores, [sub.key]: Number(e.target.value) })}
                            style={{ width: "100%", accentColor: "#7E22CE", cursor: "pointer" }}
                          />
                        ) : (
                          <div style={{ height: "6px", width: "100%", backgroundColor: "#E2E8F0", borderRadius: "4px", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${score * 10}%`, backgroundColor: score >= 8 ? "#16A34A" : score >= 5 ? "#F59E0B" : "#EF4444" }} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Approve Modal */}
      <Modal
        isOpen={modalType === "approve" && Boolean(selectedApp)}
        onClose={closeModal}
        title="Öğretmen Hesabı Oluştur"
        titleIcon={<Sparkles size={20} color="#C8952A" />}
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
                onClick={handleApproveTeacher} 
                loading={actionLoading}
                disabled={!tempPassword}
              >
                Onayla ve Hesabı Aç
              </Button>
            </>
          )
        }
      >
        {selectedApp && (
          <div>
            <p style={{ fontSize: "14px", color: "#475569", marginBottom: "16px", lineHeight: "1.5" }}>
              <strong>{selectedApp.fullName}</strong> için sisteme giriş hesabı açılacaktır. Adaya atanacak geçici şifreyi belirleyiniz:
            </p>

            {actionSuccessMsg ? (
              <div style={{ backgroundColor: "#DCFCE7", border: "1px solid #86EFAC", color: "#15803D", padding: "16px", borderRadius: "8px", fontSize: "14px" }}>
                <div style={{ fontWeight: "700", display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                  <Check size={18} /> Başarıyla Onaylandı!
                </div>
                <div>{actionSuccessMsg}</div>
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
                  label="Geçici Giriş Şifresi"
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  showGenerateButton
                  onGeneratePassword={(newPwd) => setTempPassword(newPwd)}
                  helperText="Kullanıcı ilk girişinde bu şifreyi değiştirmeye zorlanacaktır."
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

