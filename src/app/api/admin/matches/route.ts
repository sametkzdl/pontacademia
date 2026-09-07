import { NextRequest } from "next/server";
import { MatchController } from "@/controllers/match.controller";

export async function GET(req: NextRequest) {
  return await MatchController.getAllMatches(req);
}

export async function POST(req: NextRequest) {
  return await MatchController.createMatch(req);
}

export async function DELETE(req: NextRequest) {
  return await MatchController.deleteMatch(req);
}
