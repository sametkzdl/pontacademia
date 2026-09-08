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
  LogIn
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

  // Lock body scroll on mobile when menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Countdown States
  const [yksTime, setYksTime] = useState<CountdownTime>({ days: 287, hours: 0, minutes: 0, seconds: 0 });
  const [lgsTime, setLgsTime] = useState<CountdownTime>({ days: 220, hours: 0, minutes: 0, seconds: 0 });

  // Dynamic Settings & Coaches
  const [coaches, setCoaches] = useState<any[]>(initialCoaches || []);
  const [settings, setSettings] = useState<any>(initialSettings || {
    privateLessonPrice: "1.250 ₺",
    coachingPrice: "4.500 ₺",
    campaignBannerActive: true,
    campaignBannerText: "✨ 2026 Sezonu: İlk Seviye Tespiti ve Tanışma Dersi Tamamen Ücretsiz! Kontenjanlar Sınırlıdır.",
    contactPhone: "+90 (212) 000 00 00",
    contactEmail: "info@pontakademi.com",
    contactAddress: "Beşiktaş / İstanbul",
  });

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

  // Setup Countdown Timer Target Dates
  const yksTargetDate = useRef(new Date("2027-04-09T10:00:00"));
  const lgsTargetDate = useRef(new Date("2027-01-31T09:00:00"));

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

    const interval = setInterval(() => {
      const yksPrev = yksTime.seconds;
      const lgsPrev = lgsTime.seconds;

      const newYks = calculateTimeRemaining(yksTargetDate.current);
      const newLgs = calculateTimeRemaining(lgsTargetDate.current);

      setYksTime(newYks);
      setLgsTime(newLgs);

      if (newYks.seconds !== yksPrev) {
        setYksPulse(true);
        setTimeout(() => setYksPulse(false), 80);
      }
      if (newLgs.seconds !== lgsPrev) {
        setLgsPulse(true);
        setTimeout(() => setLgsPulse(false), 80);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [yksTime.seconds, lgsTime.seconds]);

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
        {/* CAMPAIGN BANNER (İLK DERS / SEVİYE TESPİTİ ÜCRETSİZ) */}
        {isBannerActive && (
          <div className="top-campaign-banner">
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <Sparkles size={16} color="#C8952A" />
              {settings.campaignBannerText || "✨ İlk Seviye Tespiti ve Tanışma Dersi Tamamen Ücretsiz! Kontenjanlar Sınırlıdır."}
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
              <a href="#kocluk" className="nav-link">Koçluk</a>
              <a href="#ekibimiz" className="nav-link">Eğitmenlerimiz</a>
              <a href="/tyt-puan-hesaplama" className="nav-link">TYT Hesapla</a>
              <a href="/yks-puan-hesaplama" className="nav-link">YKS Hesapla</a>
              <a href="/teacherApplicationForm" className="nav-link" style={{ textDecoration: "none" }}>
                <span style={{ backgroundColor: "#FEF3C7", color: "#92400E", padding: "5px 12px", borderRadius: "6px", border: "1px solid #FCD34D", fontSize: "13px", fontWeight: "700" }}>Eğitmen Ol</span>
              </a>
              <a href="/kocluk-basvuru" className="btn btn-primary" style={{ padding: "8px 20px", fontSize: "14px", fontWeight: "700", boxShadow: "0 2px 8px rgba(200, 149, 42, 0.25)" }}>
                Hemen Başla
              </a>
            </div>

            {/* Mobile Hamburguer */}
            <button className="hamburger" onClick={() => setMobileMenuOpen(true)} aria-label="Menüyü Aç">
              <Menu size={24} />
            </button>
          </div>
        </header>
      </div>

      {/* Mobile Menu Backdrop & Sliding Drawer */}
      <div 
        className={`mobile-menu-backdrop ${mobileMenuOpen ? "open" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden={!mobileMenuOpen}
      />

      <div className={`mobile-menu-drawer ${mobileMenuOpen ? "open" : ""}`}>
        <div className="mobile-menu-header">
          <a href="/" style={{ display: "inline-flex", alignItems: "center" }} onClick={() => setMobileMenuOpen(false)}>
            <Image 
              src="/pont_logo.png" 
              alt="Pont Academy Logo" 
              width={150} 
              height={40} 
              style={{ objectFit: "contain", height: "36px", width: "auto" }}
              priority
            />
          </a>
          <button className="mobile-menu-close" onClick={() => setMobileMenuOpen(false)} aria-label="Menüyü Kapat">
            <X size={22} />
          </button>
        </div>

        <div className="mobile-menu-content">
          <div>
            <div className="mobile-nav-group-title">Eğitim Programları</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <a href="#ozel-ders" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                <div className="mobile-nav-link-inner">
                  <GraduationCap size={18} color="#C8952A" />
                  <span>Birebir Özel Ders</span>
                </div>
                <ArrowRight size={15} color="#C8952A" />
              </a>
              <a href="#kocluk" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                <div className="mobile-nav-link-inner">
                  <Compass size={18} color="#C8952A" />
                  <span>Kişisel Sınav Koçluğu</span>
                </div>
                <ArrowRight size={15} color="#C8952A" />
              </a>
              <a href="#ekibimiz" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                <div className="mobile-nav-link-inner">
                  <Brain size={18} color="#C8952A" />
                  <span>Dereceli Eğitmen Kadromuz</span>
                </div>
                <ArrowRight size={15} color="#C8952A" />
              </a>
            </div>
          </div>

          <div>
            <div className="mobile-nav-group-title">Sınav Hesaplama Araçları</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <a href="/tyt-puan-hesaplama" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                <div className="mobile-nav-link-inner">
                  <Calculator size={18} color="#38BDF8" />
                  <span>TYT Puan Hesaplama</span>
                </div>
                <ArrowRight size={15} color="#38BDF8" />
              </a>
              <a href="/yks-puan-hesaplama" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
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
              <a href="/teacherApplicationForm" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                <div className="mobile-nav-link-inner">
                  <Sparkles size={18} color="#F59E0B" />
                  <span>Eğitmen & Koç Başvurusu</span>
                </div>
                <span style={{ fontSize: "11px", backgroundColor: "rgba(245, 158, 11, 0.2)", color: "#FDE68A", padding: "2px 8px", borderRadius: "6px", fontWeight: "700" }}>Katıl</span>
              </a>
              <a href="/login" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                <div className="mobile-nav-link-inner">
                  <LogIn size={18} color="#A78BFA" />
                  <span>Öğrenci / Eğitmen Girişi</span>
                </div>
                <ArrowRight size={15} color="#A78BFA" />
              </a>
              <a href="#iletisim" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
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
              href="/kocluk-basvuru" 
              className="btn btn-primary btn-block" 
              style={{ minHeight: "48px", fontSize: "15px", fontWeight: "700" }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Hemen Koçluk Başvurusu Yap
            </a>
            <a 
              href="/ozel-ders-basvuru" 
              className="btn btn-secondary btn-block" 
              style={{ minHeight: "48px", fontSize: "15px", fontWeight: "700" }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Birebir Özel Ders Başvurusu
            </a>
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
              <a href="/kocluk-basvuru" className="btn btn-primary">Hemen Başla</a>
              <a href="#ekibimiz" className="btn btn-secondary">Eğitmenlerimizi Gör</a>
            </div>
          </div>
          
          <div className="hero-stats-grid">
            <div className="card-glow hero-stat-card">
              <div className="hero-stat-number">+500</div>
              <div className="hero-stat-label">Mutlu Öğrenci</div>
            </div>
            <div className="card-glow hero-stat-card">
              <div className="hero-stat-number">%94</div>
              <div className="hero-stat-label">Hedef Puan</div>
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
              </div>
            </div>
          </div>

          <a href="/kocluk-basvuru" className="link-gold countdown-cta">
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
              <a href="/kocluk-basvuru" className="btn btn-primary" style={{ marginTop: "auto" }}>Koçluk Başlat</a>
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
                      {coach.img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          className="teacher-img" 
                          src={coach.img} 
                          alt={coach.name} 
                          style={{ width: "96px", height: "96px", borderRadius: "50%", objectFit: "cover" }} 
                        />
                      ) : (
                        <div style={{ width: "96px", height: "96px", borderRadius: "50%", backgroundColor: "#0F2645", display: "flex", alignItems: "center", justifyContent: "center", color: "#C8952A", border: "2px solid #C8952A" }}>
                          <Brain size={38} />
                        </div>
                      )}
                      {coach.school && (
                        <div className="teacher-uni-badge" style={{ fontSize: "10px", padding: "2px 8px" }}>
                          {coach.school.length > 14 ? coach.school.substring(0, 12) + "..." : coach.school}
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
                      <a href={`/kocluk-basvuru?coachId=${coach.id}`} className="link-gold">Koçluk Başlat <ArrowRight size={14} /></a>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  {/* Fallback Teacher 1 */}
                  <div className="card-glow teacher-card">
                    <div className="teacher-img-wrapper">
                      <Image 
                        className="teacher-img" 
                        src="/teacher_math.png" 
                        alt="Ahmet Yılmaz" 
                        width={96} 
                        height={96} 
                        priority
                      />
                      <div className="teacher-uni-badge">ODTÜ</div>
                    </div>
                    <h4 className="teacher-name">Ahmet Yılmaz</h4>
                    <div className="teacher-branch">Matematik & Geometri</div>
                    <div className="teacher-badge-container">
                      <span className="pill-badge pill-badge-blue" style={{ fontSize: "11px", padding: "4px 8px" }}>YKS UZMANI</span>
                      <span className="pill-badge pill-badge-gold" style={{ fontSize: "11px", padding: "4px 8px" }}>Özel Ders</span>
                    </div>
                    <div className="teacher-btn-wrapper">
                      <a href="/ozel-ders-basvuru" className="link-gold">Ders Al <ArrowRight size={14} /></a>
                    </div>
                  </div>

                  {/* Fallback Teacher 2 */}
                  <div className="card-glow teacher-card">
                    <div className="teacher-img-wrapper">
                      <Image 
                        className="teacher-img" 
                        src="/teacher_physics.png" 
                        alt="Canan Kaya" 
                        width={96} 
                        height={96}
                      />
                      <div className="teacher-uni-badge">İTÜ</div>
                    </div>
                    <h4 className="teacher-name">Canan Kaya</h4>
                    <div className="teacher-branch">Fizik & Kimya</div>
                    <div className="teacher-badge-container">
                      <span className="pill-badge pill-badge-blue" style={{ fontSize: "11px", padding: "4px 8px" }}>YKS & LGS</span>
                      <span className="pill-badge pill-badge-gold" style={{ fontSize: "11px", padding: "4px 8px" }}>Koçluk</span>
                    </div>
                    <div className="teacher-btn-wrapper">
                      <a href="/kocluk-basvuru" className="link-gold">Koçluk Başlat <ArrowRight size={14} /></a>
                    </div>
                  </div>

                  {/* Fallback Teacher 3 */}
                  <div className="card-glow teacher-card">
                    <div className="teacher-img-wrapper">
                      <Image 
                        className="teacher-img" 
                        src="/teacher_lit.png" 
                        alt="Mehmet Demir" 
                        width={96} 
                        height={96}
                      />
                      <div className="teacher-uni-badge">BİLKENT</div>
                    </div>
                    <h4 className="teacher-name">Mehmet Demir</h4>
                    <div className="teacher-branch">Edebiyat & Türkçe</div>
                    <div className="teacher-badge-container">
                      <span className="pill-badge pill-badge-blue" style={{ fontSize: "11px", padding: "4px 8px" }}>LGS UZMANI</span>
                      <span className="pill-badge pill-badge-gold" style={{ fontSize: "11px", padding: "4px 8px" }}>Her İkisi</span>
                    </div>
                    <div className="teacher-btn-wrapper">
                      <a href="/kocluk-basvuru" className="link-gold">Ders / Koçluk Al <ArrowRight size={14} /></a>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: "28px" }} className="reveal">
            <a href="/kocluk-basvuru" className="btn btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              Tüm Eğitmenlerimizi Gör & Koçunu Seç <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* PRICING SECTION (PAKETLERİMİZ) */}
      <section id="kocluk" data-theme="light">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-subtitle">Net Fiyat, Sürpriz Yok.</span>
            <h2 className="light-title">Paketlerimiz</h2>
          </div>

          <div className="pricing-grid">
            {/* Birebir Özel Ders */}
            <div className="pricing-card light reveal">
              <div className="pricing-title">Birebir Özel Ders</div>
              <div className="pricing-price-container">
                <span className="price-symbol"></span>
                <span className="price-amount numeric" style={{ fontSize: "32px" }}>{settings.privateLessonPrice || "1.250 ₺"}</span>
                <span className="price-period">/ ders saati</span>
              </div>
              <ul className="pricing-list">
                <li><Check size={16} /> İstediğin Branştan Birebir Canlı Ders</li>
                <li><Check size={16} /> Derece Yapmış Eğitmen Kadrosu</li>
                <li><Check size={16} /> Birebir Soru Çözüm Desteği</li>
                <li><Check size={16} /> Ders Notu ve Kaynak Paylaşımı</li>
                <li className="disabled"><X size={16} /> Kişisel Eğitim Koçluğu</li>
              </ul>
              <a href="/ozel-ders-basvuru" className="btn btn-dark-ghost">Özel Ders Al</a>
            </div>

            {/* Birebir Eğitim Koçluğu */}
            <div className="pricing-card dark card-glow reveal">
              <div className="pricing-title">Birebir Eğitim Koçluğu</div>
              <div className="pricing-price-container">
                <span className="price-symbol"></span>
                <span className="price-amount numeric" style={{ fontSize: "32px" }}>{settings.coachingPrice || "4.500 ₺"}</span>
                <span className="price-period">/ ay</span>
              </div>
              <ul className="pricing-list">
                <li><Check size={16} style={{ color: "var(--color-gold)" }} /> Haftalık Kişiye Özel Çalışma Programı</li>
                <li><Check size={16} style={{ color: "var(--color-gold)" }} /> 7/24 Koçluk ve Motivasyon Desteği</li>
                <li><Check size={16} style={{ color: "var(--color-gold)" }} /> Birebir Haftalık Görüşme & Analiz</li>
                <li><Check size={16} style={{ color: "var(--color-gold)" }} /> Online Deneme Sınav Takibi & Net Analizi</li>
                <li><Check size={16} style={{ color: "var(--color-gold)" }} /> Aylık Düzenli Veli Bilgilendirme Raporu</li>
              </ul>
              <a href="/kocluk-basvuru" className="btn btn-primary">Koçluk Başlat</a>
            </div>
          </div>

          <div className="pricing-note reveal">
            Fiyatlara KDV dahildir. İptal garantisi mevcuttur.
          </div>
        </div>
      </section>

      {/* STUDENT REVIEWS / TESTIMONIALS */}
      <section data-theme="dark">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-subtitle">Başarı Hikayelerimiz</span>
            <h2 className="dark-title">Öğrenci Deneyimleri</h2>
          </div>

          <div className="reviews-grid reveal">
            {/* Review 1 */}
            <div className="card-glow review-card">
              <div className="review-stars">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="var(--color-gold)" stroke="none" />)}
              </div>
              <blockquote className="review-quote">
                &quot;Matematik korkumu Pont Academy sayesinde yendim. Koçumun verdiği çalışma programı hayatımı düzene soktu.&quot;
              </blockquote>
              <div className="review-author">
                <div className="review-author-avatar">S</div>
                <div>
                  <div className="review-author-name">Selim Ak</div>
                  <div className="review-author-meta">YKS 2024 Öğrencisi</div>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="card-glow review-card">
              <div className="review-stars">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="var(--color-gold)" stroke="none" />)}
              </div>
              <blockquote className="review-quote">
                &quot;Koçum sayesinde 3 ayda 40 net artırdım. Sınav stresini yönetmeyi ve verimli ders çalışmayı öğrendim. YKS&apos;de hedefimi tutturabildim.&quot;
              </blockquote>
              <div className="review-author">
                <div className="review-author-avatar">A</div>
                <div>
                  <div className="review-author-name">Ahmet Y.</div>
                  <div className="review-author-meta">12. Sınıf, YKS 2025</div>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="card-glow review-card">
              <div className="review-stars">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="var(--color-gold)" stroke="none" />)}
              </div>
              <blockquote className="review-quote">
                &quot;Hocalarımın ilgisi ve koçumun takibi ile kızım hedeflediği liseyi kazandı. Veliler için hazırlanan raporlama sistemi harika.&quot;
              </blockquote>
              <div className="review-author">
                <div className="review-author-avatar">E</div>
                <div>
                  <div className="review-author-name">Elif K.</div>
                  <div className="review-author-meta">Veli, LGS 2025</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* UNIVERSITY LOGOS SECTION */}
      <section className="univ-logos-section">
        <div className="container">
          <div className="univ-logos-title reveal">Öğretmenlerimizin Mezun Olduğu Kurumlar</div>
          
          <div className="univ-logos-wrapper reveal">
            <div className="univ-logos-track">
              <div className="univ-logo-item">ODTÜ</div>
              <div className="univ-logo-item">İTÜ</div>
              <div className="univ-logo-item">KOÇ</div>
              <div className="univ-logo-item">BİLKENT</div>
              <div className="univ-logo-item">BOĞAZİÇİ</div>
            </div>
          </div>

          <div className="stats-ribbon reveal">
            <div className="stats-ribbon-item">
              <div className="stats-ribbon-num numeric">500+</div>
              <div className="stats-ribbon-label">Öğrenci Hazırlandı</div>
            </div>
            <div className="stats-ribbon-item">
              <div className="stats-ribbon-num numeric">12</div>
              <div className="stats-ribbon-label">Uzman Eğitmen</div>
            </div>
            <div className="stats-ribbon-item">
              <div className="stats-ribbon-num numeric">%94</div>
              <div className="stats-ribbon-label">Sınav Hedef Başarısı</div>
            </div>
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
                <a 
                  href={`tel:${settings.contactPhone || "+905300000000"}`} 
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
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "#0F2645" }}>{settings.contactPhone || "0530 000 00 00"}</div>
                  </div>
                </a>

                <a 
                  href={`mailto:${settings.contactEmail || "info@pontakademi.com"}`} 
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
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "#0F2645" }}>{settings.contactEmail || "info@pontakademi.com"}</div>
                  </div>
                </a>

                <a 
                  href={`https://wa.me/${(settings.contactPhone || "905300000000").replace(/[^0-9]/g, "")}`} 
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
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontSize: "11px", color: "#10B981", fontWeight: "700", textTransform: "uppercase" }}>WhatsApp Canlı Destek</div>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "#0F2645" }}>WhatsApp&apos;tan Anında Yazın →</div>
                  </div>
                </a>
              </div>

              {/* Fast Form Links Pills */}
              <div style={{ padding: "16px 20px", backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px dashed #CBD5E1" }}>
                <div style={{ fontSize: "12px", fontWeight: "700", color: "#0F2645", marginBottom: "10px", textTransform: "uppercase" }}>
                  Hızlı Başvuru ve Araçlar
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  <a href="/kocluk-basvuru" style={{ fontSize: "13px", padding: "6px 12px", borderRadius: "6px", backgroundColor: "#F0F5FB", color: "#0F2645", textDecoration: "none", fontWeight: "600", border: "1px solid #DDE6F0" }}>
                    🎯 Koçluk Başvurusu
                  </a>
                  <a href="/ozel-ders-basvuru" style={{ fontSize: "13px", padding: "6px 12px", borderRadius: "6px", backgroundColor: "#F0F5FB", color: "#0F2645", textDecoration: "none", fontWeight: "600", border: "1px solid #DDE6F0" }}>
                    📚 Özel Ders Talebi
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
              <li><a href="#kocluk" className="footer-link">Eğitim Koçluğu</a></li>
              <li><a href="/tyt-puan-hesaplama" className="footer-link">TYT Puan Hesaplama</a></li>
              <li><a href="/yks-puan-hesaplama" className="footer-link">YKS Puan Hesaplama</a></li>
              <li><a href="#ekibimiz" className="footer-link">Uzman Kadromuz</a></li>
              <li><a href="/teacherApplicationForm" className="footer-link">Eğitmen / Koç Başvurusu</a></li>
            </ul>
          </div>

          <div>
            <h5 className="footer-title">İletişim & Konum</h5>
            <ul className="footer-links">
              <li style={{ fontSize: "14px", color: "var(--color-text-mid)", display: "flex", alignItems: "center", gap: "8px" }}>
                <Phone size={15} color="#C8952A" />
                <a href={`tel:${settings.contactPhone || "+902120000000"}`} className="footer-link">
                  {settings.contactPhone || "+90 (212) 000 00 00"}
                </a>
              </li>
              <li style={{ fontSize: "14px", color: "var(--color-text-mid)", display: "flex", alignItems: "center", gap: "8px" }}>
                <Mail size={15} color="#C8952A" />
                <a href={`mailto:${settings.contactEmail || "info@pontakademi.com"}`} className="footer-link">
                  {settings.contactEmail || "info@pontakademi.com"}
                </a>
              </li>
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
              <a href={`mailto:${settings.contactEmail || "info@pontakademi.com"}`} className="footer-social-btn" title="E-Posta"><Mail size={18} /></a>
              <a href={`https://wa.me/${(settings.contactPhone || "905300000000").replace(/[^0-9]/g, "")}`} className="footer-social-btn" title="WhatsApp" target="_blank" rel="noopener noreferrer"><Phone size={18} /></a>
              <a href="/kocluk-basvuru" className="footer-social-btn" title="Hemen Başvur"><Sparkles size={18} /></a>
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
