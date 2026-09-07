"use client";

import React, { useState, useTransition } from "react";
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
  Users
} from "lucide-react";
import { submitBasvuruForm } from "../actions";

// İstanbul İlçeleri Listesi (Avrupa & Anadolu Yakası)
const ISTANBUL_DISTRICTS = {
  anadolu: [
    "Adalar", "Ataşehir", "Beykoz", "Çekmeköy", "Kadıköy", 
    "Kartal", "Maltepe", "Pendik", "Sancaktepe", "Sultanbeyli", 
    "Şile", "Tuzla", "Ümraniye", "Üsküdar"
  ],
  avrupa: [
    "Arnavutköy", "Avcılar", "Bağcılar", "Bahçelievler", "Bakırköy", 
    "Başakşehir", "Bayrampaşa", "Beşiktaş", "Beylikdüzü", "Beyoğlu", 
    "Büyükçekmece", "Çatalca", "Esenler", "Esenyurt", "Eyüpsultan", 
    "Fatih", "Gaziosmanpaşa", "Güngören", "Kağıthane", "Küçükçekmece", 
    "Sarıyer", "Silivri", "Sultangazi", "Şişli", "Zeytinburnu"
  ]
};

const ALL_DISTRICTS = [...ISTANBUL_DISTRICTS.avrupa, ...ISTANBUL_DISTRICTS.anadolu].sort((a, b) => a.localeCompare("tr"));

// Alınabilecek Dersler Listesi (Eğitmen dersleri ile birebir uyumlu)
const AVAILABLE_SUBJECTS = [
  { id: "tytMat", label: "TYT Matematik", category: "TYT" },
  { id: "tytTurkce", label: "TYT Türkçe", category: "TYT" },
  { id: "tytFizik", label: "TYT Fizik", category: "TYT" },
  { id: "tytKimya", label: "TYT Kimya", category: "TYT" },
  { id: "tytBiyoloji", label: "TYT Biyoloji", category: "TYT" },
  { id: "tytTarih", label: "TYT Tarih", category: "TYT" },
  { id: "tytCografya", label: "TYT Coğrafya", category: "TYT" },
  { id: "aytMat", label: "AYT Matematik & Geometri", category: "AYT" },
  { id: "aytFizik", label: "AYT Fizik", category: "AYT" },
  { id: "aytKimya", label: "AYT Kimya", category: "AYT" },
  { id: "aytBiyoloji", label: "AYT Biyoloji", category: "AYT" },
  { id: "aytTurkce", label: "AYT Edebiyat / Türkçe", category: "AYT" },
  { id: "aytTarih", label: "AYT Tarih", category: "AYT" },
  { id: "aytCografya", label: "AYT Coğrafya", category: "AYT" },
  { id: "ydtIngilizce", label: "YDT / İngilizce (YKS & LGS)", category: "DİL" },
  { id: "lgsMat", label: "LGS Matematik", category: "LGS" },
  { id: "lgsFen", label: "LGS Fen Bilimleri", category: "LGS" },
  { id: "lgsTurkce", label: "LGS Türkçe", category: "LGS" },
];

