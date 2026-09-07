import { NextRequest } from "next/server";
import { ApplicationController } from "@/controllers/application.controller";

export async function POST(req: NextRequest) {
  return ApplicationController.updateTeacherScores(req);
}
