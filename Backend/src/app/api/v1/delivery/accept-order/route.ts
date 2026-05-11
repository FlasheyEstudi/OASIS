// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Accept Delivery Order API
// POST /api/delivery/accept-order
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { createAuditLog } from '@/lib/oasis-utils';

export async function POST(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  if (auth.user.role !== ROLES.DELIVERY_PERSON && auth.user.role !== ROLES.SUPERADMIN) {
    return apiForbidden('Solo repartidores pueden aceptar órdenes');
  }

  const body = await request.json();
  const { orderId } = body;

  if (!orderId) return apiError('orderId es requerido', 422);

  const deliveryPerson = await db.deliveryPerson.findUnique({
    where: { userId: auth.user.id },
  });

  if (!deliveryPerson) return apiNotFound('Perfil de repartidor no encontrado');
  if (!deliveryPerson.isAvailable) return apiError('No estás disponible para entregas', 400);

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { delivery: true },
  });

  if (!order) return apiNotFound('Orden no encontrada');
  if (order.status !== 'ready') return apiError('La orden no está lista para entrega', 400);
  if (order.deliveryType !== 'delivery') return apiError('La orden no es de tipo entrega a domicilio', 400);
  if (order.delivery) return apiError('La orden ya tiene un repartidor asignado', 400);

  // Internal delivery person can only accept orders from their pharmacy
  if (deliveryPerson.isInternal && deliveryPerson.pharmacyId && order.pharmacyId !== deliveryPerson.pharmacyId) {
    return apiError('Solo puedes aceptar órdenes de tu farmacia', 403);
  }

  const result = await db.$transaction(async (tx) => {
    // Create delivery record
    const delivery = await tx.delivery.create({
      data: {
        orderId,
        deliveryPersonId: deliveryPerson.id,
        status: 'assigned',
        estimatedArrival: new Date(Date.now() + 45 * 60 * 1000), // 45 min estimate
      },
    });

    // Update order status to delivering
    await tx.order.update({
      where: { id: orderId },
      data: { status: 'delivering' },
    });

    return delivery;
  });

  await createAuditLog({
    userId: auth.user.id,
    action: 'accept_delivery',
    entity: 'Delivery',
    entityId: result.id,
    newValues: {
      orderId,
      deliveryPersonId: deliveryPerson.id,
      status: 'assigned',
    },
  });

  const completeDelivery = await db.delivery.findUnique({
    where: { id: result.id },
    include: {
      order: {
        include: {
          pharmacy: { select: { id: true, name: true, address: true, latitude: true, longitude: true } },
          patient: { include: { user: { select: { name: true, phone: true } } } },
          items: { include: { medication: { select: { name: true } } } },
        },
      },
      deliveryPerson: { include: { user: { select: { name: true, phone: true } } } },
    },
  });

  return apiSuccess(completeDelivery, { status: 201 });
}
