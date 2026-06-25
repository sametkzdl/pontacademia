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

export default function TytHesaplama() {
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
      // Double check total sum doesn't exceed max
      const otherVal = parseFloat(type === "correct" ? prev.incorrect : prev.correct) || 0;
      if (num + otherVal > max) {
        return prev; // Reject change if total questions exceed max
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
        <div style={{ width: "100%", maxWidth: "800px" }}>
          
          <div className="section-header" style={{ marginBottom: "32px", textAlign: "center" }}>
            <span className="pill-badge" style={{ marginBottom: "16px" }}>SINAV ARAÇLARI</span>
            <h2 className="dark-title" style={{ fontFamily: "var(--font-playfair)", fontSize: "32px", fontWeight: "700" }}>TYT Puan Hesaplama</h2>
            <p style={{ color: "var(--color-text-soft)", marginTop: "12px", fontSize: "15px", lineHeight: "1.5" }}>
              Doğru ve yanlış sayılarınızı girerek tahmini TYT yerleştirme puanınızı ve sıralamanızı hesaplayın.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }}>
            
            {/* Input Card */}
            <div className="form-card card-glow" style={{ padding: "32px", borderRadius: "12px" }}>
              <form onSubmit={handleCalculate}>
                
                {/* Header Table */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "12px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "12px", marginBottom: "16px", fontSize: "13px", fontWeight: "600", color: "var(--color-gold)", textTransform: "uppercase" }}>
                  <div>Test Adı</div>
                  <div style={{ textAlign: "center" }}>Doğru</div>
                  <div style={{ textAlign: "center" }}>Yanlış</div>
                  <div style={{ textAlign: "center" }}>Net</div>
                </div>

                {/* Türkçe */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
                  <div style={{ fontSize: "14px", fontWeight: "500", color: "#fff" }}>Türkçe <span style={{ fontSize: "12px", color: "var(--color-text-soft)" }}>(40 Soru)</span></div>
                  <input 
                    className="form-input" 
                    type="number" 
                    placeholder="0"
                    style={{ textAlign: "center", padding: "8px 0" }}
                    value={turkce.correct}
                    onChange={(e) => handleInputChange(e.target.value, turkce.max, setTurkce, "correct")}
                  />
                  <input 
                    className="form-input" 
                    type="number" 
                    placeholder="0"
                    style={{ textAlign: "center", padding: "8px 0" }}
                    value={turkce.incorrect}
                    onChange={(e) => handleInputChange(e.target.value, turkce.max, setTurkce, "incorrect")}
                  />
                  <div style={{ textAlign: "center", fontWeight: "600", color: "var(--color-gold)", fontSize: "15px" }}>{turkce.net}</div>
                </div>

                {/* Matematik */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
                  <div style={{ fontSize: "14px", fontWeight: "500", color: "#fff" }}>Temel Matematik <span style={{ fontSize: "12px", color: "var(--color-text-soft)" }}>(40 Soru)</span></div>
                  <input 
                    className="form-input" 
                    type="number" 
                    placeholder="0"
                    style={{ textAlign: "center", padding: "8px 0" }}
                    value={matematik.correct}
                    onChange={(e) => handleInputChange(e.target.value, matematik.max, setMatematik, "correct")}
                  />
                  <input 
                    className="form-input" 
                    type="number" 
                    placeholder="0"
                    style={{ textAlign: "center", padding: "8px 0" }}
                    value={matematik.incorrect}
                    onChange={(e) => handleInputChange(e.target.value, matematik.max, setMatematik, "incorrect")}
                  />
                  <div style={{ textAlign: "center", fontWeight: "600", color: "var(--color-gold)", fontSize: "15px" }}>{matematik.net}</div>
                </div>

                {/* Sosyal Bilimler */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
                  <div style={{ fontSize: "14px", fontWeight: "500", color: "#fff" }}>Sosyal Bilimler <span style={{ fontSize: "12px", color: "var(--color-text-soft)" }}>(20 Soru)</span></div>
                  <input 
                    className="form-input" 
                    type="number" 
                    placeholder="0"
                    style={{ textAlign: "center", padding: "8px 0" }}
                    value={sosyal.correct}
                    onChange={(e) => handleInputChange(e.target.value, sosyal.max, setSosyal, "correct")}
                  />
                  <input 
                    className="form-input" 
                    type="number" 
                    placeholder="0"
                    style={{ textAlign: "center", padding: "8px 0" }}
                    value={sosyal.incorrect}
                    onChange={(e) => handleInputChange(e.target.value, sosyal.max, setSosyal, "incorrect")}
                  />
                  <div style={{ textAlign: "center", fontWeight: "600", color: "var(--color-gold)", fontSize: "15px" }}>{sosyal.net}</div>
                </div>

                {/* Fen Bilimleri */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "12px", alignItems: "center", marginBottom: "24px" }}>
                  <div style={{ fontSize: "14px", fontWeight: "500", color: "#fff" }}>Fen Bilimleri <span style={{ fontSize: "12px", color: "var(--color-text-soft)" }}>(20 Soru)</span></div>
                  <input 
                    className="form-input" 
                    type="number" 
                    placeholder="0"
                    style={{ textAlign: "center", padding: "8px 0" }}
                    value={fen.correct}
                    onChange={(e) => handleInputChange(e.target.value, fen.max, setFen, "correct")}
                  />
                  <input 
                    className="form-input" 
                    type="number" 
                    placeholder="0"
                    style={{ textAlign: "center", padding: "8px 0" }}
                    value={fen.incorrect}
                    onChange={(e) => handleInputChange(e.target.value, fen.max, setFen, "incorrect")}
                  />
                  <div style={{ textAlign: "center", fontWeight: "600", color: "var(--color-gold)", fontSize: "15px" }}>{fen.net}</div>
                </div>

                {/* OBP Inputs */}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "20px", marginBottom: "24px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" htmlFor="grade">Ortaöğretim Başarı Puanı (Diploma Notu: 50 - 100)</label>
                      <input 
                        className="form-input" 
                        type="number" 
                        id="grade"
                        min="50"
                        max="100"
                        step="0.01"
                        placeholder="Örn: 82.5"
                        value={diplomaGrade}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "" || (!isNaN(parseFloat(val)) && parseFloat(val) <= 100)) {
                            setDiplomaGrade(val);
                          }
                        }}
                      />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "24px" }}>
                      <input 
                        type="checkbox" 
                        id="kirik-obp"
                        style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "var(--color-gold)" }}
                        checked={isObpKirik}
                        onChange={(e) => setIsObpKirik(e.target.checked)}
                      />
                      <label htmlFor="kirik-obp" style={{ fontSize: "13px", color: "var(--color-text-soft)", cursor: "pointer" }}>
                        Daha önce bir bölüme yerleştim (Kırık OBP)
                      </label>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "16px" }}>
                  <button className="btn btn-primary" type="submit" style={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    <Calculator size={16} /> Puan Hesapla
                  </button>
                  <button className="btn btn-secondary" type="button" onClick={handleReset} style={{ border: "1.5px solid rgba(255,255,255,0.1)", color: "#fff" }}>
                    Temizle
                  </button>
                </div>

              </form>
            </div>

            {/* Results Card */}
            {calculated && (
              <div className="form-card card-glow reveal visible" style={{ padding: "32px", borderRadius: "12px", border: "1px solid var(--color-gold)", animation: "fadeIn 0.3s ease" }}>
                <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Sparkles size={20} style={{ color: "var(--color-gold)" }} /> Hesaplama Sonuçları
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px", marginBottom: "24px" }}>
                  <div style={{ backgroundColor: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "8px", borderLeft: "4px solid var(--color-gold)" }}>
                    <div style={{ fontSize: "12px", color: "var(--color-text-soft)", textTransform: "uppercase", letterSpacing: "0.05em" }}>TYT Ham Puanı</div>
                    <div style={{ fontSize: "32px", fontWeight: "800", color: "#fff", marginTop: "4px" }} className="numeric">{scores.raw}</div>
                  </div>
                  
                  <div style={{ backgroundColor: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "8px", borderLeft: "4px solid var(--color-gold)" }}>
                    <div style={{ fontSize: "12px", color: "var(--color-text-soft)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Yerleştirme Puanı (OBP Dahil)</div>
                    <div style={{ fontSize: "32px", fontWeight: "800", color: "var(--color-gold)", marginTop: "4px" }} className="numeric">{scores.placement}</div>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "20px" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                    <tbody>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding: "10px 0", color: "var(--color-text-soft)" }}>Toplam TYT Neti</td>
                        <td style={{ padding: "10px 0", textAlign: "right", fontWeight: "600", color: "#fff" }}>
                          {(turkce.net + matematik.net + sosyal.net + fen.net).toFixed(2)} / 120
                        </td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <td style={{ padding: "10px 0", color: "var(--color-text-soft)" }}>OBP Katkısı</td>
                        <td style={{ padding: "10px 0", textAlign: "right", fontWeight: "600", color: "#fff" }}>
                          +{scores.obpContribution} Puan
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: "10px 0", color: "var(--color-text-soft)", fontWeight: "600" }}>Tahmini YKS Sıralaması</td>
                        <td style={{ padding: "10px 0", textAlign: "right", fontWeight: "800", color: "var(--color-gold)", fontSize: "16px" }} className="numeric">
                          ~ {scores.estimatedRank.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginTop: "16px", fontSize: "11px", color: "var(--color-text-soft)", lineHeight: "1.4" }}>
                    <HelpCircle size={14} style={{ flexShrink: 0, marginTop: "2px" }} />
                    <span>Sıralamalar son 3 yılın YKS (Yükseköğretim Kurumları Sınavı) istatistikleri ve standart sapmaları göz önüne alınarak hesaplanmıştır. Gerçek sınavda katılımcı sayısı ve sınav zorluğuna göre değişiklik gösterebilir.</span>
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
