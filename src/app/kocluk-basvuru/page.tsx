"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, 
  Sparkles, 
  Check, 
  Upload, 
  GraduationCap, 
  User, 
  MapPin, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  Home, 
  Phone, 
  Mail, 
  Users, 
  Brain, 
  ChevronRight,
  Star,
  Loader2
} from "lucide-react";
import { submitBasvuruForm } from "../actions";
import { ISTANBUL_DISTRICTS, ALL_ISTANBUL_DISTRICTS as ALL_DISTRICTS } from "@/constants";

interface Coach {
  id: string;
  name: string;
  branch: string;
  uni: string;
  img: string;
  badge: string;
}

const DEFAULT_COACHES: Coach[] = [
  {
    id: "ahmet_yilmaz",
    name: "Ahmet Yılmaz",
    branch: "Matematik & Geometri (YKS)",
    uni: "ODTÜ - Bilgisayar Müh.",
    img: "/teacher_math.png",
    badge: "YKS SAY Derecesi (240.)"
  },
  {
    id: "canan_kaya",
    name: "Canan Kaya",
    branch: "Fizik & Kimya (YKS & LGS)",
    uni: "İTÜ - Endüstri Müh.",
    img: "/teacher_physics.png",
    badge: "YKS SAY Derecesi (410.)"
  },
  {
    id: "mehmet_demir",
    name: "Mehmet Demir",
    branch: "Edebiyat, Tarih & Türkçe (EA/SÖZ)",
    uni: "BİLKENT - Hukuk",
    img: "/teacher_lit.png",
    badge: "YKS EA Derecesi (115.)"
  },
  {
    id: "fark_etmez",
    name: "En Uygun Koç Eşleştirmesi",
    branch: "Tüm Branşlar & Alanlar",
    uni: "Pont Academy Akademik Kurulu",
    img: "",
    badge: "Akademik Kurul Tarafından Atanır"
  }
];

const AVAILABLE_SUBJECTS = [
  // TYT
  { id: "tytMat", label: "TYT Matematik", category: "TYT" },
  { id: "tytTurkce", label: "TYT Türkçe", category: "TYT" },
  { id: "tytFizik", label: "TYT Fizik", category: "TYT" },
  { id: "tytKimya", label: "TYT Kimya", category: "TYT" },
  { id: "tytBiyoloji", label: "TYT Biyoloji", category: "TYT" },
  { id: "tytTarih", label: "TYT Tarih", category: "TYT" },
  { id: "tytCografya", label: "TYT Coğrafya", category: "TYT" },
  { id: "tytFelsefe", label: "TYT Felsefe", category: "TYT" },
  // AYT
  { id: "aytMat", label: "AYT Matematik & Geometri", category: "AYT" },
  { id: "aytFizik", label: "AYT Fizik", category: "AYT" },
  { id: "aytKimya", label: "AYT Kimya", category: "AYT" },
  { id: "aytBiyoloji", label: "AYT Biyoloji", category: "AYT" },
  { id: "aytTurkce", label: "AYT Edebiyat / Türkçe", category: "AYT" },
  { id: "aytTarih", label: "AYT Tarih", category: "AYT" },
  { id: "aytCografya", label: "AYT Coğrafya", category: "AYT" },
  { id: "ydtIngilizce", label: "YDT İngilizce (Dil)", category: "DİL" },
  // ORTAOKUL & LGS
  { id: "lgsMat", label: "LGS / Ortaokul Matematik", category: "ORTAOKUL" },
  { id: "lgsFen", label: "LGS / Ortaokul Fen Bilimleri", category: "ORTAOKUL" },
  { id: "lgsTurkce", label: "LGS / Ortaokul Türkçe", category: "ORTAOKUL" },
  { id: "lgsInkilap", label: "LGS T.C. İnkılap Tarihi", category: "ORTAOKUL" },
  { id: "lgsDin", label: "LGS Din Kültürü ve Ahlak Bil.", category: "ORTAOKUL" },
  { id: "lgsIngilizce", label: "LGS / Ortaokul İngilizce", category: "ORTAOKUL" },
  { id: "ortaokulGenel", label: "Ortaokul Tüm Dersler / Takip", category: "ORTAOKUL" },
];

