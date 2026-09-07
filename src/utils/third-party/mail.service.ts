/**
 * 3. Parti E-posta & Bildirim Entegrasyon Servisi (Third-Party Integration)
 * İleride Resend, Sendgrid, AWS SES veya Nodemailer/SMTP entegre edilebilir.
 */

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class ThirdPartyMailService {
  /**
   * E-posta gönderimi gerçekleştirir
   */
  static async sendMail(options: SendMailOptions): Promise<{ success: boolean; messageId?: string }> {
    // Geliştirme ortamı konsol loglama & simülasyonu
    console.log(`[ThirdPartyMailService] Mail gönderiliyor -> Alıcı: ${options.to} | Konu: ${options.subject}`);
    
    // Gerçek servis entegrasyonu için:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // return await resend.emails.send({ ... });

    return {
      success: true,
      messageId: `mock-mail-${Date.now()}`,
    };
  }

  /**
   * Başvuru Onay ve Geçici Şifre Bildirim Maili
   */
  static async sendAccountApprovalMail(email: string, name: string, tempPassword: string, role: string) {
    const roleText = role === "TEACHER" ? "Öğretmen" : "Öğrenci";
    return this.sendMail({
      to: email,
      subject: `Pont Academy - ${roleText} Hesabınız Onaylandı 🎉`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E2E8F0; borderRadius: 8px;">
          <h2 style="color: #0F2645;">Tebrikler ${name}!</h2>
          <p>Pont Academy başvurunuz onaylanmış ve hesabınız oluşturulmuştur.</p>
          <div style="background-color: #F8FAFC; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p><strong>Giriş E-postanız:</strong> ${email}</p>
            <p><strong>Geçici Şifreniz:</strong> <code style="background-color: #E2E8F0; padding: 2px 6px; border-radius: 4px;">${tempPassword}</code></p>
          </div>
          <p>İlk girişinizde lütfen güvenlik gereği şifrenizi güncelleyiniz.</p>
          <a href="http://localhost:3000/login" style="display: inline-block; background-color: #0F2645; color: #FFFFFF; padding: 10px 20px; text-decoration: none; border-radius: 6px;">Giriş Yap</a>
        </div>
      `,
    });
  }
}
