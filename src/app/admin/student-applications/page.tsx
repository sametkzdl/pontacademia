"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Check, 
  Eye, 
  UserCheck, 
  X,
  AlertCircle, 
  Sparkles,
  BookOpen,
  Target,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Calendar,
  User,
  Home
} from "lucide-react";
import { Button, Badge, PasswordInput, Modal, SearchFilterBar, Avatar, SubjectTagSlider } from "@/components";
import { getPhotoUrl } from "@/utils/media";

export default function StudentApplicationsPage() {
  const [studentApps, setStudentApps] = useState<any[]>([]);
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

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/applications");
      const data = await res.json();
      if (data.success) {
        setStudentApps(data.studentApplications || []);
      }
    } catch (err) {
      console.error("Fetch student apps error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveStudent = async () => {
    if (!selectedApp || !tempPassword) return;
    setActionLoading(true);
    setActionErrorMsg("");
    setActionSuccessMsg("");

    try {
      const res = await fetch("/api/admin/applications/student/approve", {
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

      setActionSuccessMsg(`Öğrenci hesabı başarıyla oluşturuldu! E-posta: ${selectedApp.email} | Şifre: ${tempPassword}`);
      fetchData();
    } catch (err) {
      console.error(err);
      setActionErrorMsg("Bağlantı hatası oluştu.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectStudent = async (id: string) => {
    if (!confirm("Bu öğrenci başvurusunu reddetmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch("/api/admin/applications/student/reject", {
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

  const filteredApps = studentApps
    .filter(app => {
      const matchesSearch = 
        app.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.email && app.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (app.subject && app.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (app.selectedSubjects && app.selectedSubjects.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (app.currentDistrict && app.currentDistrict.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchesSearch) return false;
      if (statusFilter === "ALL") return true;
      return app.status === statusFilter;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "name_asc") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "name_desc") return (b.name || "").localeCompare(a.name || "");
      if (sortBy === "status") return (a.status || "").localeCompare(b.status || "");
      return 0;
    });

  return (
    <div>
      {/* Search & Filter Bar */}
      <SearchFilterBar
        title="Öğrenci & Koçluk Başvuruları"
        subtitle="Özel ders veya koçluk başvuru formunu dolduran aday öğrencilerin ve velilerin tam kayıtları"
        titleIcon={<Users size={22} color="#C8952A" />}
        searchPlaceholder="İsim, e-posta, ders veya ilçe ara..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filterLabel="Durum"
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={[
          { value: "ALL", label: `Tümü (${studentApps.length})` },
          { value: "PENDING", label: `⏳ Bekleyen (${studentApps.filter(a => a.status === "PENDING").length})` },
          { value: "APPROVED", label: `✓ Onaylanan (${studentApps.filter(a => a.status === "APPROVED").length})` },
          { value: "REJECTED", label: `✕ Reddedilen (${studentApps.filter(a => a.status === "REJECTED").length})` },
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
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>Öğrenci / Veli</th>
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>İletişim</th>
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>Sınıf & İlçe</th>
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>Talep & Hedef</th>
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>Tür</th>
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>Durum</th>
                <th style={{ padding: "14px 18px", fontWeight: "700" }}>Tarih</th>
                <th style={{ padding: "14px 18px", fontWeight: "700", textAlign: "right" }}>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} style={{ padding: "40px 16px", textAlign: "center", color: "#94A3B8" }}>
                    Yükleniyor...
                  </td>
                </tr>
              ) : filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "40px 16px", textAlign: "center", color: "#94A3B8" }}>
                    Eşleşen öğrenci başvurusu bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => (
                  <tr key={app.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <Avatar
                          src={app.photoFileName || app.photoUrl}
                          name={app.name}
                          size={38}
                          showBorder
                          style={{ boxShadow: "0 2px 4px rgba(15, 38, 69, 0.08)" }}
                        />
                        <div>
                          <div style={{ fontWeight: "700", color: "#0F2645" }}>{app.name}</div>
                          {app.parentName && (
                            <div style={{ fontSize: "12px", color: "#64748B" }}>Veli: {app.parentName}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ color: "#0F2645" }}>{app.email || "E-posta yok"}</div>
                      <div style={{ fontSize: "12px", color: "#64748B" }}>{app.phone}</div>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ fontWeight: "600", color: "#0F2645" }}>{app.grade || "Sınıf Belirtilmedi"}</div>
                      <div style={{ fontSize: "12px", color: "#64748B" }}>{app.currentDistrict || app.city || "İstanbul"}</div>
                    </td>
                    <td style={{ padding: "14px 18px", maxWidth: "260px" }}>
                      <SubjectTagSlider 
                        subjects={app.selectedSubjects || app.subject || "Eğitim Koçluğu"}
                        target={app.target}
                        maxWidth="240px"
                      />
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <span style={{ 
                        fontSize: "11px", 
                        fontWeight: "700", 
                        padding: "3px 8px", 
                        borderRadius: "6px",
                        backgroundColor: app.formType === "kocluk" ? "#EDE9FE" : "#EFF6FF",
                        color: app.formType === "kocluk" ? "#6D28D9" : "#1D4ED8",
                        border: app.formType === "kocluk" ? "1px solid #DDD6FE" : "1px solid #BFDBFE"
                      }}>
                        {app.formType === "kocluk" ? "🎓 Koçluk" : "📚 Özel Ders"}
                      </span>
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
                          onClick={() => { setSelectedApp(app); setModalType("detail"); }}
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
                              onClick={() => handleRejectStudent(app.id)}
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

      {/* Comprehensive Detail Modal */}
      <Modal
        isOpen={modalType === "detail" && Boolean(selectedApp)}
        onClose={closeModal}
        maxWidth="820px"
        title={`${selectedApp?.name || ""} • Başvuru Detayları`}
        titleIcon={<Users size={20} color="#C8952A" />}
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
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Header Banner */}
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "20px", 
              padding: "16px 20px", 
              backgroundColor: "#F8FAFC", 
              borderRadius: "12px", 
              border: "1px solid #E2E8F0",
              flexWrap: "wrap"
            }}>
              <Avatar
                src={selectedApp.photoFileName || selectedApp.photoUrl}
                name={selectedApp.name}
                size={80}
                showBorder
                style={{ boxShadow: "0 4px 12px rgba(15, 38, 69, 0.15)", border: "3px solid #C8952A" }}
              />
              <div style={{ flex: 1, minWidth: "220px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "6px" }}>
                  <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#0F2645" }}>
                    {selectedApp.name}
                  </h3>
                  <span style={{ 
                    fontSize: "12px", 
                    fontWeight: "800", 
                    padding: "3px 10px", 
                    borderRadius: "6px",
                    backgroundColor: selectedApp.formType === "kocluk" ? "#EDE9FE" : "#EFF6FF",
                    color: selectedApp.formType === "kocluk" ? "#6D28D9" : "#1D4ED8",
                    border: selectedApp.formType === "kocluk" ? "1px solid #DDD6FE" : "1px solid #BFDBFE"
                  }}>
                    {selectedApp.formType === "kocluk" ? "🎓 Eğitim Koçluğu Başvurusu" : "📚 Birebir Özel Ders Başvurusu"}
                  </span>
                  <Badge variant={selectedApp.status as any} />
                </div>
                <div style={{ fontSize: "13px", color: "#64748B", display: "flex", flexWrap: "wrap", gap: "16px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <Calendar size={14} color="#C8952A" /> Başvuru: {new Date(selectedApp.createdAt).toLocaleDateString("tr-TR")}
                  </span>
                  {selectedApp.scoreType && (
                    <span style={{ fontWeight: "700", color: "#C8952A" }}>
                      Alan: {selectedApp.scoreType}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Grid 1: Öğrenci ve Veli Bilgileri */}
            <div className="admin-grid-2col">
              {/* Öğrenci Bilgileri */}
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", border: "1px solid #E2E8F0", padding: "16px" }}>
                <div style={{ fontSize: "14px", fontWeight: "800", color: "#0F2645", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px", borderBottom: "1px solid #F1F5F9", paddingBottom: "8px" }}>
                  <User size={16} color="#C8952A" /> 1. Öğrenci İletişim Bilgileri
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "#64748B", fontWeight: "700", display: "block" }}>Öğrenci Adı Soyadı</span>
                    <strong style={{ color: "#0F2645" }}>{selectedApp.name}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "#64748B", fontWeight: "700", display: "block" }}>E-Posta Adresi</span>
                    <strong style={{ color: "#0F2645" }}>{selectedApp.email || "Belirtilmedi"}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "#64748B", fontWeight: "700", display: "block" }}>Telefon Numarası</span>
                    <strong style={{ color: "#0F2645" }}>{selectedApp.phone}</strong>
                  </div>
                </div>
              </div>

              {/* Veli Bilgileri */}
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", border: "1px solid #E2E8F0", padding: "16px" }}>
                <div style={{ fontSize: "14px", fontWeight: "800", color: "#0F2645", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px", borderBottom: "1px solid #F1F5F9", paddingBottom: "8px" }}>
                  <Users size={16} color="#C8952A" /> 2. Veli İletişim Bilgileri
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "#64748B", fontWeight: "700", display: "block" }}>Veli Adı Soyadı</span>
                    <strong style={{ color: "#0F2645" }}>{selectedApp.parentName || "Belirtilmedi"}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "#64748B", fontWeight: "700", display: "block" }}>Veli Telefon Numarası</span>
                    <strong style={{ color: "#0F2645" }}>{selectedApp.parentPhone || "Belirtilmedi"}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "#64748B", fontWeight: "700", display: "block" }}>İletişim Notu</span>
                    <span style={{ color: "#64748B" }}>Özel ders ve koçluk planlaması için aranabilir.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid 2: Akademik Hedef & Konum Bilgileri */}
            <div className="admin-grid-2col">
              {/* Akademik & Hedef */}
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", border: "1px solid #E2E8F0", padding: "16px" }}>
                <div style={{ fontSize: "14px", fontWeight: "800", color: "#0F2645", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px", borderBottom: "1px solid #F1F5F9", paddingBottom: "8px" }}>
                  <GraduationCap size={16} color="#C8952A" /> 3. Akademik Durum & Hedef
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "#64748B", fontWeight: "700", display: "block" }}>Sınıf / Seviye</span>
                    <strong style={{ color: "#0F2645" }}>{selectedApp.grade || "Belirtilmedi"}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "#64748B", fontWeight: "700", display: "block" }}>Puan Türü / Alan</span>
                    <strong style={{ color: "#0F2645" }}>{selectedApp.scoreType || "Genel"}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "#64748B", fontWeight: "700", display: "block" }}>Hedeflenen Üniversite / Bölüm / Lise</span>
                    <strong style={{ color: "#C8952A" }}>{selectedApp.target || "Belirtilmedi"}</strong>
                  </div>
                </div>
              </div>

              {/* Konum & Açık Adres */}
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", border: "1px solid #E2E8F0", padding: "16px" }}>
                <div style={{ fontSize: "14px", fontWeight: "800", color: "#0F2645", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px", borderBottom: "1px solid #F1F5F9", paddingBottom: "8px" }}>
                  <Home size={16} color="#C8952A" /> 4. Konum & İkametgah Adresi
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "#64748B", fontWeight: "700", display: "block" }}>İkamet Edilen İlçe / Şehir</span>
                    <strong style={{ color: "#0F2645" }}>📍 {selectedApp.currentDistrict || selectedApp.city || "İstanbul"}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "#64748B", fontWeight: "700", display: "block" }}>Açık Adres / Mahalle / Semt</span>
                    <strong style={{ color: "#0F2645" }}>{selectedApp.currentAddress || "Belirtilmedi"}</strong>
                  </div>
                  {selectedApp.coachName && (
                    <div>
                      <span style={{ fontSize: "11px", color: "#64748B", fontWeight: "700", display: "block" }}>Tercih Edilen Koç</span>
                      <strong style={{ color: "#C8952A" }}>{selectedApp.coachName}</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Talep Edilen Dersler */}
            <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", border: "1px solid #E2E8F0", padding: "16px" }}>
              <div style={{ fontSize: "14px", fontWeight: "800", color: "#0F2645", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px", borderBottom: "1px solid #F1F5F9", paddingBottom: "8px" }}>
                <BookOpen size={16} color="#C8952A" /> 5. Destek Alınmak İstenen Dersler & Hizmetler
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {(selectedApp.selectedSubjects || selectedApp.subject || "Eğitim Koçluğu")
                  .split(/[,;\n]+/)
                  .map((s: string) => s.trim())
                  .filter(Boolean)
                  .map((sub: string, i: number) => (
                    <span key={i} style={{ backgroundColor: "#FEF3C7", color: "#92400E", border: "1px solid #FCD34D", padding: "6px 12px", borderRadius: "8px", fontSize: "13px", fontWeight: "700" }}>
                      📘 {sub}
                    </span>
                  ))}
              </div>
            </div>

            {/* Ek Notlar */}
            {selectedApp.notes && (
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", border: "1px solid #E2E8F0", padding: "16px" }}>
                <div style={{ fontSize: "14px", fontWeight: "800", color: "#0F2645", marginBottom: "8px" }}>
                  📝 Öğrenci Notları / Özel İstekler
                </div>
                <p style={{ backgroundColor: "#F8FAFC", padding: "12px", borderRadius: "8px", fontSize: "13px", color: "#334155", margin: 0, lineHeight: "1.6", border: "1px solid #E2E8F0" }}>
                  {selectedApp.notes}
                </p>
              </div>
            )}

            {/* Profil Fotoğrafı Önizlemesi */}
            {getPhotoUrl(selectedApp.photoFileName || selectedApp.photoUrl) && (
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", border: "1px solid #E2E8F0", padding: "16px" }}>
                <div style={{ fontSize: "14px", fontWeight: "800", color: "#0F2645", marginBottom: "10px" }}>
                  🖼️ Yüklenen Profil / Vesikalık Fotoğrafı
                </div>
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
                    alt={selectedApp.name}
                    style={{ maxWidth: "100%", maxHeight: "300px", objectFit: "contain" }}
                  />
                </div>
              </div>
            )}

          </div>
        )}
      </Modal>

      {/* Approve Modal */}
      <Modal
        isOpen={modalType === "approve" && Boolean(selectedApp)}
        onClose={closeModal}
        title="Öğrenci Hesabı Oluştur"
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
                onClick={handleApproveStudent} 
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
            <p style={{ fontSize: "14px", color: "#475569", marginBottom: "14px", lineHeight: "1.5" }}>
              <strong>{selectedApp.name}</strong> için öğrenci paneli hesabı açılacaktır.
            </p>

            <div style={{ backgroundColor: "#F8FAFC", padding: "12px 14px", borderRadius: "8px", border: "1px solid #E2E8F0", marginBottom: "16px" }}>
              <div style={{ fontSize: "12px", color: "#64748B", fontWeight: "700", marginBottom: "6px" }}>Öğrencinin Talep Ettiği Dersler:</div>
              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                {(selectedApp.selectedSubjects || selectedApp.subject || "Eğitim Koçluğu")
                  .split(/[,;\n]+/)
                  .map((s: string) => s.trim())
                  .filter(Boolean)
                  .map((sub: string, i: number) => (
                    <span key={i} style={{ backgroundColor: "#FEF3C7", color: "#92400E", border: "1px solid #FCD34D", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "700" }}>
                      {sub}
                    </span>
                  ))}
              </div>
            </div>

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
                  helperText="Öğrenci ilk girişinde bu şifreyi değiştirmeye zorlanacaktır."
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
