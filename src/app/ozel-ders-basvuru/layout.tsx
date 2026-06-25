import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Birebir Özel Ders Başvurusu",
  description: "YKS ve LGS hazırlığında Türkiye'nin en iyi eğitmenlerinden birebir özel ders almak için başvuru formunu doldurun.",
  alternates: {
    canonical: "/ozel-ders-basvuru",
  },
};

export default function OzelDersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
