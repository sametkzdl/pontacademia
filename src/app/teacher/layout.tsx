"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { 
  Users, 
  User, 
  Lock, 
  LogOut, 
  AlertCircle,
  Sparkles
} from "lucide-react";

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [studentCount, setStudentCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const [userRes, studentsRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/teacher/students"),
        ]);

        if (!userRes.ok) {
          router.push("/login");
          return;
        }

        const userData = await userRes.json();
        if (userData.success && userData.user) {
          if (userData.user.role !== "TEACHER" && userData.user.role !== "ADMIN") {
            router.push("/login");
            return;
          }
          setUser(userData.user);
        } else {
          router.push("/login");
        }

        if (studentsRes.ok) {
          const studentsData = await studentsRes.json();
          if (studentsData.success && Array.isArray(studentsData.students)) {
            setStudentCount(studentsData.students.length);
          }
        }
      } catch (err) {
        console.error("Teacher layout fetch error:", err);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [pathname, router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const navItems = [
    {
      href: "/teacher/students",
      label: "Öğrencilerim",
      icon: Users,
      badge: studentCount,
      badgeColor: "#C8952A",
    },
    {
      href: "/teacher/profile",
      label: "Profilim",
      icon: User,
    },
    {
      href: "/teacher/security",
      label: "Şifre & Güvenlik",
      icon: Lock,
      mustChange: user?.mustChangePassword,
    },
  ];

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#F0F5FB" }}>
        <p style={{ color: "#0F2645", fontWeight: "700" }}>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="portal-layout-root">
      {/* Top Navbar (Light Gray Theme) */}
      <header className="portal-header">
        <div className="container portal-header-container">
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
              backgroundColor: "#F3E8FF", 
              color: "#7E22CE", 
              padding: "4px 10px", 
              borderRadius: "6px", 
              fontSize: "11px", 
              fontWeight: "800",
              border: "1px solid #E9D5FF",
              letterSpacing: "0.5px"
            }}>
              EĞİTMEN PORTALI
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "13px", color: "#0F2645", fontWeight: "700" }}>
              {user?.name}
            </span>
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
      <main className="portal-main-container">
        {/* Security alert if must change password */}
        {user?.mustChangePassword && pathname !== "/teacher/security" && (
          <div style={{ 
            backgroundColor: "#FEF3C7", 
            border: "1px solid #FCD34D", 
            borderRadius: "12px", 
            padding: "14px 18px", 
            marginBottom: "20px",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            color: "#92400E"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <AlertCircle size={20} color="#D97706" />
              <div style={{ fontSize: "13px" }}>
                <strong>Güvenlik Uyarısı:</strong> Hesabınıza geçici şifre ile giriş yaptınız. Lütfen güvenliğiniz için kalıcı şifrenizi belirleyiniz.
              </div>
            </div>
            <Link 
              href="/teacher/security"
              style={{
                backgroundColor: "#D97706",
                color: "#FFFFFF",
                padding: "6px 14px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "700",
                textDecoration: "none"
              }}
            >
              Şifreyi Değiştir →
            </Link>
          </div>
        )}

        {/* Navigation Tabs (Smooth Horizontal Touch Slider) */}
        <div className="portal-tabs-nav">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/teacher" && pathname?.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="portal-tab-link"
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
                    color: "#0F2645",
                    fontSize: "11px",
                    fontWeight: "800",
                    padding: "1px 6px",
                    borderRadius: "10px"
                  }}>
                    {item.badge}
                  </span>
                )}
                {item.mustChange && (
                  <span style={{ backgroundColor: "#EF4444", color: "#FFFFFF", fontSize: "10px", fontWeight: "800", padding: "1px 6px", borderRadius: "8px" }}>
                    Uyarı
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Content of the active nested route */}
        {children}
      </main>
    </div>
  );
}
