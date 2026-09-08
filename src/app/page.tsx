import type { Metadata } from "next";
import HomeClient from "./HomeClient";
import { SettingService } from "@/services/setting.service";
import db from "@/utils/db";

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
  // Fetch initial data on the server for 100% SSR & SEO crawling
  let settings: any = null;
  let coaches: any[] = [];

  try {
    settings = await SettingService.getSettings();
  } catch (e) {
    console.error("Server fetch settings error in page.tsx:", e);
  }

  try {
    const teachers = await db.user.findMany({
      where: {
        role: "TEACHER",
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        teacherProfile: {
          select: {
            school: true,
            scoreType: true,
            yksRank: true,
            classStatus: true,
            currentDistrict: true,
            districts: true,
            onlineAvailable: true,
            showPhotoOnWeb: true,
            photoUrl: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    coaches = teachers.map((t) => {
      const p = t.teacherProfile;
      return {
        id: t.id,
        name: t.name,
        branch: p?.scoreType ? `${p.scoreType} Alanı / YKS Koçu` : "YKS Koçu",
        uni: p?.school || "Üniversite Belirtilmedi",
        badge: p?.yksRank ? `YKS ${p.scoreType ? `${p.scoreType} ` : ""}Sıralaması: ${p.yksRank}` : "Derece Eğitmeni",
        img: p?.showPhotoOnWeb !== false ? (p?.photoUrl || "") : "",
        districts: p?.districts || "",
        onlineAvailable: Boolean(p?.onlineAvailable),
      };
    });
  } catch (e) {
    console.error("Server fetch coaches error in page.tsx:", e);
  }

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
        "telephone": settings?.contactPhone || "+905300000000",
        "email": settings?.contactEmail || "info@pontakademi.com",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": settings?.contactAddress || "Beşiktaş",
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
      <HomeClient initialSettings={settings} initialCoaches={coaches} />
    </>
  );
}
