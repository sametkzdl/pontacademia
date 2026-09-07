import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Eğitmen & Koç Başvuru Formu | Pont Academy",
  description: "Pont Academy bünyesinde eğitmen ve öğrenci koçu olarak yer almak için başvuru formunu doldurun.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function TeacherApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
