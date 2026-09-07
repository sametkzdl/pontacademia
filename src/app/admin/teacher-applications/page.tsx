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
import { Button, Badge, PasswordInput, Modal, SearchFilterBar } from "@/components";

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
                      <div style={{ fontWeight: "700", color: "#0F2645" }}>{app.fullName}</div>
                      <div style={{ fontSize: "12px", color: "#64748B" }}>{app.classStatus || "Öğrenci"}</div>
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

