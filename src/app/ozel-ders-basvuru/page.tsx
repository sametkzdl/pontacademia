import type { Metadata } from "next";
import OzelDersClient from "./OzelDersClient";

export const metadata: Metadata = {
  title: "Birebir Özel Ders Başvurusu | YKS & LGS Hazırlık",
  description: "Boğaziçi, ODTÜ, İTÜ ve Bilkent mezunu/öğrencisi eğitmen kadrosuyla TYT, AYT, LGS ve tüm branşlarda birebir yüz yüze veya online özel ders başvurusu.",
  keywords: [
    "birebir özel ders",
    "özel ders başvurusu",
    "YKS özel ders",
    "LGS özel ders",
    "matematik özel ders",
    "fizik özel ders",
    "online özel ders",
    "İstanbul özel ders",
    "Pont Academy"
  ],
  alternates: {
    canonical: "/ozel-ders-basvuru",
  },
  openGraph: {
    title: "Birebir Özel Ders Başvurusu | Pont Academy",
    description: "Boğaziçi, ODTÜ, İTÜ ve Bilkent dereceli eğitmen kadrosuyla birebir yüz yüze ve online özel ders başvurusu.",
    url: "https://pontacademy.com/ozel-ders-basvuru",
    type: "website",
    locale: "tr_TR",
  },
};

export default function OzelDersPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": "Birebir Özel Ders Programı",
    "description": "Boğaziçi, ODTÜ, İTÜ dereceli eğitmenlerden YKS, LGS ve tüm branşlarda birebir özel ders.",
    "provider": {
      "@type": "EducationalOrganization",
      "name": "Pont Academy",
      "url": "https://pontacademy.com"
    },
    "coursePrerequisites": "Tüm sınıf düzeyleri ve mezunlar",
    "educationalCredentialAwarded": "Sınav Başarısı ve Konu Hakimiyeti"
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <OzelDersClient />
    </>
  );
}
