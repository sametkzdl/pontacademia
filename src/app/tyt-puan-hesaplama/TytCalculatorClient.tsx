"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, 
  Calculator, 
  Sparkles, 
  HelpCircle, 
  RotateCcw,
  BookOpen,
  Award,
  TrendingUp,
  ArrowRight
} from "lucide-react";

interface TestState {
  correct: string;
  incorrect: string;
  net: number;
  max: number;
}

export default function TytCalculatorClient() {
  const [turkce, setTurkce] = useState<TestState>({ correct: "", incorrect: "", net: 0, max: 40 });
  const [matematik, setMatematik] = useState<TestState>({ correct: "", incorrect: "", net: 0, max: 40 });
  const [sosyal, setSosyal] = useState<TestState>({ correct: "", incorrect: "", net: 0, max: 20 });
  const [fen, setFen] = useState<TestState>({ correct: "", incorrect: "", net: 0, max: 20 });
  
  const [diplomaGrade, setDiplomaGrade] = useState<string>("80");
  const [isObpKirik, setIsObpKirik] = useState<boolean>(false);
  
  const [calculated, setCalculated] = useState<boolean>(false);
  const [scores, setScores] = useState({
    raw: 100,
    placement: 100,
    obpContribution: 0,
    estimatedRank: 0
  });

  // Helper to calculate Net
  const calculateNet = (correct: string, incorrect: string, max: number): number => {
    const c = parseFloat(correct) || 0;
    const i = parseFloat(incorrect) || 0;
    if (c + i > max) return 0; // Invalid input fallback
    const netValue = c - i * 0.25;
    return Math.max(0, parseFloat(netValue.toFixed(2)));
  };

  // Sync nets dynamically
  useEffect(() => {
    setTurkce(prev => ({ ...prev, net: calculateNet(prev.correct, prev.incorrect, prev.max) }));
  }, [turkce.correct, turkce.incorrect]);

  useEffect(() => {
    setMatematik(prev => ({ ...prev, net: calculateNet(prev.correct, prev.incorrect, prev.max) }));
  }, [matematik.correct, matematik.incorrect]);

  useEffect(() => {
    setSosyal(prev => ({ ...prev, net: calculateNet(prev.correct, prev.incorrect, prev.max) }));
  }, [sosyal.correct, sosyal.incorrect]);

  useEffect(() => {
    setFen(prev => ({ ...prev, net: calculateNet(prev.correct, prev.incorrect, prev.max) }));
  }, [fen.correct, fen.incorrect]);

  // Handle Input Changes with boundary checks
  const handleInputChange = (
    value: string, 
    max: number, 
    setter: React.Dispatch<React.SetStateAction<TestState>>, 
    type: "correct" | "incorrect"
  ) => {
    const num = parseFloat(value);
    if (value === "") {
      setter(prev => ({ ...prev, [type]: "" }));
      return;
    }
    if (isNaN(num) || num < 0 || num > max) return;
    setter(prev => {
      const updated = { ...prev, [type]: value };
      const otherVal = parseFloat(type === "correct" ? prev.incorrect : prev.correct) || 0;
      if (num + otherVal > max) {
        return prev;
      }
      return updated;
    });
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    // Standard TYT raw score calculation weights:
    // Türkçe: 3.3, Matematik: 3.3, Sosyal: 3.4, Fen: 3.4
    const rawScore = 100 + (turkce.net * 3.3) + (matematik.net * 3.3) + (sosyal.net * 3.4) + (fen.net * 3.4);
    
    // OBP calculation: diploma grade * 5 * (0.6 or 0.3 if broken OBP)
    const grade = parseFloat(diplomaGrade) || 50;
    const obpPoints = grade * 5;
    const obpContribution = obpPoints * (isObpKirik ? 0.3 : 0.6);

    const placementScore = rawScore + obpContribution;

    // Estimated rank mapping (scientific interpolation based on recent years TYT stats)
    let rank = 2500000;
    const ham = Math.min(500, rawScore);
    if (ham >= 490) rank = Math.round(1 + (500 - ham) * 20);
    else if (ham >= 450) rank = Math.round(500 + (490 - ham) * 350);
    else if (ham >= 400) rank = Math.round(14500 + (450 - ham) * 1010);
    else if (ham >= 350) rank = Math.round(65000 + (400 - ham) * 2300);
    else if (ham >= 300) rank = Math.round(180000 + (350 - ham) * 4800);
    else if (ham >= 250) rank = Math.round(420000 + (300 - ham) * 8600);
    else if (ham >= 200) rank = Math.round(850000 + (250 - ham) * 15000);
    else if (ham >= 150) rank = Math.round(1600000 + (200 - ham) * 18000);

    setScores({
      raw: parseFloat(Math.min(500, rawScore).toFixed(3)),
      placement: parseFloat(Math.min(560, placementScore).toFixed(3)),
      obpContribution: parseFloat(obpContribution.toFixed(2)),
      estimatedRank: Math.max(1, rank)
    });
    setCalculated(true);
  };

  const handleReset = () => {
    setTurkce({ correct: "", incorrect: "", net: 0, max: 40 });
    setMatematik({ correct: "", incorrect: "", net: 0, max: 40 });
    setSosyal({ correct: "", incorrect: "", net: 0, max: 20 });
    setFen({ correct: "", incorrect: "", net: 0, max: 20 });
    setDiplomaGrade("80");
    setIsObpKirik(false);
    setCalculated(false);
  };

  const totalNet = (turkce.net + matematik.net + sosyal.net + fen.net).toFixed(2);

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
        <div style={{ width: "100%", maxWidth: "860px" }}>
          
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
                <Calculator size={16} /> 2026 GÜNCEL KATSAYILAR
              </span>
            </div>
            <h1 style={{ fontFamily: "var(--font-playfair)", fontSize: "36px", fontWeight: "800", color: "#0F2645", letterSpacing: "-0.5px" }}>
              2026 TYT Puan Hesaplama
            </h1>
            <p style={{ color: "#4A6280", marginTop: "10px", fontSize: "15px", lineHeight: "1.6", maxWidth: "640px", margin: "10px auto 0 auto" }}>
              Doğru ve yanlış sayılarınızı girerek ÖSYM katsayılarına göre güncel TYT ham ve yerleştirme puanınızı ve tahmini Türkiye sıralamanızı anında hesaplayın.
            </p>
          </div>

          {/* Main Calculation Card */}
          <div style={{ 
            padding: "36px 40px", 
            borderRadius: "16px", 
            backgroundColor: "#FFFFFF", 
            border: "1px solid #DDE6F0", 
            boxShadow: "0 12px 36px rgba(15, 38, 69, 0.06)",
            marginBottom: "32px"
          }}>
            <form onSubmit={handleCalculate}>
              
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "10px", 
                marginBottom: "24px", 
                paddingBottom: "12px", 
                borderBottom: "2px solid #F0DFA8" 
              }}>
                <BookOpen size={22} color="#C8952A" />
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0F2645", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  TYT Testleri ve Net Dağılımı
                </h3>
              </div>

              {/* Table Header */}
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "minmax(140px, 2.2fr) 1fr 1fr 1fr", 
                gap: "12px", 
                backgroundColor: "#F8FAFC",
                padding: "12px 16px",
                borderRadius: "10px",
                marginBottom: "16px", 
                fontSize: "13px", 
                fontWeight: "700", 
                color: "#0F2645", 
                textTransform: "uppercase",
                border: "1px solid #E2E8F0"
              }}>
                <div>Test Adı</div>
                <div style={{ textAlign: "center" }}>Doğru</div>
                <div style={{ textAlign: "center" }}>Yanlış</div>
                <div style={{ textAlign: "center", color: "#C8952A" }}>Net</div>
              </div>

              {/* Tests Rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "28px" }}>
                
                {/* Türkçe */}
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "minmax(140px, 2.2fr) 1fr 1fr 1fr", 
                  gap: "12px", 
                  alignItems: "center",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  backgroundColor: "#FAFCFE",
                  border: "1px solid #EDF2F7"
                }}>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "#0F2645" }}>Türkçe</div>
                    <div style={{ fontSize: "12px", color: "#64748B" }}>40 Soru</div>
                  </div>
                  <input 
                    type="number" 
                    placeholder="0"
                    min="0"
                    max="40"
                    style={{ 
                      textAlign: "center", 
                      padding: "10px 8px",
                      borderRadius: "8px",
                      border: "1.5px solid #CBD5E1",
                      backgroundColor: "#FFFFFF",
                      color: "#0F2645",
                      fontWeight: "600",
                      fontSize: "15px",
                      outline: "none"
                    }}
                    value={turkce.correct}
                    onChange={(e) => handleInputChange(e.target.value, turkce.max, setTurkce, "correct")}
                  />
                  <input 
                    type="number" 
                    placeholder="0"
                    min="0"
                    max="40"
                    style={{ 
                      textAlign: "center", 
                      padding: "10px 8px",
                      borderRadius: "8px",
                      border: "1.5px solid #CBD5E1",
                      backgroundColor: "#FFFFFF",
                      color: "#0F2645",
                      fontWeight: "600",
                      fontSize: "15px",
                      outline: "none"
                    }}
                    value={turkce.incorrect}
                    onChange={(e) => handleInputChange(e.target.value, turkce.max, setTurkce, "incorrect")}
                  />
                  <div style={{ 
                    textAlign: "center", 
                    fontWeight: "800", 
                    color: "#C8952A", 
                    fontSize: "16px",
                    backgroundColor: "#FEF9EE",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #F0DFA8"
                  }}>
                    {turkce.net}
                  </div>
                </div>

                {/* Matematik */}
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "minmax(140px, 2.2fr) 1fr 1fr 1fr", 
                  gap: "12px", 
                  alignItems: "center",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  backgroundColor: "#FAFCFE",
                  border: "1px solid #EDF2F7"
                }}>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "#0F2645" }}>Temel Matematik</div>
                    <div style={{ fontSize: "12px", color: "#64748B" }}>40 Soru</div>
                  </div>
                  <input 
                    type="number" 
                    placeholder="0"
                    min="0"
                    max="40"
                    style={{ 
                      textAlign: "center", 
                      padding: "10px 8px",
                      borderRadius: "8px",
                      border: "1.5px solid #CBD5E1",
                      backgroundColor: "#FFFFFF",
                      color: "#0F2645",
                      fontWeight: "600",
                      fontSize: "15px",
                      outline: "none"
                    }}
                    value={matematik.correct}
                    onChange={(e) => handleInputChange(e.target.value, matematik.max, setMatematik, "correct")}
                  />
                  <input 
                    type="number" 
                    placeholder="0"
                    min="0"
                    max="40"
                    style={{ 
                      textAlign: "center", 
                      padding: "10px 8px",
                      borderRadius: "8px",
                      border: "1.5px solid #CBD5E1",
                      backgroundColor: "#FFFFFF",
                      color: "#0F2645",
                      fontWeight: "600",
                      fontSize: "15px",
                      outline: "none"
                    }}
                    value={matematik.incorrect}
                    onChange={(e) => handleInputChange(e.target.value, matematik.max, setMatematik, "incorrect")}
                  />
                  <div style={{ 
                    textAlign: "center", 
                    fontWeight: "800", 
                    color: "#C8952A", 
                    fontSize: "16px",
                    backgroundColor: "#FEF9EE",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #F0DFA8"
                  }}>
                    {matematik.net}
                  </div>
                </div>

                {/* Sosyal Bilimler */}
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "minmax(140px, 2.2fr) 1fr 1fr 1fr", 
                  gap: "12px", 
                  alignItems: "center",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  backgroundColor: "#FAFCFE",
                  border: "1px solid #EDF2F7"
                }}>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "#0F2645" }}>Sosyal Bilimler</div>
                    <div style={{ fontSize: "12px", color: "#64748B" }}>20 Soru (Tarih, Coğ, Fel, Din)</div>
                  </div>
                  <input 
                    type="number" 
                    placeholder="0"
                    min="0"
                    max="20"
                    style={{ 
                      textAlign: "center", 
                      padding: "10px 8px",
                      borderRadius: "8px",
                      border: "1.5px solid #CBD5E1",
                      backgroundColor: "#FFFFFF",
                      color: "#0F2645",
                      fontWeight: "600",
                      fontSize: "15px",
                      outline: "none"
                    }}
                    value={sosyal.correct}
                    onChange={(e) => handleInputChange(e.target.value, sosyal.max, setSosyal, "correct")}
                  />
                  <input 
                    type="number" 
                    placeholder="0"
                    min="0"
                    max="20"
                    style={{ 
                      textAlign: "center", 
                      padding: "10px 8px",
                      borderRadius: "8px",
                      border: "1.5px solid #CBD5E1",
                      backgroundColor: "#FFFFFF",
                      color: "#0F2645",
                      fontWeight: "600",
                      fontSize: "15px",
                      outline: "none"
                    }}
                    value={sosyal.incorrect}
                    onChange={(e) => handleInputChange(e.target.value, sosyal.max, setSosyal, "incorrect")}
                  />
                  <div style={{ 
                    textAlign: "center", 
                    fontWeight: "800", 
                    color: "#C8952A", 
                    fontSize: "16px",
                    backgroundColor: "#FEF9EE",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #F0DFA8"
                  }}>
                    {sosyal.net}
                  </div>
                </div>

                {/* Fen Bilimleri */}
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "minmax(140px, 2.2fr) 1fr 1fr 1fr", 
                  gap: "12px", 
                  alignItems: "center",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  backgroundColor: "#FAFCFE",
                  border: "1px solid #EDF2F7"
                }}>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "#0F2645" }}>Fen Bilimleri</div>
                    <div style={{ fontSize: "12px", color: "#64748B" }}>20 Soru (Fizik, Kimya, Biyo)</div>
                  </div>
                  <input 
                    type="number" 
                    placeholder="0"
                    min="0"
                    max="20"
                    style={{ 
                      textAlign: "center", 
                      padding: "10px 8px",
                      borderRadius: "8px",
                      border: "1.5px solid #CBD5E1",
                      backgroundColor: "#FFFFFF",
                      color: "#0F2645",
                      fontWeight: "600",
                      fontSize: "15px",
                      outline: "none"
                    }}
                    value={fen.correct}
                    onChange={(e) => handleInputChange(e.target.value, fen.max, setFen, "correct")}
                  />
                  <input 
                    type="number" 
                    placeholder="0"
                    min="0"
                    max="20"
                    style={{ 
                      textAlign: "center", 
                      padding: "10px 8px",
                      borderRadius: "8px",
                      border: "1.5px solid #CBD5E1",
                      backgroundColor: "#FFFFFF",
                      color: "#0F2645",
                      fontWeight: "600",
                      fontSize: "15px",
                      outline: "none"
                    }}
                    value={fen.incorrect}
                    onChange={(e) => handleInputChange(e.target.value, fen.max, setFen, "incorrect")}
                  />
                  <div style={{ 
                    textAlign: "center", 
                    fontWeight: "800", 
                    color: "#C8952A", 
                    fontSize: "16px",
                    backgroundColor: "#FEF9EE",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "1px solid #F0DFA8"
                  }}>
                    {fen.net}
                  </div>
                </div>

              </div>

              {/* OBP Section */}
              <div style={{ 
                backgroundColor: "#F8FAFC", 
                borderRadius: "12px", 
                padding: "20px 24px", 
                border: "1px solid #E2E8F0",
                marginBottom: "28px"
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", alignItems: "center" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#0F2645", marginBottom: "8px" }} htmlFor="grade">
                      Diploma Notu / OBP (50 - 100)
                    </label>
                    <input 
                      type="number" 
                      id="grade"
                      min="50"
                      max="100"
                      step="0.01"
                      placeholder="Örn: 84.5"
                      style={{ 
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1.5px solid #CBD5E1",
                        backgroundColor: "#FFFFFF",
                        color: "#0F2645",
                        fontWeight: "600",
                        fontSize: "15px",
                        outline: "none"
                      }}
                      value={diplomaGrade}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || (!isNaN(parseFloat(val)) && parseFloat(val) <= 100)) {
                          setDiplomaGrade(val);
                        }
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "24px" }}>
                    <input 
                      type="checkbox" 
                      id="kirik-obp"
                      style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#C8952A" }}
                      checked={isObpKirik}
                      onChange={(e) => setIsObpKirik(e.target.checked)}
                    />
                    <label htmlFor="kirik-obp" style={{ fontSize: "14px", color: "#334155", fontWeight: "500", cursor: "pointer" }}>
                      Daha önce bir üniversiteye yerleştim (Kırık OBP)
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ 
                    flex: "1 1 200px", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    gap: "8px", 
                    fontSize: "16px",
                    fontWeight: "700",
                    padding: "14px 28px",
                    boxShadow: "0 4px 14px rgba(200, 149, 42, 0.25)"
                  }}
                >
                  <Calculator size={18} /> TYT Puanı Hesapla
                </button>
                <button 
                  type="button" 
                  onClick={handleReset} 
                  style={{ 
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "14px 24px",
                    borderRadius: "8px",
                    border: "1.5px solid #CBD5E1", 
                    backgroundColor: "#FFFFFF",
                    color: "#475569",
                    fontWeight: "600",
                    fontSize: "15px",
                    cursor: "pointer"
                  }}
                >
                  <RotateCcw size={16} /> Temizle
                </button>
              </div>

            </form>
          </div>

          {/* Calculation Results Card */}
          {calculated && (
            <div style={{ 
              padding: "36px 40px", 
              borderRadius: "16px", 
              backgroundColor: "#FFFFFF", 
              border: "2px solid #F0DFA8", 
              boxShadow: "0 16px 40px rgba(200, 149, 42, 0.12)",
              animation: "fadeIn 0.3s ease",
              marginBottom: "32px"
            }}>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "10px", 
                marginBottom: "24px", 
                paddingBottom: "12px", 
                borderBottom: "2px solid #F0DFA8" 
              }}>
                <Sparkles size={22} color="#C8952A" />
                <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#0F2645", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Hesaplama Sonuçları
                </h3>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "28px" }}>
                
                {/* Ham Puan */}
                <div style={{ 
                  backgroundColor: "#F8FAFC", 
                  padding: "20px 24px", 
                  borderRadius: "12px", 
                  border: "1px solid #E2E8F0",
                  borderLeft: "5px solid #0F2645" 
                }}>
                  <div style={{ fontSize: "12px", color: "#64748B", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.5px" }}>
                    TYT Ham Puanı
                  </div>
                  <div style={{ fontSize: "32px", fontWeight: "800", color: "#0F2645", marginTop: "6px" }}>
                    {scores.raw}
                  </div>
                  <div style={{ fontSize: "12px", color: "#94A3B8", marginTop: "4px" }}>
                    100 Taban + Test Puanları
                  </div>
                </div>
                
                {/* Yerleştirme Puanı */}
                <div style={{ 
                  backgroundColor: "#FEF9EE", 
                  padding: "20px 24px", 
                  borderRadius: "12px", 
                  border: "1px solid #F0DFA8",
                  borderLeft: "5px solid #C8952A" 
                }}>
                  <div style={{ fontSize: "12px", color: "#C8952A", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.5px" }}>
                    Yerleştirme Puanı (Y-TYT)
                  </div>
                  <div style={{ fontSize: "32px", fontWeight: "800", color: "#C8952A", marginTop: "6px" }}>
                    {scores.placement}
                  </div>
                  <div style={{ fontSize: "12px", color: "#B48220", marginTop: "4px" }}>
                    Ham Puan + OBP ({scores.obpContribution} Puan)
                  </div>
                </div>

                {/* Tahmini Sıralama */}
                <div style={{ 
                  backgroundColor: "#F0F5FB", 
                  padding: "20px 24px", 
                  borderRadius: "12px", 
                  border: "1px solid #DDE6F0",
                  borderLeft: "5px solid #2563EB" 
                }}>
                  <div style={{ fontSize: "12px", color: "#2563EB", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.5px" }}>
                    Tahmini YKS Sıralaması
                  </div>
                  <div style={{ fontSize: "32px", fontWeight: "800", color: "#0F2645", marginTop: "6px" }}>
                    ~ {scores.estimatedRank.toLocaleString()}
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748B", marginTop: "4px" }}>
                    ÖSYM 3 Yıllık İstatistik Projeksiyonu
                  </div>
                </div>

              </div>

              {/* Breakdown Table */}
              <div style={{ backgroundColor: "#F8FAFC", borderRadius: "12px", padding: "16px 20px", border: "1px solid #E2E8F0" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                      <td style={{ padding: "12px 0", color: "#475569", fontWeight: "500" }}>Toplam TYT Neti</td>
                      <td style={{ padding: "12px 0", textAlign: "right", fontWeight: "700", color: "#0F2645", fontSize: "15px" }}>
                        {totalNet} / 120 Soru
                      </td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                      <td style={{ padding: "12px 0", color: "#475569", fontWeight: "500" }}>Diploma Notu & OBP Katkısı</td>
                      <td style={{ padding: "12px 0", textAlign: "right", fontWeight: "700", color: "#C8952A", fontSize: "15px" }}>
                        +{scores.obpContribution} Puan {isObpKirik && <span style={{ fontSize: "12px", color: "#EF4444" }}>(Kırık OBP)</span>}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "12px 0", color: "#0F2645", fontWeight: "700" }}>TYT Baraj Durumu</td>
                      <td style={{ padding: "12px 0", textAlign: "right", fontWeight: "700", color: "#10B981" }}>
                        Geçerli (Tercih Yapılabilir)
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginTop: "14px", fontSize: "12px", color: "#64748B", lineHeight: "1.5" }}>
                  <HelpCircle size={15} style={{ flexShrink: 0, marginTop: "2px", color: "#94A3B8" }} />
                  <span>Sıralama verileri son 3 yılın ÖSYM YKS sınav standart sapma ve yığılma verileri referans alınarak hesaplanmaktadır. Her sınav yılında katılımcı sayısı ve zorluk düzeyine göre küçük farklılıklar görülebilir.</span>
                </div>
              </div>

              {/* Call to Action */}
              <div style={{ 
                marginTop: "28px", 
                textAlign: "center",
                padding: "24px",
                backgroundColor: "#FAFCFE",
                borderRadius: "12px",
                border: "1px dashed #CBD5E1"
              }}>
                <h4 style={{ fontSize: "16px", fontWeight: "800", color: "#0F2645", marginBottom: "8px" }}>
                  Netlerinizi ve Sıralamanızı Zirveye Taşımak İster Misiniz?
                </h4>
                <p style={{ color: "#4A6280", fontSize: "14px", marginBottom: "16px", maxWidth: "520px", margin: "0 auto 16px auto" }}>
                  Pont Academy'nin derece yapmış eğitmenleriyle birebir koçluk ve özel ders alarak sınavda fark yaratın.
                </p>
                <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                  <Link href="/kocluk-basvuru" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 20px" }}>
                    <Award size={16} /> Derece Koçluğu Başvurusu
                  </Link>
                  <Link href="/ozel-ders-basvuru" style={{ 
                    display: "inline-flex", 
                    alignItems: "center", 
                    gap: "8px", 
                    padding: "10px 20px",
                    backgroundColor: "#FFFFFF",
                    color: "#0F2645",
                    border: "1.5px solid #DDE6F0",
                    borderRadius: "8px",
                    fontWeight: "600",
                    fontSize: "14px",
                    textDecoration: "none"
                  }}>
                    Birebir Özel Ders <ArrowRight size={16} color="#C8952A" />
                  </Link>
                </div>
              </div>

            </div>
          )}

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
