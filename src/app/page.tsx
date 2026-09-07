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

  // Contact Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    exam: "YKS"
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Setup Countdown Timer Target Dates
  // Targets chosen to correspond roughly to 287 days and 220 days from June 25, 2026
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

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.phone) {
      setFormSubmitted(true);
      setTimeout(() => {
        setFormSubmitted(false);
        setFormData({ name: "", phone: "", exam: "YKS" });
      }, 5000);
    }
  };

  return (
    <>
      {/* Sticky Header Nav */}
      <header className={`site-header ${scrolled ? "scrolled" : ""}`}>
        <div className="container nav-container">
          <a href="#" className="logo-container" style={{ display: "flex", alignItems: "center" }}>
            <Image 
              src="/pont_logo.png" 
              alt="Pont Academy Logo" 
              width={140} 
              height={38} 
              style={{ objectFit: "contain" }}
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
            <a href="#ekibimiz" className="nav-link">Hakkımızda</a>
            <a href="#bilgi-al" className="nav-link">İletişim</a>
            <a href="/kocluk-basvuru" className="btn btn-secondary" style={{ padding: "8px 18px", fontSize: "14px", border: "1.5px solid var(--color-gold)", color: "var(--color-gold)" }}>
              Koçluk Başlat
            </a>
          </div>

          {/* Mobile Hamburguer */}
          <button className="hamburger" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
        <button className="mobile-menu-close" onClick={() => setMobileMenuOpen(false)}>
          <X size={28} />
        </button>
        <a href="#" style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
          <Image 
            src="/pont_logo.png" 
            alt="Pont Academy Logo" 
            width={160} 
            height={44} 
            style={{ objectFit: "contain" }}
            priority
          />
        </a>
        <a href="#ozel-ders" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Özel Ders</a>
        <a href="#kocluk" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Koçluk</a>
        <a href="/tyt-puan-hesaplama" className="nav-link" onClick={() => setMobileMenuOpen(false)}>TYT Puan Hesaplama</a>
        <a href="/yks-puan-hesaplama" className="nav-link" onClick={() => setMobileMenuOpen(false)}>YKS Puan Hesaplama</a>
        <a href="#ekibimiz" className="nav-link" onClick={() => setMobileMenuOpen(false)}>Hakkımızda</a>
        <a href="#iletisim" className="nav-link" onClick={() => setMobileMenuOpen(false)}>İletişim</a>
        <a href="/kocluk-basvuru" className="btn btn-primary" style={{ width: "100%", maxWidth: "250px", marginTop: "20px" }} onClick={() => setMobileMenuOpen(false)}>
          Koçluk Başlat
        </a>
      </div>

      {/* HERO SECTION */}
      <section data-theme="dark" style={{ minHeight: "100vh", display: "flex", alignItems: "center", paddingTop: "120px", paddingBottom: "80px" }}>
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
              {/* Teacher 1 */}
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

              {/* Teacher 2 */}
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

              {/* Teacher 3 */}
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
            {/* Akademik Başlangıç */}
            <div className="pricing-card light reveal">
              <div className="pricing-title">Akademik Başlangıç</div>
              <div className="pricing-price-container">
                <span className="price-symbol">₺</span>
                <span className="price-amount numeric">2.450</span>
                <span className="price-period">/ay</span>
              </div>
              <ul className="pricing-list">
                <li><Check size={16} /> Haftalık 2 Saat Özel Ders</li>
                <li><Check size={16} /> Birebir Soru Çözüm Desteği</li>
                <li><Check size={16} /> Ders Notu ve Kaynak Paylaşımı</li>
                <li className="disabled"><X size={16} /> Kişisel Eğitim Koçluğu</li>
                <li className="disabled"><X size={16} /> 7/24 Rehberlik Desteği</li>
              </ul>
              <a href="/ozel-ders-basvuru" className="btn btn-dark-ghost">İncele</a>
            </div>

            {/* Tam Başarı Paketi */}
            <div className="pricing-card dark card-glow reveal">
              <div className="pricing-title">Tam Başarı Paketi</div>
              <div className="pricing-price-container">
                <span className="price-symbol">₺</span>
                <span className="price-amount numeric">4.800</span>
                <span className="price-period">/ay</span>
              </div>
              <ul className="pricing-list">
                <li><Check size={16} style={{ color: "var(--color-gold)" }} /> Haftalık 4 Saat Özel Ders</li>
                <li><Check size={16} style={{ color: "var(--color-gold)" }} /> 7/24 Rehberlik & Koçluk Desteği</li>
                <li><Check size={16} style={{ color: "var(--color-gold)" }} /> Haftalık Kişiye Özel Ders Programı</li>
                <li><Check size={16} style={{ color: "var(--color-gold)" }} /> Online Haftalık Deneme Sınavları</li>
                <li><Check size={16} style={{ color: "var(--color-gold)" }} /> Aylık Veli İlerleme Raporu</li>
              </ul>
              <a href="/kocluk-basvuru" className="btn btn-primary">Hemen Başla</a>
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
              Size en uygun programı birlikte belirleyelim. Formu doldurun, eğitim danışmanlarımız 24 saat içinde sizinle iletişime geçsin.
            </p>
            
            <div className="contact-channels">
              <a href="tel:+905300000000" className="contact-channel-item">
                <div className="contact-channel-icon"><Phone size={18} /></div>
                <span>0530 000 00 00</span>
              </a>
              <a href="mailto:info@pontacademy.com" className="contact-channel-item">
                <div className="contact-channel-icon"><Mail size={18} /></div>
                <span>info@pontacademy.com</span>
              </a>
              <a href="https://wa.me/905300000000" className="contact-channel-item" target="_blank" rel="noopener noreferrer">
                <div className="contact-channel-icon" style={{ backgroundColor: "#25D366", borderColor: "#25D366" }}><MessageCircle size={18} style={{ color: "#fff" }} /></div>
                <span style={{ color: "#25D366", fontWeight: "600" }}>WhatsApp'tan Yazın →</span>
              </a>
            </div>
          </div>

          <div className="form-card reveal">
            {formSubmitted ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <Sparkles size={48} style={{ color: "var(--color-gold)", marginBottom: "16px" }} />
                <h4 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "8px", color: "#fff" }}>Başvurunuz Alındı!</h4>
                <p style={{ color: "var(--color-text-soft)", fontSize: "15px" }}>
                  Eğitim danışmanımız en kısa sürede sizinle iletişime geçecektir.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
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

                <div className="form-group">
                  <label className="form-label" htmlFor="phone">Telefon Numaranız</label>
                  <input 
                    className="form-input" 
                    type="tel" 
                    id="phone" 
                    placeholder="+90 5xx ..."
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="exam">Hedef Sınav</label>
                  <select 
                    className="form-select" 
                    id="exam"
                    value={formData.exam}
                    onChange={(e) => setFormData({ ...formData, exam: e.target.value })}
                  >
                    <option value="YKS">YKS (Üniversite Hazırlık)</option>
                    <option value="LGS">LGS (Lise Hazırlık)</option>
                    <option value="TÜMÜ">Her İkisi</option>
                  </select>
                </div>

                <button className="btn btn-primary form-submit-btn" type="submit">
                  Mesaj Gönder
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
            <a href="#" className="logo-text" style={{ fontSize: "24px" }}>
              Pont <span>Academy</span>
            </a>
            <p className="footer-brand-desc">
              Geleceğin liderlerini bilimsel metotlar ve akademik disiplinle hazırlıyoruz.
            </p>
          </div>

          <div>
            <h5 className="footer-title">Kurumsal</h5>
            <ul className="footer-links">
              <li><a href="#ekibimiz" className="footer-link">Hakkımızda</a></li>
              <li><a href="#ekibimiz" className="footer-link">Eğitmenler</a></li>
              <li><a href="#iletisim" className="footer-link">Blog</a></li>
            </ul>
          </div>

          <div>
            <h5 className="footer-title">Yasal</h5>
            <ul className="footer-links">
              <li><a href="#" className="footer-link">KVKK Metni</a></li>
              <li><a href="#" className="footer-link">Gizlilik Politikası</a></li>
              <li><a href="#" className="footer-link">İptal Koşulları</a></li>
            </ul>
          </div>

          <div>
            <h5 className="footer-title">Bizi Takip Edin</h5>
            <div className="footer-socials" style={{ marginBottom: "20px" }}>
              <a href="#" className="footer-social-btn"><Share2 size={16} /></a>
              <a href="#" className="footer-social-btn"><Mail size={16} /></a>
              <a href="https://wa.me/905300000000" className="footer-social-btn"><Phone size={16} /></a>
            </div>
            <p style={{ fontSize: "13px", color: "var(--color-text-soft)" }}>
              YKS ve LGS sınav hazırlığında doğru adres.
            </p>
          </div>
        </div>

        <div className="container footer-bottom">
          <div>© 2026 Pont Academy. Tüm hakları saklıdır.</div>
          <div>Tasarımlar St!tch ile Hazırlanmıştır.</div>
        </div>
      </footer>
    </>
  );
}
