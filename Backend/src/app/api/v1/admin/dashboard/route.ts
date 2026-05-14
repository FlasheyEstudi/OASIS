import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUserFromHeader, ROLES } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { handleError } from "@/lib/handle-error";
import { createAuditLog } from "@/lib/oasis-utils";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUserFromHeader(req);
    if (!auth || (auth.user.role !== ROLES.SUPERADMIN && auth.user.role !== "admin")) {
      return apiError("No autorizado", 401);
    }

    // Registro de auditoría
    await createAuditLog({
      userId: auth.user.id,
      action: 'view_dashboard',
      entity: 'Admin',
      entityId: auth.user.id,
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      details: { section: 'dashboard' }
    });

    const [totalUsers, activeUsers, totalOrders, totalRevenue, activeDoctors, activePharmacies] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { isActive: true } }),
      db.order.count(),
      db.order.aggregate({ _sum: { totalAmount: true } }),
      db.doctor.count({ where: { isActive: true } }),
      db.pharmacy.count({ where: { isActive: true } })
    ]);

    const stats = {
      totalUsers,
      activeUsers,
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      activeDoctors,
      activePharmacies,
      systemHealth: "optimal"
    };

    return apiSuccess(stats);
  } catch (error) {
    return handleError(error, "GET_ADMIN_DASHBOARD");
  }
}
