import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "pont_academy_super_secret_jwt_key_2026"
);

const COOKIE_NAME = "pont_auth_token";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Sadece korumalı rotaları denetle
  const isAdminRoute = pathname.startsWith("/admin");
  const isTeacherRoute = pathname.startsWith("/teacher");
  const isStudentRoute = pathname.startsWith("/student");

  if (!isAdminRoute && !isTeacherRoute && !isStudentRoute) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = (payload as any).role;
    const isActive = (payload as any).isActive;

    if (isActive === false) {
      const response = NextResponse.redirect(new URL("/login?error=account_deactivated", req.url));
      response.cookies.delete(COOKIE_NAME);
      return response;
    }

    if (isAdminRoute && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (isTeacherRoute && role !== "TEACHER" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (isStudentRoute && role !== "STUDENT" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*", "/student/:path*"],
};
