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
  Share2, 
  Clock,
  Sparkles,
  Award,
  Users,
  Compass
} from "lucide-react";

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function Home() {
  // Mobile Nav State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Countdown States
  const [yksTime, setYksTime] = useState<CountdownTime>({ days: 287, hours: 0, minutes: 0, seconds: 0 });
  const [lgsTime, setLgsTime] = useState<CountdownTime>({ days: 220, hours: 0, minutes: 0, seconds: 0 });

  // Dynamic Settings & Coaches
  const [coaches, setCoaches] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({
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
  // Targets chosen to correspond roughly to 287 days and 220 days from June 25, 2026
  const yksTargetDate = useRef(new Date("2027-04-09T10:00:00"));
  const lgsTargetDate = useRef(new Date("2027-01-31T09:00:00"));

  // Pulse animation states for timers
  const [yksPulse, setYksPulse] = useState(false);
  const [lgsPulse, setLgsPulse] = useState(false);

  // Fetch dynamic coaches & settings
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [coachesRes, settingsRes] = await Promise.all([
          fetch("/api/coaches"),
          fetch("/api/settings")
        ]);

        if (coachesRes.ok) {
          const coachesData = await coachesRes.json();
          if (coachesData.success && Array.isArray(coachesData.coaches)) {
            setCoaches(coachesData.coaches);
          }
        }

        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          const loaded = settingsData.settings || settingsData.data || settingsData;
          if (loaded && typeof loaded === "object") {
            setSettings((prev: any) => ({ ...prev, ...loaded }));
          }
        }
      } catch (err) {
        console.error("Fetch homepage data error:", err);
      }
    };

    fetchInitialData();
  }, []);

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

      // Trigger pulse when seconds change
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
            <a href="#" className="logo-container" style={{ display: "flex", alignItems: "center" }}>
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
            <button className="hamburger" onClick={() => setMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
          </div>
        </header>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
        <button className="mobile-menu-close" onClick={() => setMobileMenuOpen(false)}>
          <X size={28} />
        </button>
        <a href="#" style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
          <Image 
            src="/pont_logo.png" 
            alt="Pont Academy Logo" 
            width={185} 
            height={50} 
            style={{ objectFit: "contain", height: "46px", width: "auto" }}
            priority
          />
        </a>
        <a href="#ozel-ders" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Özel Ders</a>
        <a href="#kocluk" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Koçluk</a>
        <a href="/tyt-puan-hesaplama" className="nav-link" onClick={() => setMobileMenuOpen(false)}>TYT Puan Hesaplama</a>
        <a href="/yks-puan-hesaplama" className="nav-link" onClick={() => setMobileMenuOpen(false)}>YKS Puan Hesaplama</a>
        <a href="/teacherApplicationForm" className="nav-link" style={{ color: "var(--color-gold)", fontWeight: "700" }} onClick={() => setMobileMenuOpen(false)}>Eğitmen & Koç Başvurusu</a>
        <a href="#ekibimiz" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Hakkımızda</a>
        <a href="#iletisim" className="nav-link" onClick={() => setMobileMenuOpen(false)}>İletişim</a>
        <a href="/kocluk-basvuru" className="btn btn-primary" style={{ width: "100%", maxWidth: "250px", marginTop: "20px" }} onClick={() => setMobileMenuOpen(false)}>
          Koçluk Başlat
        </a>
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
              YKS'YE {yksTime.days} GÜN KALDI
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
      <section id="ekibimiz" data-theme="dark">
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

          <div style={{ textAlign: "center", marginTop: "20px" }} className="reveal">
            <a href="/kocluk-basvuru" className="btn btn-secondary">Tüm Eğitmenlerimizi Gör</a>
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
                "Matematik korkumu Pont Academy sayesinde yendim. Koçumun verdiği çalışma programı hayatımı düzene soktu."
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
                "Koçum sayesinde 3 ayda 40 net artırdım. Sınav stresini yönetmeyi ve verimli ders çalışmayı öğrendim. YKS'de hedefimi tutturabildim."
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
                "Hocalarımın ilgisi ve koçumun takibi ile kızım hedeflediği liseyi kazandı. Veliler için hazırlanan raporlama sistemi harika."
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
      <section id="bilgi-al" data-theme="dark" style={{ borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}>
        <div className="container contact-grid">
          
          <div className="contact-info reveal">
            <h3 className="contact-info-title">Bilgi Alın</h3>
            <p className="contact-info-desc">
              Size en uygun programı birlikte belirleyelim. Formu doldurun, eğitim danışmanlarımız en kısa sürede sizinle iletişime geçsin.
            </p>
            
            <div className="contact-channels">
              <a href={`tel:${settings.contactPhone || "+905300000000"}`} className="contact-channel-item">
                <div className="contact-channel-icon"><Phone size={18} /></div>
                <span>{settings.contactPhone || "0530 000 00 00"}</span>
              </a>
              <a href={`mailto:${settings.contactEmail || "info@pontakademi.com"}`} className="contact-channel-item">
                <div className="contact-channel-icon"><Mail size={18} /></div>
                <span>{settings.contactEmail || "info@pontakademi.com"}</span>
              </a>
              <a href={`https://wa.me/${(settings.contactPhone || "905300000000").replace(/[^0-9]/g, "")}`} className="contact-channel-item" target="_blank" rel="noopener noreferrer">
                <div className="contact-channel-icon" style={{ backgroundColor: "#25D366", borderColor: "#25D366" }}><MessageCircle size={18} style={{ color: "#fff" }} /></div>
                <span style={{ color: "#25D366", fontWeight: "600" }}>WhatsApp&apos;tan Yazın →</span>
              </a>
            </div>
          </div>

          <div className="form-card reveal">
            {formSubmitted ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <Sparkles size={48} style={{ color: "var(--color-gold)", marginBottom: "16px" }} />
                <h4 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px", color: "#fff" }}>Mesajınız Başarıyla İletildi!</h4>
                <p style={{ color: "var(--color-text-soft)", fontSize: "15px" }}>
                  Eğitim danışmanımız en kısa sürede sizinle iletişime geçecektir.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {formError && (
                  <div style={{ backgroundColor: "rgba(239, 68, 68, 0.15)", border: "1px solid #EF4444", color: "#FCA5A5", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
                    {formError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="name">Adınız Soyadınız</label>
                  <input 
                    className="form-input" 
                    type="text" 
                    id="name" 
                    placeholder="Örn: Mehmet Can"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="email">E-Posta Adresiniz</label>
                    <input 
                      className="form-input" 
                      type="email" 
                      id="email" 
                      placeholder="ad@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="phone">Telefon Numaranız</label>
                    <input 
                      className="form-input" 
                      type="tel" 
                      id="phone" 
                      placeholder="05xx ..."
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="exam">İlgilendiğiniz Alan / Sınav</label>
                  <select 
                    className="form-select" 
                    id="exam"
                    value={formData.exam}
                    onChange={(e) => setFormData({ ...formData, exam: e.target.value })}
                  >
                    <option value="YKS">YKS (Üniversite Hazırlık & Koçluk)</option>
                    <option value="LGS">LGS (Lise Hazırlık & Koçluk)</option>
                    <option value="OZEL_DERS">Branş Bazlı Özel Ders</option>
                    <option value="DIGER">Diğer Danışmanlık Talebi</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="message">Mesajınız / Notunuz</label>
                  <textarea
                    className="form-input"
                    id="message"
                    rows={3}
                    placeholder="Hedefleriniz, sormak istedikleriniz veya ders talebiniz..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    style={{ resize: "vertical" }}
                    required
                  />
                </div>

                <button 
                  className="btn btn-primary form-submit-btn" 
                  type="submit"
                  disabled={formLoading}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  {formLoading ? "İletiliyor..." : "Mesaj Gönder"}
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="container footer-grid">
          <div className="footer-brand">
            <a href="#" style={{ display: "inline-flex", alignItems: "center" }}>
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
              <li><a href="#ozel-ders" className="footer-link">Özel Ders</a></li>
              <li><a href="#kocluk" className="footer-link">Eğitim Koçluğu</a></li>
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
