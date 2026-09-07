import { NextResponse } from "next/server";

export interface ApiResponseOptions<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  message?: string;
  [key: string]: any;
}

export class ApiResponse {
  /**
   * Başarılı JSON Yanıtı
   */
  static success<T>(data?: T, status = 200, extra?: Record<string, any>) {
    const body: Record<string, any> = {
      success: true,
      ...(data !== undefined ? (typeof data === "object" && !Array.isArray(data) ? data : { data }) : {}),
      ...extra,
    };
    return NextResponse.json(body, { status });
  }

  /**
   * Hata JSON Yanıtı
   */
  static error(message: string, status = 400, errors?: Record<string, string[]>) {
    return NextResponse.json(
      {
        success: false,
        error: message,
        ...(errors ? { errors } : {}),
      },
      { status }
    );
  }

  /**
   * 401 Unauthorized Yanıtı
   */
  static unauthorized(message = "Oturum açmanız gerekiyor.") {
    return NextResponse.json({ success: false, error: message }, { status: 401 });
  }

  /**
   * 403 Forbidden Yanıtı
   */
  static forbidden(message = "Bu işlemi yapmaya yetkiniz yok.") {
    return NextResponse.json({ success: false, error: message }, { status: 403 });
  }

  /**
   * 404 Not Found Yanıtı
   */
  static notFound(message = "İstenen kaynak bulunamadı.") {
    return NextResponse.json({ success: false, error: message }, { status: 404 });
  }

  /**
   * 500 Internal Server Error Yanıtı
   */
  static serverError(message = "Sunucu tarafında bir hata oluştu.", err?: unknown) {
    if (process.env.NODE_ENV !== "production" && err) {
      console.error("[ServerError]:", err);
    }
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
