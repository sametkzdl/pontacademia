import db from "@/utils/db";
import { hashPassword, verifyPassword } from "@/utils/hash";
import { signToken, SessionPayload } from "@/utils/auth";

export class AuthService {
  /**
   * Kullanıcı Girişi
   */
  static async login(email: string, password: string): Promise<{
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      mustChangePassword: boolean;
      isActive: boolean;
    };
    token: string;
  }> {
    const trimmedEmail = email.toLowerCase().trim();
    const user = await db.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (!user) {
      throw new Error("E-posta adresi veya şifre hatalı.");
    }

    if (user.isActive === false) {
      throw new Error("Hesabınız pasif duruma getirilmiştir. Lütfen yönetici ile iletişime geçiniz.");
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      throw new Error("E-posta adresi veya şifre hatalı.");
    }

    const sessionPayload: SessionPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "ADMIN" | "TEACHER" | "STUDENT",
      isActive: user.isActive,
      mustChangePassword: user.mustChangePassword,
    };

    const token = await signToken(sessionPayload);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
        isActive: user.isActive,
      },
      token,
    };
  }

  /**
   * Giriş Yapan Kullanıcının Profil Bilgilerini Getir
   */
  static async getCurrentUser(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        teacherProfile: true,
        studentProfile: true,
      },
    });

    if (!user || user.isActive === false) {
      return null;
    }

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  /**
   * Şifre Değiştir
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("Kullanıcı bulunamadı.");
    }

    const isMatch = await verifyPassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new Error("Mevcut şifreniz hatalı.");
    }

    if (newPassword.length < 6) {
      throw new Error("Yeni şifreniz en az 6 karakter olmalıdır.");
    }

    const newHash = await hashPassword(newPassword);

    await db.user.update({
      where: { id: userId },
      data: {
        passwordHash: newHash,
        mustChangePassword: false,
      },
    });
  }
}
