export const TYT_SUBJECTS = [
  "TYT Matematik",
  "TYT Geometri",
  "TYT Türkçe",
  "TYT Fizik",
  "TYT Kimya",
  "TYT Biyoloji",
  "TYT Tarih",
  "TYT Coğrafya",
  "TYT Felsefe & Din",
] as const;

export const AYT_SUBJECTS = [
  "AYT Matematik",
  "AYT Geometri",
  "AYT Fizik",
  "AYT Kimya",
  "AYT Biyoloji",
  "AYT Edebiyat",
  "AYT Tarih",
  "AYT Coğrafya",
  "AYT Felsefe Grubu",
] as const;

export const LGS_SUBJECTS = [
  "LGS / Ortaokul Matematik",
  "LGS / Ortaokul Fen Bilimleri",
  "LGS / Ortaokul Türkçe",
  "LGS / Ortaokul T.C. İnkılap Tarihi",
  "LGS / Ortaokul Din Kültürü",
  "LGS / Ortaokul İngilizce",
  "Ortaokul Tüm Dersler / Okul Takviye",
] as const;

export const LANGUAGE_SUBJECTS = [
  "İngilizce",
  "YDT İngilizce",
  "Almanca",
  "Fransızca",
] as const;

export const COACHING_SUBJECTS = [
  "Eğitim Koçluğu",
  "LGS Koçluğu",
] as const;

export const MATCH_SUBJECT_OPTIONS = [
  // --- TYT DERSLERİ ---
  { value: "TYT Matematik", label: "📘 TYT Matematik" },
  { value: "TYT Geometri", label: "📐 TYT Geometri" },
  { value: "TYT Türkçe", label: "📖 TYT Türkçe" },
  { value: "TYT Fizik", label: "⚡ TYT Fizik" },
  { value: "TYT Kimya", label: "🧪 TYT Kimya" },
  { value: "TYT Biyoloji", label: "🧬 TYT Biyoloji" },
  { value: "TYT Tarih", label: "🏛️ TYT Tarih" },
  { value: "TYT Coğrafya", label: "🌍 TYT Coğrafya" },
  { value: "TYT Felsefe & Din", label: "💭 TYT Felsefe & Din" },

  // --- AYT DERSLERİ ---
  { value: "AYT Matematik", label: "📚 AYT Matematik" },
  { value: "AYT Geometri", label: "📐 AYT Geometri" },
  { value: "AYT Fizik", label: "⚡ AYT Fizik" },
  { value: "AYT Kimya", label: "🧪 AYT Kimya" },
  { value: "AYT Biyoloji", label: "🧬 AYT Biyoloji" },
  { value: "AYT Edebiyat", label: "📜 AYT Türk Dili & Edebiyatı" },
  { value: "AYT Tarih", label: "🏛️ AYT Tarih" },
  { value: "AYT Coğrafya", label: "🌍 AYT Coğrafya" },
  { value: "AYT Felsefe Grubu", label: "💭 AYT Felsefe Grubu" },

  // --- ORTAOKUL & LGS ---
  { value: "LGS / Ortaokul Matematik", label: "📐 LGS / Ortaokul Matematik" },
  { value: "LGS / Ortaokul Fen Bilimleri", label: "🔬 LGS / Ortaokul Fen Bilimleri" },
  { value: "LGS / Ortaokul Türkçe", label: "📖 LGS / Ortaokul Türkçe" },
  { value: "LGS / Ortaokul T.C. İnkılap Tarihi", label: "🏛️ LGS / İnkılap Tarihi" },
  { value: "LGS / Ortaokul Din Kültürü", label: "🕌 LGS / Din Kültürü" },
  { value: "LGS / Ortaokul İngilizce", label: "🇬🇧 LGS / İngilizce" },
  { value: "Ortaokul Tüm Dersler / Okul Takviye", label: "🎒 Ortaokul Tüm Dersler / Takviye" },

  // --- YABANCI DİL ---
  { value: "İngilizce", label: "🇬🇧 İngilizce" },
  { value: "YDT İngilizce", label: "🎯 YDT İngilizce Hazırlık" },
  { value: "Almanca", label: "🇩🇪 Almanca" },
  { value: "Fransızca", label: "🇫🇷 Fransızca" },

  // --- EĞİTİM KOÇLUĞU ---
  { value: "Eğitim Koçluğu", label: "🎓 Eğitim Koçluğu & Takip" },
  { value: "LGS Koçluğu", label: "🎯 LGS Koçluğu & Takip" },
];
