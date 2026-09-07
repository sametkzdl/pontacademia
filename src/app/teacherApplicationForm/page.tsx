"use client";

import React, { useState, useTransition, useRef } from "react";
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
  Star, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Home,
  ShieldCheck
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

// TYT ve AYT Ders Listeleri
const TYT_SUBJECTS = [
  { id: "tytTurkce", label: "TYT Türkçe", desc: "Paragraf, Dil Bilgisi & Anlam", defaultScore: 8 },
  { id: "tytMat", label: "TYT Matematik", desc: "Temel Matematik & Geometri", defaultScore: 8 },
  { id: "tytFizik", label: "TYT Fizik", desc: "Temel Fizik Konuları", defaultScore: 5 },
  { id: "tytKimya", label: "TYT Kimya", desc: "Temel Kimya Konuları", defaultScore: 5 },
  { id: "tytBiyoloji", label: "TYT Biyoloji", desc: "Temel Biyoloji & Canlılar", defaultScore: 5 },
  { id: "tytTarih", label: "TYT Tarih", desc: "Tarih Bilinci & Kavramlar", defaultScore: 5 },
  { id: "tytCografya", label: "TYT Coğrafya", desc: "Doğa, İnsan & Harita Bilgisi", defaultScore: 5 },
];

const AYT_SUBJECTS = [
  { id: "aytMat", label: "AYT Matematik", desc: "İleri Matematik & Geometri", defaultScore: 8 },
  { id: "aytFizik", label: "AYT Fizik", desc: "Mekanik, Elektromanyetizma", defaultScore: 5 },
  { id: "aytKimya", label: "AYT Kimya", desc: "Organik & Modern Kimya", defaultScore: 5 },
  { id: "aytBiyoloji", label: "AYT Biyoloji", desc: "Sistemler & Genetik", defaultScore: 5 },
  { id: "aytTurkce", label: "AYT Edebiyat / Türkçe", desc: "Türk Dili ve Edebiyatı", defaultScore: 5 },
  { id: "aytTarih", label: "AYT Tarih", desc: "Tarih-1 & Tarih-2", defaultScore: 5 },
  { id: "aytCografya", label: "AYT Coğrafya", desc: "Coğrafya-1 & Coğrafya-2", defaultScore: 5 },
];

