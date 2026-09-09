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
  Calendar,
  ChevronLeft,
  ChevronRight
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

  const tabsRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (!tabsRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const el = tabsRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [pathname]);

  const handleScrollNav = (direction: "left" | "right") => {
    if (!tabsRef.current) return;
    const scrollAmount = 240;
    tabsRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [appsRes, contactsRes, requestsRes] = await Promise.all([
          fetch("/api/admin/applications", { cache: "no-store" }),
          fetch("/api/admin/contacts", { cache: "no-store" }),
          fetch("/api/admin/requests", { cache: "no-store" }),
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
      {/* Top Navbar (Clean, White Theme with Gold Accents) */}
      <header className="admin-header">
        <div className="admin-header-container">
          <div className="admin-brand-group">
            <Link href="/" style={{ display: "inline-flex", alignItems: "center" }}>
              <Image 
                src="/pont_logo.png" 
                alt="Pont Academy Logo" 
                width={125} 
                height={35} 
                style={{ objectFit: "contain", height: "32px", width: "auto" }}
                priority
              />
            </Link>
            <span className="admin-badge-pill">
              YÖNETİCİ PANELİ
            </span>
          </div>

          <div className="admin-user-group">
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#0F2645" }}>
              <Shield size={16} color="#C8952A" />
              <span style={{ fontWeight: "700" }}>Admin</span>
            </div>
            <button 
              type="button"
              onClick={handleLogout}
              className="admin-logout-btn"
              title="Güvenli Çıkış Yap"
            >
              <LogOut size={13} /> <span>Çıkış Yap</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="admin-main-container">
        {/* Navigation Tabs with Left/Right Slider Controls */}
        <div className="tabs-slider-wrapper">
          <button
            type="button"
            onClick={() => handleScrollNav("left")}
            disabled={!canScrollLeft}
            className={`tabs-scroll-btn ${!canScrollLeft ? "disabled" : ""}`}
            title="Sola kaydır"
            aria-label="Sola kaydır"
          >
            <ChevronLeft size={16} />
          </button>

          <div ref={tabsRef} className="tabs-slider-track">
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

          <button
            type="button"
            onClick={() => handleScrollNav("right")}
            disabled={!canScrollRight}
            className={`tabs-scroll-btn ${!canScrollRight ? "disabled" : ""}`}
            title="Sağa kaydır"
            aria-label="Sağa kaydır"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Content of the active nested route with smooth animation */}
        <div key={pathname} className="page-transition">
          {children}
        </div>
      </main>
    </div>
  );
}
