import { NextRequest } from "next/server";
import { RequestController } from "@/controllers/request.controller";

export async function GET(req: NextRequest) {
  return await RequestController.getAllRequests(req);
}
