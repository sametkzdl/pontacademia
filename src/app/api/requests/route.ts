import { NextRequest } from "next/server";
import { RequestController } from "@/controllers/request.controller";

export async function POST(req: NextRequest) {
  return await RequestController.createRequest(req);
}

export async function GET(req: NextRequest) {
  return await RequestController.getMyRequests(req);
}
