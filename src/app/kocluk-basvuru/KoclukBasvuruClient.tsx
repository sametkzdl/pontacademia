"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, 
  ArrowRight,
  BookOpen, 
  CheckCircle2, 
  Mail, 
  Phone, 
  Clock, 
  ShieldAlert,
  Sparkles,
  MessageCircle,
  GraduationCap
} from "lucide-react";

export default function KoclukBasvuruClient() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F0F5FB", display: "flex", flexDirection: "column", color: "#1C2B3A" }}>
      {/* Top Header */}
      <header style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid #DDE6F0", padding: "16px 0", position: "sticky", top: 0, zIndex: 50 }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center" }}>
            <Image 
              src="/pont_logo.png" 
              alt="Pont Academy Logo" 
              width={160} 
              height={44} 
              style={{ objectFit: "contain", height: "40px", width: "auto" }}
              priority
            />
          </Link>
          <Link href="/" style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "8px", 
            textDecoration: "none", 
            fontSize: "14px", 
            fontWeight: "700",
            color: "#0F2645",
            backgroundColor: "#F8FAFC",
            padding: "8px 18px",
            borderRadius: "8px",
            border: "1px solid #DDE6F0",
            transition: "all 0.2s ease"
          }}>
            <ArrowLeft size={16} color="#C8952A" /> Ana Sayfaya Dön
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="container" style={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 16px" }}>
        <div style={{ width: "100%", maxWidth: "780px" }}>
          
          {/* Main Notice Card */}
          <div style={{ 
            backgroundColor: "#FFFFFF", 
            borderRadius: "24px", 
            border: "1px solid #DDE6F0", 
            boxShadow: "0 20px 50px rgba(15, 38, 69, 0.08)",
            padding: "48px 36px",
            textAlign: "center"
          }}>
            
            {/* Status Icon */}
            <div style={{ 
              width: "80px", 
              height: "80px", 
              borderRadius: "50%", 
              backgroundColor: "#FEF3C7", 
              border: "2px solid #FCD34D",
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              margin: "0 auto 24px auto",
              color: "#C8952A",
              boxShadow: "0 8px 24px rgba(200, 149, 42, 0.18)"
            }}>
              <Clock size={40} />
            </div>

            {/* Pill Badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 16px", borderRadius: "50px", backgroundColor: "#FFFBEB", border: "1px solid #FCD34D", color: "#92400E", fontSize: "13px", fontWeight: "700", marginBottom: "18px" }}>
              <Sparkles size={14} color="#C8952A" /> KONTENJAN VE SİSTEM GÜNCELLEMESİ
            </div>

            {/* Title */}
            <h1 style={{ fontFamily: "var(--font-playfair)", fontSize: "32px", fontWeight: "800", color: "#0F2645", letterSpacing: "-0.5px", marginBottom: "16px", lineHeight: "1.3" }}>
              Eğitim Koçluğu Başvuruları Şu Anda Aktif Değildir
            </h1>

            {/* Explanation */}
            <p style={{ color: "#4A6280", fontSize: "16px", lineHeight: "1.7", maxWidth: "620px", margin: "0 auto 32px auto" }}>
              Pont Academy olarak öğrencilerimize en yüksek standartta ve kişiye özel mentörlük sunabilmek adına, koçluk programlarımız ve kontenjanlarımız yeni dönem hazırlıkları kapsamında güncellenmektedir. Bu süreçte doğrudan koçluk başvurusu alınmamaktadır.
            </p>

            {/* Alternative Action Cards Grid */}
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
              gap: "20px", 
              textAlign: "left",
              marginBottom: "36px"
            }}>
              
              {/* Option 1: Birebir Özel Ders */}
              <div style={{ 
                padding: "24px", 
                borderRadius: "16px", 
                backgroundColor: "#F8FAFC", 
                border: "1px solid #E2E8F0",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}>
                <div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#0F2645", fontWeight: "800", fontSize: "17px", marginBottom: "10px" }}>
                    <BookOpen size={20} color="#C8952A" /> Birebir Özel Ders Al
                  </div>
                  <p style={{ fontSize: "14px", color: "#64748B", lineHeight: "1.5", margin: "0 0 20px 0" }}>
                    Derece yapmış uzman eğitmen kadromuzla eksiklerinizi hızla kapatmak ve hedefinize ulaşmak için hemen canlı ders başvurusu yapabilirsiniz.
                  </p>
                </div>
                <Link 
                  href="/ozel-ders-basvuru" 
                  className="btn btn-primary" 
                  style={{ 
                    display: "inline-flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    gap: "8px", 
                    width: "100%", 
                    padding: "12px 20px", 
                    fontSize: "14px",
                    fontWeight: "700" 
                  }}
                >
                  Özel Ders Başvurusu <ArrowRight size={16} />
                </Link>
              </div>

              {/* Option 2: Ön Kayıt & Bilgi Danışmanlığı */}
              <div style={{ 
                padding: "24px", 
                borderRadius: "16px", 
                backgroundColor: "#F8FAFC", 
                border: "1px solid #E2E8F0",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}>
                <div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#0F2645", fontWeight: "800", fontSize: "17px", marginBottom: "10px" }}>
                    <MessageCircle size={20} color="#C8952A" /> Ön Kayıt & Bilgi Al
                  </div>
                  <p style={{ fontSize: "14px", color: "#64748B", lineHeight: "1.5", margin: "0 0 20px 0" }}>
                    Koçluk kontenjanları açıldığında ilk haberdar olmak veya eğitim danışmanlarımızla görüşmek için bize formdan ulaşabilirsiniz.
                  </p>
                </div>
                <Link 
                  href="/#iletisim" 
                  className="btn btn-secondary" 
                  style={{ 
                    display: "inline-flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    gap: "8px", 
                    width: "100%", 
                    padding: "12px 20px", 
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#0F2645" 
                  }}
                >
                  Danışmanlık Talebi İlet <ArrowRight size={16} />
                </Link>
              </div>

            </div>

            {/* Quick Support Info Bar */}
            <div style={{ 
              padding: "16px 20px", 
              borderRadius: "12px", 
              backgroundColor: "#F0F5FB", 
              border: "1px solid #DDE6F0", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              flexWrap: "wrap", 
              gap: "24px",
              fontSize: "13px",
              color: "#4A6280"
            }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <CheckCircle2 size={16} color="#10B981" /> 7/24 Aktif İletişim Hattı
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                <GraduationCap size={16} color="#0F2645" /> YKS & LGS Hazırlık
              </span>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: "#0F2645", color: "#94A3B8", padding: "24px 0", textAlign: "center", fontSize: "13px" }}>
        <div className="container">
          © {new Date().getFullYear()} Pont Academy. Tüm hakları saklıdır.
        </div>
      </footer>
    </div>
  );
}
