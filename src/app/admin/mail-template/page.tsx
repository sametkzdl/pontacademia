"use client";

import React, { useState, useMemo } from "react";
import { 
  Mail, 
  Copy, 
  Check, 
  Download, 
  Smartphone, 
  Monitor, 
  Code2, 
  Eye, 
  Sparkles, 
  FileText, 
  Send,
  HelpCircle,
  ExternalLink,
  BookOpen,
  GraduationCap,
  Key,
  Bell
} from "lucide-react";
import { Button, Badge } from "@/components";

interface PresetTemplate {
  id: string;
  name: string;
  icon: any;
  subject: string;
  badgeText: string;
  headline: string;
  greeting: string;
  content: string;
  showHighlight: boolean;
  highlightTitle: string;
  highlightContent: string;
  showButton: boolean;
  buttonText: string;
  buttonUrl: string;
  signatureTitle: string;
  signatureSubtitle: string;
}

const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    id: "ozel_ders",
    name: "Özel Ders Bilgilendirme",
    icon: BookOpen,
    subject: "Pont Academy • Birebir Özel Ders Programınız Planlandı 📚",
    badgeText: "BİREBİR ÖZEL DERS PROGRAMI",
    headline: "Özel Ders Eşleştirmeniz Tamamlandı",
    greeting: "Değerli Öğrencimiz ve Sayın Velimiz,",
    content: "Pont Academy bünyesinde talep ettiğiniz birebir özel ders için alanında Türkiye derecesi yapmış uzman eğitmen eşleştirmeniz tamamlanmıştır.\n\nDers programınız ve ilk oturum detayları aşağıda bilgilerinize sunulmuştur. Eğitmenimiz ders saatinden önce sizinle iletişime geçerek hazırlık sürecini teyit edecektir.",
    showHighlight: true,
    highlightTitle: "📌 Ders ve Eğitmen Bilgileri",
    highlightContent: "• Eğitmen: Mehmet Can Yıldız (Boğaziçi Üniversitesi)\n• Branş: AYT Matematik & Geometri\n• İlk Ders: 14 Eylül Cumartesi • Saat: 14:00 - 16:00\n• Konum: Kadıköy / Yüz Yüze (Öğrenci Evi)\n• Ders Süresi: 2 Saat (120 Dakika)",
    showButton: true,
    buttonText: "Öğrenci Paneline Giriş Yap",
    buttonUrl: "https://pontacademy.com/login",
    signatureTitle: "Pont Academy Akademik Kurulu",
    signatureSubtitle: "Eğitim ve Rehberlik Koordinatörlüğü • iletisim@pontacademy.com",
  },
  {
    id: "kocluk",
    name: "Eğitim Koçluğu Başlangıç",
    icon: GraduationCap,
    subject: "Pont Academy • YKS / LGS Eğitim Koçluğu Programınız Başlıyor 🎯",
    badgeText: "EĞİTİM KOÇLUĞU & MENTORLUK",
    headline: "Kişiye Özel Koçluk Süreciniz Başlıyor",
    greeting: "Değerli Öğrencimiz,",
    content: "Pont Academy Derece Koçluğu programına hoş geldiniz! Hedeflediğiniz üniversite ve bölüme dereceyle yerleşmiş kişisel sınav koçunuz atanmıştır.\n\nKoçunuz haftalık çalışma planınızı hazırlamak, kaynak analizlerinizi yapmak ve ilk tanışma görüşmesini gerçekleştirmek üzere en kısa sürede sizinle bağlantı kuracaktır.",
    showHighlight: true,
    highlightTitle: "🎯 Koçluk Programı Detayları",
    highlightContent: "• Atanan Koç: Zeynep Kaya (ODTÜ Bilgisayar Müh. - YKS Sayısal 142.si)\n• Program Kapsamı: Haftalık 1-1 Canlı Görüşme, Günlük Soru & Deneme Takibi, 7/24 WhatsApp Desteği\n• İlk Strateji Toplantısı: Bu Hafta İçi Online (Google Meet)",
    showButton: true,
    buttonText: "Koçluk Portaline Giriş",
    buttonUrl: "https://pontacademy.com/login",
    signatureTitle: "Pont Academy Koçluk Direktörlüğü",
    signatureSubtitle: "Sınav Başarı ve Mentörlük Ekibi",
  },
  {
    id: "hesap_bilgileri",
    name: "Hesap & Giriş Bilgileri",
    icon: Key,
    subject: "Pont Academy • Portal Giriş Bilgileriniz ve Şifreniz 🔐",
    badgeText: "HESAP AKTİVASYONU",
    headline: "Pont Academy Hesabınız Aktif Edildi",
    greeting: "Merhaba Değerli Kullanıcımız,",
    content: "Pont Academy platformuna kaydınız başarıyla oluşturulmuştur. Panel üzerinden ders takviminizi, öğretmen/öğrenci eşleşmelerinizi ve oturum durumlarınızı anlık olarak takip edebilirsiniz.\n\nAşağıda belirtilen geçici şifreniz ile sisteme giriş yaptıktan sonra şifrenizi güvenliğiniz için güncellemeniz rica olunur.",
    showHighlight: true,
    highlightTitle: "🔑 Giriş Bilgileriniz",
    highlightContent: "• Giriş Sayfası: https://pontacademy.com/login\n• Kullanıcı E-posta: [ogrenci@eposta.com]\n• Geçici Şifre: Pont2026!\n• Rol: Öğrenci / Eğitmen Portalı",
    showButton: true,
    buttonText: "Hemen Panele Giriş Yap",
    buttonUrl: "https://pontacademy.com/login",
    signatureTitle: "Pont Academy Sistem Yönetimi",
    signatureSubtitle: "Teknik Destek ve Hesap Güvenliği Ekibi",
  },
  {
    id: "genel_duyuru",
    name: "Önemli Duyuru & Hatırlatma",
    icon: Bell,
    subject: "Pont Academy • Önemli Akademik Duyuru ve Bilgilendirme 📢",
    badgeText: "GENEL DUYURU & BİLGİLENDİRME",
    headline: "Yeni Dönem Akademik Takvim ve Ders Bilgilendirmesi",
    greeting: "Sayın Velilerimiz ve Sevgili Öğrencilerimiz,",
    content: "Yeni sınav hazırlık dönemi kapsamında ders planlamalarımız ve haftalık etüt oturumlarımız planlandığı şekilde devam etmektedir.\n\nÖğrencilerimizin eksik olduğu branşlarda takviye özel ders taleplerini ve koçluk değerlendirme formlarını panel üzerinden doldurmalarını önemle hatırlatırız.",
    showHighlight: false,
    highlightTitle: "📌 Önemli Not",
    highlightContent: "Haftalık deneme sınavı sonuçları her Pazar saat 20:00'de sisteme yüklenecektir.",
    showButton: true,
    buttonText: "Web Sitemizi Ziyaret Edin",
    buttonUrl: "https://pontacademy.com",
    signatureTitle: "Pont Academy Yönetim Kurulu",
    signatureSubtitle: "info@pontacademy.com • +90 (555) 000 00 00",
  },
];

