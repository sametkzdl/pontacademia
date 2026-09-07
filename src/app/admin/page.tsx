"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Users, 
  GraduationCap, 
  UserCheck, 
  UserX,
  Power,
  Clock, 
  Check, 
  X, 
  LogOut, 
  Search, 
  Eye, 
  Sparkles, 
  Shield, 
  MapPin, 
  Mail, 
  Phone, 
  BookOpen, 
  Calendar,
  AlertCircle,
  Key,
  Filter,
  ArrowUpDown
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"teacher_apps" | "student_apps" | "teachers" | "students">("teacher_apps");
  
  // Data States
  const [teacherApps, setTeacherApps] = useState<any[]>([]);
  const [studentApps, setStudentApps] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name_asc" | "name_desc" | "status">("newest");

  // Modals
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [modalType, setModalType] = useState<"detail" | "approve_teacher" | "approve_student" | null>(null);
  const [tempPassword, setTempPassword] = useState("Pont2026!");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");
  const [actionErrorMsg, setActionErrorMsg] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [appsRes, usersRes] = await Promise.all([
        fetch("/api/admin/applications"),
        fetch("/api/admin/users"),
      ]);

      if (appsRes.status === 401 || appsRes.status === 403 || usersRes.status === 401 || usersRes.status === 403) {
        router.push("/login");
        return;
      }

      const appsData = await appsRes.json();
      const usersData = await usersRes.json();

      if (appsData.success) {
        setTeacherApps(appsData.teacherApplications || []);
        setStudentApps(appsData.studentApplications || []);
      }

      if (usersData.success) {
        setTeachers(usersData.teachers || []);
        setStudents(usersData.students || []);
      }
    } catch (err) {
      console.error("Fetch data error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  // Sekme değiştiğinde filtreyi temizle
  const handleTabChange = (tab: "teacher_apps" | "student_apps" | "teachers" | "students") => {
    setActiveTab(tab);
    setStatusFilter("ALL");
  };

  // Kullanıcı Aktiflik Durumunu Değiştir (Aktif / Pasif)
  const handleToggleUserStatus = async (userId: string, currentStatus: boolean, userName: string) => {
    const nextStatus = currentStatus === false ? true : false;
    const actionText = nextStatus ? "aktif etmek" : "pasife almak (oturumu sonlandırılır)";
    if (!confirm(`"${userName}" kullanıcısını ${actionText} istediğinize emin misiniz?`)) return;

    try {
      const res = await fetch("/api/admin/users/toggle-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isActive: nextStatus }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // State'leri güncelle
        setTeachers(prev => prev.map(t => t.id === userId ? { ...t, isActive: nextStatus } : t));
        setStudents(prev => prev.map(s => s.id === userId ? { ...s, isActive: nextStatus } : s));
      } else {
        alert(data.error || "İşlem sırasında bir hata oluştu.");
      }
    } catch (err) {
      console.error(err);
      alert("Bağlantı hatası oluştu.");
    }
  };

  // Öğretmen Başvurusunu Onayla
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

      setActionSuccessMsg(`Öğretmen başarıyla oluşturuldu! E-posta: ${selectedApp.email} | Şifre: ${tempPassword}`);
      fetchData();
    } catch (err) {
      console.error(err);
      setActionErrorMsg("Bağlantı hatası oluştu.");
    } finally {
      setActionLoading(false);
    }
  };

  // Öğretmen Başvurusunu Reddet
  const handleRejectTeacher = async (id: string) => {
    if (!confirm("Bu başvuruyu reddetmek istediğinize emin misiniz?")) return;
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

  // Öğrenci Başvurusunu Onayla
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

  // Öğrenci Başvurusunu Reddet
  const handleRejectStudent = async (id: string) => {
    if (!confirm("Bu başvuruyu reddetmek istediğinize emin misiniz?")) return;
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

  const isAppTab = activeTab === "teacher_apps" || activeTab === "student_apps";

  // Filtrelenmiş ve Sıralanmış Veriler
  const filteredTeacherApps = teacherApps
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

  const filteredStudentApps = studentApps
    .filter(app => {
      const matchesSearch = 
        app.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.email && app.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (app.subject && app.subject.toLowerCase().includes(searchQuery.toLowerCase()));
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

  const filteredTeachers = teachers
    .filter(t => {
      const matchesSearch = 
        t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.email?.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (statusFilter === "ALL") return true;
      if (statusFilter === "ACTIVE") return t.isActive !== false;
      if (statusFilter === "PASSIVE") return t.isActive === false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "name_asc") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "name_desc") return (b.name || "").localeCompare(a.name || "");
      if (sortBy === "status") return (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0);
      return 0;
    });

  const filteredStudents = students
    .filter(s => {
      const matchesSearch = 
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (statusFilter === "ALL") return true;
      if (statusFilter === "ACTIVE") return s.isActive !== false;
      if (statusFilter === "PASSIVE") return s.isActive === false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "name_asc") return (a.name || "").localeCompare(b.name || "");
      if (sortBy === "name_desc") return (b.name || "").localeCompare(a.name || "");
      if (sortBy === "status") return (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0);
      return 0;
    });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F0F5FB", display: "flex", flexDirection: "column" }}>
      
      {/* Top Navbar */}
      <header style={{ backgroundColor: "#0F2645", color: "#FFFFFF", padding: "16px 0", borderBottom: "2px solid #C8952A" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link href="/">
              <Image 
                src="/pont_logo.png" 
                alt="Pont Academy Logo" 
                width={130} 
                height={36} 
                style={{ objectFit: "contain" }}
                priority
              />
            </Link>
            <span style={{ 
              backgroundColor: "rgba(200, 149, 42, 0.2)", 
              color: "#F0DFA8", 
              padding: "4px 10px", 
              borderRadius: "6px", 
              fontSize: "12px", 
              fontWeight: "700",
              border: "1px solid rgba(200, 149, 42, 0.4)"
            }}>
              YÖNETİCİ PANELİ
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#E0E8F2" }}>
              <Shield size={16} color="#C8952A" />
              <span>Admin</span>
            </div>
            <button 
              onClick={handleLogout}
              style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                gap: "6px", 
                backgroundColor: "rgba(255, 255, 255, 0.1)", 
                color: "#FFFFFF", 
                border: "1px solid rgba(255, 255, 255, 0.2)", 
                padding: "6px 14px", 
                borderRadius: "6px", 
                fontSize: "13px", 
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              <LogOut size={14} /> Çıkış Yap
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container" style={{ flexGrow: 1, padding: "32px 24px" }}>
        
        {/* Navigation Tabs & Search/Filter Controls */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
          
          {/* Tab Buttons */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              onClick={() => handleTabChange("teacher_apps")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "700",
                backgroundColor: activeTab === "teacher_apps" ? "#0F2645" : "#FFFFFF",
                color: activeTab === "teacher_apps" ? "#FFFFFF" : "#475569",
                border: activeTab === "teacher_apps" ? "1px solid #0F2645" : "1px solid #DDE6F0",
                cursor: "pointer",
                boxShadow: activeTab === "teacher_apps" ? "0 4px 12px rgba(15, 38, 69, 0.15)" : "0 1px 3px rgba(0,0,0,0.02)"
              }}
            >
              <GraduationCap size={16} color={activeTab === "teacher_apps" ? "#C8952A" : "#64748B"} />
              Öğretmen Başvuruları ({teacherApps.filter(a => a.status === "PENDING").length})
            </button>

            <button
              onClick={() => handleTabChange("student_apps")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "700",
                backgroundColor: activeTab === "student_apps" ? "#0F2645" : "#FFFFFF",
                color: activeTab === "student_apps" ? "#FFFFFF" : "#475569",
                border: activeTab === "student_apps" ? "1px solid #0F2645" : "1px solid #DDE6F0",
                cursor: "pointer",
                boxShadow: activeTab === "student_apps" ? "0 4px 12px rgba(15, 38, 69, 0.15)" : "0 1px 3px rgba(0,0,0,0.02)"
              }}
            >
              <Users size={16} color={activeTab === "student_apps" ? "#C8952A" : "#64748B"} />
              Öğrenci Başvuruları ({studentApps.filter(a => a.status === "PENDING").length})
            </button>

            <button
              onClick={() => handleTabChange("teachers")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "700",
                backgroundColor: activeTab === "teachers" ? "#0F2645" : "#FFFFFF",
                color: activeTab === "teachers" ? "#FFFFFF" : "#475569",
                border: activeTab === "teachers" ? "1px solid #0F2645" : "1px solid #DDE6F0",
                cursor: "pointer",
                boxShadow: activeTab === "teachers" ? "0 4px 12px rgba(15, 38, 69, 0.15)" : "0 1px 3px rgba(0,0,0,0.02)"
              }}
            >
              <UserCheck size={16} color={activeTab === "teachers" ? "#C8952A" : "#64748B"} />
              Öğretmenler Listesi ({teachers.length})
            </button>

            <button
              onClick={() => handleTabChange("students")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "700",
                backgroundColor: activeTab === "students" ? "#0F2645" : "#FFFFFF",
                color: activeTab === "students" ? "#FFFFFF" : "#475569",
                border: activeTab === "students" ? "1px solid #0F2645" : "1px solid #DDE6F0",
                cursor: "pointer",
                boxShadow: activeTab === "students" ? "0 4px 12px rgba(15, 38, 69, 0.15)" : "0 1px 3px rgba(0,0,0,0.02)"
              }}
            >
              <Users size={16} color={activeTab === "students" ? "#C8952A" : "#64748B"} />
              Öğrenciler Listesi ({students.length})
            </button>
          </div>

          {/* Controls: Durum Filtresi + Sıralama + Arama */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" }}>
            
            {/* Durum Filtresi */}
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "6px", 
              backgroundColor: "#FFFFFF", 
              padding: "7px 12px", 
              borderRadius: "8px", 
              border: "1px solid #CBD5E1",
              boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
            }}>
              <Filter size={14} color="#64748B" />
              <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600" }}>Durum:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ 
                  border: "none", 
                  outline: "none", 
                  fontSize: "13px", 
                  fontWeight: "600", 
                  color: "#0F2645", 
                  backgroundColor: "transparent", 
                  cursor: "pointer" 
                }}
              >
                <option value="ALL">Tümü</option>
                {isAppTab ? (
                  <>
                    <option value="PENDING">⏳ Bekleyen</option>
                    <option value="APPROVED">✓ Onaylanan</option>
                    <option value="REJECTED">✕ Reddedilen</option>
                  </>
                ) : (
                  <>
                    <option value="ACTIVE">🟢 Aktifler</option>
                    <option value="PASSIVE">🔴 Pasifler</option>
                  </>
                )}
              </select>
            </div>

            {/* Sıralama */}
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "6px", 
              backgroundColor: "#FFFFFF", 
              padding: "7px 12px", 
              borderRadius: "8px", 
              border: "1px solid #CBD5E1",
              boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
            }}>
              <ArrowUpDown size={14} color="#64748B" />
              <span style={{ fontSize: "12px", color: "#64748B", fontWeight: "600" }}>Sırala:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{ 
                  border: "none", 
                  outline: "none", 
                  fontSize: "13px", 
                  fontWeight: "600", 
                  color: "#0F2645", 
                  backgroundColor: "transparent", 
                  cursor: "pointer" 
                }}
              >
                <option value="newest">En Yeni</option>
                <option value="oldest">En Eski</option>
                <option value="name_asc">İsim (A → Z)</option>
                <option value="name_desc">İsim (Z → A)</option>
                <option value="status">Duruma Göre</option>
              </select>
            </div>

            {/* Search Input */}
            <div style={{ position: "relative", minWidth: "220px" }}>
              <input 
                type="text"
                placeholder="İsim, e-posta veya okul ara..."
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
                  boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
                }}
              />
              <Search size={15} color="#94A3B8" style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)" }} />
            </div>

          </div>

        </div>

        {/* Tab 1: Öğretmen Başvuruları */}
        {activeTab === "teacher_apps" && (
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #DDE6F0", overflow: "hidden", boxShadow: "0 4px 16px rgba(15, 38, 69, 0.04)" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#475569" }}>
                    <th style={{ padding: "14px 18px", fontWeight: "700" }}>Aday</th>
                    <th style={{ padding: "14px 18px", fontWeight: "700" }}>İletişim</th>
                    <th style={{ padding: "14px 18px", fontWeight: "700" }}>Üniversite & Sıralama</th>
                    <th style={{ padding: "14px 18px", fontWeight: "700" }}>İlçe / İkamet</th>
                    <th style={{ padding: "14px 18px", fontWeight: "700" }}>Durum</th>
                    <th style={{ padding: "14px 18px", fontWeight: "700", textAlign: "right" }}>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeacherApps.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "#94A3B8" }}>
                        Kayıtlı öğretmen başvurusu bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    filteredTeacherApps.map((app) => (
                      <tr key={app.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                        <td style={{ padding: "14px 18px" }}>
                          <div style={{ fontWeight: "700", color: "#0F2645" }}>{app.fullName}</div>
                          <div style={{ fontSize: "12px", color: "#64748B" }}>{app.gender} &bull; {app.birthDate}</div>
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <div style={{ color: "#0F2645", fontSize: "13px" }}>{app.email}</div>
                          <div style={{ color: "#64748B", fontSize: "12px" }}>{app.phone}</div>
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <div style={{ fontWeight: "600", color: "#0F2645", fontSize: "13px" }}>{app.school}</div>
                          <div style={{ color: "#C8952A", fontWeight: "700", fontSize: "12px" }}>YKS: {app.yksRank}</div>
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <div style={{ color: "#0F2645", fontSize: "13px" }}>{app.currentDistrict}</div>
                          <div style={{ color: "#64748B", fontSize: "12px" }}>{app.onlineAvailable ? "Online + Yüz Yüze" : "Yalnızca Yüz Yüze"}</div>
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <span style={{ 
                            padding: "4px 10px", 
                            borderRadius: "20px", 
                            fontSize: "12px", 
                            fontWeight: "700",
                            backgroundColor: app.status === "APPROVED" ? "#DCFCE7" : app.status === "REJECTED" ? "#FEE2E2" : "#FEF3C7",
                            color: app.status === "APPROVED" ? "#15803D" : app.status === "REJECTED" ? "#B91C1C" : "#B45309",
                          }}>
                            {app.status === "APPROVED" ? "Onaylandı" : app.status === "REJECTED" ? "Reddedildi" : "Bekliyor"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 18px", textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "6px" }}>
                            <button
                              onClick={() => { setSelectedApp(app); setModalType("detail"); }}
                              style={{ padding: "6px 10px", borderRadius: "6px", backgroundColor: "#F1F5F9", color: "#0F2645", border: "1px solid #CBD5E1", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}
                            >
                              Detay
                            </button>
                            {app.status === "PENDING" && (
                              <>
                                <button
                                  onClick={() => { setSelectedApp(app); setModalType("approve_teacher"); }}
                                  style={{ padding: "6px 12px", borderRadius: "6px", backgroundColor: "#15803D", color: "#FFF", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: "700" }}
                                >
                                  Onayla & Hesap Aç
                                </button>
                                <button
                                  onClick={() => handleRejectTeacher(app.id)}
                                  style={{ padding: "6px 10px", borderRadius: "6px", backgroundColor: "#FEE2E2", color: "#B91C1C", border: "1px solid #FCA5A5", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}
                                >
                                  Reddet
                                </button>
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
        )}

        {/* Tab 2: Öğrenci Başvuruları */}
        {activeTab === "student_apps" && (
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #DDE6F0", overflow: "hidden", boxShadow: "0 4px 16px rgba(15, 38, 69, 0.04)" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#475569" }}>
                    <th style={{ padding: "14px 18px", fontWeight: "700" }}>Tür</th>
                    <th style={{ padding: "14px 18px", fontWeight: "700" }}>Öğrenci / Veli</th>
                    <th style={{ padding: "14px 18px", fontWeight: "700" }}>İletişim</th>
                    <th style={{ padding: "14px 18px", fontWeight: "700" }}>Sınıf / Hedef</th>
                    <th style={{ padding: "14px 18px", fontWeight: "700" }}>Ders / Tercih</th>
                    <th style={{ padding: "14px 18px", fontWeight: "700" }}>Durum</th>
                    <th style={{ padding: "14px 18px", fontWeight: "700", textAlign: "right" }}>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudentApps.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "#94A3B8" }}>
                        Kayıtlı öğrenci başvurusu bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    filteredStudentApps.map((app) => (
                      <tr key={app.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                        <td style={{ padding: "14px 18px" }}>
                          <span style={{ 
                            padding: "3px 8px", 
                            borderRadius: "6px", 
                            fontSize: "11px", 
                            fontWeight: "700",
                            backgroundColor: app.formType === "kocluk" ? "#EDE9FE" : "#E0F2FE",
                            color: app.formType === "kocluk" ? "#6D28D9" : "#0369A1"
                          }}>
                            {app.formType === "kocluk" ? "KOÇLUK" : "ÖZEL DERS"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 18px", fontWeight: "700", color: "#0F2645" }}>
                          {app.name}
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <div style={{ color: "#0F2645", fontSize: "13px" }}>{app.email || "E-posta yok"}</div>
                          <div style={{ color: "#64748B", fontSize: "12px" }}>{app.phone}</div>
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <div style={{ color: "#0F2645", fontSize: "13px" }}>{app.grade || "-"}</div>
                          <div style={{ color: "#64748B", fontSize: "12px" }}>{app.target || "-"}</div>
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <div style={{ color: "#0F2645", fontSize: "13px", fontWeight: "600" }}>{app.subject || app.coachName || "-"}</div>
                          <div style={{ color: "#64748B", fontSize: "12px" }}>{app.city || "-"}</div>
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <span style={{ 
                            padding: "4px 10px", 
                            borderRadius: "20px", 
                            fontSize: "12px", 
                            fontWeight: "700",
                            backgroundColor: app.status === "APPROVED" ? "#DCFCE7" : app.status === "REJECTED" ? "#FEE2E2" : "#FEF3C7",
                            color: app.status === "APPROVED" ? "#15803D" : app.status === "REJECTED" ? "#B91C1C" : "#B45309",
                          }}>
                            {app.status === "APPROVED" ? "Onaylandı" : app.status === "REJECTED" ? "Reddedildi" : "Bekliyor"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 18px", textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "6px" }}>
                            {app.status === "PENDING" && app.email && (
                              <button
                                onClick={() => { setSelectedApp(app); setModalType("approve_student"); }}
                                style={{ padding: "6px 12px", borderRadius: "6px", backgroundColor: "#15803D", color: "#FFF", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: "700" }}
                              >
                                Onayla & Hesap Aç
                              </button>
                            )}
                            {app.status === "PENDING" && (
                              <button
                                onClick={() => handleRejectStudent(app.id)}
                                style={{ padding: "6px 10px", borderRadius: "6px", backgroundColor: "#FEE2E2", color: "#B91C1C", border: "1px solid #FCA5A5", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}
                              >
                                Reddet
                              </button>
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
        )}

        {/* Tab 3: Öğretmenler Listesi */}
        {activeTab === "teachers" && (
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #DDE6F0", overflow: "hidden", boxShadow: "0 4px 16px rgba(15, 38, 69, 0.04)" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#475569" }}>
                    <th style={{ padding: "14px 18px", fontWeight: "700" }}>Öğretmen</th>
                    <th style={{ padding: "14px 18px", fontWeight: "700" }}>E-posta & Telefon</th>
                    <th style={{ padding: "14px 18px", fontWeight: "700" }}>Üniversite</th>
                    <th style={{ padding: "14px 18px", fontWeight: "700" }}>İkamet / İlçe</th>
                    <th style={{ padding: "14px 18px", fontWeight: "700" }}>Ders Verilen İlçeler</th>
                    <th style={{ padding: "14px 18px", fontWeight: "700" }}>Durum</th>
                    <th style={{ padding: "14px 18px", fontWeight: "700" }}>Kayıt Tarihi</th>
                    <th style={{ padding: "14px 18px", fontWeight: "700", textAlign: "right" }}>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: "32px", textAlign: "center", color: "#94A3B8" }}>
                        Kayıtlı öğretmen bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    filteredTeachers.map((t) => (
                      <tr key={t.id} style={{ borderBottom: "1px solid #F1F5F9", backgroundColor: t.isActive === false ? "#F8FAFC" : "#FFFFFF" }}>
                        <td style={{ padding: "14px 18px", fontWeight: "700", color: "#0F2645" }}>
                          {t.name}
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <div style={{ color: "#0F2645", fontSize: "13px" }}>{t.email}</div>
                          <div style={{ color: "#64748B", fontSize: "12px" }}>{t.teacherProfile?.phone || "-"}</div>
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <div style={{ color: "#0F2645", fontSize: "13px" }}>{t.teacherProfile?.school || "-"}</div>
                          <div style={{ color: "#C8952A", fontWeight: "700", fontSize: "12px" }}>{t.teacherProfile?.yksRank || "-"}</div>
                        </td>
                        <td style={{ padding: "14px 18px", fontSize: "13px", color: "#475569" }}>
                          {t.teacherProfile?.currentDistrict || "-"}
                        </td>
                        <td style={{ padding: "14px 18px", fontSize: "12px", color: "#64748B", maxWidth: "200px" }}>
                          {t.teacherProfile?.districts || "-"}
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <span style={{ 
                            padding: "4px 10px", 
                            borderRadius: "20px", 
                            fontSize: "12px", 
                            fontWeight: "700",
                            backgroundColor: t.isActive !== false ? "#DCFCE7" : "#FEE2E2",
                            color: t.isActive !== false ? "#15803D" : "#B91C1C",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px"
                          }}>
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: t.isActive !== false ? "#16A34A" : "#DC2626" }}></span>
                            {t.isActive !== false ? "Aktif" : "Pasif"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 18px", fontSize: "12px", color: "#64748B" }}>
                          {new Date(t.createdAt).toLocaleDateString("tr-TR")}
                        </td>
                        <td style={{ padding: "14px 18px", textAlign: "right" }}>
                          <button
                            onClick={() => handleToggleUserStatus(t.id, t.isActive, t.name)}
                            style={{ 
                              padding: "6px 12px", 
                              borderRadius: "6px", 
                              backgroundColor: t.isActive !== false ? "#FEF2F2" : "#F0FDF4", 
                              color: t.isActive !== false ? "#DC2626" : "#16A34A", 
                              border: t.isActive !== false ? "1px solid #FECACA" : "1px solid #BBF7D0", 
                              cursor: "pointer", 
                              fontSize: "12px", 
                              fontWeight: "700",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            <Power size={13} />
                            {t.isActive !== false ? "Pasife Al" : "Aktif Et"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Öğrenciler Listesi */}
        {activeTab === "students" && (
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #DDE6F0", overflow: "hidden", boxShadow: "0 4px 16px rgba(15, 38, 69, 0.04)" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0", color: "#475569" }}>
                    <th style={{ padding: "14px 18px", fontWeight: "700" }}>Öğrenci</th>
                    <th style={{ padding: "14px 18px", fontWeight: "700" }}>E-posta & Telefon</th>
                    <th style={{ padding: "14px 18px", fontWeight: "700" }}>Şehir</th>
                    <th style={{ padding: "14px 18px", fontWeight: "700" }}>Sınıf</th>
                    <th style={{ padding: "14px 18px", fontWeight: "700" }}>Hedef / Ders</th>
                    <th style={{ padding: "14px 18px", fontWeight: "700" }}>Durum</th>
                    <th style={{ padding: "14px 18px", fontWeight: "700" }}>Kayıt Tarihi</th>
                    <th style={{ padding: "14px 18px", fontWeight: "700", textAlign: "right" }}>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: "32px", textAlign: "center", color: "#94A3B8" }}>
                        Kayıtlı öğrenci bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s) => (
                      <tr key={s.id} style={{ borderBottom: "1px solid #F1F5F9", backgroundColor: s.isActive === false ? "#F8FAFC" : "#FFFFFF" }}>
                        <td style={{ padding: "14px 18px", fontWeight: "700", color: "#0F2645" }}>
                          {s.name}
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <div style={{ color: "#0F2645", fontSize: "13px" }}>{s.email}</div>
                          <div style={{ color: "#64748B", fontSize: "12px" }}>{s.studentProfile?.phone || "-"}</div>
                        </td>
                        <td style={{ padding: "14px 18px", fontSize: "13px", color: "#475569" }}>
                          {s.studentProfile?.city || "-"}
                        </td>
                        <td style={{ padding: "14px 18px", fontSize: "13px", color: "#475569" }}>
                          {s.studentProfile?.grade || "-"}
                        </td>
                        <td style={{ padding: "14px 18px", fontSize: "13px", color: "#0F2645" }}>
                          {s.studentProfile?.target || s.studentProfile?.subject || "-"}
                        </td>
                        <td style={{ padding: "14px 18px" }}>
                          <span style={{ 
                            padding: "4px 10px", 
                            borderRadius: "20px", 
                            fontSize: "12px", 
                            fontWeight: "700",
                            backgroundColor: s.isActive !== false ? "#DCFCE7" : "#FEE2E2",
                            color: s.isActive !== false ? "#15803D" : "#B91C1C",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px"
                          }}>
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: s.isActive !== false ? "#16A34A" : "#DC2626" }}></span>
                            {s.isActive !== false ? "Aktif" : "Pasif"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 18px", fontSize: "12px", color: "#64748B" }}>
                          {new Date(s.createdAt).toLocaleDateString("tr-TR")}
                        </td>
                        <td style={{ padding: "14px 18px", textAlign: "right" }}>
                          <button
                            onClick={() => handleToggleUserStatus(s.id, s.isActive, s.name)}
                            style={{ 
                              padding: "6px 12px", 
                              borderRadius: "6px", 
                              backgroundColor: s.isActive !== false ? "#FEF2F2" : "#F0FDF4", 
                              color: s.isActive !== false ? "#DC2626" : "#16A34A", 
                              border: s.isActive !== false ? "1px solid #FECACA" : "1px solid #BBF7D0", 
                              cursor: "pointer", 
                              fontSize: "12px", 
                              fontWeight: "700",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            <Power size={13} />
                            {s.isActive !== false ? "Pasife Al" : "Aktif Et"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* Modal 1: Öğretmen Başvuru Detayı */}
      {modalType === "detail" && selectedApp && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", padding: "28px", maxWidth: "680px", width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 50px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #E2E8F0", paddingBottom: "12px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#0F2645", margin: 0 }}>
                {selectedApp.fullName} &bull; Başvuru Detayı
              </h3>
              <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px", fontSize: "14px" }}>
              <div><strong>E-posta:</strong> {selectedApp.email}</div>
              <div><strong>Telefon:</strong> {selectedApp.phone}</div>
              <div><strong>Doğum Tarihi:</strong> {selectedApp.birthDate}</div>
              <div><strong>Cinsiyet:</strong> {selectedApp.gender}</div>
              <div><strong>Üniversite / Bölüm:</strong> {selectedApp.school}</div>
              <div><strong>YKS Sıralaması:</strong> {selectedApp.yksRank}</div>
              <div><strong>Aktif Sınıf:</strong> {selectedApp.classStatus}</div>
              <div><strong>IBAN:</strong> {selectedApp.iban}</div>
              <div><strong>İkametgah İlçesi:</strong> {selectedApp.currentDistrict}</div>
              <div><strong>Online Ders:</strong> {selectedApp.onlineAvailable ? "Evet" : "Hayır"}</div>
            </div>

            <div style={{ marginBottom: "16px", fontSize: "14px" }}>
              <strong>Açık Adres:</strong>
              <div style={{ backgroundColor: "#F8FAFC", padding: "10px", borderRadius: "8px", marginTop: "4px", color: "#334155" }}>
                {selectedApp.currentAddress || "Belirtilmedi"}
              </div>
            </div>

            <div style={{ marginBottom: "16px", fontSize: "14px" }}>
              <strong>Yüz Yüze Ders Verilebilecek İlçeler:</strong>
              <div style={{ backgroundColor: "#F8FAFC", padding: "10px", borderRadius: "8px", marginTop: "4px", color: "#0F2645", fontWeight: "600" }}>
                {selectedApp.districts || "Belirtilmedi"}
              </div>
            </div>

            {/* TYT Ders Bilgisi & Yetkinlikleri */}
            {(() => {
              let tyt: any = {};
              let ayt: any = {};
              try {
                tyt = typeof selectedApp.tytScores === "string" ? JSON.parse(selectedApp.tytScores) : (selectedApp.tytScores || {});
                ayt = typeof selectedApp.aytScores === "string" ? JSON.parse(selectedApp.aytScores) : (selectedApp.aytScores || {});
              } catch {}

              return (
                <div style={{ marginBottom: "20px" }}>
                  {/* TYT Skorları */}
                  <div style={{ marginBottom: "16px" }}>
                    <strong style={{ fontSize: "13px", color: "#0F2645", display: "block", marginBottom: "8px" }}>
                      TYT DERS YETKİNLİKLERİ (10 Üzerinden Puan):
                    </strong>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "8px" }}>
                      {[
                        { label: "TYT Türkçe", val: tyt.tytTurkce },
                        { label: "TYT Matematik", val: tyt.tytMat },
                        { label: "TYT Fizik", val: tyt.tytFizik },
                        { label: "TYT Kimya", val: tyt.tytKimya },
                        { label: "TYT Biyoloji", val: tyt.tytBiyoloji },
                        { label: "TYT Tarih", val: tyt.tytTarih },
                        { label: "TYT Coğrafya", val: tyt.tytCografya },
                      ].map((item, idx) => (
                        <div key={idx} style={{ 
                          backgroundColor: "#F8FAFC", 
                          padding: "8px 12px", 
                          borderRadius: "8px", 
                          border: "1px solid #E2E8F0",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: "12px"
                        }}>
                          <span style={{ color: "#475569", fontWeight: "600" }}>{item.label}</span>
                          <span style={{ 
                            fontWeight: "800", 
                            color: Number(item.val || 5) >= 8 ? "#92400E" : Number(item.val || 5) >= 5 ? "#0369A1" : "#475569",
                            backgroundColor: Number(item.val || 5) >= 8 ? "#FEF3C7" : Number(item.val || 5) >= 5 ? "#E0F2FE" : "#F1F5F9",
                            padding: "2px 6px",
                            borderRadius: "4px"
                          }}>
                            {item.val ?? 5}/10
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AYT Skorları */}
                  <div>
                    <strong style={{ fontSize: "13px", color: "#0F2645", display: "block", marginBottom: "8px" }}>
                      AYT DERS YETKİNLİKLERİ (10 Üzerinden Puan):
                    </strong>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: "8px" }}>
                      {[
                        { label: "AYT Matematik", val: ayt.aytMat },
                        { label: "AYT Fizik", val: ayt.aytFizik },
                        { label: "AYT Kimya", val: ayt.aytKimya },
                        { label: "AYT Biyoloji", val: ayt.aytBiyoloji },
                        { label: "AYT Edebiyat/Tr", val: ayt.aytTurkce },
                        { label: "AYT Tarih", val: ayt.aytTarih },
                        { label: "AYT Coğrafya", val: ayt.aytCografya },
                      ].map((item, idx) => (
                        <div key={idx} style={{ 
                          backgroundColor: "#F8FAFC", 
                          padding: "8px 12px", 
                          borderRadius: "8px", 
                          border: "1px solid #E2E8F0",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: "12px"
                        }}>
                          <span style={{ color: "#475569", fontWeight: "600" }}>{item.label}</span>
                          <span style={{ 
                            fontWeight: "800", 
                            color: Number(item.val || 5) >= 8 ? "#92400E" : Number(item.val || 5) >= 5 ? "#0369A1" : "#475569",
                            backgroundColor: Number(item.val || 5) >= 8 ? "#FEF3C7" : Number(item.val || 5) >= 5 ? "#E0F2FE" : "#F1F5F9",
                            padding: "2px 6px",
                            borderRadius: "4px"
                          }}>
                            {item.val ?? 5}/10
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {selectedApp.notes && (
              <div style={{ marginBottom: "16px", fontSize: "14px" }}>
                <strong>Aday Notları:</strong>
                <div style={{ backgroundColor: "#FEF9C3", padding: "10px", borderRadius: "8px", marginTop: "4px", color: "#713F12" }}>
                  {selectedApp.notes}
                </div>
              </div>
            )}

            <div style={{ marginTop: "24px", textAlign: "right" }}>
              <button onClick={closeModal} className="btn btn-secondary" style={{ padding: "8px 18px", borderRadius: "8px" }}>
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Öğretmen Onaylama & Geçici Şifre Atama */}
      {modalType === "approve_teacher" && selectedApp && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", padding: "28px", maxWidth: "480px", width: "100%", boxShadow: "0 20px 50px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0F2645", margin: 0 }}>
                Öğretmen Başvurusunu Onayla
              </h3>
              <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: "14px", color: "#475569", marginBottom: "20px" }}>
              <strong>{selectedApp.fullName}</strong> ({selectedApp.email}) için eğitmen hesabı açılacaktır. Adaya iletilecek geçici şifreyi belirleyiniz:
            </p>

            {actionSuccessMsg ? (
              <div style={{ backgroundColor: "#DCFCE7", border: "1px solid #86EFAC", color: "#15803D", padding: "14px", borderRadius: "8px", fontSize: "14px", marginBottom: "20px", fontWeight: "600" }}>
                <Check size={18} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
                {actionSuccessMsg}
              </div>
            ) : (
              <>
                {actionErrorMsg && (
                  <div style={{ backgroundColor: "#FEE2E2", border: "1px solid #FCA5A5", color: "#B91C1C", padding: "12px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
                    <AlertCircle size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
                    {actionErrorMsg}
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: "24px" }}>
                  <label className="form-label" style={{ fontWeight: "700", color: "#0F2645" }}>Geçici Şifre</label>
                  <div style={{ position: "relative" }}>
                    <input 
                      className="form-input" 
                      type="text" 
                      value={tempPassword} 
                      onChange={(e) => setTempPassword(e.target.value)}
                      style={{ 
                        backgroundColor: "#FFFFFF", 
                        color: "#0F2645", 
                        borderColor: "#CBD5E1", 
                        fontWeight: "700", 
                        fontSize: "15px", 
                        paddingLeft: "38px" 
                      }}
                      required
                    />
                    <Key size={16} color="#94A3B8" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button onClick={closeModal} className="btn btn-secondary" style={{ padding: "10px 18px" }}>
                    İptal
                  </button>
                  <button 
                    onClick={handleApproveTeacher} 
                    disabled={actionLoading}
                    className="btn btn-primary" 
                    style={{ padding: "10px 20px" }}
                  >
                    {actionLoading ? "Hesap Açılıyor..." : "Onayla ve Hesabı Oluştur"}
                  </button>
                </div>
              </>
            )}

            {actionSuccessMsg && (
              <div style={{ textAlign: "right", marginTop: "16px" }}>
                <button onClick={closeModal} className="btn btn-primary" style={{ padding: "8px 18px" }}>
                  Tamam
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal 3: Öğrenci Onaylama & Geçici Şifre Atama */}
      {modalType === "approve_student" && selectedApp && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", padding: "28px", maxWidth: "480px", width: "100%", boxShadow: "0 20px 50px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0F2645", margin: 0 }}>
                Öğrenci Başvurusunu Onayla
              </h3>
              <button onClick={closeModal} style={{ background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: "14px", color: "#475569", marginBottom: "20px" }}>
              <strong>{selectedApp.name}</strong> ({selectedApp.email}) için öğrenci hesabı açılacaktır. Adaya iletilecek geçici şifreyi belirleyiniz:
            </p>

            {actionSuccessMsg ? (
              <div style={{ backgroundColor: "#DCFCE7", border: "1px solid #86EFAC", color: "#15803D", padding: "14px", borderRadius: "8px", fontSize: "14px", marginBottom: "20px", fontWeight: "600" }}>
                <Check size={18} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
                {actionSuccessMsg}
              </div>
            ) : (
              <>
                {actionErrorMsg && (
                  <div style={{ backgroundColor: "#FEE2E2", border: "1px solid #FCA5A5", color: "#B91C1C", padding: "12px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
                    <AlertCircle size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
                    {actionErrorMsg}
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: "24px" }}>
                  <label className="form-label" style={{ fontWeight: "700", color: "#0F2645" }}>Geçici Şifre</label>
                  <div style={{ position: "relative" }}>
                    <input 
                      className="form-input" 
                      type="text" 
                      value={tempPassword} 
                      onChange={(e) => setTempPassword(e.target.value)}
                      style={{ 
                        backgroundColor: "#FFFFFF", 
                        color: "#0F2645", 
                        borderColor: "#CBD5E1", 
                        fontWeight: "700", 
                        fontSize: "15px", 
                        paddingLeft: "38px" 
                      }}
                      required
                    />
                    <Key size={16} color="#94A3B8" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                  <button onClick={closeModal} className="btn btn-secondary" style={{ padding: "10px 18px" }}>
                    İptal
                  </button>
                  <button 
                    onClick={handleApproveStudent} 
                    disabled={actionLoading}
                    className="btn btn-primary" 
                    style={{ padding: "10px 20px" }}
                  >
                    {actionLoading ? "Hesap Açılıyor..." : "Onayla ve Hesabı Oluştur"}
                  </button>
                </div>
              </>
            )}

            {actionSuccessMsg && (
              <div style={{ textAlign: "right", marginTop: "16px" }}>
                <button onClick={closeModal} className="btn btn-primary" style={{ padding: "8px 18px" }}>
                  Tamam
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
