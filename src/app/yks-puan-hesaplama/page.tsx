"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calculator, Sparkles, HelpCircle } from "lucide-react";

interface TestState {
  correct: string;
  incorrect: string;
  net: number;
  max: number;
}

export default function YksHesaplama() {
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
    // weights: Türkçe: 1.32, Mat: 1.32, Sosyal: 1.36, Fen: 1.36
    const tytPoints = (tytTur.net * 1.32) + (tytMat.net * 1.32) + (tytSos.net * 1.36) + (tytFen.net * 1.36);

    // 2. AYT Track Scores (60% total raw max 240)
    // SAY: Mat: 3.0, Fizik: 2.85, Kimya: 3.07, Biyoloji: 3.07
    const aytSayPoints = (aytMat.net * 3.0) + (aytFiz.net * 2.85) + (aytKim.net * 3.07) + (aytBiy.net * 3.07);
    
    // EA: Mat: 3.0, Edebiyat: 3.0, Tarih-1: 2.8, Coğrafya-1: 3.33
    const aytEaPoints = (aytMat.net * 3.0) + (aytEde.net * 3.0) + (aytTar1.net * 2.8) + (aytCog1.net * 3.33);

    // SÖZ: Edebiyat: 3.0, Tarih-1: 2.8, Coğrafya-1: 3.33, Tarih-2: 2.91, Coğrafya-2: 2.91, Felsefe: 3.0, Din: 3.33
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

      <main className="container" style={{ flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: "100%", maxWidth: "1100px" }}>
          
          <div className="section-header" style={{ marginBottom: "32px", textAlign: "center" }}>
            <span className="pill-badge" style={{ marginBottom: "16px" }}>SINAV ARAÇLARI</span>
            <h2 className="dark-title" style={{ fontFamily: "var(--font-playfair)", fontSize: "32px", fontWeight: "700" }}>YKS (TYT - AYT) Puan Hesaplama</h2>
            <p style={{ color: "var(--color-text-soft)", marginTop: "12px", fontSize: "15px", lineHeight: "1.5" }}>
              TYT ve AYT netlerinizi girerek Sayısal, Eşit Ağırlık ve Sözel yerleştirme puanlarınızı ve tahmini sıralamalarınızı görün.
            </p>
          </div>

          <form onSubmit={handleCalculate}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px", marginBottom: "32px" }}>
              
              {/* TYT Inputs Column */}
              <div className="form-card card-glow" style={{ padding: "28px", borderRadius: "12px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "20px", color: "var(--color-gold)", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "8px" }}>
                  1. TYT Netleri
                </h3>
                
                <div style={{ display: "grid", gridTemplateColumns: "3fr 1.5fr 1.5fr 1fr", gap: "8px", fontWeight: "600", fontSize: "12px", color: "var(--color-text-soft)", marginBottom: "12px" }}>
                  <div>Test Adı</div>
                  <div style={{ textAlign: "center" }}>Doğru</div>
                  <div style={{ textAlign: "center" }}>Yanlış</div>
                  <div style={{ textAlign: "center" }}>Net</div>
                </div>

                {/* Türkçe */}
                <div style={{ display: "grid", gridTemplateColumns: "3fr 1.5fr 1.5fr 1fr", gap: "8px", alignItems: "center", marginBottom: "12px" }}>
                  <div style={{ fontSize: "13px", color: "#fff" }}>Türkçe <span style={{ fontSize: "11px", color: "var(--color-text-soft)" }}>(40)</span></div>
                  <input className="form-input" type="number" placeholder="0" style={{ textAlign: "center", padding: "6px 0" }} value={tytTur.correct} onChange={(e) => handleInputChange(e.target.value, tytTur.max, setTytTur, "correct")} />
                  <input className="form-input" type="number" placeholder="0" style={{ textAlign: "center", padding: "6px 0" }} value={tytTur.incorrect} onChange={(e) => handleInputChange(e.target.value, tytTur.max, setTytTur, "incorrect")} />
                  <div style={{ textAlign: "center", fontWeight: "600", color: "var(--color-gold)", fontSize: "14px" }}>{tytTur.net}</div>
                </div>

                {/* Matematik */}
                <div style={{ display: "grid", gridTemplateColumns: "3fr 1.5fr 1.5fr 1fr", gap: "8px", alignItems: "center", marginBottom: "12px" }}>
                  <div style={{ fontSize: "13px", color: "#fff" }}>Temel Mat. <span style={{ fontSize: "11px", color: "var(--color-text-soft)" }}>(40)</span></div>
                  <input className="form-input" type="number" placeholder="0" style={{ textAlign: "center", padding: "6px 0" }} value={tytMat.correct} onChange={(e) => handleInputChange(e.target.value, tytMat.max, setTytMat, "correct")} />
                  <input className="form-input" type="number" placeholder="0" style={{ textAlign: "center", padding: "6px 0" }} value={tytMat.incorrect} onChange={(e) => handleInputChange(e.target.value, tytMat.max, setTytMat, "incorrect")} />
                  <div style={{ textAlign: "center", fontWeight: "600", color: "var(--color-gold)", fontSize: "14px" }}>{tytMat.net}</div>
                </div>

                {/* Sosyal */}
                <div style={{ display: "grid", gridTemplateColumns: "3fr 1.5fr 1.5fr 1fr", gap: "8px", alignItems: "center", marginBottom: "12px" }}>
                  <div style={{ fontSize: "13px", color: "#fff" }}>Sosyal Bil. <span style={{ fontSize: "11px", color: "var(--color-text-soft)" }}>(20)</span></div>
                  <input className="form-input" type="number" placeholder="0" style={{ textAlign: "center", padding: "6px 0" }} value={tytSos.correct} onChange={(e) => handleInputChange(e.target.value, tytSos.max, setTytSos, "correct")} />
                  <input className="form-input" type="number" placeholder="0" style={{ textAlign: "center", padding: "6px 0" }} value={tytSos.incorrect} onChange={(e) => handleInputChange(e.target.value, tytSos.max, setTytSos, "incorrect")} />
                  <div style={{ textAlign: "center", fontWeight: "600", color: "var(--color-gold)", fontSize: "14px" }}>{tytSos.net}</div>
                </div>

                {/* Fen */}
                <div style={{ display: "grid", gridTemplateColumns: "3fr 1.5fr 1.5fr 1fr", gap: "8px", alignItems: "center", marginBottom: "12px" }}>
                  <div style={{ fontSize: "13px", color: "#fff" }}>Fen Bil. <span style={{ fontSize: "11px", color: "var(--color-text-soft)" }}>(20)</span></div>
                  <input className="form-input" type="number" placeholder="0" style={{ textAlign: "center", padding: "6px 0" }} value={tytFen.correct} onChange={(e) => handleInputChange(e.target.value, tytFen.max, setTytFen, "correct")} />
                  <input className="form-input" type="number" placeholder="0" style={{ textAlign: "center", padding: "6px 0" }} value={tytFen.incorrect} onChange={(e) => handleInputChange(e.target.value, tytFen.max, setTytFen, "incorrect")} />
                  <div style={{ textAlign: "center", fontWeight: "600", color: "var(--color-gold)", fontSize: "14px" }}>{tytFen.net}</div>
                </div>

              </div>

              {/* AYT Inputs Column */}
              <div className="form-card card-glow" style={{ padding: "28px", borderRadius: "12px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "20px", color: "var(--color-gold)", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "8px" }}>
                  2. AYT Netleri
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "3fr 1.5fr 1.5fr 1fr", gap: "8px", fontWeight: "600", fontSize: "12px", color: "var(--color-text-soft)", marginBottom: "12px" }}>
                  <div>Test Adı</div>
                  <div style={{ textAlign: "center" }}>Doğru</div>
                  <div style={{ textAlign: "center" }}>Yanlış</div>
                  <div style={{ textAlign: "center" }}>Net</div>
                </div>

                {/* Matematik */}
                <div style={{ display: "grid", gridTemplateColumns: "3fr 1.5fr 1.5fr 1fr", gap: "8px", alignItems: "center", marginBottom: "12px", borderBottom: "1px dashed rgba(255,255,255,0.05)", paddingBottom: "8px" }}>
                  <div style={{ fontSize: "13px", color: "#fff", fontWeight: "600" }}>Matematik <span style={{ fontSize: "11px", color: "var(--color-text-soft)" }}>(40)</span></div>
                  <input className="form-input" type="number" placeholder="0" style={{ textAlign: "center", padding: "6px 0" }} value={aytMat.correct} onChange={(e) => handleInputChange(e.target.value, aytMat.max, setAytMat, "correct")} />
                  <input className="form-input" type="number" placeholder="0" style={{ textAlign: "center", padding: "6px 0" }} value={aytMat.incorrect} onChange={(e) => handleInputChange(e.target.value, aytMat.max, setAytMat, "incorrect")} />
                  <div style={{ textAlign: "center", fontWeight: "600", color: "var(--color-gold)", fontSize: "14px" }}>{aytMat.net}</div>
                </div>

                {/* SAY / FEN */}
                <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-text-soft)", textTransform: "uppercase", marginTop: "12px", marginBottom: "8px" }}>Fen Bilimleri (Sayısal)</div>
                <div style={{ display: "grid", gridTemplateColumns: "3fr 1.5fr 1.5fr 1fr", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ fontSize: "13px", color: "#fff" }}>Fizik <span style={{ fontSize: "11px", color: "var(--color-text-soft)" }}>(14)</span></div>
                  <input className="form-input" type="number" placeholder="0" style={{ textAlign: "center", padding: "6px 0" }} value={aytFiz.correct} onChange={(e) => handleInputChange(e.target.value, aytFiz.max, setAytFiz, "correct")} />
                  <input className="form-input" type="number" placeholder="0" style={{ textAlign: "center", padding: "6px 0" }} value={aytFiz.incorrect} onChange={(e) => handleInputChange(e.target.value, aytFiz.max, setAytFiz, "incorrect")} />
                  <div style={{ textAlign: "center", fontWeight: "600", color: "var(--color-gold)", fontSize: "13px" }}>{aytFiz.net}</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "3fr 1.5fr 1.5fr 1fr", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ fontSize: "13px", color: "#fff" }}>Kimya <span style={{ fontSize: "11px", color: "var(--color-text-soft)" }}>(13)</span></div>
                  <input className="form-input" type="number" placeholder="0" style={{ textAlign: "center", padding: "6px 0" }} value={aytKim.correct} onChange={(e) => handleInputChange(e.target.value, aytKim.max, setAytKim, "correct")} />
                  <input className="form-input" type="number" placeholder="0" style={{ textAlign: "center", padding: "6px 0" }} value={aytKim.incorrect} onChange={(e) => handleInputChange(e.target.value, aytKim.max, setAytKim, "incorrect")} />
                  <div style={{ textAlign: "center", fontWeight: "600", color: "var(--color-gold)", fontSize: "13px" }}>{aytKim.net}</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "3fr 1.5fr 1.5fr 1fr", gap: "8px", alignItems: "center", marginBottom: "12px", borderBottom: "1px dashed rgba(255,255,255,0.05)", paddingBottom: "8px" }}>
                  <div style={{ fontSize: "13px", color: "#fff" }}>Biyoloji <span style={{ fontSize: "11px", color: "var(--color-text-soft)" }}>(13)</span></div>
                  <input className="form-input" type="number" placeholder="0" style={{ textAlign: "center", padding: "6px 0" }} value={aytBiy.correct} onChange={(e) => handleInputChange(e.target.value, aytBiy.max, setAytBiy, "correct")} />
                  <input className="form-input" type="number" placeholder="0" style={{ textAlign: "center", padding: "6px 0" }} value={aytBiy.incorrect} onChange={(e) => handleInputChange(e.target.value, aytBiy.max, setAytBiy, "incorrect")} />
                  <div style={{ textAlign: "center", fontWeight: "600", color: "var(--color-gold)", fontSize: "13px" }}>{aytBiy.net}</div>
                </div>

                {/* EA / SÖZEL Edebiyat & Sosyal-1 */}
                <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-text-soft)", textTransform: "uppercase", marginTop: "12px", marginBottom: "8px" }}>Edebiyat & Sosyal-1 (Eşit Ağırlık / Sözel)</div>
                <div style={{ display: "grid", gridTemplateColumns: "3fr 1.5fr 1.5fr 1fr", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ fontSize: "13px", color: "#fff" }}>Edebiyat <span style={{ fontSize: "11px", color: "var(--color-text-soft)" }}>(24)</span></div>
                  <input className="form-input" type="number" placeholder="0" style={{ textAlign: "center", padding: "6px 0" }} value={aytEde.correct} onChange={(e) => handleInputChange(e.target.value, aytEde.max, setAytEde, "correct")} />
                  <input className="form-input" type="number" placeholder="0" style={{ textAlign: "center", padding: "6px 0" }} value={aytEde.incorrect} onChange={(e) => handleInputChange(e.target.value, aytEde.max, setAytEde, "incorrect")} />
                  <div style={{ textAlign: "center", fontWeight: "600", color: "var(--color-gold)", fontSize: "13px" }}>{aytEde.net}</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "3fr 1.5fr 1.5fr 1fr", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ fontSize: "13px", color: "#fff" }}>Tarih-1 <span style={{ fontSize: "11px", color: "var(--color-text-soft)" }}>(10)</span></div>
                  <input className="form-input" type="number" placeholder="0" style={{ textAlign: "center", padding: "6px 0" }} value={aytTar1.correct} onChange={(e) => handleInputChange(e.target.value, aytTar1.max, setAytTar1, "correct")} />
                  <input className="form-input" type="number" placeholder="0" style={{ textAlign: "center", padding: "6px 0" }} value={aytTar1.incorrect} onChange={(e) => handleInputChange(e.target.value, aytTar1.max, setAytTar1, "incorrect")} />
                  <div style={{ textAlign: "center", fontWeight: "600", color: "var(--color-gold)", fontSize: "13px" }}>{aytTar1.net}</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "3fr 1.5fr 1.5fr 1fr", gap: "8px", alignItems: "center", marginBottom: "12px", borderBottom: "1px dashed rgba(255,255,255,0.05)", paddingBottom: "8px" }}>
                  <div style={{ fontSize: "13px", color: "#fff" }}>Coğrafya-1 <span style={{ fontSize: "11px", color: "var(--color-text-soft)" }}>(6)</span></div>
                  <input className="form-input" type="number" placeholder="0" style={{ textAlign: "center", padding: "6px 0" }} value={aytCog1.correct} onChange={(e) => handleInputChange(e.target.value, aytCog1.max, setAytCog1, "correct")} />
                  <input className="form-input" type="number" placeholder="0" style={{ textAlign: "center", padding: "6px 0" }} value={aytCog1.incorrect} onChange={(e) => handleInputChange(e.target.value, aytCog1.max, setAytCog1, "incorrect")} />
                  <div style={{ textAlign: "center", fontWeight: "600", color: "var(--color-gold)", fontSize: "13px" }}>{aytCog1.net}</div>
                </div>

                {/* SÖZEL Sosyal-2 */}
                <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--color-text-soft)", textTransform: "uppercase", marginTop: "12px", marginBottom: "8px" }}>Sosyal Bilimler-2 (Sözel)</div>
                <div style={{ display: "grid", gridTemplateColumns: "3fr 1.5fr 1.5fr 1fr", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ fontSize: "13px", color: "#fff" }}>Tarih-2 <span style={{ fontSize: "11px", color: "var(--color-text-soft)" }}>(11)</span></div>
                  <input className="form-input" type="number" placeholder="0" style={{ textAlign: "center", padding: "6px 0" }} value={aytTar2.correct} onChange={(e) => handleInputChange(e.target.value, aytTar2.max, setAytTar2, "correct")} />
                  <input className="form-input" type="number" placeholder="0" style={{ textAlign: "center", padding: "6px 0" }} value={aytTar2.incorrect} onChange={(e) => handleInputChange(e.target.value, aytTar2.max, setAytTar2, "incorrect")} />
                  <div style={{ textAlign: "center", fontWeight: "600", color: "var(--color-gold)", fontSize: "13px" }}>{aytTar2.net}</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "3fr 1.5fr 1.5fr 1fr", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ fontSize: "13px", color: "#fff" }}>Coğrafya-2 <span style={{ fontSize: "11px", color: "var(--color-text-soft)" }}>(11)</span></div>
                  <input className="form-input" type="number" placeholder="0" style={{ textAlign: "center", padding: "6px 0" }} value={aytCog2.correct} onChange={(e) => handleInputChange(e.target.value, aytCog2.max, setAytCog2, "correct")} />
                  <input className="form-input" type="number" placeholder="0" style={{ textAlign: "center", padding: "6px 0" }} value={aytCog2.incorrect} onChange={(e) => handleInputChange(e.target.value, aytCog2.max, setAytCog2, "incorrect")} />
                  <div style={{ textAlign: "center", fontWeight: "600", color: "var(--color-gold)", fontSize: "13px" }}>{aytCog2.net}</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "3fr 1.5fr 1.5fr 1fr", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ fontSize: "13px", color: "#fff" }}>Felsefe Gr. <span style={{ fontSize: "11px", color: "var(--color-text-soft)" }}>(12)</span></div>
                  <input className="form-input" type="number" placeholder="0" style={{ textAlign: "center", padding: "6px 0" }} value={aytFel.correct} onChange={(e) => handleInputChange(e.target.value, aytFel.max, setAytFel, "correct")} />
                  <input className="form-input" type="number" placeholder="0" style={{ textAlign: "center", padding: "6px 0" }} value={aytFel.incorrect} onChange={(e) => handleInputChange(e.target.value, aytFel.max, setAytFel, "incorrect")} />
                  <div style={{ textAlign: "center", fontWeight: "600", color: "var(--color-gold)", fontSize: "13px" }}>{aytFel.net}</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "3fr 1.5fr 1.5fr 1fr", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ fontSize: "13px", color: "#fff" }}>Din Kültürü <span style={{ fontSize: "11px", color: "var(--color-text-soft)" }}>(6)</span></div>
                  <input className="form-input" type="number" placeholder="0" style={{ textAlign: "center", padding: "6px 0" }} value={aytDin.correct} onChange={(e) => handleInputChange(e.target.value, aytDin.max, setAytDin, "correct")} />
                  <input className="form-input" type="number" placeholder="0" style={{ textAlign: "center", padding: "6px 0" }} value={aytDin.incorrect} onChange={(e) => handleInputChange(e.target.value, aytDin.max, setAytDin, "incorrect")} />
                  <div style={{ textAlign: "center", fontWeight: "600", color: "var(--color-gold)", fontSize: "13px" }}>{aytDin.net}</div>
                </div>

              </div>

            </div>

            {/* OBP Inputs Row */}
            <div className="form-card card-glow" style={{ padding: "28px", borderRadius: "12px", marginBottom: "32px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px", alignItems: "center" }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="grade">Diploma Notu (Ortaöğretim Başarı Puanı: 50 - 100)</label>
                  <input 
                    className="form-input" 
                    type="number" 
                    id="grade"
                    min="50"
                    max="100"
                    step="0.01"
                    placeholder="Örn: 84.6"
                    value={diplomaGrade}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || (!isNaN(parseFloat(val)) && parseFloat(val) <= 100)) {
                        setDiplomaGrade(val);
                      }
                    }}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "20px" }}>
                  <input 
                    type="checkbox" 
                    id="kirik-obp"
                    style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "var(--color-gold)" }}
                    checked={isObpKirik}
                    onChange={(e) => setIsObpKirik(e.target.checked)}
                  />
                  <label htmlFor="kirik-obp" style={{ fontSize: "13px", color: "var(--color-text-soft)", cursor: "pointer" }}>
                    Daha önce bir yükseköğrenim programına yerleştirildim (Kırık OBP)
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "16px", justifyContent: "center", marginBottom: "40px" }}>
              <button className="btn btn-primary" type="submit" style={{ minWidth: "220px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <Calculator size={16} /> YKS Puanı Hesapla
              </button>
              <button className="btn btn-secondary" type="button" onClick={handleReset} style={{ border: "1.5px solid rgba(255,255,255,0.1)", color: "#fff" }}>
                Temizle
              </button>
            </div>
          </form>

          {/* Results Summary */}
          {calculated && (
            <div className="form-card card-glow reveal visible" style={{ padding: "32px", borderRadius: "12px", border: "1px solid var(--color-gold)", animation: "fadeIn 0.3s ease", marginBottom: "40px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                <Sparkles size={20} style={{ color: "var(--color-gold)" }} /> YKS Hesaplama Sonuçları
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px", marginBottom: "24px" }}>
                
                {/* Sayısal (SAY) */}
                <div style={{ backgroundColor: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "8px", borderLeft: "4px solid #3b82f6" }}>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#3b82f6", textTransform: "uppercase" }}>Sayısal (SAY)</div>
                  <div style={{ fontSize: "11px", color: "var(--color-text-soft)", marginTop: "4px" }}>Yerleştirme Puanı (OBP Dahil)</div>
                  <div style={{ fontSize: "28px", fontWeight: "800", color: "#fff", marginTop: "4px" }} className="numeric">{results.say.placement}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginTop: "12px", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ color: "var(--color-text-soft)" }}>Ham Puan:</span>
                    <span style={{ fontWeight: "600", color: "#fff" }} className="numeric">{results.say.raw}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginTop: "6px" }}>
                    <span style={{ color: "var(--color-text-soft)" }}>Tahmini Sıralama:</span>
                    <span style={{ fontWeight: "700", color: "var(--color-gold)" }} className="numeric">~ {results.say.rank.toLocaleString()}</span>
                  </div>
                </div>

                {/* Eşit Ağırlık (EA) */}
                <div style={{ backgroundColor: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "8px", borderLeft: "4px solid #10b981" }}>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#10b981", textTransform: "uppercase" }}>Eşit Ağırlık (EA)</div>
                  <div style={{ fontSize: "11px", color: "var(--color-text-soft)", marginTop: "4px" }}>Yerleştirme Puanı (OBP Dahil)</div>
                  <div style={{ fontSize: "28px", fontWeight: "800", color: "#fff", marginTop: "4px" }} className="numeric">{results.ea.placement}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginTop: "12px", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ color: "var(--color-text-soft)" }}>Ham Puan:</span>
                    <span style={{ fontWeight: "600", color: "#fff" }} className="numeric">{results.ea.raw}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginTop: "6px" }}>
                    <span style={{ color: "var(--color-text-soft)" }}>Tahmini Sıralama:</span>
                    <span style={{ fontWeight: "700", color: "var(--color-gold)" }} className="numeric">~ {results.ea.rank.toLocaleString()}</span>
                  </div>
                </div>

                {/* Sözel (SÖZ) */}
                <div style={{ backgroundColor: "rgba(255,255,255,0.02)", padding: "20px", borderRadius: "8px", borderLeft: "4px solid #ec4899" }}>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#ec4899", textTransform: "uppercase" }}>Sözel (SÖZ)</div>
                  <div style={{ fontSize: "11px", color: "var(--color-text-soft)", marginTop: "4px" }}>Yerleştirme Puanı (OBP Dahil)</div>
                  <div style={{ fontSize: "28px", fontWeight: "800", color: "#fff", marginTop: "4px" }} className="numeric">{results.soz.placement}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginTop: "12px", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ color: "var(--color-text-soft)" }}>Ham Puan:</span>
                    <span style={{ fontWeight: "600", color: "#fff" }} className="numeric">{results.soz.raw}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginTop: "6px" }}>
                    <span style={{ color: "var(--color-text-soft)" }}>Tahmini Sıralama:</span>
                    <span style={{ fontWeight: "700", color: "var(--color-gold)" }} className="numeric">~ {results.soz.rank.toLocaleString()}</span>
                  </div>
                </div>

              </div>

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "20px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding: "8px 0", color: "var(--color-text-soft)" }}>Toplam TYT Neti</td>
                      <td style={{ padding: "8px 0", textAlign: "right", fontWeight: "600", color: "#fff" }}>
                        {(tytTur.net + tytMat.net + tytSos.net + tytFen.net).toFixed(2)} / 120
                      </td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <td style={{ padding: "8px 0", color: "var(--color-text-soft)" }}>OBP Puan Katkısı</td>
                      <td style={{ padding: "8px 0", textAlign: "right", fontWeight: "600", color: "#fff" }}>
                        +{results.obpContribution} Puan
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginTop: "16px", fontSize: "11px", color: "var(--color-text-soft)", lineHeight: "1.4" }}>
                  <HelpCircle size={14} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <span>Sıralama verileri ÖSYM geçmiş sınav istatistikleri and standart sapmaları esas alınarak formüle edilmiştir. Netlerinizin hesaplanan yerleştirme puanını geçebilmesi için ilgili testlerden 0.5 ham puan barajını geçmiş olmanız gerekir.</span>
                </div>
              </div>

              <div style={{ marginTop: "24px", textAlign: "center" }}>
                <Link href="/kocluk-basvuru" className="btn btn-primary" style={{ display: "inline-flex", padding: "10px 24px" }}>
                  Pont Academy Koçluğu ile Netlerini Artır <Sparkles size={16} style={{ marginLeft: "8px" }} />
                </Link>
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
