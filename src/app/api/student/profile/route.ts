import { NextRequest } from "next/server";
import { ProfileController } from "@/controllers/profile.controller";

export async function GET() {
  return ProfileController.getProfile();
}

export async function PUT(req: NextRequest) {
  return ProfileController.updateProfile(req);
}

export async function PATCH(req: NextRequest) {
  return ProfileController.updateProfile(req);
}
