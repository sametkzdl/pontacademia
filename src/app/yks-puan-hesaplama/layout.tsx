import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "YKS (TYT - AYT) Puan Hesaplama ve Sıralama Tahmini",
  description: "TYT ve AYT netlerinizi girerek Sayısal (SAY), Eşit Ağırlık (EA) ve Sözel (SÖZ) yerleştirme puanlarınızı hesaplayın, sıralamanızı tahmin edin.",
  alternates: {
    canonical: "/yks-puan-hesaplama",
  },
};

export default function YksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
