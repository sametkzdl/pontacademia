import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kişisel Sınav Koçluğu Başvurusu",
  description: "YKS ve LGS süreçlerinizi yönetmek, haftalık çalışma planları ve deneme analizleri almak için kişisel sınav koçluğu başvuru formunu doldurun.",
  alternates: {
    canonical: "/kocluk-basvuru",
  },
};

export default function KoclukLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
