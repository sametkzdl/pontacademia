import { NextRequest } from "next/server";
import { SettingController } from "@/controllers/setting.controller";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function POST(req: NextRequest) {
  return await SettingController.updateSettings(req);
}
