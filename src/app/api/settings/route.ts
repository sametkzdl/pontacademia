import { SettingController } from "@/controllers/setting.controller";

export async function GET() {
  return await SettingController.getPublicSettings();
}
