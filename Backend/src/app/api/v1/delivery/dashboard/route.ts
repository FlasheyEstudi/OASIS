import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAuthUserFromHeader } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { handleError } from "@/lib/handle-error";
import { createAuditLog } from "@/lib/oasis-utils";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthUserFromHeader(req);
    if (!auth || (auth.user.role !== "delivery_person" && auth.user.role !== "delivery")) {
      return apiError("No autorizado", 401);
    }

    const deliveryPerson = await db.deliveryPerson.findUnique({
      where: { userId: auth.user.id }
    });

    if (!deliveryPerson) return apiError("Repartidor no encontrado", 404);

    // Registro de auditoría
    await createAuditLog({
      userId: auth.user.id,
      action: 'view_dashboard',
      entity: 'DeliveryPerson',
      entityId: deliveryPerson.id,
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      details: { section: 'dashboard' }
    });

    const [activeDelivery, todayDeliveries, availableOrders] = await Promise.all([
      db.delivery.findFirst({
        where: { deliveryPersonId: deliveryPerson.id, status: { notIn: ["delivered", "failed"] } },
        include: { order: { include: { pharmacy: true, patient: { include: { user: true } } } } }
      }),
      db.delivery.count({
        where: { 
          deliveryPersonId: deliveryPerson.id, 
          status: "delivered",
          updatedAt: { gte: new Date(new Date().setHours(0,0,0,0)) }
        }
      }),
      db.order.findMany({
        where: { status: "ready_for_pickup", delivery: null },
        include: { pharmacy: true },
        take: 10
      })
    ]);

    const stats = {
      isAvailable: deliveryPerson.isAvailable,
      currentDelivery: activeDelivery,
      todayDeliveriesCount: todayDeliveries,
      earningsBalance: deliveryPerson.earningsBalance,
      availableOrdersNearCount: availableOrders.length,
      availableOrders,
      rating: deliveryPerson.rating
    };

    return apiSuccess(stats);
  } catch (error) {
    return handleError(error, "GET_DELIVERY_DASHBOARD");
  }
}
