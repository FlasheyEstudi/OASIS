// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - My Deliveries API
// GET /api/v1/delivery/my-deliveries
// Returns all deliveries assigned to the authenticated delivery person
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { apiSuccess, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  if (auth.user.role !== ROLES.DELIVERY_PERSON && auth.user.role !== ROLES.SUPERADMIN) {
    return apiForbidden('Solo repartidores pueden ver sus entregas');
  }

  const dp = await db.deliveryPerson.findUnique({ where: { userId: auth.user.id } });
  if (!dp) return apiNotFound('Perfil de repartidor no encontrado');

  const url = new URL(request.url);
  const status = url.searchParams.get('status'); // optional filter

  const deliveries = await db.delivery.findMany({
    where: {
      deliveryPersonId: dp.id,
      ...(status ? { status } : {}),
    },
    include: {
      order: {
        include: {
          pharmacy: {
            select: { id: true, name: true, address: true, latitude: true, longitude: true }
          },
          items: {
            include: {
              medication: { select: { name: true } }
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  // Flatten to include order-level fields for the driver app
  const result = deliveries.map(d => ({
    id: d.id,
    orderId: d.orderId,
    status: d.status,
    pickupTime: d.pickupTime,
    deliveryTime: d.deliveryTime,
    pharmacy: d.order.pharmacy,
    deliveryAddress: d.order.deliveryAddress,
    deliveryLatitude: d.order.deliveryLatitude,
    deliveryLongitude: d.order.deliveryLongitude,
    deliveryNotes: d.order.deliveryNotes,
    totalAmount: d.order.totalAmount,
    items: d.order.items,
    createdAt: d.createdAt,
  }));

  return apiSuccess(result);
}
