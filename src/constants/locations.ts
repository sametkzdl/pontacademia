export const ISTANBUL_DISTRICTS: { anadolu: string[]; avrupa: string[] } = {
  anadolu: [
    "Adalar", "Ataşehir", "Beykoz", "Çekmeköy", "Kadıköy", 
    "Kartal", "Maltepe", "Pendik", "Sancaktepe", "Sultanbeyli", 
    "Şile", "Tuzla", "Ümraniye", "Üsküdar"
  ],
  avrupa: [
    "Arnavutköy", "Avcılar", "Bağcılar", "Bahçelievler", "Bakırköy", 
    "Başakşehir", "Bayrampaşa", "Beşiktaş", "Beylikdüzü", "Beyoğlu", 
    "Büyükçekmece", "Çatalca", "Esenler", "Esenyurt", "Eyüpsultan", 
    "Fatih", "Gaziosmanpaşa", "Güngören", "Kâğıthane", "Küçükçekmece", 
    "Sarıyer", "Silivri", "Sultangazi", "Şişli", "Zeytinburnu"
  ]
};

export const ALL_ISTANBUL_DISTRICTS: string[] = [
  ...ISTANBUL_DISTRICTS.anadolu,
  ...ISTANBUL_DISTRICTS.avrupa
].sort((a, b) => a.localeCompare("tr"));

export const DISTRICT_OPTIONS = ALL_ISTANBUL_DISTRICTS.map((d) => ({
  value: d,
  label: d,
}));
