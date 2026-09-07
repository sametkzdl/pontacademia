import { NextRequest } from "next/server";
import { LessonController } from "@/controllers/lesson.controller";

export async function GET(req: NextRequest) {
  return await LessonController.getLessons(req);
}

export async function POST(req: NextRequest) {
  return await LessonController.createLesson(req);
}
