import { NextRequest } from "next/server";
import { StorageController } from "@/controllers/storage.controller";

export async function DELETE(req: NextRequest) {
  return StorageController.delete(req);
}
