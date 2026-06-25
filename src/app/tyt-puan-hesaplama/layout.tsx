import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TYT Puan Hesaplama ve Tahmini YKS Sıralaması",
  description: "Güncel katsayılar ile TYT netlerinizi girerek ham ve yerleştirme puanlarınızı hesaplayın, tahmini YKS sıralamanızı anında görün.",
  alternates: {
    canonical: "/tyt-puan-hesaplama",
  },
};

export default function TytLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
