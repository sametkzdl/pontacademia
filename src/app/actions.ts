"use server";

import { getSiteSettings } from "@/lib/site";

type Result = { success: boolean; error?: string };

// Online applications are closed for now: nothing is stored or sent. The forms stay on the site
// and point visitors to the phone/WhatsApp number instead of pretending the submission went through.
function closedMessage(what: string) {
  const phone = getSiteSettings().contactPhone;
  return phone
    ? `Online ${what} şu an alınamıyor. Lütfen ${phone} numarasından bizi arayın veya WhatsApp'tan yazın.`
    : `Online ${what} şu an alınamıyor. Lütfen sayfadaki iletişim bilgilerinden bize ulaşın.`;
}

export async function submitBasvuruForm(_fd: FormData): Promise<Result> {
  return { success: false, error: closedMessage("başvuru") };
}

export async function submitContactForm(_data: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}): Promise<Result> {
  return { success: false, error: closedMessage("mesaj") };
}
