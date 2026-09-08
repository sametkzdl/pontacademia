import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { 
  Home, 
  ArrowLeft, 
  Compass, 
  GraduationCap, 
  Calculator, 
  Sparkles, 
  ArrowRight,
  LogIn,
  Search,
  MessageCircle
} from "lucide-react";

export const metadata: Metadata = {
  title: "404 - Sayfa Bulunamadı | Pont Academy",
  description: "Aradığınız sayfa bulunamadı veya taşınmış olabilir. Pont Academy ana sayfasına dönerek özel ders, koçluk ve puan hesaplama araçlarına erişebilirsiniz.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  const quickLinks = [
    {
      title: "Birebir Özel Ders",
      desc: "Boğaziçi, ODTÜ, İTÜ dereceli eğitmenlerle kişiselleştirilmiş ders programı.",
      icon: GraduationCap,
      href: "/ozel-ders-basvuru",
      badge: "YKS & LGS",
      badgeColor: "#0F2645",
      badgeBg: "#EBF3FC"
    },
    {
      title: "Kişisel Sınav Koçluğu",
      desc: "Haftalık birebir strateji seansları, kaynak takibi ve deneme analizi.",
      icon: Compass,
      href: "/kocluk-basvuru",
      badge: "Derece Odaklı",
      badgeColor: "#C8952A",
      badgeBg: "#FEF9EE"
    },
    {
      title: "TYT & YKS Puan Hesaplama",
      desc: "ÖSYM güncel katsayılarına göre sıralama ve yerleştirme puanınızı hesaplayın.",
      icon: Calculator,
      href: "/tyt-puan-hesaplama",
      badge: "2026 Güncel",
      badgeColor: "#059669",
      badgeBg: "#ECFDF5"
    },
    {
      title: "Öğrenci & Eğitmen Girişi",
      desc: "Ders programınızı takip etmek ve materyallere erişmek için portala giriş yapın.",
      icon: LogIn,
      href: "/login",
      badge: "Portal",
      badgeColor: "#6366F1",
      badgeBg: "#EEF2FF"
    },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#F0F5FB",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      color: "#1C2B3A",
      position: "relative",
      overflow: "hidden",
      fontFamily: "var(--font-roboto, sans-serif)"
    }}>
      {/* Background Decorative Ambient Blobs */}
      <div style={{
        position: "absolute",
        top: "-120px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "700px",
        height: "350px",
        background: "radial-gradient(circle, rgba(200, 149, 42, 0.12) 0%, rgba(15, 38, 69, 0.05) 50%, transparent 70%)",
        filter: "blur(60px)",
        pointerEvents: "none",
        zIndex: 0
      }} />

      {/* Header */}
      <header style={{ 
        position: "relative", 
        zIndex: 10, 
        padding: "24px 0",
        borderBottom: "1px solid rgba(221, 230, 240, 0.8)",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)"
      }}>
        <div className="container" style={{ 
          maxWidth: "1100px", 
          margin: "0 auto", 
          padding: "0 24px",
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center" 
        }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
            <Image 
              src="/pont_logo.png" 
              alt="Pont Academy Logo" 
              width={160} 
              height={44} 
              style={{ objectFit: "contain", height: "auto" }}
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
              padding: "10px 18px",
              borderRadius: "10px",
              border: "1.5px solid #DDE6F0",
              boxShadow: "0 2px 8px rgba(15, 38, 69, 0.04)",
              transition: "all 0.2s ease"
            }}
            className="card-hover-lift"
          >
            <ArrowLeft size={16} color="#C8952A" /> Ana Sayfaya Dön
          </Link>
        </div>
      </header>

      {/* Main 404 Hero Section */}
      <main style={{ 
        position: "relative", 
        zIndex: 1, 
        flexGrow: 1, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        padding: "60px 20px" 
      }}>
        <div style={{ width: "100%", maxWidth: "860px", textAlign: "center" }}>
          
          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <span style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              gap: "8px",
              padding: "8px 20px",
              borderRadius: "50px",
              fontSize: "13px",
              fontWeight: "700",
              backgroundColor: "#FFFFFF",
              color: "#C8952A",
              border: "1.5px solid #F0DFA8",
              boxShadow: "0 4px 14px rgba(200, 149, 42, 0.12)",
              letterSpacing: "0.5px"
            }}>
              <Search size={15} /> HATA KODU: 404 • SAYFA BULUNAMADI
            </span>
          </div>

          {/* Large Big 404 Graphic */}
          <div style={{ 
            fontFamily: "var(--font-playfair, Georgia, serif)", 
            fontSize: "clamp(80px, 14vw, 130px)", 
            fontWeight: "800", 
            lineHeight: "1",
            letterSpacing: "-3px",
            margin: "0 0 16px 0",
            background: "linear-gradient(135deg, #0F2645 20%, #2B5280 60%, #C8952A 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            display: "inline-block",
            userSelect: "none"
          }}>
            404
          </div>

          {/* Title & Description */}
          <h1 style={{ 
            fontFamily: "var(--font-playfair, Georgia, serif)", 
            fontSize: "clamp(24px, 4vw, 36px)", 
            fontWeight: "800", 
            color: "#0F2645", 
            letterSpacing: "-0.5px",
            marginBottom: "14px"
          }}>
            Rotanızdan Sapmış Olabilirsiniz
          </h1>

          <p style={{ 
            color: "#4A6280", 
            fontSize: "16px", 
            lineHeight: "1.65", 
            maxWidth: "600px", 
            margin: "0 auto 36px auto" 
          }}>
            Ulaşmak istediğiniz sayfa taşınmış, adı değiştirilmiş veya artık mevcut olmayabilir. Endişelenmeyin; hedeflerinize doğru adımlarla devam etmek için aşağıdaki hızlı bağlantıları kullanabilirsiniz.
          </p>

          {/* Primary Action Buttons */}
          <div style={{ 
            display: "flex", 
            gap: "16px", 
            justifyContent: "center", 
            flexWrap: "wrap",
            marginBottom: "48px"
          }}>
            <Link 
              href="/" 
              style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                justifyContent: "center",
                gap: "10px", 
                padding: "14px 28px", 
                backgroundColor: "#C8952A", 
                color: "#FFFFFF", 
                borderRadius: "10px", 
                fontWeight: "700", 
                fontSize: "15px",
                textDecoration: "none",
                boxShadow: "0 6px 20px rgba(200, 149, 42, 0.3)",
                transition: "all 0.25s ease"
              }}
              className="btn-primary"
            >
              <Home size={18} /> Ana Sayfaya Dön
            </Link>

            <a 
              href="https://wa.me/905300000000" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                justifyContent: "center",
                gap: "10px", 
                padding: "14px 24px", 
                backgroundColor: "#FFFFFF", 
                color: "#0F2645", 
                borderRadius: "10px", 
                fontWeight: "600", 
                fontSize: "15px",
                textDecoration: "none",
                border: "1.5px solid #CBD5E1",
                boxShadow: "0 2px 8px rgba(15, 38, 69, 0.04)",
                transition: "all 0.25s ease"
              }}
              className="card-hover-lift"
            >
              <MessageCircle size={18} color="#25D366" /> Destek Ekibine Yazın
            </a>
          </div>

          {/* Quick Navigation Cards Grid */}
          <div style={{
            textAlign: "left",
            backgroundColor: "#FFFFFF",
            borderRadius: "20px",
            padding: "32px",
            border: "1px solid #DDE6F0",
            boxShadow: "0 12px 36px rgba(15, 38, 69, 0.05)"
          }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between", 
              marginBottom: "20px",
              paddingBottom: "14px",
              borderBottom: "1.5px solid #F0F5FB"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={18} color="#C8952A" />
                <span style={{ fontSize: "14px", fontWeight: "800", color: "#0F2645", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Popüler Sayfalar ve Araçlar
                </span>
              </div>
              <span style={{ fontSize: "12px", color: "#7A92AA", fontWeight: "500" }}>
                Hızlı Erişim
              </span>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px"
            }}>
              {quickLinks.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={idx}
                    href={item.href}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      padding: "20px",
                      borderRadius: "12px",
                      backgroundColor: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      textDecoration: "none",
                      transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                      position: "relative"
                    }}
                    className="card-hover-lift"
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <div style={{ 
                          width: "38px", 
                          height: "38px", 
                          borderRadius: "8px", 
                          backgroundColor: "#FFFFFF", 
                          border: "1px solid #DDE6F0",
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center",
                          color: "#0F2645"
                        }}>
                          <IconComponent size={19} color="#C8952A" />
                        </div>
                        <span style={{ 
                          fontSize: "11px", 
                          fontWeight: "700", 
                          padding: "3px 8px", 
                          borderRadius: "6px", 
                          backgroundColor: item.badgeBg, 
                          color: item.badgeColor 
                        }}>
                          {item.badge}
                        </span>
                      </div>

                      <div style={{ fontSize: "15px", fontWeight: "700", color: "#0F2645", marginBottom: "6px" }}>
                        {item.title}
                      </div>

                      <p style={{ fontSize: "12.5px", color: "#64748B", lineHeight: "1.45", margin: 0 }}>
                        {item.desc}
                      </p>
                    </div>

                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "6px", 
                      marginTop: "16px", 
                      fontSize: "13px", 
                      fontWeight: "700", 
                      color: "#C8952A" 
                    }}>
                      İncele <ArrowRight size={14} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer style={{ 
        position: "relative", 
        zIndex: 10, 
        padding: "24px 0", 
        borderTop: "1px solid #DDE6F0",
        backgroundColor: "rgba(255, 255, 255, 0.6)",
        textAlign: "center"
      }}>
        <div className="container" style={{ 
          maxWidth: "1100px", 
          margin: "0 auto", 
          padding: "0 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          fontSize: "13px",
          color: "#64748B"
        }}>
          <div>
            © {new Date().getFullYear()} Pont Academy. Tüm hakları saklıdır.
          </div>
          <div style={{ display: "flex", gap: "20px" }}>
            <Link href="/" style={{ color: "#4A6280", textDecoration: "none", fontWeight: "500" }}>
              Ana Sayfa
            </Link>
            <Link href="/ozel-ders-basvuru" style={{ color: "#4A6280", textDecoration: "none", fontWeight: "500" }}>
              Özel Ders
            </Link>
            <Link href="/kocluk-basvuru" style={{ color: "#4A6280", textDecoration: "none", fontWeight: "500" }}>
              Koçluk
            </Link>
            <Link href="/login" style={{ color: "#4A6280", textDecoration: "none", fontWeight: "500" }}>
              Giriş Yap
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
