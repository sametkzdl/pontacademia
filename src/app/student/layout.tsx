import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Öğrenci Paneli | Pont Academy",
  description: "Pont Academy Öğrenci Portalı",
  robots: {
    index: false,
    follow: false,
  },
};

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