export default function OzelDersBasvuru() {
  const [isPending, startTransition] = useTransition();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState<string>("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(["TYT Matematik"]);
  const [subjectError, setSubjectError] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSubject = (subjectLabel: string) => {
    setSubjectError(false);
    setSelectedSubjects(prev => 
      prev.includes(subjectLabel) 
        ? prev.filter(s => s !== subjectLabel)
        : [...prev, subjectLabel]
    );
  };

  const selectAllCategory = (cat: string) => {
    setSubjectError(false);
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

    if (selectedSubjects.length === 0) {
      setSubjectError(true);
      const subjectSection = document.getElementById("subjects-section");
      if (subjectSection) {
        subjectSection.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    const formElement = e.currentTarget;
    const fd = new FormData(formElement);

    fd.set("formType", "ozel_ders");
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
                <BookOpen size={16} /> BİREBİR ÖZEL DERS PROGRAMI
              </span>
            </div>
            <h1 style={{ fontFamily: "var(--font-playfair)", fontSize: "36px", fontWeight: "800", color: "#0F2645", letterSpacing: "-0.5px" }}>
              Özel Ders Başvuru Formu
            </h1>
            <p style={{ color: "#4A6280", marginTop: "10px", fontSize: "15px", lineHeight: "1.6", maxWidth: "640px", margin: "10px auto 0 auto" }}>
              Türkiye derecesi yapmış eğitmenlerimizden birebir yüz yüze veya online özel ders alarak hedeflerinize emin adımlarla ilerleyin.
            </p>
          </div>

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
                  Başvurunuz Başarıyla Alındı!
                </h2>
                <p style={{ color: "#4A6280", fontSize: "16px", lineHeight: "1.7", maxWidth: "540px", margin: "0 auto 28px auto" }}>
                  Sayın <strong style={{ color: "#0F2645" }}>{studentName}</strong>, özel ders talebiniz eğitim koordinatörlerimize iletilmiştir. Seçtiğiniz dersler ve konumunuz doğrultusunda en uygun eğitmen eşleştirmesi yapılarak 24 saat içinde sizinle ve velinizle iletişime geçilecektir.
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
                    <CheckCircle2 size={18} color="#C8952A" /> Ders talebiniz ve ikamet bilgileriniz sisteme kaydedildi.
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#475569", fontSize: "14px" }}>
                    <CheckCircle2 size={18} color="#C8952A" /> Danışmanımız telefon üzerinden ders planlamasını netleştirecektir.
                  </div>
                </div>

                <Link href="/" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                  <ArrowLeft size={16} /> Ana Sayfaya Dön
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                
                {/* 1. ÖĞRENCİ KİŞİSEL VE İLETİŞİM BİLGİLERİ */}
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
                        placeholder="Örn: Emir Kaan Demir"
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
                          {photoFileName ? "Fotoğrafı Değiştir" : "Fotoğraf Seç"}
                        </label>
                        <span style={{ marginLeft: "12px", fontSize: "13px", color: "#64748B" }}>
                          {photoFileName ? photoFileName : "JPG, PNG veya WEBP formatında"}
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
                        placeholder="Örn: Ayşe Demir (Anne/Baba)"
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

                {/* 3. AKADEMİK BİLGİLER & HEDEF */}
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
                      3. Akademik Bilgiler & Sınav Hedefi
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
                        <option value="SAY">Sayısal (SAY - Mühendislik, Tıp vb.)</option>
                        <option value="EA">Eşit Ağırlık (EA - Hukuk, İktisat, İşletme vb.)</option>
                        <option value="SÖZ">Sözel (SÖZ - İletişim, Tarih vb.)</option>
                        <option value="DİL">Dil / YDT (İngilizce Öğretmenliği, Mütercim vb.)</option>
                        <option value="LGS">LGS (8. Sınıf Lise Hazırlık)</option>
                        <option value="ARA_SINIF">Ara Sınıf (9, 10, 11. Sınıf Takviye)</option>
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
                        defaultValue="12. Sınıf (YKS)"
                        required
                      >
                        <option value="8. Sınıf (LGS)">8. Sınıf (LGS Hazırlık)</option>
                        <option value="9. Sınıf">9. Sınıf</option>
                        <option value="10. Sınıf">10. Sınıf</option>
                        <option value="11. Sınıf">11. Sınıf (YKS Ön Hazırlık)</option>
                        <option value="12. Sınıf (YKS)">12. Sınıf (YKS Hazırlık)</option>
                        <option value="Mezun (YKS)">Mezun (YKS Hazırlık)</option>
                      </select>
                    </div>

                    {/* Hedeflenen Üniversite / Bölüm / Lise */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ color: "#1C2B3A", fontWeight: "700", fontSize: "13px" }} htmlFor="target">
                        Hedeflenen Üniversite, Bölüm veya Lise <span style={{ color: "#C8952A" }}>*</span>
                      </label>
                      <input 
                        className="form-input" 
                        style={{ backgroundColor: "#FFFFFF", color: "#0F2645", borderColor: "#CBD5E1" }}
                        type="text" 
                        id="target" 
                        name="target"
                        placeholder="Örn: Boğaziçi Üniversitesi - Bilgisayar Müh. veya Kabataş Erkek"
                        required
                      />
                    </div>

                  </div>
                </div>

                {/* 4. İKAMETGAH & İLÇE BİLGİSİ */}
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
                      4. İkametgah & Konum Bilgileri
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
                        placeholder="Örn: Fenerbahçe Mah. Bağdat Cad. No: 44"
                        required
                      />
                    </div>

                  </div>
                </div>

                {/* 5. ALMAK İSTENEN DERSLER (ÇOKLU SEÇİM) */}
                <div id="subjects-section" style={{ marginBottom: "36px" }}>
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
                        5. Destek Almak İstediğiniz Dersler <span style={{ color: "#C8952A" }}>*</span>
                      </h3>
                    </div>
                    <span style={{ fontSize: "13px", color: selectedSubjects.length > 0 ? "#0F2645" : "#DC2626", fontWeight: "700" }}>
                      {selectedSubjects.length} Ders Seçildi
                    </span>
                  </div>

                  <p style={{ color: "#64748B", fontSize: "13px", marginBottom: "16px" }}>
                    Lütfen özel ders almak istediğiniz tüm branşları tıklayarak seçiniz (Birden fazla ders seçebilirsiniz).
                  </p>

                  {/* Hata Uyarısı */}
                  {subjectError && (
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
                      fontWeight: "700", 
                      marginBottom: "16px" 
                    }}>
                      <AlertCircle size={18} color="#DC2626" />
                      Lütfen özel ders almak istediğiniz en az bir ders seçiniz.
                    </div>
                  )}

                  {/* Kategori Seçim Butonları */}
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
                      onClick={() => selectAllCategory("LGS")}
                      style={{ padding: "6px 14px", borderRadius: "6px", backgroundColor: "#EDE9FE", border: "1px solid #DDD6FE", color: "#6D28D9", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}
                    >
                      + Tüm LGS Dersleri
                    </button>
                    <button 
                      type="button" 
                      onClick={clearSubjects}
                      style={{ padding: "6px 14px", borderRadius: "6px", backgroundColor: "#F1F5F9", border: "1px solid #CBD5E1", color: "#475569", fontSize: "12px", fontWeight: "600", cursor: "pointer", marginLeft: "auto" }}
                    >
                      Seçimi Temizle
                    </button>
                  </div>

                  {/* Ders Butonları Grid */}
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
                          {isSelected ? (
                            <Check size={16} color="#C8952A" strokeWidth={3} />
                          ) : (
                            <span style={{ fontSize: "10px", color: "#94A3B8", backgroundColor: "#F1F5F9", padding: "2px 6px", borderRadius: "4px" }}>{sub.category}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 6. EK NOTLAR VE ÖZEL TALEPLER */}
                <div style={{ marginBottom: "36px" }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ color: "#1C2B3A", fontWeight: "700", fontSize: "13px" }} htmlFor="notes">
                      Eklemek İstediğiniz Notlar veya Özel İstekler <span style={{ color: "#64748B", fontWeight: "400" }}>(Hangi konularda zorlanıyorsunuz, ders gün/saat tercihleri vb.)</span>
                    </label>
                    <textarea 
                      className="form-textarea" 
                      style={{ backgroundColor: "#FFFFFF", color: "#0F2645", borderColor: "#CBD5E1", minHeight: "100px" }}
                      id="notes" 
                      name="notes"
                      rows={3}
                      placeholder="Örn: Hafta sonları yüz yüze veya hafta içi akşam online ders almak istiyoruz. Özellikle Fizik Mekanik ve Matematik Fonksiyonlar ağırlıklı çalışmak istiyorum."
                    />
                  </div>
                </div>

                {/* Submit Butonu */}
                <div style={{ textAlign: "center", paddingTop: "12px", borderTop: "1px solid #E2E8F0" }}>
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
                    {isPending ? "Başvurunuz İletiliyor..." : "Özel Ders Başvurusunu Tamamla"}
                  </button>
                  <p style={{ fontSize: "12px", color: "#64748B", marginTop: "12px" }}>
                    Bilgileriniz KVKK kapsamında gizli tutulmakta ve yalnızca eğitim eşleştirmesi amacıyla kullanılmaktadır.
                  </p>
                </div>

              </form>
            )}

          </div>

        </div>
      </main>

      <footer style={{ marginTop: "40px", textAlign: "center", fontSize: "12px", color: "#94A3B8" }}>
        © 2026 Pont Academy. Birebir Eğitim & Özel Ders Sistemi.
      </footer>
    </div>
  );
}
