import { NextRequest } from "next/server";
import { StorageController } from "@/controllers/storage.controller";

export async function POST(req: NextRequest) {
  return StorageController.upload(req);
}
