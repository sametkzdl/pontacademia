import { NextRequest } from "next/server";
import { ApplicationService } from "@/services/application.service";
import { ApiResponse } from "@/utils/response";
import { getSessionUser } from "@/utils/auth";

export class ApplicationController {
  /**
   * POST /api/applications/teacher
   */
  static async submitTeacherApplication(req: NextRequest) {
    try {
      const body = await req.json();
      const application = await ApplicationService.createTeacherApplication(body);
      return ApiResponse.success({ application, message: "Başvurunuz başarıyla alındı." }, 201);
    } catch (err: any) {
      return ApiResponse.error(err.message || "Başvuru kaydedilemedi.", 400);
    }
  }

  /**
   * POST /api/applications/student
   */
  static async submitStudentApplication(req: NextRequest) {
    try {
      const body = await req.json();
      const application = await ApplicationService.createStudentApplication(body);
      return ApiResponse.success({ application, message: "Başvurunuz başarıyla alındı." }, 201);
    } catch (err: any) {
      return ApiResponse.error(err.message || "Başvuru kaydedilemedi.", 400);
    }
  }

  /**
   * GET /api/admin/applications
   */
  static async getAllApplications() {
    try {
      const session = await getSessionUser();
      if (!session || session.role !== "ADMIN") {
        return ApiResponse.forbidden("Bu alana yalnızca yöneticiler erişebilir.");
      }

      const result = await ApplicationService.getAllApplications();
      return ApiResponse.success(result);
    } catch (err: any) {
      return ApiResponse.serverError("Başvurular yüklenirken hata oluştu.", err);
    }
  }

  /**
   * POST /api/admin/applications/teacher/approve
   */
  static async approveTeacher(req: NextRequest) {
    try {
      const session = await getSessionUser();
      if (!session || session.role !== "ADMIN") {
        return ApiResponse.forbidden("Bu işlemi yalnızca yöneticiler yapabilir.");
      }

      const body = await req.json();
      const { applicationId, temporaryPassword } = body;

      if (!applicationId || !temporaryPassword) {
        return ApiResponse.error("Başvuru ID ve geçici şifre zorunludur.", 400);
      }

      const result = await ApplicationService.approveTeacherApplication(applicationId, temporaryPassword);
      return ApiResponse.success({
        message: "Öğretmen başarıyla onaylandı ve hesabı oluşturuldu.",
        ...result,
      });
    } catch (err: any) {
      return ApiResponse.error(err.message || "Öğretmen onaylanamadı.", 400);
    }
  }

  /**
   * POST /api/admin/applications/teacher/reject
   */
  static async rejectTeacher(req: NextRequest) {
    try {
      const session = await getSessionUser();
      if (!session || session.role !== "ADMIN") {
        return ApiResponse.forbidden("Bu işlemi yalnızca yöneticiler yapabilir.");
      }

      const body = await req.json();
      const { applicationId } = body;

      if (!applicationId) {
        return ApiResponse.error("Başvuru ID zorunludur.", 400);
      }

      await ApplicationService.rejectTeacherApplication(applicationId);
      return ApiResponse.success({ message: "Başvuru reddedildi." });
    } catch (err: any) {
      return ApiResponse.error(err.message || "Başvuru reddedilemedi.", 400);
    }
  }

  /**
   * POST /api/admin/applications/student/approve
   */
  static async approveStudent(req: NextRequest) {
    try {
      const session = await getSessionUser();
      if (!session || session.role !== "ADMIN") {
        return ApiResponse.forbidden("Bu işlemi yalnızca yöneticiler yapabilir.");
      }

      const body = await req.json();
      const { applicationId, temporaryPassword } = body;

      if (!applicationId) {
        return ApiResponse.error("Başvuru ID zorunludur.", 400);
      }

      const result = await ApplicationService.approveStudentApplication(applicationId, temporaryPassword);
      return ApiResponse.success({
        message: result.isNewAccount
          ? "Öğrenci başarıyla onaylandı ve hesabı oluşturuldu."
          : "Öğrenci başarıyla onaylandı ve mevcut hesabına bağlandı.",
        ...result,
      });
    } catch (err: any) {
      return ApiResponse.error(err.message || "Öğrenci onaylanamadı.", 400);
    }
  }

  /**
   * POST /api/admin/applications/student/reject
   */
  static async rejectStudent(req: NextRequest) {
    try {
      const session = await getSessionUser();
      if (!session || session.role !== "ADMIN") {
        return ApiResponse.forbidden("Bu işlemi yalnızca yöneticiler yapabilir.");
      }

      const body = await req.json();
      const { applicationId } = body;

      if (!applicationId) {
        return ApiResponse.error("Başvuru ID zorunludur.", 400);
      }

      await ApplicationService.rejectStudentApplication(applicationId);
      return ApiResponse.success({ message: "Başvuru reddedildi." });
    } catch (err: any) {
      return ApiResponse.error(err.message || "Başvuru reddedilemedi.", 400);
    }
  }
}
