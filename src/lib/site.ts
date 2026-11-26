// Site content that used to live in the admin panel's settings table. Set in .env on the server;
// the home page reads it on every request, so a change only needs `pm2 restart pontakademi`.
export function getSiteSettings() {
  const banner = (process.env.SITE_CAMPAIGN_BANNER_TEXT || "").trim();
  return {
    privateLessonPrice: process.env.SITE_PRIVATE_LESSON_PRICE || "",
    coachingPrice: process.env.SITE_COACHING_PRICE || "",
    campaignBannerActive: banner.length > 0,
    campaignBannerText: banner,
    contactPhone: process.env.SITE_CONTACT_PHONE || "",
    contactEmail: process.env.SITE_CONTACT_EMAIL || "",
    contactAddress: process.env.SITE_CONTACT_ADDRESS || "",
  };
}
