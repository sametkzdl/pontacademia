import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "pont_academy_super_secret_jwt_key_2026"
);

export const COOKIE_NAME = "pont_auth_token";

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  isActive?: boolean;
  mustChangePassword?: boolean;
}

// JWT İmzala (7 günlük)
export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

// JWT Doğrula
export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// Server Component / Route Handler / Service için Cookie'den Kullanıcıyı Getir
export async function getSessionUser(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

// Request üzerinden token doğrula (Middleware için)
export async function getSessionFromRequest(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}
