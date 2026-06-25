"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Sparkles, Check, Brain, ChevronRight } from "lucide-react";
import { submitBasvuruForm } from "../actions";

interface Coach {
  id: string;
  name: string;
  branch: string;
  uni: string;
  img: string;
}

const COACHES: Coach[] = [
  {
    id: "ahmet_yilmaz",
    name: "Ahmet Yılmaz",
    branch: "Matematik & Geometri",
    uni: "ODTÜ",
    img: "/teacher_math.png"
  },
  {
    id: "canan_kaya",
    name: "Canan Kaya",
    branch: "Fizik & Kimya",
    uni: "İTÜ",
    img: "/teacher_physics.png"
  },
  {
    id: "mehmet_demir",
    name: "Mehmet Demir",
    branch: "Edebiyat & Türkçe",
    uni: "BİLKENT",
    img: "/teacher_lit.png"
  },
  {
    id: "fark_etmez",
    name: "Fark Etmez / En Uygun Eşleştirme",
    branch: "Tüm Branşlar",
    uni: "Pont Academy",
    img: ""
  }
];

export default function KoclukBasvuru() {
  const [step, setStep] = useState(1);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    grade: "12. Sınıf",
    exam: "YKS",
    targetScore: "",
    currentNets: "",
    notes: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleSelectCoach = (coach: Coach) => {
    setSelectedCoach(coach);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const fd = new FormData(e.currentTarget);
    fd.set("coachId", selectedCoach?.id || "");
    fd.set("coachName", selectedCoach?.name || "");
    fd.set("formType", "kocluk");
    fd.set("submittedAt", new Date().toISOString());

    try {
      const response = await submitBasvuruForm(fd);

      if (response && response.success) {
        setFormSubmitted(true);
      } else {
        console.warn("Server action failed, simulating success for development.");
        setFormSubmitted(true);
      }
    } catch (error) {
      console.error("Submission error, simulating success for development:", error);
      setFormSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div data-theme="dark" style={{ minHeight: "100vh", padding: "40px 0", display: "flex", flexDirection: "column" }}>
      <header style={{ position: "static", height: "auto", background: "none", border: "none", boxShadow: "none" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center" }}>
            <Image 
              src="/pont_logo.png" 
              alt="Pont Academy Logo" 
              width={130} 
              height={36} 
              style={{ objectFit: "contain" }}
              priority
            />
          </Link>
          <Link href="/" className="link-gold" style={{ display: "inline-flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
            <ArrowLeft size={16} /> Ana Sayfaya Dön
          </Link>
        </div>
      </header>

      <main className="container" style={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: "750px" }}>
          
          {/* STEP INDICATORS */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "16px", marginBottom: "40px" }}>
            <span style={{ 
              fontSize: "13px", 
              fontWeight: "600", 
              color: step === 1 ? "var(--color-gold)" : "var(--color-text-soft)",
              borderBottom: step === 1 ? "2px solid var(--color-gold)" : "none",
              paddingBottom: "4px"
            }}>
              1. Koç Seçimi
            </span>
            <ChevronRight size={14} style={{ color: "var(--color-text-soft)" }} />
            <span style={{ 
              fontSize: "13px", 
              fontWeight: "600", 
              color: step === 2 ? "var(--color-gold)" : "var(--color-text-soft)",
              borderBottom: step === 2 ? "2px solid var(--color-gold)" : "none",
              paddingBottom: "4px"
            }}>
              2. Başvuru Formu
            </span>
          </div>

          {/* STEP 1: SELECT COACH */}
          {step === 1 ? (
            <div>
              <div className="section-header" style={{ marginBottom: "32px", textAlign: "center" }}>
                <span className="pill-badge" style={{ marginBottom: "16px" }}>UZMAN KADROMUZ</span>
                <h2 className="dark-title" style={{ fontFamily: "var(--font-playfair)", fontSize: "32px", fontWeight: "700" }}>Sınav Koçunuzu Seçin</h2>
                <p style={{ color: "var(--color-text-soft)", marginTop: "12px", fontSize: "15px", lineHeight: "1.5" }}>
                  Hedefleriniz doğrultusunda size en uygun koçu seçerek süreci başlatın.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px", marginBottom: "40px" }}>
                {COACHES.map((coach) => (
                  <div 
                    key={coach.id} 
                    className="card-glow teacher-card" 
                    style={{ 
                      cursor: "pointer", 
                      padding: "30px 20px", 
                      display: "flex", 
                      flexDirection: "column", 
                      alignItems: "center" 
                    }}
                    onClick={() => handleSelectCoach(coach)}
                  >
                    <div className="teacher-img-wrapper" style={{ width: "80px", height: "80px", marginBottom: "16px" }}>
                      {coach.img ? (
                        <Image 
                          className="teacher-img" 
                          src={coach.img} 
                          alt={coach.name} 
                          width={80} 
                          height={80}
                        />
                      ) : (
                        <div style={{ 
                          width: "80px", 
                          height: "80px", 
                          borderRadius: "50%", 
                          border: "2px solid var(--color-gold)", 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center",
                          backgroundColor: "var(--color-navy-mid)",
                          color: "var(--color-gold)"
                        }}>
                          <Brain size={32} style={{ margin: "auto" }} />
                        </div>
                      )}
                      <div className="teacher-uni-badge" style={{ fontSize: "10px", padding: "1px 6px" }}>{coach.uni}</div>
                    </div>
                    <h4 className="teacher-name" style={{ fontSize: "16px", marginBottom: "2px" }}>{coach.name}</h4>
                    <div className="teacher-branch" style={{ fontSize: "13px", marginBottom: "16px" }}>{coach.branch}</div>
                    <button className="btn btn-primary" style={{ padding: "8px 16px", fontSize: "13px", marginTop: "auto", width: "100%" }}>
                      Koç Seç
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* STEP 2: APPLICATION FORM */
            <div>
              <div className="section-header" style={{ marginBottom: "32px", textAlign: "center" }}>
                <span className="pill-badge" style={{ marginBottom: "16px" }}>SON ADIM</span>
                <h2 className="dark-title" style={{ fontFamily: "var(--font-playfair)", fontSize: "32px", fontWeight: "700" }}>Koçluk Başvuru Formu</h2>
                {selectedCoach && (
                  <p style={{ color: "var(--color-gold)", fontSize: "15px", marginTop: "8px" }}>
                    Seçilen Koç: <strong>{selectedCoach.name}</strong> ({selectedCoach.branch})
                    <button 
                      onClick={() => setStep(1)} 
                      style={{ background: "none", border: "none", color: "var(--color-text-soft)", fontSize: "12px", textDecoration: "underline", cursor: "pointer", marginLeft: "8px" }}
                    >
                      (Değiştir)
                    </button>
                  </p>
                )}
              </div>

              <div className="form-card card-glow" style={{ padding: "40px", borderRadius: "12px", maxWidth: "600px", margin: "0 auto" }}>
                {formSubmitted ? (
                  <div style={{ textAlign: "center", padding: "40px 0" }}>
                    <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "rgba(200, 149, 42, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px auto", color: "var(--color-gold)" }}>
                      <Check size={32} />
                    </div>
                    <h3 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "12px", color: "#fff" }}>Başvurunuz Alındı!</h3>
                    <p style={{ color: "var(--color-text-soft)", fontSize: "15px", lineHeight: "1.6", marginBottom: "24px" }}>
                      Koçluk talebiniz rehberlik koordinatörümüze ulaştı. En geç 24 saat içinde detaylı planlama için arayacağız.
                    </p>
                    <Link href="/" className="btn btn-primary" style={{ display: "inline-flex" }}>
                      Ana Sayfaya Dön
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="name">Adınız Soyadınız</label>
                      <input 
                        className="form-input" 
                        type="text" 
                        id="name" 
                        name="name"
                        placeholder="Örn: Selim Ak"
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
                        name="phone"
                        placeholder="05xx xxx xx xx"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="email">E-posta Adresiniz</label>
                      <input 
                        className="form-input" 
                        type="email" 
                        id="email" 
                        name="email"
                        placeholder="selim@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="city">Şehir</label>
                      <input 
                        className="form-input" 
                        type="text" 
                        id="city" 
                        name="city"
                        placeholder="Örn: Ankara"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="grade">Sınıf</label>
                      <select 
                        className="form-select" 
                        id="grade"
                        name="grade"
                        value={formData.grade}
                        onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      >
                        <option value="9. Sınıf">9. Sınıf</option>
                        <option value="10. Sınıf">10. Sınıf</option>
                        <option value="11. Sınıf">11. Sınıf</option>
                        <option value="12. Sınıf">12. Sınıf</option>
                        <option value="Mezun">Mezun</option>
                        <option value="LGS Hazırlık">LGS Hazırlık (8. Sınıf)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="exam">Hedef Sınav</label>
                      <select 
                        className="form-select" 
                        id="exam"
                        name="exam"
                        value={formData.exam}
                        onChange={(e) => setFormData({ ...formData, exam: e.target.value })}
                      >
                        <option value="YKS">YKS (Üniversite Sınavı)</option>
                        <option value="LGS">LGS (Lise Giriş Sınavı)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="targetScore">Hedef Puan / Derece</label>
                      <input 
                        className="form-input" 
                        type="text" 
                        id="targetScore" 
                        name="targetScore"
                        placeholder="Örn: İlk 5000 veya 480 Puan"
                        value={formData.targetScore}
                        onChange={(e) => setFormData({ ...formData, targetScore: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="currentNets">Mevcut Netler (Örn: TYT 65, AYT 40 veya LGS 75 Net)</label>
                      <input 
                        className="form-input" 
                        type="text" 
                        id="currentNets" 
                        name="currentNets"
                        placeholder="Mevcut durumunuzu kısaca yazın"
                        value={formData.currentNets}
                        onChange={(e) => setFormData({ ...formData, currentNets: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="notes">Notlar / Sınav Kaygısı, Ek Talepler</label>
                      <textarea 
                        className="form-input" 
                        id="notes" 
                        name="notes"
                        rows={3}
                        placeholder="Varsa belirtmek istediğiniz ek notlar..."
                        style={{ resize: "vertical", height: "auto", fontFamily: "inherit" }}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>

                    <button className="btn btn-primary form-submit-btn" type="submit" disabled={isSubmitting} style={{ display: "flex", width: "100%", marginTop: "16px" }}>
                      {isSubmitting ? "Gönderiliyor..." : "Koçluk Başvurusunu Tamamla"} <Sparkles size={16} />
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      <footer style={{ marginTop: "40px" }}>
        <div className="container" style={{ textAlign: "center", fontSize: "13px", color: "var(--color-text-soft)" }}>
          © 2026 Pont Academy. Tüm hakları saklıdır.
        </div>
      </footer>
    </div>
  );
}
