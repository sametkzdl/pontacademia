import type { Metadata } from "next";
import HomeClient from "./HomeClient";
import { getSiteSettings } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pont Academy — Birebir Özel Ders ve Kişisel Sınav Koçluğu",
  description: "Boğaziçi, ODTÜ, İTÜ, Bilkent dereceli eğitmen kadrosuyla YKS ve LGS sınavlarına hazırlıkta kişiselleştirilmiş birebir dersler ve profesyonel koçluk.",
  keywords: [
    "YKS özel ders",
    "LGS koçluk",
    "birebir özel ders",
    "online koçluk",
    "üniversite hazırlık",
    "lise hazırlık",
    "TYT AYT puan hesaplama",
    "İstanbul özel ders",
    "eğitim koçu",
    "Pont Academy"
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Pont Academy — Birebir Özel Ders ve Kişisel Sınav Koçluğu",
    description: "Boğaziçi, ODTÜ, İTÜ, Bilkent dereceli eğitmen kadrosuyla YKS ve LGS sınavlarına hazırlıkta kişiselleştirilmiş birebir dersler ve profesyonel koçluk.",
    url: "https://pontacademy.com",
    type: "website",
    locale: "tr_TR",
  },
};

export default async function HomePage() {
  const settings = getSiteSettings();

  // Schema.org Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "EducationalOrganization",
        "@id": "https://pontacademy.com/#organization",
        "name": "Pont Academy",
        "url": "https://pontacademy.com",
        "logo": "https://pontacademy.com/pont_logo.png",
        "description": "Boğaziçi, ODTÜ, İTÜ, Bilkent dereceli eğitmen kadrosuyla YKS ve LGS sınavlarına hazırlıkta kişiselleştirilmiş birebir dersler ve profesyonel koçluk.",
        "telephone": settings?.contactPhone || "",
        "email": settings?.contactEmail || "",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": settings?.contactAddress || "",
          "addressLocality": "İstanbul",
          "addressCountry": "TR"
        }
      },
      {
        "@type": "Course",
        "name": "YKS & LGS Birebir Özel Ders ve Koçluk",
        "description": "Kişiye özel çalışma planı, haftalık görüşmeler ve derece yapmış eğitmenlerle birebir dersler.",
        "provider": {
          "@id": "https://pontacademy.com/#organization"
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient initialSettings={settings} />
    </>
  );
}
