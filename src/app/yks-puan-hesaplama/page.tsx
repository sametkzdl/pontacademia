import type { Metadata } from "next";
import YksCalculatorClient from "./YksCalculatorClient";

export const metadata: Metadata = {
  title: "2026 YKS (TYT-AYT-YDT) Puan Hesaplama & Sıralama",
  description: "ÖSYM güncel katsayılarına göre Sayısal (SAY), Eşit Ağırlık (EA) ve Sözel (SÖZ) YKS yerleştirme puanınızı, OBP katkısını ve tahmini Türkiye sıralamanızı hesaplayın.",
  keywords: [
    "YKS puan hesaplama",
    "2026 YKS sıralama hesaplama",
    "AYT puan hesaplama",
    "TYT AYT hesaplama robotu",
    "Sayısal puan hesaplama",
    "Eşit Ağırlık puan hesaplama",
    "Sözel puan hesaplama",
    "Pont Academy"
  ],
  alternates: {
    canonical: "/yks-puan-hesaplama",
  },
  openGraph: {
    title: "2026 YKS (TYT-AYT-YDT) Puan Hesaplama & Sıralama | Pont Academy",
    description: "ÖSYM uyumlu güncel katsayılarla YKS Sayısal, Eşit Ağırlık ve Sözel yerleştirme puanı hesaplama robotu.",
    url: "https://pontacademy.com/yks-puan-hesaplama",
    type: "website",
    locale: "tr_TR",
  },
};

export default function YksPuanHesaplamaPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "YKS Yerleştirme Puanı Nasıl Hesaplanır?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "YKS yerleştirme puanı, TYT sınavının %40'ı ve AYT sınavının ilgili puan türündeki testlerinin %60'ı ağırlıklandırılarak ham puan bulunur. Bu ham puana diploma notunuzdan elde edilen OBP (Ortaöğretim Başarı Puanı) katkısı eklenerek yerleştirme puanı hesaplanır."
        }
      },
      {
        "@type": "Question",
        "name": "AYT Barajı ve Net Ağırlıkları Nelerdir?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sayısal puan türünde Matematik ve Fen Bilimleri testleri; Eşit Ağırlık puan türünde Matematik ve Edebiyat-Sosyal-1 testleri; Sözel puan türünde ise Edebiyat-Sosyal-1 ve Sosyal-2 testleri belirleyicidir."
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
      <YksCalculatorClient />
    </>
  );
}
