import { NextRequest } from "next/server";
import { LessonController } from "@/controllers/lesson.controller";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return await LessonController.rejectLesson(req, { params });
}