export default function MailTemplatePage() {
  // Form State
  const [subject, setSubject] = useState(PRESET_TEMPLATES[0].subject);
  const [badgeText, setBadgeText] = useState(PRESET_TEMPLATES[0].badgeText);
  const [headline, setHeadline] = useState(PRESET_TEMPLATES[0].headline);
  const [greeting, setGreeting] = useState(PRESET_TEMPLATES[0].greeting);
  const [content, setContent] = useState(PRESET_TEMPLATES[0].content);
  
  const [showHighlight, setShowHighlight] = useState(PRESET_TEMPLATES[0].showHighlight);
  const [highlightTitle, setHighlightTitle] = useState(PRESET_TEMPLATES[0].highlightTitle);
  const [highlightContent, setHighlightContent] = useState(PRESET_TEMPLATES[0].highlightContent);
  
  const [showButton, setShowButton] = useState(PRESET_TEMPLATES[0].showButton);
  const [buttonText, setButtonText] = useState(PRESET_TEMPLATES[0].buttonText);
  const [buttonUrl, setButtonUrl] = useState(PRESET_TEMPLATES[0].buttonUrl);
  
  const [signatureTitle, setSignatureTitle] = useState(PRESET_TEMPLATES[0].signatureTitle);
  const [signatureSubtitle, setSignatureSubtitle] = useState(PRESET_TEMPLATES[0].signatureSubtitle);

  // View States
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("ozel_ders");

  const loadPreset = (preset: PresetTemplate) => {
    setSelectedPresetId(preset.id);
    setSubject(preset.subject);
    setBadgeText(preset.badgeText);
    setHeadline(preset.headline);
    setGreeting(preset.greeting);
    setContent(preset.content);
    setShowHighlight(preset.showHighlight);
    setHighlightTitle(preset.highlightTitle);
    setHighlightContent(preset.highlightContent);
    setShowButton(preset.showButton);
    setButtonText(preset.buttonText);
    setButtonUrl(preset.buttonUrl);
    setSignatureTitle(preset.signatureTitle);
    setSignatureSubtitle(preset.signatureSubtitle);
  };

  // Generate Bulletproof HTML Email Template
  const generatedHtml = useMemo(() => {
    const formattedParagraphs = content
      .split("\n\n")
      .map(para => {
        const lines = para.split("\n").map(l => l.trim()).filter(Boolean).join("<br/>");
        return `<p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.65; color: #334155;">${lines}</p>`;
      })
      .join("");

    const formattedHighlight = highlightContent
      .split("\n")
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => `<div style="font-size: 14px; line-height: 1.6; color: #0F2645; margin-bottom: 6px;">${line}</div>`)
      .join("");

    return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="tr">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${subject}</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #F0F5FB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .content-padding { padding: 24px 18px !important; }
      .header-padding { padding: 20px 18px !important; }
      .headline-text { font-size: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F0F5FB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F0F5FB;">
    <tr>
      <td align="center" style="padding: 30px 12px 40px 12px;">
        
        <!-- MAIN WRAPPER (Max 600px) -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #DDE6F0; box-shadow: 0 10px 30px rgba(15, 38, 69, 0.08);">
          
          <!-- TOP GOLD ACCENT BAR -->
          <tr>
            <td height="5" style="background-color: #C8952A; font-size: 0px; line-height: 0px;">&nbsp;</td>
          </tr>

          <!-- HEADER / LOGO -->
          <tr>
            <td align="center" class="header-padding" style="padding: 28px 36px; background-color: #F0F5FB; border-bottom: 1px solid #DDE6F0;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="https://pontakademi.com" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img src="https://pontakademi.com/_next/image?url=%2Fpont_logo.png&w=256&q=75" alt="Pont Academy" width="160" style="display: block; width: 160px; max-width: 100%; height: auto; object-fit: contain;" />
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 10px;">
                    <span style="display: inline-block; font-size: 11px; font-weight: 700; color: #4A6280; letter-spacing: 2px; text-transform: uppercase;">
                      Birebir Eğitim & Derece Koçluğu
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- MAIN CONTENT BODY -->
          <tr>
            <td class="content-padding" style="padding: 36px 36px 28px 36px; background-color: #FFFFFF;">
              
              <!-- BADGE (Optional) -->
              ${badgeText ? `
              <table border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 14px;">
                <tr>
                  <td style="background-color: #FEF3C7; border: 1px solid #FCD34D; border-radius: 20px; padding: 4px 12px; font-size: 11px; font-weight: 800; color: #92400E; letter-spacing: 0.5px; text-transform: uppercase;">
                    ★ ${badgeText}
                  </td>
                </tr>
              </table>` : ""}

              <!-- HEADLINE -->
              <h1 class="headline-text" style="margin: 0 0 16px 0; font-size: 24px; font-weight: 800; color: #0F2645; line-height: 1.3; letter-spacing: -0.5px;">
                ${headline}
              </h1>

              <!-- GREETING -->
              <p style="margin: 0 0 16px 0; font-size: 15px; font-weight: 700; color: #0F2645;">
                ${greeting}
              </p>

              <!-- PARAGRAPHS CONTENT -->
              ${formattedParagraphs}

              <!-- HIGHLIGHT CARD (Optional) -->
              ${showHighlight ? `
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0; background-color: #F8FAFC; border: 1.5px solid #CBD5E1; border-left: 4px solid #C8952A; border-radius: 10px;">
                <tr>
                  <td style="padding: 18px 20px;">
                    ${highlightTitle ? `<div style="font-size: 15px; font-weight: 800; color: #0F2645; margin-bottom: 10px; display: block;">${highlightTitle}</div>` : ""}
                    ${formattedHighlight}
                  </td>
                </tr>
              </table>` : ""}

              <!-- ACTION BUTTON (Optional) -->
              ${showButton && buttonText ? `
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0 20px 0;">
                <tr>
                  <td align="center">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="border-radius: 8px; background-color: #0F2645;">
                          <a href="${buttonUrl || 'https://pontacademy.com'}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 15px; font-weight: 700; color: #FFFFFF; text-decoration: none; border-radius: 8px; border: 1px solid #0F2645; box-shadow: 0 4px 12px rgba(15, 38, 69, 0.2);">
                            ${buttonText} &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>` : ""}

              <!-- SIGNATURE DIVIDER -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 28px; border-top: 1px solid #E2E8F0; padding-top: 18px;">
                <tr>
                  <td>
                    <div style="font-size: 14px; font-weight: 800; color: #0F2645;">
                      ${signatureTitle}
                    </div>
                    ${signatureSubtitle ? `
                    <div style="font-size: 12px; color: #64748B; margin-top: 3px;">
                      ${signatureSubtitle}
                    </div>` : ""}
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- FOOTER SECTION -->
          <tr>
            <td style="padding: 24px 36px; background-color: #F8FAFC; border-top: 1px solid #E2E8F0; text-align: center;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="font-size: 12px; color: #64748B; line-height: 1.6;">
                    <strong style="color: #0F2645;">Pont Academy</strong> &bull; Boğaziçi & ODTÜ Dereceli Eğitmen Kadrosu<br />
                    İstanbul, Türkiye &bull; <a href="https://pontacademy.com" target="_blank" style="color: #C8952A; text-decoration: none; font-weight: 700;">pontacademy.com</a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 12px; font-size: 11px; color: #94A3B8;">
                    Bu e-posta Pont Academy eğitim ve bilgilendirme hizmetleri kapsamında gönderilmiştir.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- END MAIN WRAPPER -->

      </td>
    </tr>
  </table>
</body>
</html>`;
  }, [subject, badgeText, headline, greeting, content, showHighlight, highlightTitle, highlightContent, showButton, buttonText, buttonUrl, signatureTitle, signatureSubtitle]);

  // Plain Text Version
  const generatedPlainText = useMemo(() => {
    return `PONT ACADEMY
---------------------------------------------
Konu: ${subject}
${badgeText ? `[${badgeText}]` : ""}

${headline}

${greeting}

${content}

${showHighlight ? `--- ${highlightTitle} ---\n${highlightContent}\n` : ""}
${showButton ? `[ ${buttonText}: ${buttonUrl} ]\n` : ""}
Saygılarımızla,
${signatureTitle}
${signatureSubtitle}

Pont Academy • https://pontacademy.com`;
  }, [subject, badgeText, headline, greeting, content, showHighlight, highlightTitle, highlightContent, showButton, buttonText, buttonUrl, signatureTitle, signatureSubtitle]);

  // Clipboard copy handler
  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(generatedHtml);
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2500);
    } catch (err) {
      console.error("Copy error:", err);
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = generatedHtml;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2500);
    }
  };

  const handleCopyPlainText = async () => {
    try {
      await navigator.clipboard.writeText(generatedPlainText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    }
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([generatedHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pont-academy-mail-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      
      {/* Top Header Card */}
      <div style={{ 
        backgroundColor: "#FFFFFF", 
        borderRadius: "14px", 
        border: "1px solid #DDE6F0", 
        padding: "20px 24px",
        boxShadow: "0 4px 16px rgba(15, 38, 69, 0.04)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <Mail size={22} color="#C8952A" />
            <h1 style={{ fontSize: "20px", fontWeight: "800", color: "#0F2645", margin: 0 }}>
              Mail Template Oluşturucu
            </h1>
            <span style={{ fontSize: "11px", fontWeight: "800", backgroundColor: "#FEF3C7", color: "#92400E", padding: "2px 8px", borderRadius: "12px", border: "1px solid #FCD34D" }}>
              Canlı Kod Üretici
            </span>
          </div>
          <p style={{ margin: 0, fontSize: "13px", color: "#64748B" }}>
            Pont Academy kurumsal tasarımına uygun HTML e-posta şablonu oluşturun, içeriği özelleştirin ve tek tıkla kopyalayın.
          </p>
        </div>

        {/* Quick Action Copy Button */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Button
            variant="primary"
            size="md"
            icon={copiedHtml ? <Check size={16} color={copiedHtml ? "#FFFFFF" : "#0F2645"} /> : <Copy size={16} color="#0F2645" />}
            onClick={handleCopyHtml}
            style={{ 
              backgroundColor: copiedHtml ? "#16A34A" : "#C8952A",
              color: copiedHtml ? "#FFFFFF" : "#0F2645",
              minWidth: "210px",
              fontWeight: "800",
              boxShadow: copiedHtml ? "0 4px 14px rgba(22, 163, 74, 0.25)" : "0 4px 14px rgba(200, 149, 42, 0.3)"
            }}
          >
            {copiedHtml ? "HTML Kopyalandı! ✓" : "📋 HTML Kodunu Kopyala"}
          </Button>
        </div>
      </div>

      {/* Preset Templates Bar */}
      <div style={{ 
        backgroundColor: "#FFFFFF", 
        borderRadius: "12px", 
        border: "1px solid #DDE6F0", 
        padding: "16px 20px",
        boxShadow: "0 2px 8px rgba(15, 38, 69, 0.03)"
      }}>
        <div style={{ fontSize: "12px", fontWeight: "800", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
          <Sparkles size={14} color="#C8952A" /> Hazır E-posta Şablonları (Tek Tıkla Yükle)
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {PRESET_TEMPLATES.map((preset) => {
            const Icon = preset.icon;
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => loadPreset(preset)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: isSelected ? "700" : "600",
                  backgroundColor: isSelected ? "#0F2645" : "#F8FAFC",
                  color: isSelected ? "#FFFFFF" : "#334155",
                  border: isSelected ? "1px solid #0F2645" : "1px solid #CBD5E1",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  boxShadow: isSelected ? "0 2px 8px rgba(15, 38, 69, 0.15)" : "none"
                }}
              >
                <Icon size={15} color={isSelected ? "#C8952A" : "#64748B"} />
                {preset.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Workspace */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "minmax(360px, 480px) 1fr", 
        gap: "24px", 
        alignItems: "start" 
      }}>
        
        {/* LEFT COLUMN: DYNAMIC EDITORS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          
          {/* Card 1: Başlık & Hitap */}
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #DDE6F0", padding: "20px", boxShadow: "0 2px 8px rgba(15, 38, 69, 0.03)" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "800", color: "#0F2645", margin: "0 0 14px 0", display: "flex", alignItems: "center", gap: "6px", borderBottom: "1px solid #F1F5F9", paddingBottom: "8px" }}>
              <FileText size={16} color="#C8952A" /> 1. Konu, Başlık & Hitap
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "4px" }}>
                  E-Posta Konusu (Mail Subject)
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="E-posta gelen kutusu başlığı..."
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "4px" }}>
                  Kategori Rozeti (Opsiyonel Üst Etiket)
                </label>
                <input
                  type="text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  placeholder="Örn: BİREBİR ÖZEL DERS PROGRAMI"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "4px" }}>
                  Ana Başlık (Headline H1)
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Mailin içindeki büyük ana başlık..."
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "4px" }}>
                  Alıcı Hitap Cümlesi
                </label>
                <input
                  type="text"
                  value={greeting}
                  onChange={(e) => setGreeting(e.target.value)}
                  placeholder="Örn: Değerli Öğrencimiz / Sayın Velimiz,"
                  style={{ width: "100%", padding: "9px 12px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Ana İçerik / Paragraflar */}
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #DDE6F0", padding: "20px", boxShadow: "0 2px 8px rgba(15, 38, 69, 0.03)" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "800", color: "#0F2645", margin: "0 0 14px 0", display: "flex", alignItems: "center", gap: "6px", borderBottom: "1px solid #F1F5F9", paddingBottom: "8px" }}>
              <BookOpen size={16} color="#C8952A" /> 2. E-Posta Ana İçeriği
            </h3>

            <div>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "4px" }}>
                Metin Paragrafları (İki boş satır yeni paragraf oluşturur)
              </label>
              <textarea
                rows={7}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="E-postanın ana gövde metnini buraya yazın..."
                style={{ width: "100%", padding: "10px 12px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", lineHeight: "1.5", outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
              />
            </div>
          </div>

          {/* Card 3: Vurgulu Bilgi Kutusu (Opsiyonel) */}
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #DDE6F0", padding: "20px", boxShadow: "0 2px 8px rgba(15, 38, 69, 0.03)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid #F1F5F9", paddingBottom: "8px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "800", color: "#0F2645", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                <Sparkles size={16} color="#C8952A" /> 3. Vurgulu Bilgi / Detay Kartı
              </h3>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "700", color: showHighlight ? "#0F2645" : "#64748B" }}>
                <input
                  type="checkbox"
                  checked={showHighlight}
                  onChange={(e) => setShowHighlight(e.target.checked)}
                  style={{ accentColor: "#C8952A", width: "16px", height: "16px" }}
                />
                Göster
              </label>
            </div>

            {showHighlight && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "4px" }}>
                    Kutu Başlığı
                  </label>
                  <input
                    type="text"
                    value={highlightTitle}
                    onChange={(e) => setHighlightTitle(e.target.value)}
                    placeholder="Örn: 📌 Ders ve Eğitmen Bilgileri"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", outline: "none", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "4px" }}>
                    Kutu Satırları (Her satır ayrı bir madde olur)
                  </label>
                  <textarea
                    rows={5}
                    value={highlightContent}
                    onChange={(e) => setHighlightContent(e.target.value)}
                    placeholder="• Eğitmen: Mehmet Can Yıldız&#10;• Tarih: 14 Eylül Cumartesi..."
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", lineHeight: "1.4", outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Card 4: Aksiyon Butonu & İmza */}
          <div style={{ backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #DDE6F0", padding: "20px", boxShadow: "0 2px 8px rgba(15, 38, 69, 0.03)" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "800", color: "#0F2645", margin: "0 0 14px 0", display: "flex", alignItems: "center", gap: "6px", borderBottom: "1px solid #F1F5F9", paddingBottom: "8px" }}>
              <Send size={16} color="#C8952A" /> 4. Buton ve İmza Bilgileri
            </h3>

            {/* Buton Ayarları */}
            <div style={{ marginBottom: "16px", padding: "12px", backgroundColor: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showButton ? "10px" : 0 }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#0F2645" }}>E-posta İçi Tıklama Butonu</span>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "700", color: showButton ? "#0F2645" : "#64748B" }}>
                  <input
                    type="checkbox"
                    checked={showButton}
                    onChange={(e) => setShowButton(e.target.checked)}
                    style={{ accentColor: "#C8952A", width: "16px", height: "16px" }}
                  />
                  Buton Ekle
                </label>
              </div>

              {showButton && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: "700", color: "#64748B", display: "block", marginBottom: "3px" }}>Buton Metni</label>
                    <input
                      type="text"
                      value={buttonText}
                      onChange={(e) => setButtonText(e.target.value)}
                      placeholder="Örn: Panele Giriş Yap"
                      style={{ width: "100%", padding: "7px 10px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "12px", color: "#0F2645", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: "11px", fontWeight: "700", color: "#64748B", display: "block", marginBottom: "3px" }}>Yönlendirilecek Link (URL)</label>
                    <input
                      type="text"
                      value={buttonUrl}
                      onChange={(e) => setButtonUrl(e.target.value)}
                      placeholder="https://pontacademy.com/login"
                      style={{ width: "100%", padding: "7px 10px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "12px", color: "#0F2645", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* İmza */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "4px" }}>
                  İmza Başlığı
                </label>
                <input
                  type="text"
                  value={signatureTitle}
                  onChange={(e) => setSignatureTitle(e.target.value)}
                  placeholder="Örn: Pont Academy Akademik Kurulu"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#334155", display: "block", marginBottom: "4px" }}>
                  İmza Alt Unvanı / İletişim Notu
                </label>
                <input
                  type="text"
                  value={signatureSubtitle}
                  onChange={(e) => setSignatureSubtitle(e.target.value)}
                  placeholder="Örn: Eğitim Koordinatörlüğü • iletisim@pontacademy.com"
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "13px", color: "#0F2645", outline: "none", boxSizing: "border-box" }}
                />
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: LIVE PREVIEW & CODE EXPORT */}
        <div style={{ position: "sticky", top: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {/* Action & Tab Bar */}
          <div style={{ 
            backgroundColor: "#FFFFFF", 
            borderRadius: "12px", 
            border: "1px solid #DDE6F0", 
            padding: "12px 18px",
            boxShadow: "0 2px 8px rgba(15, 38, 69, 0.03)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px"
          }}>
            {/* Tab selector */}
            <div style={{ display: "flex", gap: "6px", backgroundColor: "#F1F5F9", padding: "3px", borderRadius: "8px" }}>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 14px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "700",
                  backgroundColor: activeTab === "preview" ? "#FFFFFF" : "transparent",
                  color: activeTab === "preview" ? "#0F2645" : "#64748B",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: activeTab === "preview" ? "0 2px 6px rgba(0,0,0,0.05)" : "none"
                }}
              >
                <Eye size={14} /> Canlı Önizleme
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("code")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 14px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "700",
                  backgroundColor: activeTab === "code" ? "#FFFFFF" : "transparent",
                  color: activeTab === "code" ? "#0F2645" : "#64748B",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: activeTab === "code" ? "0 2px 6px rgba(0,0,0,0.05)" : "none"
                }}
              >
                <Code2 size={14} /> HTML Kodu
              </button>
            </div>

            {/* Device Toggle (Only in preview tab) */}
            {activeTab === "preview" && (
              <div style={{ display: "flex", gap: "4px", backgroundColor: "#F1F5F9", padding: "3px", borderRadius: "8px" }}>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("desktop")}
                  title="Masaüstü Görünümü"
                  style={{
                    padding: "6px 10px",
                    borderRadius: "6px",
                    backgroundColor: previewDevice === "desktop" ? "#FFFFFF" : "transparent",
                    color: previewDevice === "desktop" ? "#0F2645" : "#64748B",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: previewDevice === "desktop" ? "0 2px 6px rgba(0,0,0,0.05)" : "none"
                  }}
                >
                  <Monitor size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice("mobile")}
                  title="Mobil Görünümü"
                  style={{
                    padding: "6px 10px",
                    borderRadius: "6px",
                    backgroundColor: previewDevice === "mobile" ? "#FFFFFF" : "transparent",
                    color: previewDevice === "mobile" ? "#0F2645" : "#64748B",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: previewDevice === "mobile" ? "0 2px 6px rgba(0,0,0,0.05)" : "none"
                  }}
                >
                  <Smartphone size={14} />
                </button>
              </div>
            )}

            {/* Export buttons */}
            <div style={{ display: "flex", gap: "8px" }}>
              <Button
                variant="secondary"
                size="sm"
                icon={<Download size={13} />}
                onClick={handleDownloadHtml}
                title=".html dosyası olarak indir"
              >
                İndir (.html)
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={copiedHtml ? <Check size={14} color={copiedHtml ? "#FFFFFF" : "#0F2645"} /> : <Copy size={14} color="#0F2645" />}
                onClick={handleCopyHtml}
                style={{ 
                  backgroundColor: copiedHtml ? "#16A34A" : "#C8952A",
                  color: copiedHtml ? "#FFFFFF" : "#0F2645",
                  fontWeight: "700"
                }}
              >
                {copiedHtml ? "Kopyalandı ✓" : "HTML Kopyala"}
              </Button>
            </div>
          </div>

          {/* Preview / Code Container */}
          <div style={{ 
            backgroundColor: "#F0F5FB", 
            borderRadius: "14px", 
            border: "1px solid #DDE6F0", 
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(15, 38, 69, 0.06)",
            minHeight: "560px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}>
            {activeTab === "preview" ? (
              <div style={{
                width: previewDevice === "mobile" ? "375px" : "100%",
                maxWidth: previewDevice === "mobile" ? "375px" : "620px",
                transition: "all 0.25s ease",
                backgroundColor: "#FFFFFF",
                borderRadius: "16px",
                boxShadow: "0 10px 30px rgba(15, 38, 69, 0.12)",
                overflow: "hidden"
              }}>
                <iframe
                  title="E-Posta Önizleme"
                  srcDoc={generatedHtml}
                  style={{
                    width: "100%",
                    height: "640px",
                    border: "none",
                    display: "block",
                    backgroundColor: "#F0F5FB"
                  }}
                />
              </div>
            ) : (
              <div style={{ width: "100%", height: "640px", position: "relative", backgroundColor: "#0F2645", borderRadius: "10px", padding: "16px", boxSizing: "border-box", overflow: "auto" }}>
                <button
                  type="button"
                  onClick={handleCopyHtml}
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    padding: "8px 14px",
                    borderRadius: "6px",
                    backgroundColor: copiedHtml ? "#16A34A" : "#C8952A",
                    color: copiedHtml ? "#FFFFFF" : "#0F2645",
                    border: "none",
                    fontSize: "12px",
                    fontWeight: "800",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                    zIndex: 10
                  }}
                >
                  {copiedHtml ? <Check size={14} color="#FFFFFF" /> : <Copy size={14} color="#0F2645" />}
                  {copiedHtml ? "Kopyalandı! ✓" : "Tüm Kodu Kopyala"}
                </button>
                <pre style={{ margin: 0, color: "#93C5FD", fontSize: "12px", fontFamily: "Consolas, Monaco, monospace", lineHeight: "1.45", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                  {generatedHtml}
                </pre>
              </div>
            )}
          </div>

          {/* Quick Guide on how to paste in Gmail / Outlook */}
          <div style={{ 
            backgroundColor: "#FFFFFF", 
            borderRadius: "12px", 
            border: "1px solid #DDE6F0", 
            padding: "16px 20px",
            boxShadow: "0 2px 8px rgba(15, 38, 69, 0.03)"
          }}>
            <div style={{ fontSize: "13px", fontWeight: "800", color: "#0F2645", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
              <HelpCircle size={16} color="#C8952A" /> Manuel Mail Gönderim Rehberi (Gmail / Outlook)
            </div>
            <div style={{ fontSize: "12px", color: "#64748B", lineHeight: "1.6", display: "flex", flexDirection: "column", gap: "6px" }}>
              <div>
                <strong>1. Yöntem (En Kolay):</strong> <em>"İndir (.html)"</em> butonuna tıklayın, inen dosyayı Chrome / Edge tarayıcınızda açın. Sayfada <kbd style={{ backgroundColor: "#F1F5F9", padding: "1px 4px", borderRadius: "3px", border: "1px solid #CBD5E1" }}>Ctrl+A</kbd> veya <kbd style={{ backgroundColor: "#F1F5F9", padding: "1px 4px", borderRadius: "3px", border: "1px solid #CBD5E1" }}>Cmd+A</kbd> ile tümünü seçip kopyalayın, ardından Gmail veya Outlook yeni ileti penceresine yapıştırın. Görsel ve butonlar birebir korunacaktır.
              </div>
              <div>
                <strong>2. Yöntem (HTML Eklentisi):</strong> Gmail & Outlook için <em>"Insert HTML"</em> eklentisini kullanarak doğrudan <strong>HTML Kopyala</strong> butonundaki kodu yapıştırabilirsiniz.
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
