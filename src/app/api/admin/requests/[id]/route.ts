import { NextRequest } from "next/server";
import { RequestController } from "@/controllers/request.controller";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  return await RequestController.updateRequestStatus(req, resolvedParams);
}