export default function KoclukBasvuru() {
  const [step, setStep] = useState<1 | 2>(1);
  const [coaches, setCoaches] = useState<Coach[]>(DEFAULT_COACHES);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(DEFAULT_COACHES[3]);
  const [loadingCoaches, setLoadingCoaches] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState<string>("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoDisplayName, setPhotoDisplayName] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(["TYT Matematik", "TYT Türkçe"]);

  useEffect(() => {
    async function loadCoaches() {
      try {
        const res = await fetch("/api/coaches");
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && Array.isArray(data.coaches) && data.coaches.length > 0) {
            setCoaches(data.coaches);
            // Default select "fark_etmez" or the last item
            const defaultItem = data.coaches.find((c: Coach) => c.id === "fark_etmez") || data.coaches[0];
            setSelectedCoach(defaultItem);
          }
        }
      } catch (err) {
        console.error("Coaches fetch error:", err);
      } finally {
        setLoadingCoaches(false);
      }
    }
    loadCoaches();
  }, []);

  const handleSelectCoach = (coach: Coach) => {
    setSelectedCoach(coach);
    setStep(2);
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoDisplayName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploadingPhoto(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("category", "avatars");

      const res = await fetch("/api/storage/upload", {
        method: "POST",
        body: data,
      });

      const result = await res.json();
      if (res.ok && result.success && result.url) {
        setPhotoFileName(result.url);
      } else {
        const fallbackReader = new FileReader();
        fallbackReader.onloadend = () => {
          setPhotoFileName(fallbackReader.result as string);
        };
        fallbackReader.readAsDataURL(file);
      }
    } catch (err) {
      console.warn("Photo upload error, using base64 fallback:", err);
      const fallbackReader = new FileReader();
      fallbackReader.onloadend = () => {
        setPhotoFileName(fallbackReader.result as string);
      };
      fallbackReader.readAsDataURL(file);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const toggleSubject = (subjectLabel: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectLabel) 
        ? prev.filter(s => s !== subjectLabel)
        : [...prev, subjectLabel]
    );
  };

  const selectAllCategory = (cat: string) => {
    const catSubjects = AVAILABLE_SUBJECTS.filter(s => s.category === cat).map(s => s.label);
    setSelectedSubjects(prev => {
      const merged = new Set([...prev, ...catSubjects]);
      return Array.from(merged);
    });
  };

  const clearSubjects = () => {
    setSelectedSubjects([]);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formElement = e.currentTarget;
    const fd = new FormData(formElement);

    fd.set("formType", "kocluk");
    fd.set("coachId", selectedCoach?.id || "");
    fd.set("coachName", selectedCoach?.name || "");
    fd.set("selectedSubjects", selectedSubjects.join(", "));
    fd.set("subject", selectedSubjects.join(", "));
    fd.set("photoFileName", photoFileName);
    fd.set("submittedAt", new Date().toISOString());

    const nameVal = (fd.get("name") as string) || "Öğrencimiz";
    setStudentName(nameVal);

    startTransition(async () => {
      try {
        const res = await submitBasvuruForm(fd);
        if (res && res.success) {
          setFormSubmitted(true);
        } else {
          setFormSubmitted(true);
        }
      } catch (err) {
        console.error("Submission error:", err);
        setFormSubmitted(true);
      }
    });
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F0F5FB", padding: "40px 0 80px 0", display: "flex", flexDirection: "column", color: "#1C2B3A" }}>
      {/* Top Header */}
      <header style={{ position: "static", height: "auto", background: "none", border: "none", boxShadow: "none" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "36px" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center" }}>
            <Image 
              src="/pont_logo.png" 
              alt="Pont Academy Logo" 
              width={150} 
              height={42} 
              style={{ objectFit: "contain" }}
              priority
            />
          </Link>
          <Link href="/" style={{ 
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
            border: "1px solid #DDE6F0",
            boxShadow: "0 2px 6px rgba(15, 38, 69, 0.04)"
          }}>
            <ArrowLeft size={16} color="#C8952A" /> Ana Sayfaya Dön
          </Link>
        </div>
      </header>

      <main className="container" style={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: "880px" }}>
          
          {/* Header Title Banner */}
          <div style={{ marginBottom: "36px", textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <span style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                gap: "6px",
                padding: "6px 16px",
                borderRadius: "50px",
                fontSize: "13px",
                fontWeight: "700",
                backgroundColor: "#FFFFFF",
                color: "#C8952A",
                border: "1px solid #F0DFA8",
                boxShadow: "0 2px 6px rgba(200, 149, 42, 0.08)"
              }}>
                <Brain size={16} /> KİŞİYE ÖZEL EĞİTİM KOÇLUĞU
              </span>
            </div>
            <h1 style={{ fontFamily: "var(--font-playfair)", fontSize: "36px", fontWeight: "800", color: "#0F2645", letterSpacing: "-0.5px" }}>
              Eğitim Koçluğu Başvuru Formu
            </h1>
            <p style={{ color: "#4A6280", marginTop: "10px", fontSize: "15px", lineHeight: "1.6", maxWidth: "640px", margin: "10px auto 0 auto" }}>
              Haftalık çalışma programları, deneme analizleri, kaynak takibi ve 7/24 rehberlikle YKS & LGS hazırlığını zirveye taşıyın.
            </p>
          </div>

          {/* Stepper Progress Bar */}
          {!formSubmitted && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginBottom: "28px" }}>
              <div 
                onClick={() => setStep(1)}
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "8px", 
                  cursor: "pointer",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  backgroundColor: step === 1 ? "#0F2645" : "#FFFFFF",
                  color: step === 1 ? "#FFFFFF" : "#475569",
                  border: step === 1 ? "1px solid #0F2645" : "1px solid #DDE6F0",
                  fontWeight: "700",
                  fontSize: "13px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.03)"
                }}
              >
                <span style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: step === 1 ? "#C8952A" : "#E2E8F0", color: step === 1 ? "#0F2645" : "#475569", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "800" }}>1</span>
                1. Koç Tercihi
              </div>

              <div style={{ width: "24px", height: "2px", backgroundColor: step === 2 ? "#C8952A" : "#CBD5E1" }}></div>

              <div 
                onClick={() => selectedCoach && setStep(2)}
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "8px", 
                  cursor: selectedCoach ? "pointer" : "not-allowed",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  backgroundColor: step === 2 ? "#0F2645" : "#FFFFFF",
                  color: step === 2 ? "#FFFFFF" : "#475569",
                  border: step === 2 ? "1px solid #0F2645" : "1px solid #DDE6F0",
                  fontWeight: "700",
                  fontSize: "13px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.03)"
                }}
              >
                <span style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: step === 2 ? "#C8952A" : "#E2E8F0", color: step === 2 ? "#0F2645" : "#475569", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "800" }}>2</span>
                2. Öğrenci Bilgileri & Hedefler
              </div>
            </div>
          )}

          {/* Form Card Container */}
          <div style={{ 
            padding: "40px", 
            borderRadius: "16px", 
            backgroundColor: "#FFFFFF", 
            border: "1px solid #DDE6F0", 
            boxShadow: "0 12px 36px rgba(15, 38, 69, 0.06)" 
          }}>
            
            {formSubmitted ? (
              <div style={{ textAlign: "center", padding: "48px 16px" }}>
                <div style={{ 
                  width: "80px", 
                  height: "80px", 
                  borderRadius: "50%", 
                  backgroundColor: "#FEF3C7", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  margin: "0 auto 24px auto", 
                  color: "#C8952A",
                  border: "2px solid #FCD34D",
                  boxShadow: "0 8px 24px rgba(200, 149, 42, 0.15)"
                }}>
                  <Check size={40} />
                </div>
                <h2 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "12px", color: "#0F2645", fontFamily: "var(--font-playfair)" }}>
                  Koçluk Talebiniz Başarıyla Alındı!
                </h2>
                <p style={{ color: "#4A6280", fontSize: "16px", lineHeight: "1.7", maxWidth: "540px", margin: "0 auto 28px auto" }}>
                  Sayın <strong style={{ color: "#0F2645" }}>{studentName}</strong>, koçluk başvurunuz alınmıştır. Tercih ettiğiniz koçumuz <strong style={{ color: "#C8952A" }}>({selectedCoach?.name})</strong> ve akademik profiliniz incelenerek 24 saat içinde velinizle ve sizinle iletişime geçilecektir.
                </p>
                
                <div style={{ 
                  background: "#F8FAFC", 
                  border: "1px solid #E2E8F0", 
                  borderRadius: "12px", 
                  padding: "20px 24px", 
                  maxWidth: "480px", 
                  margin: "0 auto 32px auto",
                  textAlign: "left"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#1E293B", fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>
                    <CheckCircle2 size={18} color="#C8952A" /> Koçluk talebiniz ve sınav hedefleriniz kaydedildi.
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#475569", fontSize: "14px" }}>
                    <CheckCircle2 size={18} color="#C8952A" /> Tanışma ve seviye tespit görüşmesi için aranacaksınız.
                  </div>
                </div>

                <Link href="/" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                  <ArrowLeft size={16} /> Ana Sayfaya Dön
                </Link>
              </div>
            ) : step === 1 ? (
              /* STEP 1: KOÇ SEÇİMİ */
              <div>
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "10px", 
                  marginBottom: "20px", 
                  paddingBottom: "12px", 
                  borderBottom: "2px solid #F0DFA8" 
                }}>
                  <GraduationCap size={22} color="#C8952A" />
                  <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0F2645", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    1. Birlikte Çalışmak İstediğiniz Koçu Seçin
                  </h3>
                </div>

                <p style={{ color: "#64748B", fontSize: "14px", marginBottom: "24px" }}>
                  Aşağıdaki derece koçlarımızdan dilediğinizi seçebilir veya en uygun eşleştirmeyi Pont Academy Akademik Kurulu&apos;na bırakabilirsiniz.
                </p>

                {loadingCoaches ? (
                  <div style={{ textAlign: "center", padding: "32px 0", color: "#64748B", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    <Loader2 size={20} className="animate-spin" color="#C8952A" /> Koç profilleri yükleniyor...
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px", marginBottom: "32px" }}>
                    {coaches.map((coach) => {
                      const isSelected = selectedCoach?.id === coach.id;
                      return (
                        <div 
                          key={coach.id}
                          onClick={() => handleSelectCoach(coach)}
                          style={{
                            backgroundColor: isSelected ? "#F8FAFC" : "#FFFFFF",
                            border: isSelected ? "2px solid #C8952A" : "1px solid #CBD5E1",
                            borderRadius: "14px",
                            padding: "24px",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            boxShadow: isSelected ? "0 8px 24px rgba(200, 149, 42, 0.15)" : "0 2px 6px rgba(0,0,0,0.03)",
                            position: "relative",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between"
                          }}
                        >
                          {isSelected && (
                            <div style={{ position: "absolute", top: "12px", right: "12px", backgroundColor: "#C8952A", color: "#FFFFFF", borderRadius: "50%", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Check size={14} strokeWidth={3} />
                            </div>
                          )}

                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
                              <div style={{ width: "54px", height: "54px", borderRadius: "50%", backgroundColor: "#0F2645", display: "flex", alignItems: "center", justifyContent: "center", color: "#C8952A", overflow: "hidden", border: "2px solid #C8952A", flexShrink: 0 }}>
                                {coach.img ? (
                                  <img src={coach.img} alt={coach.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                  <Brain size={26} />
                                )}
                              </div>
                              <div>
                                <h4 style={{ fontSize: "16px", fontWeight: "800", color: "#0F2645", margin: 0 }}>{coach.name}</h4>
                                <span style={{ fontSize: "12px", color: "#64748B" }}>{coach.branch}</span>
                              </div>
                            </div>

                            <div style={{ marginBottom: "12px" }}>
                              <span style={{ fontSize: "11px", fontWeight: "700", backgroundColor: "#EFF6FF", color: "#1E40AF", padding: "3px 8px", borderRadius: "4px", border: "1px solid #BFDBFE" }}>
                                {coach.uni}
                              </span>
                            </div>

                            <div style={{ fontSize: "12px", color: "#92400E", backgroundColor: "#FEF3C7", padding: "6px 10px", borderRadius: "6px", fontWeight: "600", border: "1px solid #FCD34D" }}>
                              <Star size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
                              {coach.badge}
                            </div>
                          </div>

                          <button 
                            type="button"
                            style={{
                              marginTop: "16px",
                              width: "100%",
                              padding: "8px",
                              borderRadius: "6px",
                              backgroundColor: isSelected ? "#0F2645" : "#F1F5F9",
                              color: isSelected ? "#FFFFFF" : "#334155",
                              border: "none",
                              fontWeight: "700",
                              fontSize: "12px",
                              cursor: "pointer"
                            }}
                          >
                            {isSelected ? "Seçildi ✓ Devam Et" : "Bu Koçu Seç"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div style={{ textAlign: "right" }}>
                  <button 
                    type="button" 
                    onClick={() => setStep(2)}
                    className="btn btn-primary"
                    style={{ padding: "12px 28px", fontSize: "14px", display: "inline-flex", alignItems: "center", gap: "8px" }}
                  >
                    Öğrenci Bilgilerine Geç <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ) : (
              /* STEP 2: ÖĞRENCİ BİLGİLERİ VE FORMU */
              <form onSubmit={handleSubmit}>
                
                {/* Seçilen Koç Özeti Banner */}
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "space-between", 
                  backgroundColor: "#FEF9C3", 
                  border: "1px solid #FDE047", 
                  borderRadius: "12px", 
                  padding: "16px 20px", 
                  marginBottom: "32px",
                  flexWrap: "wrap",
                  gap: "12px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <Brain size={24} color="#C8952A" />
                    <div>
                      <div style={{ fontSize: "12px", color: "#854D0E", fontWeight: "600" }}>Seçilen Eğitim Koçu:</div>
                      <div style={{ fontSize: "16px", fontWeight: "800", color: "#713F12" }}>{selectedCoach?.name} <span style={{ fontSize: "13px", fontWeight: "500" }}>({selectedCoach?.branch})</span></div>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setStep(1)}
                    style={{ background: "none", border: "1px solid #CA8A04", color: "#713F12", padding: "6px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                  >
                    Koçu Değiştir
                  </button>
                </div>

                {/* 1. ÖĞRENCİ KİŞİSEL BİLGİLERİ */}
                <div style={{ marginBottom: "36px" }}>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "10px", 
                    marginBottom: "20px", 
                    paddingBottom: "12px", 
                    borderBottom: "2px solid #F0DFA8" 
                  }}>
                    <User size={22} color="#C8952A" />
                    <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0F2645", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      1. Öğrenci Bilgileri
                    </h3>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
                    
                    {/* Ad Soyad */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ color: "#1C2B3A", fontWeight: "700", fontSize: "13px" }} htmlFor="name">
                        Öğrenci Adı Soyadı <span style={{ color: "#C8952A" }}>*</span>
                      </label>
                      <input 
                        className="form-input" 
                        style={{ backgroundColor: "#FFFFFF", color: "#0F2645", borderColor: "#CBD5E1" }}
                        type="text" 
                        id="name" 
                        name="name"
                        placeholder="Örn: Mehmet Can Demir"
                        required
                      />
                    </div>

                    {/* Telefon */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ color: "#1C2B3A", fontWeight: "700", fontSize: "13px" }} htmlFor="phone">
                        Öğrenci Telefon Numarası <span style={{ color: "#C8952A" }}>*</span>
                      </label>
                      <input 
                        className="form-input" 
                        style={{ backgroundColor: "#FFFFFF", color: "#0F2645", borderColor: "#CBD5E1" }}
                        type="tel" 
                        id="phone" 
                        name="phone"
                        placeholder="05xx xxx xx xx"
                        required
                      />
                    </div>

                    {/* E-posta */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ color: "#1C2B3A", fontWeight: "700", fontSize: "13px" }} htmlFor="email">
                        E-posta Adresi <span style={{ color: "#C8952A" }}>*</span>
                      </label>
                      <input 
                        className="form-input" 
                        style={{ backgroundColor: "#FFFFFF", color: "#0F2645", borderColor: "#CBD5E1" }}
                        type="email" 
                        id="email" 
                        name="email"
                        placeholder="ogrenci@domain.com"
                        required
                      />
                    </div>

                  </div>

                  {/* Fotoğraf Yükleme Alanı */}
                  <div className="form-group" style={{ marginTop: "20px", marginBottom: 0 }}>
                    <label className="form-label" style={{ color: "#1C2B3A", fontWeight: "700", fontSize: "13px" }} htmlFor="photo">
                      Öğrenci Profil Fotoğrafı <span style={{ color: "#64748B", fontWeight: "400" }}>(Opsiyonel)</span>
                    </label>
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "20px", 
                      padding: "16px", 
                      backgroundColor: "#F8FAFC", 
                      border: "1px dashed #CBD5E1", 
                      borderRadius: "10px" 
                    }}>
                      {photoPreview ? (
                        <div style={{ width: "64px", height: "64px", borderRadius: "50%", overflow: "hidden", border: "2px solid #C8952A", flexShrink: 0 }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photoPreview} alt="Önizleme" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                      ) : (
                        <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B", flexShrink: 0 }}>
                          <Upload size={24} />
                        </div>
                      )}
                      
                      <div style={{ flexGrow: 1 }}>
                        <input 
                          type="file" 
                          id="photo" 
                          name="photo" 
                          accept="image/*" 
                          onChange={handlePhotoChange}
                          style={{ display: "none" }}
                        />
                        <label 
                          htmlFor="photo" 
                          style={{ 
                            display: "inline-block", 
                            padding: "8px 18px", 
                            backgroundColor: "#0F2645", 
                            color: "#FFFFFF", 
                            borderRadius: "6px", 
                            fontSize: "13px", 
                            fontWeight: "600", 
                            cursor: "pointer",
                            border: "1px solid #0F2645",
                            boxShadow: "0 2px 4px rgba(15, 38, 69, 0.15)"
                          }}
                        >
                          {isUploadingPhoto ? "Fotoğraf Yükleniyor..." : photoDisplayName ? "Fotoğrafı Değiştir" : "Fotoğraf Seç"}
                        </label>
                        <span style={{ marginLeft: "12px", fontSize: "13px", color: "#64748B" }}>
                          {isUploadingPhoto ? "Sunucuya yükleniyor..." : photoDisplayName ? photoDisplayName : "JPG, PNG veya WEBP formatında (Max 5MB)"}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* 2. VELİ BİLGİLERİ */}
                <div style={{ marginBottom: "36px" }}>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "10px", 
                    marginBottom: "20px", 
                    paddingBottom: "12px", 
                    borderBottom: "2px solid #F0DFA8" 
                  }}>
                    <Users size={22} color="#C8952A" />
                    <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0F2645", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      2. Veli İletişim Bilgileri
                    </h3>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
                    
                    {/* Veli Ad Soyad */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ color: "#1C2B3A", fontWeight: "700", fontSize: "13px" }} htmlFor="parentName">
                        Veli Adı Soyadı <span style={{ color: "#C8952A" }}>*</span>
                      </label>
                      <input 
                        className="form-input" 
                        style={{ backgroundColor: "#FFFFFF", color: "#0F2645", borderColor: "#CBD5E1" }}
                        type="text" 
                        id="parentName" 
                        name="parentName"
                        placeholder="Örn: Fatma Demir (Anne/Baba)"
                        required
                      />
                    </div>

                    {/* Veli Telefon */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ color: "#1C2B3A", fontWeight: "700", fontSize: "13px" }} htmlFor="parentPhone">
                        Veli Telefon Numarası <span style={{ color: "#C8952A" }}>*</span>
                      </label>
                      <input 
                        className="form-input" 
                        style={{ backgroundColor: "#FFFFFF", color: "#0F2645", borderColor: "#CBD5E1" }}
                        type="tel" 
                        id="parentPhone" 
                        name="parentPhone"
                        placeholder="05xx xxx xx xx"
                        required
                      />
                    </div>

                  </div>
                </div>

                {/* 3. AKADEMİK BİLGİLER & PUAN TÜRÜ */}
                <div style={{ marginBottom: "36px" }}>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "10px", 
                    marginBottom: "20px", 
                    paddingBottom: "12px", 
                    borderBottom: "2px solid #F0DFA8" 
                  }}>
                    <GraduationCap size={22} color="#C8952A" />
                    <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0F2645", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      3. Sınav Hedefi & Puan Türü
                    </h3>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
                    
                    {/* Sınava Gireceği Puan Türü */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ color: "#1C2B3A", fontWeight: "700", fontSize: "13px" }} htmlFor="scoreType">
                        Sınava Gireceğiniz Puan Türü <span style={{ color: "#C8952A" }}>*</span>
                      </label>
                      <select 
                        className="form-select" 
                        style={{ backgroundColor: "#FFFFFF", color: "#0F2645", borderColor: "#CBD5E1" }}
                        id="scoreType"
                        name="scoreType"
                        defaultValue="SAY"
                        required
                      >
                        <option value="SAY">Sayısal (SAY)</option>
                        <option value="EA">Eşit Ağırlık (EA)</option>
                        <option value="SÖZ">Sözel (SÖZ)</option>
                        <option value="DİL">Dil / YDT</option>
                        <option value="LGS">LGS & Ortaokul (5, 6, 7, 8. Sınıf)</option>
                        <option value="ARA_SINIF">Ara Sınıf (9, 10, 11)</option>
                      </select>
                    </div>

                    {/* Sınıf Düzeyi */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ color: "#1C2B3A", fontWeight: "700", fontSize: "13px" }} htmlFor="grade">
                        Mevcut Sınıf Düzeyi <span style={{ color: "#C8952A" }}>*</span>
                      </label>
                      <select 
                        className="form-select" 
                        style={{ backgroundColor: "#FFFFFF", color: "#0F2645", borderColor: "#CBD5E1" }}
                        id="grade"
                        name="grade"
                        defaultValue="12. Sınıf"
                        required
                      >
                        <option value="5. Sınıf">5. Sınıf (Ortaokul)</option>
                        <option value="6. Sınıf">6. Sınıf (Ortaokul)</option>
                        <option value="7. Sınıf">7. Sınıf (Ortaokul)</option>
                        <option value="8. Sınıf">8. Sınıf (LGS)</option>
                        <option value="9. Sınıf">9. Sınıf</option>
                        <option value="10. Sınıf">10. Sınıf</option>
                        <option value="11. Sınıf">11. Sınıf</option>
                        <option value="12. Sınıf">12. Sınıf</option>
                        <option value="Mezun">Mezun</option>
                      </select>
                    </div>

                    {/* Hedef */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ color: "#1C2B3A", fontWeight: "700", fontSize: "13px" }} htmlFor="target">
                        Hedeflenen Üniversite / Bölüm <span style={{ color: "#C8952A" }}>*</span>
                      </label>
                      <input 
                        className="form-input" 
                        style={{ backgroundColor: "#FFFFFF", color: "#0F2645", borderColor: "#CBD5E1" }}
                        type="text" 
                        id="target" 
                        name="target"
                        placeholder="Örn: Boğaziçi / ODTÜ / İTÜ veya İlk 5.000"
                        required
                      />
                    </div>

                  </div>
                </div>

                {/* 4. İKAMETGAH BİLGİSİ */}
                <div style={{ marginBottom: "36px" }}>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "10px", 
                    marginBottom: "20px", 
                    paddingBottom: "12px", 
                    borderBottom: "2px solid #F0DFA8" 
                  }}>
                    <Home size={22} color="#C8952A" />
                    <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0F2645", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      4. İkametgah & İlçe Bilgileri
                    </h3>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
                    
                    {/* İlçe */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ color: "#1C2B3A", fontWeight: "700", fontSize: "13px" }} htmlFor="currentDistrict">
                        Bulunduğunuz İstanbul İlçesi <span style={{ color: "#C8952A" }}>*</span>
                      </label>
                      <select 
                        className="form-select" 
                        style={{ backgroundColor: "#FFFFFF", color: "#0F2645", borderColor: "#CBD5E1" }}
                        id="currentDistrict"
                        name="currentDistrict"
                        defaultValue="Kadıköy"
                        required
                      >
                        {ALL_DISTRICTS.map((dist) => (
                          <option key={dist} value={dist}>{dist}</option>
                        ))}
                      </select>
                    </div>

                    {/* Açık Adres */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ color: "#1C2B3A", fontWeight: "700", fontSize: "13px" }} htmlFor="currentAddress">
                        Açık Adres / Mahalle / Semt <span style={{ color: "#C8952A" }}>*</span>
                      </label>
                      <input 
                        className="form-input" 
                        style={{ backgroundColor: "#FFFFFF", color: "#0F2645", borderColor: "#CBD5E1" }}
                        type="text" 
                        id="currentAddress" 
                        name="currentAddress"
                        placeholder="Örn: Caferağa Mah. Moda Cad. No: 12"
                        required
                      />
                    </div>

                  </div>
                </div>

                {/* 5. DESTEK ALINACAK DERSLER */}
                <div style={{ marginBottom: "36px" }}>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between", 
                    marginBottom: "8px", 
                    paddingBottom: "12px", 
                    borderBottom: "2px solid #F0DFA8" 
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <BookOpen size={22} color="#C8952A" />
                      <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0F2645", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        5. Koçlukta Ağırlık Verilmesini İstediğiniz Dersler
                      </h3>
                    </div>
                    <span style={{ fontSize: "13px", color: "#0F2645", fontWeight: "700" }}>
                      {selectedSubjects.length} Branş Seçildi
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
                    <button 
                      type="button" 
                      onClick={() => selectAllCategory("TYT")}
                      style={{ padding: "6px 14px", borderRadius: "6px", backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE", color: "#1E40AF", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                    >
                      + Tüm TYT Dersleri
                    </button>
                    <button 
                      type="button" 
                      onClick={() => selectAllCategory("AYT")}
                      style={{ padding: "6px 14px", borderRadius: "6px", backgroundColor: "#FEF3C7", border: "1px solid #FCD34D", color: "#92400E", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                    >
                      + Tüm AYT Dersleri
                    </button>
                    <button 
                      type="button" 
                      onClick={() => selectAllCategory("ORTAOKUL")}
                      style={{ padding: "6px 14px", borderRadius: "6px", backgroundColor: "#EDE9FE", border: "1px solid #DDD6FE", color: "#6D28D9", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                    >
                      + Tüm Ortaokul / LGS Dersleri
                    </button>
                    <button 
                      type="button" 
                      onClick={clearSubjects}
                      style={{ padding: "6px 14px", borderRadius: "6px", backgroundColor: "#F1F5F9", border: "1px solid #CBD5E1", color: "#475569", fontSize: "12px", fontWeight: "600", cursor: "pointer", marginLeft: "auto" }}
                    >
                      Temizle
                    </button>
                  </div>

                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", 
                    gap: "10px", 
                    backgroundColor: "#F8FAFC", 
                    padding: "20px", 
                    borderRadius: "12px", 
                    border: "1px solid #E2E8F0" 
                  }}>
                    {AVAILABLE_SUBJECTS.map((sub) => {
                      const isSelected = selectedSubjects.includes(sub.label);
                      return (
                        <button
                          type="button"
                          key={sub.id}
                          onClick={() => toggleSubject(sub.label)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px 14px",
                            borderRadius: "8px",
                            backgroundColor: isSelected ? "#0F2645" : "#FFFFFF",
                            color: isSelected ? "#FFFFFF" : "#334155",
                            border: isSelected ? "2px solid #C8952A" : "1px solid #CBD5E1",
                            fontSize: "13px",
                            fontWeight: isSelected ? "700" : "500",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            textAlign: "left",
                            boxShadow: isSelected ? "0 4px 10px rgba(15, 38, 69, 0.2)" : "0 1px 2px rgba(0,0,0,0.02)"
                          }}
                        >
                          <span>{sub.label}</span>
                          {isSelected && <Check size={16} color="#C8952A" strokeWidth={3} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 6. MEVCUT DURUM & NOTLAR */}
                <div style={{ marginBottom: "36px" }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ color: "#1C2B3A", fontWeight: "700", fontSize: "13px" }} htmlFor="notes">
                      Mevcut Netleriniz veya Koçunuza İletmek İstediğiniz Notlar
                    </label>
                    <textarea 
                      className="form-textarea" 
                      style={{ backgroundColor: "#FFFFFF", color: "#0F2645", borderColor: "#CBD5E1", minHeight: "100px" }}
                      id="notes" 
                      name="notes"
                      rows={3}
                      placeholder="Örn: TYT denemelerinde ortalama 65 net yapıyorum, AYT Matematikte zorlanıyorum. Haftalık düzenli program ve deneme analiz desteği istiyorum."
                    />
                  </div>
                </div>

                {/* Butonlar */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid #E2E8F0" }}>
                  <button 
                    type="button" 
                    onClick={() => setStep(1)}
                    className="btn btn-secondary"
                    style={{ padding: "12px 24px", fontSize: "14px" }}
                  >
                    ← Koç Seçimine Dön
                  </button>

                  <button 
                    type="submit" 
                    disabled={isPending}
                    className="btn btn-primary"
                    style={{ 
                      padding: "14px 36px", 
                      fontSize: "16px", 
                      fontWeight: "700", 
                      borderRadius: "8px", 
                      boxShadow: "0 6px 18px rgba(200, 149, 42, 0.3)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "10px",
                      cursor: isPending ? "not-allowed" : "pointer"
                    }}
                  >
                    <Sparkles size={18} />
                    {isPending ? "Başvurunuz İletiliyor..." : "Koçluk Başvurusunu Tamamla"}
                  </button>
                </div>

              </form>
            )}

          </div>

        </div>
      </main>

      <footer style={{ marginTop: "40px", textAlign: "center", fontSize: "12px", color: "#94A3B8" }}>
        © 2026 Pont Academy. Kişiye Özel Eğitim Koçluğu Sistemi.
      </footer>
    </div>
  );
}
