import { NextRequest } from "next/server";
import { SettingController } from "@/controllers/setting.controller";

export async function POST(req: NextRequest) {
  return await SettingController.updateSettings(req);
}
