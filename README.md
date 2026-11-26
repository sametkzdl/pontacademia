# Pont Academy — tanıtım sitesi

pontakademi.com: YKS/LGS özel ders ve koçluk tanıtım sitesi. Next.js 16, veritabanı yok.

| Rota | Açıklama |
|---|---|
| `/` | Ana sayfa (iletişim bilgileri, fiyat ve kampanya bandı `.env`'den) |
| `/ozel-ders-basvuru`, `/teacherApplicationForm` | Başvuru formları (şimdilik kapalı: gönderince telefon numarasını gösterir, hiçbir şey kaydedilmez) |
| `/kocluk-basvuru` | Koçluk tanıtım sayfası |
| `/tyt-puan-hesaplama`, `/yks-puan-hesaplama` | Puan hesaplayıcılar (tamamen tarayıcıda çalışır) |

Formların gönderimi `src/app/actions.ts` içinde. Şu an hiçbir şey kaydetmiyor veya göndermiyor.

## Sunucuya kurulum

```bash
cd /var/www
git clone https://github.com/sametkzdl/pontacademia.git pontakademi
cd pontakademi
cp .env.example .env && nano .env      # site bilgileri
npm ci && npm run build
PORT=3001 pm2 start npm --name pontakademi -- start
pm2 save
```

Güncelleme: `git pull && npm ci && npm run build && pm2 restart pontakademi`

`.env`'deki site bilgileri her istekte okunur. Değiştirdikten sonra `pm2 restart pontakademi` yeterli, build gerekmez.
