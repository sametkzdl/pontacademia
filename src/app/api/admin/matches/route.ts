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

export async function PUT(req: NextRequest) {
  return await MatchController.updateMatch(req);
}

export async function PATCH(req: NextRequest) {
  return await MatchController.updateMatch(req);
}

