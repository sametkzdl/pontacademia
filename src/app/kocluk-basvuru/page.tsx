import type { Metadata } from "next";
import KoclukBasvuruClient from "./KoclukBasvuruClient";

export const metadata: Metadata = {
  title: "YKS & LGS Eğitim Koçluğu Başvurusu",
  description: "Türkiye derecesi yapmış Boğaziçi, ODTÜ, İTÜ ve Bilkentli koçlarımızla kişiye özel haftalık çalışma programı, deneme analizleri ve 7/24 rehberlik desteği.",
  keywords: [
    "eğitim koçluğu başvurusu",
    "YKS koçluk",
    "LGS koçluk",
    "online eğitim koçu",
    "öğrenci koçluğu",
    "derece koçluğu",
    "Pont Academy"
  ],
  alternates: {
    canonical: "/kocluk-basvuru",
  },
  openGraph: {
    title: "YKS & LGS Eğitim Koçluğu Başvurusu | Pont Academy",
    description: "Boğaziçi, ODTÜ, İTÜ dereceli sınav koçlarımızla başarıya ulaşın.",
    url: "https://pontacademy.com/kocluk-basvuru",
    type: "website",
    locale: "tr_TR",
  },
};

export default function KoclukBasvuruPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "YKS & LGS Eğitim Koçluğu",
    "serviceType": "Eğitim ve Sınav Danışmanlığı",
    "description": "Kişiye özel haftalık program, deneme takibi ve 7/24 mentorluk desteği.",
    "provider": {
      "@type": "EducationalOrganization",
      "name": "Pont Academy",
      "url": "https://pontacademy.com"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <KoclukBasvuruClient />
    </>
  );
}
