import type { Metadata } from "next";
import TytCalculatorClient from "./TytCalculatorClient";

export const metadata: Metadata = {
  title: "2026 TYT Puan Hesaplama ve Sıralama Tahmini",
  description: "ÖSYM güncel katsayılarına ve son 3 yılın YKS istatistiklerine göre TYT puanınızı, OBP katkısını ve tahmini Türkiye sıralamanızı anında hesaplayın.",
  keywords: [
    "TYT puan hesaplama",
    "2026 TYT sıralama hesaplama",
    "YKS puan hesaplama robotu",
    "OBP puan hesaplama",
    "TYT net hesaplama",
    "Pont Academy"
  ],
  alternates: {
    canonical: "/tyt-puan-hesaplama",
  },
  openGraph: {
    title: "2026 TYT Puan Hesaplama ve Sıralama Tahmini | Pont Academy",
    description: "ÖSYM uyumlu güncel katsayılarla TYT ham puan, yerleştirme puanı ve tahmini başarı sırası hesaplama aracı.",
    url: "https://pontacademy.com/tyt-puan-hesaplama",
    type: "website",
    locale: "tr_TR",
  },
};

export default function TytPuanHesaplamaPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "TYT Puanı Nasıl Hesaplanır?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "TYT puanı, Türkçe, Matematik, Sosyal Bilimler ve Fen Bilimleri testlerindeki doğru ve yanlış sayılarından 4 yanlış 1 doğruyu götürecek şekilde hesaplanan netlerin ÖSYM standart sapma katsayılarıyla çarpılması ve taban 100 puan eklenmesi ile hesaplanır."
        }
      },
      {
        "@type": "Question",
        "name": "OBP (Ortaöğretim Başarı Puanı) TYT Puanına Nasıl Eklenir?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Diploma notunuz 5 ile çarpılarak OBP puanı elde edilir. Bu puanın 0.12 ile çarpımı (yani diploma notunuzun 0.6 katı) yerleştirme puanınıza eklenir. Bir önceki yıl bir bölüme yerleştiyseniz bu katsayı yarı yarıya düşer."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <TytCalculatorClient />
    </>
  );
}
