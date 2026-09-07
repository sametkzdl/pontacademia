import { NextRequest } from "next/server";
import { LessonController } from "@/controllers/lesson.controller";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return LessonController.updateTeacherPayment(req, context);
}
