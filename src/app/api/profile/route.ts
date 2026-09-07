import { NextRequest } from "next/server";
import { ProfileController } from "@/controllers/profile.controller";

export async function PATCH(req: NextRequest) {
  return ProfileController.updateProfile(req);
}
