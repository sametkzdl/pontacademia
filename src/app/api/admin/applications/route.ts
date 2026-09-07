import { ApplicationController } from "@/controllers/application.controller";

export async function GET() {
  return ApplicationController.getAllApplications();
}
