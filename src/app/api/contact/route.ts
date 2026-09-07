import { NextRequest } from "next/server";
import { ContactController } from "@/controllers/contact.controller";

export async function POST(req: NextRequest) {
  return ContactController.createMessage(req);
}
