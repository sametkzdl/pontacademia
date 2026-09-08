import type { Metadata } from "next";
import TeacherApplicationClient from "./TeacherApplicationClient";

export const metadata: Metadata = {
  title: "Eğitmen & Sınav Koçu Başvuru Formu",
  description: "Boğaziçi, ODTÜ, İTÜ, Bilkent gibi Türkiye'nin önde gelen üniversitelerinde okuyan veya mezun olan derece öğrencileri için Pont Academy eğitmen ve koç başvuru formu.",
  keywords: [
    "eğitmen başvurusu",
    "özel ders öğretmeni iş ilanı",
    "öğrenci koçu başvurusu",
    "yks koç başvuru",
    "üniversite öğrencisi iş imkanı",
    "Pont Academy"
  ],
  alternates: {
    canonical: "/teacherApplicationForm",
  },
  openGraph: {
    title: "Eğitmen & Sınav Koçu Başvurusu | Pont Academy",
    description: "Derece yapan eğitmen kadromuza katılarak öğrencilerin hedeflerine rehberlik edin.",
    url: "https://pontacademy.com/teacherApplicationForm",
    type: "website",
    locale: "tr_TR",
  },
};

export default function TeacherApplicationPage() {
  return <TeacherApplicationClient />;
}
