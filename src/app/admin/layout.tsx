"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { 
  Users, 
  GraduationCap, 
  UserCheck, 
  Link2, 
  Settings, 
  MessageSquare, 
  Shield, 
  LogOut,
  Calendar
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [badgeCounts, setBadgeCounts] = useState({
    pendingTeacherApps: 0,
    pendingStudentApps: 0,
    unreadMessages: 0,
    pendingRequests: 0,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [appsRes, contactsRes, requestsRes] = await Promise.all([
          fetch("/api/admin/applications"),
          fetch("/api/admin/contacts"),
          fetch("/api/admin/requests"),
        ]);

        if (appsRes.ok) {
          const appsData = await appsRes.json();
          if (appsData.success) {
            setBadgeCounts(prev => ({
              ...prev,
              pendingTeacherApps: (appsData.teacherApplications || []).filter((a: any) => a.status === "PENDING").length,
              pendingStudentApps: (appsData.studentApplications || []).filter((a: any) => a.status === "PENDING").length,
            }));
          }
        }

        if (contactsRes.ok) {
          const contactsData = await contactsRes.json();
          if (contactsData.success && Array.isArray(contactsData.data)) {
            setBadgeCounts(prev => ({
              ...prev,
              unreadMessages: contactsData.data.filter((m: any) => m.status === "UNREAD").length,
            }));
          }
        }

        if (requestsRes.ok) {
          const reqData = await requestsRes.json();
          if (reqData.success && reqData.stats) {
            setBadgeCounts(prev => ({
              ...prev,
              pendingRequests: reqData.stats.pending || 0,
            }));
          }
        }
      } catch (err) {
        console.error("Admin layout fetch error:", err);
      }
    };

    fetchCounts();
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const navItems = [
    {
      href: "/admin/teacher-applications",
      label: "Öğretmen Başvuruları",
      icon: GraduationCap,
      badge: badgeCounts.pendingTeacherApps,
      badgeColor: "#C8952A",
    },
    {
      href: "/admin/student-applications",
      label: "Öğrenci Başvuruları",
      icon: Users,
      badge: badgeCounts.pendingStudentApps,
      badgeColor: "#C8952A",
    },
    {
      href: "/admin/teachers",
      label: "Öğretmenler",
      icon: UserCheck,
    },
    {
      href: "/admin/students",
      label: "Öğrenciler",
      icon: Users,
    },
    {
      href: "/admin/matches",
      label: "Eşleştirmeler",
      icon: Link2,
    },
    {
      href: "/admin/lessons",
      label: "Ders Takibi & Oturumlar",
      icon: Calendar,
    },
    {
      href: "/admin/requests",
      label: "Talepler & Şikayetler",
      icon: MessageSquare,
      badge: badgeCounts.pendingRequests,
      badgeColor: "#EA580C",
    },
    {
      href: "/admin/messages",
      label: "Gelen Mesajlar",
      icon: MessageSquare,
      badge: badgeCounts.unreadMessages,
      badgeColor: "#EF4444",
    },
    {
      href: "/admin/settings",
      label: "Genel Ayarlar",
      icon: Settings,
    },
  ];

  return (
    <div className="admin-layout-root">
      {/* Top Navbar (Light Gray Theme) */}
      <header className="admin-header">
        <div className="container admin-header-container">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link href="/">
              <Image 
                src="/pont_logo.png" 
                alt="Pont Academy Logo" 
                width={135} 
                height={38} 
                style={{ objectFit: "contain" }}
                priority
              />
            </Link>
            <span style={{ 
              backgroundColor: "#FEF3C7", 
              color: "#92400E", 
              padding: "4px 10px", 
              borderRadius: "6px", 
              fontSize: "11px", 
              fontWeight: "800",
              border: "1px solid #FCD34D",
              letterSpacing: "0.5px"
            }}>
              YÖNETİCİ PANELİ
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#0F2645" }}>
              <Shield size={16} color="#C8952A" />
              <span style={{ fontWeight: "700" }}>Admin</span>
            </div>
            <button 
              onClick={handleLogout}
              style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                gap: "5px", 
                backgroundColor: "#FFFFFF", 
                color: "#DC2626", 
                border: "1px solid #FECACA", 
                padding: "6px 12px", 
                borderRadius: "6px", 
                fontSize: "12px", 
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
              }}
            >
              <LogOut size={13} /> <span>Çıkış Yap</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="admin-main-container">
        {/* Navigation Tabs (Smooth Horizontal Scroll on Mobile) */}
        <div className="admin-tabs-nav">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="admin-tab-link"
                style={{
                  backgroundColor: isActive ? "#0F2645" : "#FFFFFF",
                  color: isActive ? "#FFFFFF" : "#475569",
                  border: isActive ? "1px solid #0F2645" : "1px solid #DDE6F0",
                  boxShadow: isActive ? "0 4px 12px rgba(15, 38, 69, 0.15)" : "0 1px 3px rgba(0,0,0,0.02)",
                }}
              >
                <Icon size={15} color={isActive ? "#C8952A" : "#64748B"} />
                {item.label}
                {item.badge !== undefined && item.badge > 0 && (
                  <span style={{
                    backgroundColor: item.badgeColor || "#C8952A",
                    color: item.badgeColor === "#EF4444" ? "#FFFFFF" : "#0F2645",
                    fontSize: "11px",
                    fontWeight: "800",
                    padding: "1px 6px",
                    borderRadius: "10px"
                  }}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Content of the active nested route with smooth animation */}
        <div key={pathname} className="page-transition">
          {children}
        </div>
      </main>
    </div>
  );
}
