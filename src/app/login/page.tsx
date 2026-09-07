"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Mail, Sparkles, Shield, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("error") === "account_deactivated") {
        setErrorMsg("Hesabınız yönetici tarafından pasif duruma getirilmiştir. Oturumunuz durduruldu.");
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Giriş yapılamadı. Bilgilerinizi kontrol ediniz.");
        setIsLoading(false);
        return;
      }

      // Başarılı giriş -> Role veya URL parametresine göre yönlendir
      const searchParams = new URLSearchParams(window.location.search);
      const from = searchParams.get("from");

      let targetUrl = from;
      if (!targetUrl || targetUrl === "/login" || targetUrl === "/") {
        if (data.redirectUrl) {
          targetUrl = data.redirectUrl;
        } else if (data.user?.role === "ADMIN") {
          targetUrl = "/admin";
        } else if (data.user?.role === "TEACHER") {
          targetUrl = "/teacher";
        } else if (data.user?.role === "STUDENT") {
          targetUrl = "/student";
        } else {
          targetUrl = "/admin";
        }
      }

      router.push(targetUrl || "/admin");
      router.refresh();
    } catch (err) {
      console.error("Login error:", err);
      setErrorMsg("Bağlantı hatası oluştu. Lütfen tekrar deneyiniz.");
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F0F5FB", display: "flex", flexDirection: "column" }}>
      {/* Top Bar */}
      <header style={{ padding: "24px 0" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/">
            <Image 
              src="/pont_logo.png" 
              alt="Pont Academy Logo" 
              width={140} 
              height={40} 
              style={{ objectFit: "contain" }}
              priority
            />
          </Link>
          <Link 
            href="/" 
            style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              gap: "8px", 
              textDecoration: "none", 
              fontSize: "14px", 
              fontWeight: "600",
              color: "#0F2645",
              backgroundColor: "#FFFFFF",
              padding: "8px 16px",
              borderRadius: "8px",
              border: "1px solid #DDE6F0"
            }}
          >
            <ArrowLeft size={16} color="#C8952A" /> Ana Sayfa
          </Link>
        </div>
      </header>

      {/* Login Card */}
      <main style={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <div style={{ width: "100%", maxWidth: "440px" }}>
          
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{ 
              width: "60px", 
              height: "60px", 
              borderRadius: "50%", 
              backgroundColor: "#FFFFFF", 
              border: "2px solid #F0DFA8",
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              margin: "0 auto 16px auto",
              boxShadow: "0 4px 12px rgba(200, 149, 42, 0.12)"
            }}>
              <Shield size={28} color="#C8952A" />
            </div>
            <h1 style={{ fontFamily: "var(--font-playfair)", fontSize: "28px", fontWeight: "800", color: "#0F2645" }}>
              Pont Academy Portal
            </h1>
            <p style={{ color: "#64748B", fontSize: "14px", marginTop: "6px" }}>
              Öğretmen, Öğrenci & Yönetici Giriş Paneli
            </p>
          </div>

          <div style={{ 
            backgroundColor: "#FFFFFF", 
            borderRadius: "16px", 
            padding: "36px", 
            border: "1px solid #DDE6F0",
            boxShadow: "0 10px 30px rgba(15, 38, 69, 0.06)" 
          }}>

            {errorMsg && (
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "10px", 
                padding: "12px 16px", 
                backgroundColor: "#FEE2E2", 
                border: "1px solid #FCA5A5", 
                borderRadius: "8px", 
                color: "#B91C1C", 
                fontSize: "13px", 
                fontWeight: "600",
                marginBottom: "20px" 
              }}>
                <AlertCircle size={18} color="#DC2626" />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: "18px" }}>
                <label className="form-label" style={{ color: "#0F2645", fontWeight: "700", fontSize: "13px" }} htmlFor="email">
                  E-posta Adresi
                </label>
                <div style={{ position: "relative" }}>
                  <input 
                    className="form-input" 
                    style={{ backgroundColor: "#FFFFFF", color: "#0F2645", borderColor: "#CBD5E1", paddingLeft: "40px" }}
                    type="email" 
                    id="email" 
                    name="email"
                    placeholder="ornek@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Mail size={18} color="#94A3B8" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "24px" }}>
                <label className="form-label" style={{ color: "#0F2645", fontWeight: "700", fontSize: "13px" }} htmlFor="password">
                  Şifre
                </label>
                <div style={{ position: "relative" }}>
                  <input 
                    className="form-input" 
                    style={{ backgroundColor: "#FFFFFF", color: "#0F2645", borderColor: "#CBD5E1", paddingLeft: "40px", paddingRight: "40px" }}
                    type={showPassword ? "text" : "password"} 
                    id="password" 
                    name="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Lock size={18} color="#94A3B8" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isLoading}
                style={{ 
                  display: "flex", 
                  width: "100%", 
                  padding: "14px", 
                  fontSize: "15px", 
                  fontWeight: "700", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  gap: "8px",
                  boxShadow: "0 6px 20px rgba(200, 149, 42, 0.25)"
                }}
              >
                {isLoading ? "Giriş Yapılıyor..." : (
                  <>Giriş Yap <Sparkles size={16} /></>
                )}
              </button>
            </form>

            <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #E2E8F0", textAlign: "center" }}>
              <p style={{ fontSize: "13px", color: "#64748B" }}>
                Hesabınız yok mu?{" "}
                <Link href="/ozel-ders-basvuru" style={{ color: "#C8952A", fontWeight: "700", textDecoration: "none" }}>
                  Öğrenci Başvurusu
                </Link>
                {" veya "}
                <Link href="/teacherApplicationForm" style={{ color: "#0F2645", fontWeight: "700", textDecoration: "none" }}>
                  Eğitmen Başvurusu
                </Link>
              </p>
            </div>

          </div>
        </div>
      </main>

      <footer style={{ padding: "20px 0", textAlign: "center", fontSize: "12px", color: "#94A3B8" }}>
        © 2026 Pont Academy. Güvenli Giriş Sistemi.
      </footer>
    </div>
  );
}
