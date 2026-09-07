import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Eğitmen Paneli | Pont Academy",
  description: "Pont Academy Eğitmen & Koç Portalı",
  robots: {
    index: false,
    follow: false,
  },
};

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