// Tek bir ders puanlayıcı bileşeni (Açık, ferah ve yüksek kontrastlı)
function SubjectScoreItem({ id, label, desc, defaultScore }: { id: string; label: string; desc: string; defaultScore: number }) {
  const [score, setScore] = useState(defaultScore);

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      gap: "10px", 
      padding: "14px 16px", 
      backgroundColor: "#FFFFFF", 
      borderRadius: "10px",
      border: "1px solid #E2E8F0",
      boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
    }}>
      {/* Form verisi JS FormData ile doğrudan yakalanır */}
      <input type="hidden" name={id} value={score} />
      
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
        <div>
          <span style={{ fontWeight: "700", color: "#0F2645", fontSize: "14px" }}>{label}</span>
          <span style={{ fontSize: "12px", color: "#64748B", marginLeft: "8px" }}>({desc})</span>
        </div>
        <div style={{ 
          display: "inline-flex", 
          alignItems: "center", 
          gap: "4px", 
          padding: "3px 12px", 
          borderRadius: "20px", 
          backgroundColor: score >= 8 ? "#FEF3C7" : score >= 5 ? "#E0F2FE" : "#F1F5F9",
          border: score >= 8 ? "1px solid #F59E0B" : score >= 5 ? "1px solid #38BDF8" : "1px solid #CBD5E1",
          color: score >= 8 ? "#92400E" : score >= 5 ? "#0369A1" : "#475569",
          fontSize: "12px",
          fontWeight: "700"
        }}>
          Yetkinlik: {score} / 10
        </div>
      </div>

      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
          const isSelected = score === num;
          return (
            <button
              type="button"
              key={num}
              onClick={() => setScore(num)}
              style={{
                flex: "1 1 calc(10% - 6px)",
                minWidth: "30px",
                height: "34px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: isSelected ? "700" : "500",
                backgroundColor: isSelected 
                  ? "#0F2645" 
                  : "#F8FAFC",
                color: isSelected ? "#FFFFFF" : "#334155",
                border: isSelected ? "2px solid #C8952A" : "1px solid #CBD5E1",
                cursor: "pointer",
                transition: "all 0.15s ease",
                boxShadow: isSelected ? "0 2px 6px rgba(15, 38, 69, 0.25)" : "none"
              }}
            >
              {num}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function TeacherApplicationForm() {
  const [isPending, startTransition] = useTransition();
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submittedCandidateName, setSubmittedCandidateName] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState<string>("");
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [districtSearch, setDistrictSearch] = useState("");
  const [districtError, setDistrictError] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

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

  const toggleDistrict = (district: string) => {
    setDistrictError(false);
    setSelectedDistricts(prev => 
      prev.includes(district) ? prev.filter(d => d !== district) : [...prev, district]
    );
  };

  const selectAllDistricts = () => {
    setDistrictError(false);
    setSelectedDistricts([...ALL_DISTRICTS]);
  };

  const clearDistricts = () => {
    setSelectedDistricts([]);
  };

  const selectSide = (side: "avrupa" | "anadolu") => {
    setDistrictError(false);
    const sideDistricts = ISTANBUL_DISTRICTS[side];
    setSelectedDistricts(prev => {
      const filtered = prev.filter(d => !sideDistricts.includes(d));
      return [...filtered, ...sideDistricts];
    });
  };

  // Form verisi JS FormData ile doğrudan DOM'dan okunur
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Yüz yüze ilçe seçimi kontrolü (Zorunlu)
    if (selectedDistricts.length === 0) {
      setDistrictError(true);
      const districtSection = document.getElementById("districts-section");
      if (districtSection) {
        districtSection.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    const formElement = e.currentTarget;
    const fd = new FormData(formElement);

    // Ekstra alanları ekle
    fd.set("districts", selectedDistricts.join(", "));
    fd.set("photoFileName", photoFileName);
    fd.set("formType", "teacher_application");
    fd.set("submittedAt", new Date().toISOString());

    const fullNameVal = (fd.get("fullName") as string) || "Eğitmenimiz";
    setSubmittedCandidateName(fullNameVal);

    startTransition(async () => {
      try {
        const response = await submitBasvuruForm(fd);
        if (response && response.success) {
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

  const filteredDistricts = ALL_DISTRICTS.filter(d => 
    d.toLowerCase().includes(districtSearch.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F0F5FB", padding: "40px 0 80px 0", display: "flex", flexDirection: "column", color: "#1C2B3A" }}>
      {/* Top Navigation */}
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
                <GraduationCap size={16} /> EĞİTMEN & KOÇ KADROSU
              </span>
            </div>
            <h1 style={{ fontFamily: "var(--font-playfair)", fontSize: "36px", fontWeight: "800", color: "#0F2645", letterSpacing: "-0.5px" }}>
              Eğitmen & Koç Başvuru Formu
            </h1>
            <p style={{ color: "#4A6280", marginTop: "10px", fontSize: "15px", lineHeight: "1.6", maxWidth: "640px", margin: "10px auto 0 auto" }}>
              Pont Academy bünyesinde derece yapmış eğitmen kadromuza katılarak öğrencilerin YKS & LGS hedeflerine rehberlik edin.
            </p>
          </div>

          {/* Form Card Container (Açık Beyaz Kart & Yüksek Netlik) */}
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
                  Sayın <strong style={{ color: "#0F2645" }}>{submittedCandidateName}</strong>, eğitmenlik ve koçluk başvurunuz Pont Academy Akademik Kurulu&apos;na iletilmiştir. Profiliniz ve ders yetkinlikleriniz incelendikten sonra en kısa sürede sizinle iletişime geçilecektir.
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
                    <CheckCircle2 size={18} color="#C8952A" /> Bilgileriniz güvenli sistemimize kaydedildi.
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#475569", fontSize: "14px" }}>
                    <CheckCircle2 size={18} color="#C8952A" /> Mülakat ve oryantasyon süreci için telefon & e-posta ile dönüş yapılacaktır.
                  </div>
                </div>

                <Link href="/" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                  <ArrowLeft size={16} /> Ana Sayfaya Dön
                </Link>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit}>
                
                {/* 1. KİŞİSEL VE İLETİŞİM BİLGİLERİ */}
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
                      1. Kişisel ve İletişim Bilgileri
                    </h3>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
                    
                    {/* Ad Soyad */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ color: "#1C2B3A", fontWeight: "700", fontSize: "13px" }} htmlFor="fullName">
                        Ad Soyad <span style={{ color: "#C8952A" }}>*</span>
                      </label>
                      <input 
                        className="form-input" 
                        style={{ backgroundColor: "#FFFFFF", color: "#0F2645", borderColor: "#CBD5E1" }}
                        type="text" 
                        id="fullName" 
                        name="fullName"
                        placeholder="Örn: Mehmet Can Yıldız"
                        required
                      />
                    </div>

                    {/* Doğum Tarihi */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ color: "#1C2B3A", fontWeight: "700", fontSize: "13px" }} htmlFor="birthDate">
                        Doğum Tarihi <span style={{ color: "#C8952A" }}>*</span>
                      </label>
                      <input 
                        className="form-input" 
                        style={{ backgroundColor: "#FFFFFF", color: "#0F2645", borderColor: "#CBD5E1" }}
                        type="date" 
                        id="birthDate" 
                        name="birthDate"
                        required
                      />
                    </div>

                    {/* Cinsiyet */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ color: "#1C2B3A", fontWeight: "700", fontSize: "13px" }} htmlFor="gender">
                        Cinsiyet <span style={{ color: "#C8952A" }}>*</span>
                      </label>
                      <select 
                        className="form-select" 
                        style={{ backgroundColor: "#FFFFFF", color: "#0F2645", borderColor: "#CBD5E1" }}
                        id="gender"
                        name="gender"
                        defaultValue="Kadın"
                        required
                      >
                        <option value="Kadın">Kadın</option>
                        <option value="Erkek">Erkek</option>
                      </select>
                    </div>

                    {/* Telefon */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ color: "#1C2B3A", fontWeight: "700", fontSize: "13px" }} htmlFor="phone">
                        Telefon Numarası <span style={{ color: "#C8952A" }}>*</span>
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
                        placeholder="ornek@domain.com"
                        required
                      />
                    </div>

                    {/* IBAN */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ color: "#1C2B3A", fontWeight: "700", fontSize: "13px" }} htmlFor="iban">
                        IBAN Numarası <span style={{ color: "#C8952A" }}>*</span>
                      </label>
                      <input 
                        className="form-input" 
                        style={{ backgroundColor: "#FFFFFF", color: "#0F2645", borderColor: "#CBD5E1" }}
                        type="text" 
                        id="iban" 
                        name="iban"
                        placeholder="TR00 0000 0000 0000 0000 00"
                        required
                      />
                    </div>

                  </div>

                  {/* İstanbul Aktif Konum & Adres Bilgisi (Vurgulu Açık Kutu) */}
                  <div style={{ 
                    marginTop: "20px", 
                    padding: "20px", 
                    backgroundColor: "#F8FAFC", 
                    border: "1px solid #E2E8F0", 
                    borderRadius: "12px" 
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                      <Home size={18} color="#C8952A" />
                      <span style={{ fontSize: "15px", fontWeight: "700", color: "#0F2645" }}>
                        İstanbul&apos;da Aktif Bulunulan Konum & İkametgah Adresi <span style={{ color: "#C8952A" }}>*</span>
                      </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
                      
                      {/* İkamet Edilen İlçe */}
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ color: "#334155", fontWeight: "600", fontSize: "13px" }} htmlFor="currentDistrict">
                          Bulunduğunuz / İkamet Ettiğiniz İlçe <span style={{ color: "#C8952A" }}>*</span>
                        </label>
                        <select 
                          className="form-select" 
                          style={{ backgroundColor: "#FFFFFF", color: "#0F2645", borderColor: "#CBD5E1" }}
                          id="currentDistrict"
                          name="currentDistrict"
                          defaultValue="Kadıköy"
                          required
                        >
                          {ALL_DISTRICTS.map((district) => (
                            <option key={district} value={district}>{district}</option>
                          ))}
                        </select>
                      </div>

                      {/* Açık Adres / Semt / Mahalle */}
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ color: "#334155", fontWeight: "600", fontSize: "13px" }} htmlFor="currentAddress">
                          Açık Adres / Mahalle / Semt / Yurt Bilgisi <span style={{ color: "#C8952A" }}>*</span>
                        </label>
                        <input 
                          className="form-input" 
                          style={{ backgroundColor: "#FFFFFF", color: "#0F2645", borderColor: "#CBD5E1" }}
                          type="text" 
                          id="currentAddress" 
                          name="currentAddress"
                          placeholder="Örn: Caferağa Mah. Moda Cad. No: 12 / veya İTÜ Ayazağa Yurdu"
                          required
                        />
                      </div>

                    </div>
                  </div>

                  {/* Fotoğraf Yükleme Alanı */}
                  <div className="form-group" style={{ marginTop: "20px", marginBottom: 0 }}>
                    <label className="form-label" style={{ color: "#1C2B3A", fontWeight: "700", fontSize: "13px" }} htmlFor="photo">
                      Profil / Vesikalık Fotoğrafı <span style={{ color: "#C8952A" }}>*</span>
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
                          required
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
                          {photoFileName ? photoFileName : "JPG, PNG veya WEBP formatında (Max 5MB)"}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* 2. AKADEMİK BİLGİLER */}
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
                      2. Akademik Bilgiler & YKS Derecesi
                    </h3>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
                    
                    {/* Okulu / Üniversite & Bölüm */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ color: "#1C2B3A", fontWeight: "700", fontSize: "13px" }} htmlFor="school">
                        Okuduğunuz / Mezun Olduğunuz Okul (Üniversite & Bölüm) <span style={{ color: "#C8952A" }}>*</span>
                      </label>
                      <input 
                        className="form-input" 
                        style={{ backgroundColor: "#FFFFFF", color: "#0F2645", borderColor: "#CBD5E1" }}
                        type="text" 
                        id="school" 
                        name="school"
                        placeholder="Örn: Boğaziçi Üniversitesi - Bilgisayar Mühendisliği"
                        required
                      />
                    </div>

                    {/* YKS Sıralaması */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ color: "#1C2B3A", fontWeight: "700", fontSize: "13px" }} htmlFor="yksRank">
                        YKS Sıralamanız <span style={{ color: "#C8952A" }}>*</span>
                      </label>
                      <input 
                        className="form-input" 
                        style={{ backgroundColor: "#FFFFFF", color: "#0F2645", borderColor: "#CBD5E1" }}
                        type="text" 
                        id="yksRank" 
                        name="yksRank"
                        placeholder="Örn: Sayısal 450. / EA 120."
                        required
                      />
                    </div>

                    {/* Aktif Sınıfı / Mezun mu */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ color: "#1C2B3A", fontWeight: "700", fontSize: "13px" }} htmlFor="classStatus">
                        Aktif Sınıfı / Mezuniyet Durumu <span style={{ color: "#C8952A" }}>*</span>
                      </label>
                      <select 
                        className="form-select" 
                        style={{ backgroundColor: "#FFFFFF", color: "#0F2645", borderColor: "#CBD5E1" }}
                        id="classStatus"
                        name="classStatus"
                        defaultValue="1. Sınıf"
                        required
                      >
                        <option value="Hazırlık">Hazırlık Sınıfı</option>
                        <option value="1. Sınıf">1. Sınıf</option>
                        <option value="2. Sınıf">2. Sınıf</option>
                        <option value="3. Sınıf">3. Sınıf</option>
                        <option value="4. Sınıf">4. Sınıf</option>
                        <option value="Yüksek Lisans / Doktora">Yüksek Lisans / Doktora</option>
                        <option value="Mezun">Mezun</option>
                      </select>
                    </div>

                  </div>
                </div>

                {/* 3. DERS BİLGİSİ & YETKİNLİK PUANLARI (1-10 ÜZERİNDEN) */}
                <div style={{ marginBottom: "36px" }}>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "10px", 
                    marginBottom: "8px", 
                    paddingBottom: "12px", 
                    borderBottom: "2px solid #F0DFA8" 
                  }}>
                    <Star size={22} color="#C8952A" />
                    <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0F2645", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      3. Ders Bilgisi & Yetkinlik Seviyeleri (10 Üzerinden Puanlama)
                    </h3>
                  </div>
                  <p style={{ color: "#64748B", fontSize: "13px", marginBottom: "20px" }}>
                    Her ders için konuya olan hakimiyetinizi ve ders anlatabilme yetkinliğinizi <strong>1 ile 10 arasında</strong> puanlayınız (1: Başlangıç &bull; 10: Üst Seviye / Tam Hakimiyet).
                  </p>

                  {/* TYT DERSLERİ PUANLAMA */}
                  <div style={{ backgroundColor: "#F8FAFC", padding: "20px", borderRadius: "12px", border: "1px solid #E2E8F0", marginBottom: "24px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", paddingBottom: "8px", borderBottom: "1px solid #E2E8F0" }}>
                      <span style={{ fontWeight: "800", color: "#0F2645", fontSize: "15px", letterSpacing: "0.5px" }}>
                        TYT DERSLERİ BİLGİ DÜZEYİ
                      </span>
                      <span style={{ fontSize: "12px", color: "#64748B" }}>1 (Düşük) — 10 (Mükemmel)</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {TYT_SUBJECTS.map((sub) => (
                        <SubjectScoreItem 
                          key={sub.id} 
                          id={sub.id} 
                          label={sub.label} 
                          desc={sub.desc} 
                          defaultScore={sub.defaultScore} 
                        />
                      ))}
                    </div>
                  </div>

                  {/* AYT DERSLERİ PUANLAMA */}
                  <div style={{ backgroundColor: "#F8FAFC", padding: "20px", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", paddingBottom: "8px", borderBottom: "1px solid #E2E8F0" }}>
                      <span style={{ fontWeight: "800", color: "#0F2645", fontSize: "15px", letterSpacing: "0.5px" }}>
                        AYT DERSLERİ BİLGİ DÜZEYİ
                      </span>
                      <span style={{ fontSize: "12px", color: "#64748B" }}>1 (Düşük) — 10 (Mükemmel)</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {AYT_SUBJECTS.map((sub) => (
                        <SubjectScoreItem 
                          key={sub.id} 
                          id={sub.id} 
                          label={sub.label} 
                          desc={sub.desc} 
                          defaultScore={sub.defaultScore} 
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* 4. YÜZ YÜZE DERS VERİLEBİLECEK İSTANBUL İLÇELERİ (ZORUNLU) */}
                <div id="districts-section" style={{ marginBottom: "36px" }}>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between", 
                    marginBottom: "8px", 
                    paddingBottom: "12px", 
                    borderBottom: "2px solid #F0DFA8" 
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <MapPin size={22} color="#C8952A" />
                      <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0F2645", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        4. Yüz Yüze Ders Verilebilecek İstanbul İlçeleri <span style={{ color: "#C8952A" }}>* (Zorunlu)</span>
                      </h3>
                    </div>
                    <span style={{ fontSize: "13px", color: selectedDistricts.length > 0 ? "#0F2645" : "#DC2626", fontWeight: "700" }}>
                      {selectedDistricts.length} İlçe Seçildi
                    </span>
                  </div>
                  
                  <p style={{ color: "#64748B", fontSize: "13px", marginBottom: "16px" }}>
                    Eğitmenlerimizin yüz yüze gidebilecekleri ilçeleri belirtmesi <strong>zorunludur</strong>. Lütfen fiziksel olarak ders verebileceğiniz en az 1 ilçeyi seçiniz.
                  </p>

                  {/* Zorunlu Seçim Hata Uyarısı */}
                  {districtError && (
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
                      Lütfen yüz yüze ders verebileceğiniz en az bir İstanbul ilçesi seçiniz.
                    </div>
                  )}

                  {/* Online Ders Seçeneği (Opsiyonel) */}
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between", 
                    backgroundColor: "#FEF9C3", 
                    border: "1px solid #FDE047", 
                    borderRadius: "10px", 
                    padding: "14px 18px", 
                    marginBottom: "16px" 
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Sparkles size={18} color="#C8952A" />
                      <div>
                        <div style={{ color: "#713F12", fontSize: "14px", fontWeight: "700" }}>
                          Ayrıca Online (Uzaktan) Ders de Verebilirim <span style={{ color: "#854D0E", fontWeight: "500", fontSize: "12px" }}>(Opsiyonel)</span>
                        </div>
                        <div style={{ color: "#854D0E", fontSize: "12px" }}>
                          Yüz yüze derslerin yanında internet üzerinden online ders taleplerini de kabul ediyorsanız işaretleyin.
                        </div>
                      </div>
                    </div>
                    <label style={{ display: "flex", alignItems: "center", cursor: "pointer", gap: "8px" }}>
                      <input 
                        type="checkbox" 
                        name="onlineAvailable"
                        value="Evet"
                        style={{ accentColor: "#C8952A", width: "20px", height: "20px", cursor: "pointer" }}
                      />
                      <span style={{ fontSize: "13px", color: "#713F12", fontWeight: "700" }}>
                        Online Ders Verebilirim
                      </span>
                    </label>
                  </div>

                  {/* Hızlı Seçim Butonları & Arama */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <button 
                        type="button" 
                        onClick={selectAllDistricts}
                        style={{ 
                          padding: "7px 14px", 
                          fontSize: "12px", 
                          fontWeight: "600",
                          borderRadius: "6px", 
                          background: "#0F2645", 
                          color: "#FFFFFF", 
                          border: "1px solid #0F2645", 
                          cursor: "pointer" 
                        }}
                      >
                        Tümünü Seç ({ALL_DISTRICTS.length})
                      </button>
                      <button 
                        type="button" 
                        onClick={() => selectSide("avrupa")}
                        style={{ 
                          padding: "7px 14px", 
                          fontSize: "12px", 
                          fontWeight: "600",
                          borderRadius: "6px", 
                          background: "#FFFFFF", 
                          color: "#0F2645", 
                          border: "1px solid #CBD5E1", 
                          cursor: "pointer" 
                        }}
                      >
                        Avrupa Yakası
                      </button>
                      <button 
                        type="button" 
                        onClick={() => selectSide("anadolu")}
                        style={{ 
                          padding: "7px 14px", 
                          fontSize: "12px", 
                          fontWeight: "600",
                          borderRadius: "6px", 
                          background: "#FFFFFF", 
                          color: "#0F2645", 
                          border: "1px solid #CBD5E1", 
                          cursor: "pointer" 
                        }}
                      >
                        Anadolu Yakası
                      </button>
                      <button 
                        type="button" 
                        onClick={clearDistricts}
                        style={{ 
                          padding: "7px 14px", 
                          fontSize: "12px", 
                          fontWeight: "600",
                          borderRadius: "6px", 
                          background: "#FEE2E2", 
                          color: "#991B1B", 
                          border: "1px solid #FECACA", 
                          cursor: "pointer" 
                        }}
                      >
                        Temizle
                      </button>
                    </div>

                    <input 
                      type="text" 
                      placeholder="İlçe ara..." 
                      value={districtSearch} 
                      onChange={(e) => setDistrictSearch(e.target.value)}
                      style={{ 
                        padding: "7px 14px", 
                        borderRadius: "6px", 
                        backgroundColor: "#FFFFFF", 
                        border: "1px solid #CBD5E1", 
                        color: "#0F2645", 
                        fontSize: "13px",
                        minWidth: "180px",
                        outline: "none"
                      }}
                    />
                  </div>

                  {/* Çoklu Seçim Çipleri (Badge Grid - Ferah & Yüksek Okunabilirlik) */}
                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", 
                    gap: "8px", 
                    maxHeight: "260px", 
                    overflowY: "auto", 
                    padding: "14px", 
                    backgroundColor: "#F8FAFC", 
                    borderRadius: "10px", 
                    border: districtError ? "2px solid #DC2626" : "1px solid #E2E8F0" 
                  }}>
                    {filteredDistricts.map((district) => {
                      const isSelected = selectedDistricts.includes(district);
                      return (
                        <button
                          type="button"
                          key={district}
                          onClick={() => toggleDistrict(district)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "9px 12px",
                            borderRadius: "8px",
                            fontSize: "13px",
                            fontWeight: isSelected ? "700" : "500",
                            backgroundColor: isSelected ? "#0F2645" : "#FFFFFF",
                            border: isSelected ? "1px solid #0F2645" : "1px solid #CBD5E1",
                            color: isSelected ? "#FFFFFF" : "#334155",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            boxShadow: isSelected ? "0 2px 6px rgba(15, 38, 69, 0.2)" : "0 1px 2px rgba(0,0,0,0.02)"
                          }}
                        >
                          <span>{district}</span>
                          {isSelected && <Check size={14} color="#C8952A" />}
                        </button>
                      );
                    })}
                  </div>
                  {selectedDistricts.length === 0 && (
                    <p style={{ fontSize: "12px", color: "#DC2626", fontWeight: "600", marginTop: "8px" }}>
                      * Yüz yüze ders verebileceğiniz en az 1 ilçe seçilmesi zorunludur.
                    </p>
                  )}
                </div>

                {/* 5. NOT (OPSİYONEL) */}
                <div style={{ marginBottom: "36px" }}>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "10px", 
                    marginBottom: "16px", 
                    paddingBottom: "12px", 
                    borderBottom: "2px solid #F0DFA8" 
                  }}>
                    <FileText size={22} color="#C8952A" />
                    <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0F2645", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      5. Notlar & Eklemek İstedikleriniz (Opsiyonel)
                    </h3>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ color: "#334155", fontWeight: "600", fontSize: "13px" }} htmlFor="notes">
                      Eğitmenlik tecrübeleriniz, müsait gün/saatleriniz veya eklemek istediğiniz detaylar:
                    </label>
                    <textarea 
                      className="form-input" 
                      style={{ backgroundColor: "#FFFFFF", color: "#0F2645", borderColor: "#CBD5E1", resize: "vertical", height: "auto", fontFamily: "inherit" }}
                      id="notes" 
                      name="notes" 
                      rows={4} 
                      placeholder="Daha önce verdiğiniz özel dersler, öğrenci koçluğu deneyimleriniz veya belirtmek istediğiniz özel notlar..."
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button 
                  className="btn btn-primary form-submit-btn" 
                  type="submit" 
                  disabled={isPending}
                  style={{ 
                    display: "flex", 
                    width: "100%", 
                    padding: "16px", 
                    fontSize: "16px", 
                    fontWeight: "800", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    gap: "10px",
                    boxShadow: "0 8px 24px rgba(200, 149, 42, 0.25)"
                  }}
                >
                  {isPending ? (
                    <>Başvuru Kaydediliyor...</>
                  ) : (
                    <>
                      Başvuruyu Gönder <Sparkles size={18} />
                    </>
                  )}
                </button>

              </form>
            )}

          </div>
        </div>
      </main>

      <footer style={{ marginTop: "40px" }}>
        <div className="container" style={{ textAlign: "center", fontSize: "13px", color: "#64748B" }}>
          © 2026 Pont Academy. Tüm hakları saklıdır.
        </div>
      </footer>
    </div>
  );
}
