import { UserController } from "@/controllers/user.controller";

export async function GET() {
  return UserController.getAllUsers();
}
