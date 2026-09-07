import { AuthController } from "@/controllers/auth.controller";

export async function GET() {
  return AuthController.me();
}
