import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Yönetici Paneli | Pont Academy",
  description: "Pont Academy Başvuru ve Kullanıcı Yönetim Paneli",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
