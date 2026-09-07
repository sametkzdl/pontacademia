import { NextRequest } from "next/server";
import { ContactController } from "@/controllers/contact.controller";

export async function GET(req: NextRequest) {
  return ContactController.getAllMessages(req);
}

export async function PATCH(req: NextRequest) {
  return ContactController.updateStatus(req);
}

export async function DELETE(req: NextRequest) {
  return ContactController.deleteMessage(req);
}
