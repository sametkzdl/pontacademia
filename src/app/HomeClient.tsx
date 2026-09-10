"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { 
  BookOpen, 
  Brain, 
  Check, 
  X, 
  Menu, 
  Phone, 
  Mail, 
  ArrowRight, 
  Star, 
  MessageCircle, 
  Sparkles,
  Send,
  CheckCircle2,
  Calculator,
  GraduationCap,
  MapPin,
  Compass,
  LogIn,
  UserPlus
} from "lucide-react";

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface HomeClientProps {
  initialSettings: any;
  initialCoaches: any[];
}

export default function HomeClient({ initialSettings, initialCoaches }: HomeClientProps) {
  // Mobile Nav State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Lock body scroll on mobile when menu is open & listen for ESC key
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const handleMobileNavClick = (e?: React.MouseEvent) => {
    document.body.style.overflow = "";
    setMobileMenuOpen(false);
  };

  // Helper to compute upcoming exam date
  const getNextExamDate = (month: number, day: number, hour: number, minute: number): Date => {
    const now = new Date();
    let year = now.getFullYear();
    let target = new Date(year, month - 1, day, hour, minute, 0);
    if (target.getTime() <= now.getTime()) {
      target = new Date(year + 1, month - 1, day, hour, minute, 0);
    }
    return target;
  };

  const calculateTimeRemaining = (target: Date): CountdownTime => {
    const difference = +target - +new Date();
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  // Setup Countdown Timer Target Dates (YKS: June 19, 10:15 | LGS: June 6, 09:30)
  const yksTargetDate = useRef(getNextExamDate(6, 19, 10, 15));
  const lgsTargetDate = useRef(getNextExamDate(6, 6, 9, 30));

  // Countdown States
  const [yksTime, setYksTime] = useState<CountdownTime>(() => calculateTimeRemaining(yksTargetDate.current));
  const [lgsTime, setLgsTime] = useState<CountdownTime>(() => calculateTimeRemaining(lgsTargetDate.current));

  // Dynamic Settings & Coaches
  const [coaches, setCoaches] = useState<any[]>(initialCoaches || []);
  const [settings, setSettings] = useState<any>(initialSettings || {
    privateLessonPrice: "",
    coachingPrice: "",
    campaignBannerActive: false,
    campaignBannerText: "",
    contactPhone: "",
    contactEmail: "",
    contactAddress: "",
  });

  // Props güncellendiğinde state'i senkronize et
  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
    }
  }, [initialSettings]);

  useEffect(() => {
    if (initialCoaches) {
      setCoaches(initialCoaches);
    }
  }, [initialCoaches]);

  // Sayfa yüklendiğinde en güncel DB verisini önbelleksiz çek
  useEffect(() => {
    const fetchFreshData = async () => {
      try {
        const [settingsRes, coachesRes] = await Promise.all([
          fetch("/api/settings", { cache: "no-store" }),
          fetch("/api/coaches", { cache: "no-store" }),
        ]);

        if (settingsRes.ok) {
          const sData = await settingsRes.json();
          if (sData.settings) setSettings(sData.settings);
        }
        if (coachesRes.ok) {
          const cData = await coachesRes.json();
          if (cData.coaches) setCoaches(cData.coaches);
        }
      } catch (err) {
        // quiet catch
      }
    };
    fetchFreshData();
  }, []);

  // Contact Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    exam: "YKS",
    message: ""
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  // Pulse animation states for timers
  const [yksPulse, setYksPulse] = useState(false);
  const [lgsPulse, setLgsPulse] = useState(false);

  // Monitor Scroll for Sticky Nav
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Update Countdown Timers
  useEffect(() => {
    const interval = setInterval(() => {
      const newYks = calculateTimeRemaining(yksTargetDate.current);
      const newLgs = calculateTimeRemaining(lgsTargetDate.current);

      setYksTime(newYks);
      setLgsTime(newLgs);

      setYksPulse(true);
      setTimeout(() => setYksPulse(false), 80);
      setLgsPulse(true);
      setTimeout(() => setLgsPulse(false), 80);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Intersection Observer for Scroll Reveal
  useEffect(() => {
    const reveals = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.15 }
    );
    reveals.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  // Disable body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  // Handle Contact Form Submission to Backend API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setFormError("Lütfen ad soyad, e-posta ve mesaj alanlarını doldurunuz.");
      return;
    }

    setFormLoading(true);
    setFormError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: `${formData.exam} Hazırlık Danışmanlığı`,
          message: formData.message,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setFormSubmitted(true);
        setFormData({ name: "", email: "", phone: "", exam: "YKS", message: "" });
        setTimeout(() => {
          setFormSubmitted(false);
        }, 6000);
      } else {
        setFormError(data.error || "Mesaj gönderilemedi. Lütfen tekrar deneyiniz.");
      }
    } catch (err) {
      console.error("Contact submit error:", err);
      setFormError("Bağlantı hatası oluştu. Lütfen daha sonra tekrar deneyiniz.");
    } finally {
      setFormLoading(false);
    }
  };

  const isBannerActive = settings?.campaignBannerActive === true || settings?.campaignBannerActive === "true";

  return (
    <>
      {/* FIXED TOP HEADER WRAPPER (BANNER + NAVIGATION) */}
      <div className="site-header-wrapper">
        {/* CAMPAIGN BANNER */}
        {isBannerActive && settings.campaignBannerText && (
          <div className="top-campaign-banner">
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <Sparkles size={16} color="#C8952A" />
              {settings.campaignBannerText}
            </span>
            <a href="/ozel-ders-basvuru" className="banner-link">
              FIRSATI YAKALA →
            </a>
          </div>
        )}

        {/* Sticky Header Nav */}
        <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
          <div className="container nav-container">
            <a href="/" className="logo-container" style={{ display: "flex", alignItems: "center" }}>
              <Image 
                src="/pont_logo.png" 
                alt="Pont Academy Logo" 
                width={185} 
                height={50} 
                style={{ objectFit: "contain", height: "46px", width: "auto" }}
                priority
              />
            </a>
            
            <nav className="nav-links" style={{ display: "none" }}>
              {/* Built for desktop screen visibility */}
            </nav>
            
            {/* Desktop Nav Actions */}
            <div className="desktop-actions">
              <a href="#ozel-ders" className="nav-link">Özel Ders</a>
              <a href="#paketler" className="nav-link">Paketimiz</a>
              <a href="#ekibimiz" className="nav-link">Eğitmenlerimiz</a>
              <a href="/tyt-puan-hesaplama" className="nav-link">TYT Hesapla</a>
              <a href="/yks-puan-hesaplama" className="nav-link">YKS Hesapla</a>
              <a href="/teacherApplicationForm" className="nav-link" style={{ textDecoration: "none" }}>
                <span style={{ backgroundColor: "#FEF3C7", color: "#92400E", padding: "5px 12px", borderRadius: "6px", border: "1px solid #FCD34D", fontSize: "13px", fontWeight: "700" }}>Eğitmen Ol</span>
              </a>
              <a href="/ozel-ders-basvuru" className="btn btn-primary" style={{ padding: "8px 20px", fontSize: "14px", fontWeight: "700", boxShadow: "0 2px 8px rgba(200, 149, 42, 0.25)" }}>
                Hemen Başla
              </a>
            </div>

            {/* Mobile Hamburguer */}
            <button 
              type="button"
              className="hamburger" 
              onClick={() => setMobileMenuOpen(prev => !prev)} 
              aria-label={mobileMenuOpen ? "Menüyü Kapat" : "Menüyü Aç"}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </header>

        {/* Mobile Menu Backdrop & Sliding Drawer */}
        <div 
          className={`mobile-menu-backdrop ${mobileMenuOpen ? "open" : ""}`}
          onClick={handleMobileNavClick}
          aria-hidden={!mobileMenuOpen}
          role="button"
          tabIndex={-1}
        />

        <div className={`mobile-menu-drawer ${mobileMenuOpen ? "open" : ""}`}>
          <div className="mobile-menu-header">
            <a href="/" style={{ display: "inline-flex", alignItems: "center" }} onClick={handleMobileNavClick}>
              <Image 
                src="/pont_logo.png" 
                alt="Pont Academy Logo" 
                width={150} 
                height={40} 
                style={{ objectFit: "contain", height: "36px", width: "auto" }}
                priority
              />
            </a>
            <button 
              type="button"
              className="mobile-menu-close" 
              onClick={handleMobileNavClick} 
              aria-label="Menüyü Kapat"
            >
              <X size={22} />
            </button>
          </div>

          <div className="mobile-menu-content">
            <div>
              <div className="mobile-nav-group-title">Eğitim Programları</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <a href="#ozel-ders" className="mobile-nav-link" onClick={handleMobileNavClick}>
                  <div className="mobile-nav-link-inner">
                    <BookOpen size={18} color="#C8952A" />
                    <span>Birebir Özel Ders</span>
                  </div>
                  <ArrowRight size={15} color="#C8952A" />
                </a>
                <a href="#paketler" className="mobile-nav-link" onClick={handleMobileNavClick}>
                  <div className="mobile-nav-link-inner">
                    <Sparkles size={18} color="#C8952A" />
                    <span>Özel Ders Paketimiz</span>
                  </div>
                  <ArrowRight size={15} color="#C8952A" />
                </a>
                <a href="#ekibimiz" className="mobile-nav-link" onClick={handleMobileNavClick}>
                  <div className="mobile-nav-link-inner">
                    <GraduationCap size={18} color="#C8952A" />
                    <span>Dereceli Eğitmen Kadromuz</span>
                  </div>
                  <ArrowRight size={15} color="#C8952A" />
                </a>
              </div>
            </div>

            <div>
              <div className="mobile-nav-group-title">Sınav Hesaplama Araçları</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <a href="/tyt-puan-hesaplama" className="mobile-nav-link" onClick={handleMobileNavClick}>
                  <div className="mobile-nav-link-inner">
                    <Calculator size={18} color="#38BDF8" />
                    <span>TYT Puan Hesaplama</span>
                  </div>
                  <ArrowRight size={15} color="#38BDF8" />
                </a>
                <a href="/yks-puan-hesaplama" className="mobile-nav-link" onClick={handleMobileNavClick}>
                  <div className="mobile-nav-link-inner">
                    <Calculator size={18} color="#34D399" />
                    <span>YKS (TYT-AYT) Hesaplama</span>
                  </div>
                  <ArrowRight size={15} color="#34D399" />
                </a>
              </div>
            </div>

            <div>
              <div className="mobile-nav-group-title">Hızlı İşlemler & İletişim</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <a href="/teacherApplicationForm" className="mobile-nav-link" onClick={handleMobileNavClick}>
                  <div className="mobile-nav-link-inner">
                    <UserPlus size={18} color="#F59E0B" />
                    <span>Eğitmen Başvurusu Yap</span>
                  </div>
                  <span style={{ fontSize: "11px", backgroundColor: "rgba(245, 158, 11, 0.2)", color: "#FDE68A", padding: "2px 8px", borderRadius: "6px", fontWeight: "700" }}>Katıl</span>
                </a>
                <a href="/login" className="mobile-nav-link" onClick={handleMobileNavClick}>
                  <div className="mobile-nav-link-inner">
                    <LogIn size={18} color="#A78BFA" />
                    <span>Öğrenci / Eğitmen Girişi</span>
                  </div>
                  <ArrowRight size={15} color="#A78BFA" />
                </a>
                <a href="#iletisim" className="mobile-nav-link" onClick={handleMobileNavClick}>
                  <div className="mobile-nav-link-inner">
                    <Mail size={18} color="#94A3B8" />
                    <span>İletişim & Danışmanlık</span>
                  </div>
                  <ArrowRight size={15} color="#94A3B8" />
                </a>
              </div>
            </div>

            <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <a 
                href="/ozel-ders-basvuru" 
                className="btn btn-primary btn-block" 
                style={{ minHeight: "48px", fontSize: "15px", fontWeight: "700" }}
                onClick={handleMobileNavClick}
              >
                Birebir Özel Ders Başvurusu
              </a>
              <a 
                href="#iletisim" 
                className="btn btn-secondary btn-block" 
                style={{ minHeight: "48px", fontSize: "15px", fontWeight: "700", backgroundColor: "rgba(255, 255, 255, 0.08)", borderColor: "rgba(255, 255, 255, 0.2)" }}
                onClick={handleMobileNavClick}
              >
                Bilgi Al & Danışmanlık
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* HERO SECTION */}
      <section data-theme="dark" style={{ minHeight: "100vh", display: "flex", alignItems: "center", paddingTop: isBannerActive ? "160px" : "120px", paddingBottom: "80px" }}>
        <div className="hero-bg-accent">
          <div className="hero-shape-1"></div>
          <div className="hero-shape-2"></div>
        </div>
        
        <div className="container hero-content">
          <div>
            <div className="pill-badge">
              <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--color-gold)" }}></span>
              YKS&apos;YE {yksTime.days} GÜN KALDI
            </div>
            
            <h1 className="hero-headline">
              Başarı bir<br />
              <span>kararla</span> başlar.
            </h1>
            
            <p className="hero-subtext">
              Pont Academy ile hedeflerine giden yolu kişiselleştirilmiş stratejiler ve uzman kadroyla inşa et.
            </p>
            
            <div className="hero-ctas">
              <a href="/ozel-ders-basvuru" className="btn btn-primary">Hemen Başla</a>
              <a href="#ekibimiz" className="btn btn-secondary">Eğitmenlerimizi Gör</a>
            </div>
          </div>
        </div>
      </section>

      {/* COUNTDOWN SECTION */}
      <section className="countdown-section" data-theme="dark">
        <div className="container countdown-container">
          <div className="countdown-title">Sınav Geri Sayımı</div>
          
          <div className="countdown-grids">
            {/* YKS Timer */}
            <div className="countdown-block">
              <div className="countdown-label">YKS (Üniversite)</div>
              <div className={`countdown-timer ${yksPulse ? "pulse-animation" : ""}`}>
                <div className="timer-box">
                  <span className="timer-num numeric">{yksTime.days}</span>
                  <span className="timer-unit">Gün</span>
                </div>
                <div className="timer-box">
                  <span className="timer-num numeric">{String(yksTime.hours).padStart(2, "0")}</span>
                  <span className="timer-unit">Saat</span>
                </div>
                <div className="timer-box">
                  <span className="timer-num numeric">{String(yksTime.minutes).padStart(2, "0")}</span>
                  <span className="timer-unit">Dakika</span>
                </div>
                <div className="timer-box">
                  <span className="timer-num numeric">{String(yksTime.seconds).padStart(2, "0")}</span>
                  <span className="timer-unit">Saniye</span>
                </div>
              </div>
            </div>

            <div className="countdown-divider"></div>

            {/* LGS Timer */}
            <div className="countdown-block">
              <div className="countdown-label">LGS (Lise)</div>
              <div className={`countdown-timer ${lgsPulse ? "pulse-animation" : ""}`}>
                <div className="timer-box">
                  <span className="timer-num numeric">{lgsTime.days}</span>
                  <span className="timer-unit">Gün</span>
                </div>
                <div className="timer-box">
                  <span className="timer-num numeric">{String(lgsTime.hours).padStart(2, "0")}</span>
                  <span className="timer-unit">Saat</span>
                </div>
                <div className="timer-box">
                  <span className="timer-num numeric">{String(lgsTime.minutes).padStart(2, "0")}</span>
                  <span className="timer-unit">Dakika</span>
                </div>
                <div className="timer-box">
                  <span className="timer-num numeric">{String(lgsTime.seconds).padStart(2, "0")}</span>
                  <span className="timer-unit">Saniye</span>
                </div>
              </div>
            </div>
          </div>

          <a href="/ozel-ders-basvuru" className="link-gold countdown-cta">
            Şimdi Hazırlanmaya Başla <ArrowRight size={16} />
          </a>
        </div>
      </section>

      {/* SERVICES COMPARISON SECTION */}
      <section id="ozel-ders" data-theme="light">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-subtitle">Eğitim Modelimiz</span>
            <h2 className="light-title">İki farklı ihtiyaç, iki güçlü çözüm.</h2>
            <div style={{ width: "60px", height: "3px", backgroundColor: "var(--color-gold)", margin: "16px auto 0 auto" }}></div>
          </div>

          <div className="services-grid">
            {/* Özel Ders Card */}
            <div className="service-card light reveal">
              <div className="service-icon-wrapper">
                <BookOpen size={40} strokeWidth={1.5} />
              </div>
              <h3 className="service-title">Özel Ders</h3>
              <p className="service-description">
                İhtiyacın olan konularda, alanında uzman hocalarla birebir canlı dersler. Müfredat odaklı, tam öğrenme garantili.
              </p>
              <ul className="service-list">
                <li><Check size={18} /> Canlı ve Birebir Ders</li>
                <li><Check size={18} /> Soru Çözüm Odaklı Yaklaşım</li>
                <li><Check size={18} /> Kişiye Özel Konu Anlatımı</li>
                <li><Check size={18} /> Ödev ve Kaynak Paylaşımı</li>
              </ul>
              <a href="/ozel-ders-basvuru" className="btn btn-dark-ghost" style={{ marginTop: "auto" }}>Özel Ders Al</a>
            </div>

            {/* Kişisel Koçluk Card */}
            <div className="service-card dark card-glow reveal">
              <div className="badge-overlay">
                <span className="pill-badge pill-badge-gold">ÖNERİLEN</span>
              </div>
              <div className="service-icon-wrapper">
                <Brain size={40} strokeWidth={1.5} />
              </div>
              <h3 className="service-title">Kişisel Koçluk</h3>
              <p className="service-description">
                Sadece ders değil, süreci de yönetiyoruz. Haftalık programlar, motivasyon takibi ve psikolojik destek.
              </p>
              <ul className="service-list">
                <li><Sparkles size={18} style={{ color: "var(--color-gold)" }} /> Haftalık Görüşme ve Takip</li>
                <li><Sparkles size={18} style={{ color: "var(--color-gold)" }} /> Kişiye Özel Haftalık Program</li>
                <li><Sparkles size={18} style={{ color: "var(--color-gold)" }} /> Deneme Analizleri ve İlerleme Raporu</li>
                <li><Sparkles size={18} style={{ color: "var(--color-gold)" }} /> 7/24 Kesintisiz Rehberlik</li>
                <li><Sparkles size={18} style={{ color: "var(--color-gold)" }} /> Veli Bilgilendirme Raporları</li>
              </ul>
              <a href="#iletisim" className="btn btn-primary" style={{ marginTop: "auto" }}>Bilgi Al & Başvur</a>
            </div>
          </div>
        </div>
      </section>

      {/* TEACHERS SHOWCASE (ÖĞRETMEN VİTRİNİ) */}
      <section id="ekibimiz" data-theme="dark" style={{ position: "relative" }}>
        {/* Alias target for #egitmenler */}
        <span id="egitmenler" style={{ position: "absolute", top: "-80px", left: 0 }}></span>
        
        <div className="container">
          <div className="section-header reveal">
            <span className="section-subtitle">Alanında Uzman Ekibimiz</span>
            <h2 className="dark-title">Uzman Kadromuz</h2>
          </div>

          <div className="teachers-container reveal">
            <div className="teachers-grid">
              {coaches.length > 0 ? (
                coaches.map((coach) => (
                  <div key={coach.id} className="card-glow teacher-card">
                    <div className="teacher-img-wrapper">
                      {coach.img && coach.showPhotoOnWeb !== false ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          className="teacher-img" 
                          src={coach.img} 
                          alt={coach.name} 
                          style={{ width: "96px", height: "96px", borderRadius: "50%", objectFit: "cover" }} 
                        />
                      ) : (
                        <div style={{ width: "96px", height: "96px", borderRadius: "50%", backgroundColor: "#0F2645", display: "flex", alignItems: "center", justifyContent: "center", color: "#C8952A", border: "2px solid #C8952A", fontWeight: "800", fontSize: "30px" }}>
                          {coach.name?.charAt(0) || <Brain size={38} />}
                        </div>
                      )}
                      {coach.uni && (
                        <div className="teacher-uni-badge" style={{ fontSize: "10px", padding: "3px 8px", maxWidth: "160px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }} title={coach.uni}>
                          {coach.uni}
                        </div>
                      )}
                    </div>
                    <h4 className="teacher-name">{coach.name}</h4>
                    <div className="teacher-branch">
                      {coach.subjects && coach.subjects.length > 0 ? coach.subjects.join(" & ") : (coach.branch || "Eğitim Koçu")}
                    </div>
                    <div className="teacher-badge-container">
                      <span className="pill-badge pill-badge-blue" style={{ fontSize: "11px", padding: "4px 8px" }}>
                        {coach.experienceYears ? `${coach.experienceYears} Yıl Deneyim` : "YKS & LGS"}
                      </span>
                      <span className="pill-badge pill-badge-gold" style={{ fontSize: "11px", padding: "4px 8px" }}>
                        Özel Ders & Koçluk
                      </span>
                    </div>
                    <div className="teacher-btn-wrapper" style={{ marginTop: "12px", display: "flex", gap: "8px", justifyContent: "center" }}>
                      <a href={`/ozel-ders-basvuru?coachId=${coach.id}`} className="link-gold">Ders Talebi Oluştur <ArrowRight size={14} /></a>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "36px 20px", backgroundColor: "#FFFFFF", borderRadius: "14px", border: "1px solid #DDE6F0" }}>
                  <p style={{ color: "#64748B", fontSize: "15px", margin: "0 0 14px 0" }}>
                    Eğitmen kadromuz güncelleniyor. Birebir özel ders veya danışmanlık talebiniz için hemen başvurabilirsiniz.
                  </p>
                  <a href="/ozel-ders-basvuru" className="btn btn-primary" style={{ display: "inline-flex" }}>
                    Hemen Başvuru Yap <ArrowRight size={16} style={{ marginLeft: "6px" }} />
                  </a>
                </div>
              )}
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: "28px" }} className="reveal">
            <a href="/ozel-ders-basvuru" className="btn btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              Tüm Eğitmenlerimizi Gör & Ders Talebi Oluştur <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* PRICING SECTION (PAKETLERİMİZ) */}
      <section id="paketler" data-theme="light">
        <div className="container" style={{ maxWidth: "800px" }}>
          <div className="section-header reveal">
            <span className="section-subtitle">Net Fiyat, Sürpriz Yok.</span>
            <h2 className="light-title">Özel Ders Paketimiz</h2>
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            {/* Birebir Özel Ders */}
            <div className="pricing-card light reveal" style={{ maxWidth: "480px", width: "100%" }}>
              <div className="pricing-title">Birebir Özel Ders</div>
              <div className="pricing-price-container">
                <span className="price-symbol"></span>
                <span className="price-amount numeric" style={{ fontSize: "32px" }}>{settings.privateLessonPrice || ""}</span>
                <span className="price-period">/ ders saati</span>
              </div>
              <ul className="pricing-list">
                <li><Check size={16} /> İstediğin Branştan Birebir Canlı Ders</li>
                <li><Check size={16} /> Derece Yapmış Eğitmen Kadrosu</li>
                <li><Check size={16} /> Birebir Soru Çözüm Desteği</li>
                <li><Check size={16} /> Ders Notu ve Kaynak Paylaşımı</li>
                <li><Check size={16} /> Kişiye Özel Eksik & Konu Takibi</li>
              </ul>
              <a href="/ozel-ders-basvuru" className="btn btn-primary" style={{ textAlign: "center", justifyContent: "center" }}>
                Hemen Özel Ders Al
              </a>
            </div>
          </div>

          <div className="pricing-note reveal" style={{ textAlign: "center", marginTop: "24px" }}>
            Fiyatlara KDV dahildir. İptal ve telafi garantisi mevcuttur.
          </div>
        </div>
      </section>

      {/* CONTACT & REGISTRATION FORM SECTION */}
      <section id="iletisim" style={{ backgroundColor: "#F0F5FB", padding: "80px 0", borderTop: "1px solid #DDE6F0" }}>
        <div className="container" style={{ maxWidth: "1200px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "48px", alignItems: "flex-start" }}>
            
            {/* Left Column: Contact Info */}
            <div className="reveal">
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "50px", fontSize: "13px", fontWeight: "700", backgroundColor: "#FFFFFF", color: "#C8952A", border: "1px solid #F0DFA8", boxShadow: "0 2px 6px rgba(200, 149, 42, 0.08)", marginBottom: "16px" }}>
                <MessageCircle size={15} /> BİLGİ & DANIŞMANLIK
              </div>
              <h3 style={{ fontFamily: "var(--font-playfair)", fontSize: "34px", fontWeight: "800", color: "#0F2645", letterSpacing: "-0.5px", lineHeight: "1.25", marginBottom: "14px" }}>
                Geleceğinizi Birlikte Planlayalım
              </h3>
              <p style={{ color: "#4A6280", fontSize: "15px", lineHeight: "1.6", marginBottom: "28px" }}>
                Size ve öğrencinize en uygun çalışma programını belirlemek için formu doldurun; uzman eğitim danışmanlarımız 24 saat içinde sizinle iletişime geçsin.
              </p>
              
              {/* Contact Channels Cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
                {settings.contactPhone && (
                  <a 
                    href={`tel:${settings.contactPhone.replace(/\s+/g, "")}`} 
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "14px", 
                      padding: "14px 18px", 
                      backgroundColor: "#FFFFFF", 
                      borderRadius: "12px", 
                      border: "1px solid #DDE6F0", 
                      textDecoration: "none",
                      boxShadow: "0 2px 8px rgba(15, 38, 69, 0.04)",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#FEF9EE", border: "1px solid #F0DFA8", display: "flex", alignItems: "center", justifyContent: "center", color: "#C8952A", flexShrink: 0 }}>
                      <Phone size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "#64748B", fontWeight: "600", textTransform: "uppercase" }}>Telefon ile Ulaşın</div>
                      <div style={{ fontSize: "15px", fontWeight: "700", color: "#0F2645" }}>{settings.contactPhone}</div>
                    </div>
                  </a>
                )}

                {settings.contactEmail && (
                  <a 
                    href={`mailto:${settings.contactEmail}`} 
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "14px", 
                      padding: "14px 18px", 
                      backgroundColor: "#FFFFFF", 
                      borderRadius: "12px", 
                      border: "1px solid #DDE6F0", 
                      textDecoration: "none",
                      boxShadow: "0 2px 8px rgba(15, 38, 69, 0.04)",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#FEF9EE", border: "1px solid #F0DFA8", display: "flex", alignItems: "center", justifyContent: "center", color: "#C8952A", flexShrink: 0 }}>
                      <Mail size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "#64748B", fontWeight: "600", textTransform: "uppercase" }}>E-Posta Gönderin</div>
                      <div style={{ fontSize: "15px", fontWeight: "700", color: "#0F2645" }}>{settings.contactEmail}</div>
                    </div>
                  </a>
                )}

                {settings.contactPhone && (
                  <a 
                    href={`https://wa.me/${settings.contactPhone.replace(/[^0-9]/g, "")}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "14px", 
                      padding: "14px 18px", 
                      backgroundColor: "#FFFFFF", 
                      borderRadius: "12px", 
                      border: "1px solid #DDE6F0", 
                      textDecoration: "none",
                      boxShadow: "0 2px 8px rgba(15, 38, 69, 0.04)",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#EBFBF2", border: "1px solid #A7F3D0", display: "flex", alignItems: "center", justifyContent: "center", color: "#10B981", flexShrink: 0 }}>
                      <MessageCircle size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "#64748B", fontWeight: "600", textTransform: "uppercase" }}>WhatsApp Danışma Hattı</div>
                      <div style={{ fontSize: "15px", fontWeight: "700", color: "#0F2645" }}>Hemen Mesaj Gönderin</div>
                    </div>
                  </a>
                )}
              </div>

              {/* Fast Form Links Pills */}
              <div style={{ padding: "16px 20px", backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px dashed #CBD5E1" }}>
                <div style={{ fontSize: "12px", fontWeight: "700", color: "#0F2645", marginBottom: "10px", textTransform: "uppercase" }}>
                  Hızlı Başvuru ve Araçlar
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  <a href="/ozel-ders-basvuru" style={{ fontSize: "13px", padding: "6px 12px", borderRadius: "6px", backgroundColor: "#F0F5FB", color: "#0F2645", textDecoration: "none", fontWeight: "600", border: "1px solid #DDE6F0" }}>
                    📚 Birebir Özel Ders Talebi
                  </a>
                  <a href="#iletisim" style={{ fontSize: "13px", padding: "6px 12px", borderRadius: "6px", backgroundColor: "#F0F5FB", color: "#0F2645", textDecoration: "none", fontWeight: "600", border: "1px solid #DDE6F0" }}>
                    💬 Bilgi & Danışmanlık
                  </a>
                  <a href="/tyt-puan-hesaplama" style={{ fontSize: "13px", padding: "6px 12px", borderRadius: "6px", backgroundColor: "#F0F5FB", color: "#0F2645", textDecoration: "none", fontWeight: "600", border: "1px solid #DDE6F0" }}>
                    🧮 TYT/YKS Hesaplama
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Premium Form Card */}
            <div 
              className="reveal"
              style={{ 
                padding: "36px 40px", 
                borderRadius: "16px", 
                backgroundColor: "#FFFFFF", 
                border: "1px solid #DDE6F0", 
                boxShadow: "0 12px 36px rgba(15, 38, 69, 0.06)" 
              }}
            >
              {formSubmitted ? (
                <div style={{ textAlign: "center", padding: "36px 12px" }}>
                  <div style={{ 
                    width: "72px", 
                    height: "72px", 
                    borderRadius: "50%", 
                    backgroundColor: "#FEF3C7", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    margin: "0 auto 20px auto", 
                    color: "#C8952A",
                    border: "2px solid #FCD34D",
                    boxShadow: "0 8px 24px rgba(200, 149, 42, 0.15)"
                  }}>
                    <CheckCircle2 size={38} />
                  </div>
                  <h4 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "10px", color: "#0F2645", fontFamily: "var(--font-playfair)" }}>
                    Mesajınız Başarıyla İletildi!
                  </h4>
                  <p style={{ color: "#4A6280", fontSize: "15px", lineHeight: "1.6", maxWidth: "460px", margin: "0 auto 20px auto" }}>
                    Talebiniz eğitim danışmanlarımıza ulaştı. Program detayları ve rehberlik için en kısa sürede sizinle iletişime geçeceğiz.
                  </p>
                  <div style={{ padding: "12px 18px", backgroundColor: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0", display: "inline-block", fontSize: "13px", color: "#0F2645", fontWeight: "600" }}>
                    ⏱ Ortalama geri dönüş süremiz 24 saattir.
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "10px", 
                    marginBottom: "24px", 
                    paddingBottom: "12px", 
                    borderBottom: "2px solid #F0DFA8" 
                  }}>
                    <Send size={20} color="#C8952A" />
                    <h4 style={{ fontSize: "17px", fontWeight: "800", color: "#0F2645", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Ücretsiz Ön Görüşme ve Bilgi Formu
                    </h4>
                  </div>

                  {formError && (
                    <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #F87171", color: "#DC2626", padding: "12px 16px", borderRadius: "8px", fontSize: "13px", marginBottom: "20px" }}>
                      {formError}
                    </div>
                  )}

                  <div style={{ marginBottom: "18px" }}>
                    <label className="form-label" htmlFor="name">
                      Adınız Soyadınız *
                    </label>
                    <input 
                      type="text" 
                      id="name" 
                      className="form-input"
                      placeholder="Örn: Mehmet Can"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-grid-2col" style={{ marginBottom: "18px" }}>
                    <div>
                      <label className="form-label" htmlFor="email">
                        E-Posta Adresiniz *
                      </label>
                      <input 
                        type="email" 
                        id="email" 
                        className="form-input"
                        placeholder="ad@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className="form-label" htmlFor="phone">
                        Telefon Numaranız
                      </label>
                      <input 
                        type="tel" 
                        id="phone" 
                        className="form-input"
                        placeholder="05xx xxx xx xx"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: "18px" }}>
                    <label className="form-label" htmlFor="exam">
                      İlgilendiğiniz Alan / Sınav Programı
                    </label>
                    <select 
                      id="exam"
                      className="form-select"
                      value={formData.exam}
                      onChange={(e) => setFormData({ ...formData, exam: e.target.value })}
                    >
                      <option value="YKS">YKS (Üniversite Hazırlık & Derece Koçluğu)</option>
                      <option value="LGS">LGS (Lise Hazırlık & Koçluk)</option>
                      <option value="OZEL_DERS">Birebir Branş Özel Dersi (TYT / AYT / LGS)</option>
                      <option value="DIGER">Diğer Eğitim Danışmanlığı Talebi</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: "24px" }}>
                    <label className="form-label" htmlFor="message">
                      Mesajınız / Notunuz *
                    </label>
                    <textarea
                      id="message"
                      rows={3}
                      className="form-input"
                      placeholder="Hedefleriniz, sınıf düzeyiniz veya ders/koçluk talebiniz..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </div>

                  <button 
                    type="submit"
                    className="btn btn-primary form-submit-btn" 
                    disabled={formLoading}
                  >
                    {formLoading ? (
                      "İletiliyor..."
                    ) : (
                      <>
                        <Send size={18} /> Mesaj Gönder & Bilgi Al
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="container footer-grid">
          <div className="footer-brand">
            <a href="/" style={{ display: "inline-flex", alignItems: "center" }}>
              <Image 
                src="/pont_logo.png" 
                alt="Pont Academy Logo" 
                width={200} 
                height={54} 
                style={{ objectFit: "contain", height: "50px", width: "auto" }}
              />
            </a>
            <p className="footer-brand-desc">
              Geleceğin liderlerini bilimsel metotlar, birebir rehberlik ve akademik disiplinle hazırlıyoruz.
            </p>
          </div>

          <div>
            <h5 className="footer-title">Hızlı Bağlantılar</h5>
            <ul className="footer-links">
              <li><a href="#ozel-ders" className="footer-link">Özel Ders Programları</a></li>
              <li><a href="#paketler" className="footer-link">Özel Ders Paketimiz</a></li>
              <li><a href="/tyt-puan-hesaplama" className="footer-link">TYT Puan Hesaplama</a></li>
              <li><a href="/yks-puan-hesaplama" className="footer-link">YKS Puan Hesaplama</a></li>
              <li><a href="#ekibimiz" className="footer-link">Uzman Kadromuz</a></li>
              <li><a href="/teacherApplicationForm" className="footer-link">Eğitmen / Koç Başvurusu</a></li>
            </ul>
          </div>

          <div>
            <h5 className="footer-title">İletişim & Konum</h5>
            <ul className="footer-links">
              {settings.contactPhone && (
                <li style={{ fontSize: "14px", color: "var(--color-text-mid)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Phone size={15} color="#C8952A" />
                  <a href={`tel:${settings.contactPhone.replace(/\s+/g, "")}`} className="footer-link">
                    {settings.contactPhone}
                  </a>
                </li>
              )}
              {settings.contactEmail && (
                <li style={{ fontSize: "14px", color: "var(--color-text-mid)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Mail size={15} color="#C8952A" />
                  <a href={`mailto:${settings.contactEmail}`} className="footer-link">
                    {settings.contactEmail}
                  </a>
                </li>
              )}
              {settings.contactAddress && (
                <li style={{ fontSize: "13px", color: "var(--color-text-soft)", lineHeight: "1.4" }}>
                  📍 {settings.contactAddress}
                </li>
              )}
            </ul>
          </div>

          <div>
            <h5 className="footer-title">Bizi Takip Edin</h5>
            <div className="footer-socials" style={{ marginBottom: "16px" }}>
              {settings.contactEmail && (
                <a href={`mailto:${settings.contactEmail}`} className="footer-social-btn" title="E-Posta"><Mail size={18} /></a>
              )}
              {settings.contactPhone && (
                <a href={`https://wa.me/${settings.contactPhone.replace(/[^0-9]/g, "")}`} className="footer-social-btn" title="WhatsApp" target="_blank" rel="noopener noreferrer"><Phone size={18} /></a>
              )}
              <a href="/ozel-ders-basvuru" className="footer-social-btn" title="Hemen Başvur"><Sparkles size={18} /></a>
            </div>
            <p style={{ fontSize: "13px", color: "var(--color-text-soft)" }}>
              YKS ve LGS sınav hazırlığında doğru adres.
            </p>
          </div>
        </div>

        <div className="container footer-bottom">
          <div>© {new Date().getFullYear()} Pont Academy. Tüm hakları saklıdır.</div>
          <div>Birebir Özel Ders & Kişisel Eğitim Koçluğu</div>
        </div>
      </footer>
    </>
  );
}
