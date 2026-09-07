import { NextRequest } from "next/server";
import { MatchController } from "@/controllers/match.controller";

export async function GET(req: NextRequest) {
  return await MatchController.getTeacherStudents(req);
}
