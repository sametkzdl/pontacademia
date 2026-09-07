import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/services/auth.service";
import { ApiResponse } from "@/utils/response";
import { getSessionUser, COOKIE_NAME } from "@/utils/auth";

export class AuthController {
  /**
   * POST /api/auth/login
   */
  static async login(req: NextRequest) {
    try {
      const body = await req.json();
      const { email, password } = body;

      if (!email || !password) {
        return ApiResponse.error("E-posta ve şifre zorunludur.", 400);
      }

      const { user, token } = await AuthService.login(email, password);

      let redirectUrl = "/";
      if (user.role === "ADMIN") {
        redirectUrl = "/admin";
      } else if (user.role === "TEACHER") {
        redirectUrl = "/teacher";
      } else if (user.role === "STUDENT") {
        redirectUrl = "/student";
      }

      const response = ApiResponse.success({ 
        user, 
        redirectUrl,
        message: "Giriş başarılı." 
      });
      
      // HttpOnly Güvenli Cookie Kaydı
      response.cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 gün
        path: "/",
      });

      return response;
    } catch (err: any) {
      return ApiResponse.error(err.message || "Giriş yapılamadı.", 400);
    }
  }

  /**
   * POST /api/auth/logout
   */
  static async logout() {
    try {
      const response = ApiResponse.success({ message: "Başarıyla çıkış yapıldı." });
      response.cookies.set(COOKIE_NAME, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
      });
      return response;
    } catch (err: any) {
      return ApiResponse.serverError("Çıkış yapılırken bir hata oluştu.", err);
    }
  }

  /**
   * GET /api/auth/me
   */
  static async me() {
    try {
      const session = await getSessionUser();
      if (!session) {
        return ApiResponse.unauthorized("Oturum bulunamadı.");
      }

      const user = await AuthService.getCurrentUser(session.userId);
      if (!user) {
        const response = ApiResponse.forbidden("Hesabınız pasif duruma getirilmiştir.");
        response.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
        return response;
      }

      return ApiResponse.success({ user });
    } catch (err: any) {
      return ApiResponse.serverError("Kullanıcı bilgisi alınamadı.", err);
    }
  }

  /**
   * POST /api/auth/change-password
   */
  static async changePassword(req: NextRequest) {
    try {
      const session = await getSessionUser();
      if (!session) {
        return ApiResponse.unauthorized("Oturum açmanız gerekiyor.");
      }

      const body = await req.json();
      const { currentPassword, newPassword } = body;

      if (!currentPassword || !newPassword) {
        return ApiResponse.error("Mevcut şifre ve yeni şifre zorunludur.", 400);
      }

      await AuthService.changePassword(session.userId, currentPassword, newPassword);

      return ApiResponse.success({ message: "Şifreniz başarıyla güncellendi." });
    } catch (err: any) {
      return ApiResponse.error(err.message || "Şifre güncellenemedi.", 400);
    }
  }
}
