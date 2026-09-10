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
  Layers,
  ArrowRight
} from "lucide-react";

interface TestState {
  correct: string;
  incorrect: string;
  net: number;
  max: number;
}

export default function YksCalculatorClient() {
  // TYT Tests
  const [tytTur, setTytTur] = useState<TestState>({ correct: "", incorrect: "", net: 0, max: 40 });
  const [tytMat, setTytMat] = useState<TestState>({ correct: "", incorrect: "", net: 0, max: 40 });
  const [tytSos, setTytSos] = useState<TestState>({ correct: "", incorrect: "", net: 0, max: 20 });
  const [tytFen, setTytFen] = useState<TestState>({ correct: "", incorrect: "", net: 0, max: 20 });

  // AYT Tests
  const [aytMat, setAytMat] = useState<TestState>({ correct: "", incorrect: "", net: 0, max: 40 });
  const [aytEde, setAytEde] = useState<TestState>({ correct: "", incorrect: "", net: 0, max: 24 });
  const [aytTar1, setAytTar1] = useState<TestState>({ correct: "", incorrect: "", net: 0, max: 10 });
  const [aytCog1, setAytCog1] = useState<TestState>({ correct: "", incorrect: "", net: 0, max: 6 });
  
  const [aytFiz, setAytFiz] = useState<TestState>({ correct: "", incorrect: "", net: 0, max: 14 });
  const [aytKim, setAytKim] = useState<TestState>({ correct: "", incorrect: "", net: 0, max: 13 });
  const [aytBiy, setAytBiy] = useState<TestState>({ correct: "", incorrect: "", net: 0, max: 13 });
  
  const [aytTar2, setAytTar2] = useState<TestState>({ correct: "", incorrect: "", net: 0, max: 11 });
  const [aytCog2, setAytCog2] = useState<TestState>({ correct: "", incorrect: "", net: 0, max: 11 });
  const [aytFel, setAytFel] = useState<TestState>({ correct: "", incorrect: "", net: 0, max: 12 });
  const [aytDin, setAytDin] = useState<TestState>({ correct: "", incorrect: "", net: 0, max: 6 });

  const [diplomaGrade, setDiplomaGrade] = useState<string>("80");
  const [isObpKirik, setIsObpKirik] = useState<boolean>(false);
  
  const [calculated, setCalculated] = useState<boolean>(false);
  const [results, setResults] = useState({
    say: { raw: 100, placement: 100, rank: 0 },
    ea: { raw: 100, placement: 100, rank: 0 },
    soz: { raw: 100, placement: 100, rank: 0 },
    obpContribution: 0
  });

  const calculateNet = (correct: string, incorrect: string, max: number): number => {
    const c = parseFloat(correct) || 0;
    const i = parseFloat(incorrect) || 0;
    if (c + i > max) return 0;
    const netValue = c - i * 0.25;
    return Math.max(0, parseFloat(netValue.toFixed(2)));
  };

  // Sync all nets
  useEffect(() => {
    setTytTur(prev => ({ ...prev, net: calculateNet(prev.correct, prev.incorrect, prev.max) }));
  }, [tytTur.correct, tytTur.incorrect]);
  useEffect(() => {
    setTytMat(prev => ({ ...prev, net: calculateNet(prev.correct, prev.incorrect, prev.max) }));
  }, [tytMat.correct, tytMat.incorrect]);
  useEffect(() => {
    setTytSos(prev => ({ ...prev, net: calculateNet(prev.correct, prev.incorrect, prev.max) }));
  }, [tytSos.correct, tytSos.incorrect]);
  useEffect(() => {
    setTytFen(prev => ({ ...prev, net: calculateNet(prev.correct, prev.incorrect, prev.max) }));
  }, [tytFen.correct, tytFen.incorrect]);

  useEffect(() => {
    setAytMat(prev => ({ ...prev, net: calculateNet(prev.correct, prev.incorrect, prev.max) }));
  }, [aytMat.correct, aytMat.incorrect]);
  useEffect(() => {
    setAytEde(prev => ({ ...prev, net: calculateNet(prev.correct, prev.incorrect, prev.max) }));
  }, [aytEde.correct, aytEde.incorrect]);
  useEffect(() => {
    setAytTar1(prev => ({ ...prev, net: calculateNet(prev.correct, prev.incorrect, prev.max) }));
  }, [aytTar1.correct, aytTar1.incorrect]);
  useEffect(() => {
    setAytCog1(prev => ({ ...prev, net: calculateNet(prev.correct, prev.incorrect, prev.max) }));
  }, [aytCog1.correct, aytCog1.incorrect]);

  useEffect(() => {
    setAytFiz(prev => ({ ...prev, net: calculateNet(prev.correct, prev.incorrect, prev.max) }));
  }, [aytFiz.correct, aytFiz.incorrect]);
  useEffect(() => {
    setAytKim(prev => ({ ...prev, net: calculateNet(prev.correct, prev.incorrect, prev.max) }));
  }, [aytKim.correct, aytKim.incorrect]);
  useEffect(() => {
    setAytBiy(prev => ({ ...prev, net: calculateNet(prev.correct, prev.incorrect, prev.max) }));
  }, [aytBiy.correct, aytBiy.incorrect]);

  useEffect(() => {
    setAytTar2(prev => ({ ...prev, net: calculateNet(prev.correct, prev.incorrect, prev.max) }));
  }, [aytTar2.correct, aytTar2.incorrect]);
  useEffect(() => {
    setAytCog2(prev => ({ ...prev, net: calculateNet(prev.correct, prev.incorrect, prev.max) }));
  }, [aytCog2.correct, aytCog2.incorrect]);
  useEffect(() => {
    setAytFel(prev => ({ ...prev, net: calculateNet(prev.correct, prev.incorrect, prev.max) }));
  }, [aytFel.correct, aytFel.incorrect]);
  useEffect(() => {
    setAytDin(prev => ({ ...prev, net: calculateNet(prev.correct, prev.incorrect, prev.max) }));
  }, [aytDin.correct, aytDin.incorrect]);

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
      if (num + otherVal > max) return prev;
      return updated;
    });
  };

  const interpolateRank = (score: number, track: "say" | "ea" | "soz"): number => {
    const s = Math.min(500, score);
    if (track === "say") {
      if (s >= 490) return Math.round(1 + (500 - s) * 15);
      if (s >= 450) return Math.round(150 + (490 - s) * 120);
      if (s >= 400) return Math.round(5000 + (450 - s) * 500);
      if (s >= 350) return Math.round(30000 + (400 - s) * 900);
      if (s >= 300) return Math.round(75000 + (350 - s) * 1500);
      if (s >= 250) return Math.round(150000 + (300 - s) * 3000);
      if (s >= 200) return Math.round(300000 + (250 - s) * 6000);
      return Math.round(600000 + (200 - s) * 10000);
    } else if (track === "ea") {
      if (s >= 490) return Math.round(1 + (500 - s) * 10);
      if (s >= 450) return Math.round(100 + (490 - s) * 72);
      if (s >= 400) return Math.round(3000 + (450 - s) * 300);
      if (s >= 350) return Math.round(18000 + (400 - s) * 740);
      if (s >= 300) return Math.round(55000 + (350 - s) * 1700);
      if (s >= 250) return Math.round(140000 + (300 - s) * 3600);
      if (s >= 200) return Math.round(320000 + (250 - s) * 7600);
      return Math.round(700000 + (200 - s) * 10000);
    } else { // soz
      if (s >= 490) return Math.round(1 + (500 - s) * 5);
      if (s >= 450) return Math.round(50 + (490 - s) * 36);
      if (s >= 400) return Math.round(1500 + (450 - s) * 170);
      if (s >= 350) return Math.round(10000 + (400 - s) * 500);
      if (s >= 300) return Math.round(35000 + (350 - s) * 1200);
      if (s >= 250) return Math.round(95000 + (300 - s) * 2900);
      if (s >= 200) return Math.round(240000 + (250 - s) * 6200);
      return Math.round(550000 + (200 - s) * 9000);
    }
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. TYT Points Contribution (40% total raw max 160)
    const tytPoints = (tytTur.net * 1.32) + (tytMat.net * 1.32) + (tytSos.net * 1.36) + (tytFen.net * 1.36);

    // 2. AYT Track Scores (60% total raw max 240)
    const aytSayPoints = (aytMat.net * 3.0) + (aytFiz.net * 2.85) + (aytKim.net * 3.07) + (aytBiy.net * 3.07);
    const aytEaPoints = (aytMat.net * 3.0) + (aytEde.net * 3.0) + (aytTar1.net * 2.8) + (aytCog1.net * 3.33);
    const aytSozPoints = (aytEde.net * 3.0) + (aytTar1.net * 2.8) + (aytCog1.net * 3.33) + 
                         (aytTar2.net * 2.91) + (aytCog2.net * 2.91) + (aytFel.net * 3.0) + (aytDin.net * 3.33);

    // 3. Raw Scores
    const sayRaw = 100 + tytPoints + aytSayPoints;
    const eaRaw = 100 + tytPoints + aytEaPoints;
    const sozRaw = 100 + tytPoints + aytSozPoints;

    // 4. OBP addition
    const grade = parseFloat(diplomaGrade) || 50;
    const obpPoints = grade * 5;
    const obpContribution = obpPoints * (isObpKirik ? 0.3 : 0.6);

    // 5. Final results
    setResults({
      say: {
        raw: parseFloat(Math.min(500, sayRaw).toFixed(3)),
        placement: parseFloat(Math.min(560, sayRaw + obpContribution).toFixed(3)),
        rank: interpolateRank(sayRaw, "say")
      },
      ea: {
        raw: parseFloat(Math.min(500, eaRaw).toFixed(3)),
        placement: parseFloat(Math.min(560, eaRaw + obpContribution).toFixed(3)),
        rank: interpolateRank(eaRaw, "ea")
      },
      soz: {
        raw: parseFloat(Math.min(500, sozRaw).toFixed(3)),
        placement: parseFloat(Math.min(560, sozRaw + obpContribution).toFixed(3)),
        rank: interpolateRank(sozRaw, "soz")
      },
      obpContribution: parseFloat(obpContribution.toFixed(2))
    });
    setCalculated(true);
  };

  const handleReset = () => {
    setTytTur({ correct: "", incorrect: "", net: 0, max: 40 });
    setTytMat({ correct: "", incorrect: "", net: 0, max: 40 });
    setTytSos({ correct: "", incorrect: "", net: 0, max: 20 });
    setTytFen({ correct: "", incorrect: "", net: 0, max: 20 });

    setAytMat({ correct: "", incorrect: "", net: 0, max: 40 });
    setAytEde({ correct: "", incorrect: "", net: 0, max: 24 });
    setAytTar1({ correct: "", incorrect: "", net: 0, max: 10 });
    setAytCog1({ correct: "", incorrect: "", net: 0, max: 6 });
    setAytFiz({ correct: "", incorrect: "", net: 0, max: 14 });
    setAytKim({ correct: "", incorrect: "", net: 0, max: 13 });
    setAytBiy({ correct: "", incorrect: "", net: 0, max: 13 });
    setAytTar2({ correct: "", incorrect: "", net: 0, max: 11 });
    setAytCog2({ correct: "", incorrect: "", net: 0, max: 11 });
    setAytFel({ correct: "", incorrect: "", net: 0, max: 12 });
    setAytDin({ correct: "", incorrect: "", net: 0, max: 6 });

    setDiplomaGrade("80");
    setIsObpKirik(false);
    setCalculated(false);
  };

  const totalTytNet = (tytTur.net + tytMat.net + tytSos.net + tytFen.net).toFixed(2);

  // Helper row component for clean layout
  const renderTestRow = (
    name: string, 
    questionCount: number, 
    state: TestState, 
    setter: React.Dispatch<React.SetStateAction<TestState>>, 
    subLabel?: string
  ) => (
    <div className="calc-test-row" style={{ 
      display: "grid", 
      gridTemplateColumns: "minmax(110px, 2fr) 1fr 1fr 1fr", 
      gap: "8px", 
      alignItems: "center",
      padding: "8px 10px",
      borderRadius: "8px",
      backgroundColor: "#FAFCFE",
      border: "1px solid #EDF2F7",
      marginBottom: "8px",
      minWidth: "290px"
    }}>
      <div>
        <div style={{ fontSize: "13px", fontWeight: "700", color: "#0F2645" }}>{name}</div>
        <div style={{ fontSize: "10px", color: "#64748B" }}>
          {questionCount} Soru {subLabel && `(${subLabel})`}
        </div>
      </div>
      <input 
        type="number" 
        placeholder="0"
        min="0"
        max={questionCount}
        style={{ 
          textAlign: "center", 
          padding: "7px 4px",
          borderRadius: "6px",
          border: "1.5px solid #CBD5E1",
          backgroundColor: "#FFFFFF",
          color: "#0F2645",
          fontWeight: "600",
          fontSize: "13px",
          outline: "none",
          width: "100%",
          boxSizing: "border-box"
        }}
        value={state.correct}
        onChange={(e) => handleInputChange(e.target.value, state.max, setter, "correct")}
      />
      <input 
        type="number" 
        placeholder="0"
        min="0"
        max={questionCount}
        style={{ 
          textAlign: "center", 
          padding: "7px 4px",
          borderRadius: "6px",
          border: "1.5px solid #CBD5E1",
          backgroundColor: "#FFFFFF",
          color: "#0F2645",
          fontWeight: "600",
          fontSize: "13px",
          outline: "none",
          width: "100%",
          boxSizing: "border-box"
        }}
        value={state.incorrect}
        onChange={(e) => handleInputChange(e.target.value, state.max, setter, "incorrect")}
      />
      <div style={{ 
        textAlign: "center", 
        fontWeight: "800", 
        color: "#C8952A", 
        fontSize: "13px",
        backgroundColor: "#FEF9EE",
        padding: "6px 4px",
        borderRadius: "6px",
        border: "1px solid #F0DFA8"
      }}>
        {state.net}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F0F5FB", padding: "20px 0 60px 0", display: "flex", flexDirection: "column", color: "#1C2B3A", overflowX: "hidden" }}>
      <style>{`
        .yks-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 460px), 1fr));
          gap: 24px;
          margin-bottom: 24px;
          width: 100%;
        }
        .yks-card-box {
          padding: 28px;
          border-radius: 16px;
          background-color: #FFFFFF;
          border: 1px solid #DDE6F0;
          box-shadow: 0 12px 36px rgba(15, 38, 69, 0.06);
          box-sizing: border-box;
          width: 100%;
        }
        .yks-result-box {
          padding: 32px 36px;
          border-radius: 16px;
          background-color: #FFFFFF;
          border: 1.5px solid #F0DFA8;
          box-shadow: 0 16px 40px rgba(200, 149, 42, 0.12);
          animation: fadeIn 0.3s ease;
          margin-bottom: 32px;
          box-sizing: border-box;
          width: 100%;
        }
        .yks-table-header {
          display: grid;
          grid-template-columns: minmax(110px, 2fr) 1fr 1fr 1fr;
          gap: 8px;
          background-color: #F8FAFC;
          padding: 8px 10px;
          border-radius: 8px;
          margin-bottom: 10px;
          font-size: 11px;
          font-weight: 700;
          color: "#0F2645";
          text-transform: uppercase;
          border: 1px solid #E2E8F0;
          min-width: 290px;
        }
        @media (max-width: 640px) {
          .yks-card-box, .yks-result-box {
            padding: 18px 12px !important;
          }
          .yks-title-h1 {
            font-size: 24px !important;
          }
        }
      `}</style>
      {/* Top Header */}
      <header style={{ position: "static", height: "auto", background: "none", border: "none", boxShadow: "none" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center" }}>
            <Image 
              src="/pont_logo.png" 
              alt="Pont Academy Logo" 
              width={140} 
              height={38} 
              style={{ objectFit: "contain" }}
              priority
            />
          </Link>
          <Link href="/" style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "8px", 
            textDecoration: "none", 
            fontSize: "13px", 
            fontWeight: "600",
            color: "#0F2645",
            backgroundColor: "#FFFFFF",
            padding: "8px 14px",
            borderRadius: "8px",
            border: "1px solid #DDE6F0",
            boxShadow: "0 2px 6px rgba(15, 38, 69, 0.04)"
          }}>
            <ArrowLeft size={15} color="#C8952A" /> Ana Sayfa
          </Link>
        </div>
      </header>

      <main className="container" style={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 12px", boxSizing: "border-box", maxWidth: "1120px" }}>
        <div style={{ width: "100%", maxWidth: "1100px" }}>
          
          {/* Header Title Banner */}
          <div style={{ marginBottom: "28px", textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <span style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                gap: "6px",
                padding: "5px 14px",
                borderRadius: "50px",
                fontSize: "12px",
                fontWeight: "700",
                backgroundColor: "#FFFFFF",
                color: "#C8952A",
                border: "1px solid #F0DFA8",
                boxShadow: "0 2px 6px rgba(200, 149, 42, 0.08)"
              }}>
                <Calculator size={15} /> 2026 GÜNCEL KATSAYILAR
              </span>
            </div>
            <h1 className="yks-title-h1" style={{ fontFamily: "var(--font-playfair)", fontSize: "34px", fontWeight: "800", color: "#0F2645", letterSpacing: "-0.5px", margin: "0 0 8px 0" }}>
              2026 YKS (TYT - AYT) Puan Hesaplama
            </h1>
            <p style={{ color: "#4A6280", fontSize: "14px", lineHeight: "1.6", maxWidth: "700px", margin: "0 auto" }}>
              TYT ve AYT netlerinizi girerek Sayısal (SAY), Eşit Ağırlık (EA) ve Sözel (SÖZ) yerleştirme puanlarınızı ve tahmini Türkiye başarı sıralamanızı eş zamanlı hesaplayın.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleCalculate}>
            <div className="yks-cards-grid">
              
              {/* TYT Card */}
              <div className="yks-card-box">
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "10px", 
                  marginBottom: "16px", 
                  paddingBottom: "10px", 
                  borderBottom: "2px solid #F0DFA8" 
                }}>
                  <BookOpen size={18} color="#C8952A" />
                  <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0F2645", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    1. TYT Netleri (%40 Etki)
                  </h3>
                </div>

                <div style={{ width: "100%", overflowX: "auto", paddingBottom: "4px" }}>
                  {/* Table Header */}
                  <div className="yks-table-header">
                    <div>Test</div>
                    <div style={{ textAlign: "center" }}>Doğru</div>
                    <div style={{ textAlign: "center" }}>Yanlış</div>
                    <div style={{ textAlign: "center", color: "#C8952A" }}>Net</div>
                  </div>

                  {renderTestRow("Türkçe", 40, tytTur, setTytTur)}
                  {renderTestRow("Temel Matematik", 40, tytMat, setTytMat)}
                  {renderTestRow("Sosyal Bilimler", 20, tytSos, setTytSos)}
                  {renderTestRow("Fen Bilimleri", 20, tytFen, setTytFen)}
                </div>

                <div style={{ 
                  marginTop: "14px", 
                  padding: "10px 14px", 
                  backgroundColor: "#F0F5FB", 
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: "1px solid #DDE6F0"
                }}>
                  <span style={{ fontSize: "12px", fontWeight: "600", color: "#0F2645" }}>Toplam TYT Neti:</span>
                  <span style={{ fontSize: "14px", fontWeight: "800", color: "#C8952A" }}>{totalTytNet} / 120</span>
                </div>
              </div>

              {/* AYT Card */}
              <div className="yks-card-box">
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "10px", 
                  marginBottom: "16px", 
                  paddingBottom: "10px", 
                  borderBottom: "2px solid #F0DFA8" 
                }}>
                  <Layers size={18} color="#C8952A" />
                  <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#0F2645", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    2. AYT Netleri (%60 Etki)
                  </h3>
                </div>

                <div style={{ width: "100%", overflowX: "auto", paddingBottom: "4px" }}>
                  {/* Table Header */}
                  <div className="yks-table-header">
                    <div>Test</div>
                    <div style={{ textAlign: "center" }}>Doğru</div>
                    <div style={{ textAlign: "center" }}>Yanlış</div>
                    <div style={{ textAlign: "center", color: "#C8952A" }}>Net</div>
                  </div>

                  {/* Matematik */}
                  {renderTestRow("AYT Matematik", 40, aytMat, setAytMat)}

                  {/* SAY */}
                  <div style={{ fontSize: "11px", fontWeight: "800", color: "#2563EB", textTransform: "uppercase", margin: "10px 0 6px 4px" }}>
                    • Fen Bilimleri (Sayısal Testi)
                  </div>
                  {renderTestRow("Fizik", 14, aytFiz, setAytFiz)}
                  {renderTestRow("Kimya", 13, aytKim, setAytKim)}
                  {renderTestRow("Biyoloji", 13, aytBiy, setAytBiy)}

                  {/* EA / SÖZ */}
                  <div style={{ fontSize: "11px", fontWeight: "800", color: "#059669", textTransform: "uppercase", margin: "12px 0 6px 4px" }}>
                    • Türk Dili ve Edebiyatı - Sosyal-1 (EA & Sözel)
                  </div>
                  {renderTestRow("Edebiyat", 24, aytEde, setAytEde)}
                  {renderTestRow("Tarih-1", 10, aytTar1, setAytTar1)}
                  {renderTestRow("Coğrafya-1", 6, aytCog1, setAytCog1)}

                  {/* SÖZEL Sosyal-2 */}
                  <div style={{ fontSize: "11px", fontWeight: "800", color: "#DB2777", textTransform: "uppercase", margin: "12px 0 6px 4px" }}>
                    • Sosyal Bilimler-2 (Sözel Testi)
                  </div>
                  {renderTestRow("Tarih-2", 11, aytTar2, setAytTar2)}
                  {renderTestRow("Coğrafya-2", 11, aytCog2, setAytCog2)}
                  {renderTestRow("Felsefe Grubu", 12, aytFel, setAytFel)}
                  {renderTestRow("Din Kültürü", 6, aytDin, setAytDin)}
                </div>
              </div>

            </div>

            {/* OBP Section */}
            <div style={{ 
              padding: "20px 24px", 
              borderRadius: "16px", 
              backgroundColor: "#FFFFFF", 
              border: "1px solid #DDE6F0", 
              boxShadow: "0 12px 36px rgba(15, 38, 69, 0.06)",
              marginBottom: "24px"
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", alignItems: "center" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#0F2645", marginBottom: "6px" }} htmlFor="grade">
                    Diploma Notu / OBP (50 - 100)
                  </label>
                  <input 
                    type="number" 
                    id="grade"
                    min="50"
                    max="100"
                    step="0.01"
                    placeholder="Örn: 85.0"
                    style={{ 
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "8px",
                      border: "1.5px solid #CBD5E1",
                      backgroundColor: "#FFFFFF",
                      color: "#0F2645",
                      fontWeight: "600",
                      fontSize: "14px",
                      outline: "none",
                      boxSizing: "border-box"
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
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                  <input 
                    type="checkbox" 
                    id="kirik-obp"
                    style={{ width: "17px", height: "17px", cursor: "pointer", accentColor: "#C8952A" }}
                    checked={isObpKirik}
                    onChange={(e) => setIsObpKirik(e.target.checked)}
                  />
                  <label htmlFor="kirik-obp" style={{ fontSize: "13px", color: "#334155", fontWeight: "500", cursor: "pointer" }}>
                    Daha önce bir bölüme yerleştirildim (Kırık OBP)
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "28px" }}>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ 
                  minWidth: "200px", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  gap: "8px", 
                  fontSize: "15px",
                  fontWeight: "700",
                  padding: "12px 28px",
                  boxShadow: "0 4px 14px rgba(200, 149, 42, 0.25)"
                }}
              >
                <Calculator size={17} /> YKS Puanı Hesapla
              </button>
              <button 
                type="button" 
                onClick={handleReset} 
                style={{ 
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "12px 20px",
                  borderRadius: "8px",
                  border: "1.5px solid #CBD5E1", 
                  backgroundColor: "#FFFFFF",
                  color: "#475569",
                  fontWeight: "600",
                  fontSize: "14px",
                  cursor: "pointer"
                }}
              >
                <RotateCcw size={15} /> Temizle
              </button>
            </div>
          </form>

          {/* Results Summary */}
          {calculated && (
            <div className="yks-result-box">
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "10px", 
                marginBottom: "20px", 
                paddingBottom: "10px", 
                borderBottom: "2px solid #F0DFA8" 
              }}>
                <Sparkles size={20} color="#C8952A" />
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#0F2645", margin: 0, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  YKS Hesaplama Sonuçları
                </h3>
              </div>

              {/* 3 Tracks Cards - Clean Cards without AI left border */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                
                {/* Sayısal (SAY) */}
                <div style={{ 
                  backgroundColor: "#EFF6FF", 
                  padding: "20px", 
                  borderRadius: "14px", 
                  border: "1px solid #BFDBFE",
                }}>
                  <div style={{ fontSize: "13px", fontWeight: "800", color: "#2563EB", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Sayısal (SAY)
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748B", marginTop: "4px" }}>Yerleştirme Puanı (Y-SAY)</div>
                  <div style={{ fontSize: "28px", fontWeight: "800", color: "#0F2645", marginTop: "4px" }}>
                    {results.say.placement}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginTop: "12px", paddingTop: "8px", borderTop: "1px solid #DBEAFE" }}>
                    <span style={{ color: "#64748B" }}>Ham SAY Puanı:</span>
                    <span style={{ fontWeight: "700", color: "#0F2645" }}>{results.say.raw}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginTop: "6px" }}>
                    <span style={{ color: "#64748B" }}>Tahmini Sıralama:</span>
                    <span style={{ fontWeight: "800", color: "#C8952A" }}>~ {results.say.rank.toLocaleString()}</span>
                  </div>
                </div>

                {/* Eşit Ağırlık (EA) */}
                <div style={{ 
                  backgroundColor: "#ECFDF5", 
                  padding: "20px", 
                  borderRadius: "14px", 
                  border: "1px solid #A7F3D0",
                }}>
                  <div style={{ fontSize: "13px", fontWeight: "800", color: "#059669", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Eşit Ağırlık (EA)
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748B", marginTop: "4px" }}>Yerleştirme Puanı (Y-EA)</div>
                  <div style={{ fontSize: "28px", fontWeight: "800", color: "#0F2645", marginTop: "4px" }}>
                    {results.ea.placement}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginTop: "12px", paddingTop: "8px", borderTop: "1px solid #D1FAE5" }}>
                    <span style={{ color: "#64748B" }}>Ham EA Puanı:</span>
                    <span style={{ fontWeight: "700", color: "#0F2645" }}>{results.ea.raw}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginTop: "6px" }}>
                    <span style={{ color: "#64748B" }}>Tahmini Sıralama:</span>
                    <span style={{ fontWeight: "800", color: "#C8952A" }}>~ {results.ea.rank.toLocaleString()}</span>
                  </div>
                </div>

                {/* Sözel (SÖZ) */}
                <div style={{ 
                  backgroundColor: "#FDF2F8", 
                  padding: "20px", 
                  borderRadius: "14px", 
                  border: "1px solid #FBCFE8",
                }}>
                  <div style={{ fontSize: "13px", fontWeight: "800", color: "#DB2777", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Sözel (SÖZ)
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748B", marginTop: "4px" }}>Yerleştirme Puanı (Y-SÖZ)</div>
                  <div style={{ fontSize: "28px", fontWeight: "800", color: "#0F2645", marginTop: "4px" }}>
                    {results.soz.placement}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginTop: "12px", paddingTop: "8px", borderTop: "1px solid #FCE7F3" }}>
                    <span style={{ color: "#64748B" }}>Ham SÖZ Puanı:</span>
                    <span style={{ fontWeight: "700", color: "#0F2645" }}>{results.soz.raw}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginTop: "6px" }}>
                    <span style={{ color: "#64748B" }}>Tahmini Sıralama:</span>
                    <span style={{ fontWeight: "800", color: "#C8952A" }}>~ {results.soz.rank.toLocaleString()}</span>
                  </div>
                </div>

              </div>

              {/* Summary Table */}
              <div style={{ backgroundColor: "#F8FAFC", borderRadius: "12px", padding: "14px 18px", border: "1px solid #E2E8F0" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                      <td style={{ padding: "10px 0", color: "#475569", fontWeight: "500" }}>Toplam TYT Neti</td>
                      <td style={{ padding: "10px 0", textAlign: "right", fontWeight: "700", color: "#0F2645" }}>
                        {totalTytNet} / 120 Soru
                      </td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                      <td style={{ padding: "10px 0", color: "#475569", fontWeight: "500" }}>Diploma Notu & OBP Puan Katkısı</td>
                      <td style={{ padding: "10px 0", textAlign: "right", fontWeight: "700", color: "#C8952A" }}>
                        +{results.obpContribution} Puan {isObpKirik && <span style={{ fontSize: "11px", color: "#EF4444" }}>(Kırık OBP)</span>}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginTop: "12px", fontSize: "11px", color: "#64748B", lineHeight: "1.5" }}>
                  <HelpCircle size={14} style={{ flexShrink: 0, marginTop: "2px", color: "#94A3B8" }} />
                  <span>Sıralama verileri ÖSYM geçmiş sınav istatistikleri ve standart sapmaları esas alınarak formüle edilmiştir. Netlerinizin hesaplanan yerleştirme puanına etki edebilmesi için ilgili testlerden 0.5 ham puan barajını geçmiş olmanız gerekir.</span>
                </div>
              </div>

              {/* Call to Action */}
              <div style={{ 
                marginTop: "24px", 
                textAlign: "center",
                padding: "20px",
                backgroundColor: "#FAFCFE",
                borderRadius: "12px",
                border: "1px dashed #CBD5E1"
              }}>
                <h4 style={{ fontSize: "15px", fontWeight: "800", color: "#0F2645", marginBottom: "6px" }}>
                  Hedeflediğin Üniversite ve Bölüme Ulaşmak İçin Hazır Mısın?
                </h4>
                <p style={{ color: "#4A6280", fontSize: "13px", marginBottom: "14px", maxWidth: "560px", margin: "0 auto 14px auto" }}>
                  Pont Academy'nin derece yapmış seçkin eğitmenleriyle birebir özel ders alarak netlerini hızla artır.
                </p>
                <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
                  <Link href="/ozel-ders-basvuru" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "10px 22px" }}>
                    <Award size={16} /> Birebir Özel Ders Başvurusu <ArrowRight size={15} />
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
