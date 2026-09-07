import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giriş Yap | Pont Academy Panel",
  description: "Pont Academy Öğrenci, Öğretmen ve Yönetici Giriş Paneli",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
