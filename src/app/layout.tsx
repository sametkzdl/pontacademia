import type { Metadata } from "next";
import { Playfair_Display, Roboto } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["700", "800"],
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pontacademy.com"),
  title: {
    default: "Pont Academy — Birebir Özel Ders ve Kişisel Sınav Koçluğu",
    template: "%s | Pont Academy"
  },
  description: "Türkiye'nin en başarılı üniversitelerinden mezun eğitmen kadrosuyla YKS ve LGS sınavlarına hazırlıkta kişiselleştirilmiş birebir dersler ve profesyonel koçluk.",
  keywords: ["YKS özel ders", "LGS koçluk", "birebir ders", "online koçluk", "üniversite hazırlık", "lise hazırlık", "TYT AYT puan hesaplama", "Pont Academy"],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Pont Academy — Birebir Özel Ders ve Kişisel Sınav Koçluğu",
    description: "Türkiye'nin en başarılı üniversitelerinden mezun eğitmen kadrosuyla YKS ve LGS sınavlarına hazırlıkta kişiselleştirilmiş birebir dersler ve profesyonel koçluk.",
    url: "https://pontacademy.com",
    siteName: "Pont Academy",
    type: "website",
    locale: "tr_TR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pont Academy — Birebir Özel Ders ve Kişisel Sınav Koçluğu",
    description: "Türkiye'nin en başarılı üniversitelerinden mezun eğitmen kadrosuyla YKS ve LGS sınavlarına hazırlıkta kişiselleştirilmiş birebir dersler ve profesyonel koçluk.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Pont Academy",
    "url": "https://pontacademy.com",
    "logo": "https://pontacademy.com/pont_logo.png",
    "description": "Türkiye'nin en başarılı üniversitelerinden mezun eğitmen kadrosuyla YKS ve LGS sınavlarına hazırlıkta kişiselleştirilmiş birebir dersler ve profesyonel koçluk.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "İstanbul",
      "addressRegion": "İstanbul",
      "addressCountry": "TR"
    },
    "sameAs": [
      "https://www.instagram.com/pontacademy",
      "https://www.linkedin.com/company/pontacademy"
    ],
    "offers": [
      {
        "@type": "Offer",
        "name": "Birebir Özel Ders",
        "category": "Eğitim"
      },
      {
        "@type": "Offer",
        "name": "YKS & LGS Eğitim Koçluğu",
        "category": "Sınav Koçluğu"
      }
    ]
  };

  return (
    <html lang="tr" className={`${playfair.variable} ${roboto.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#0F2645" />
        <link rel="icon" href="/icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
