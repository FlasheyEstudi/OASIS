// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Cash Collection Confirmation API
// PUT /api/delivery/order/[orderId]/collect-cash
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { createAuditLog } from '@/lib/oasis-utils';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  if (auth.user.role !== ROLES.DELIVERY_PERSON && auth.user.role !== ROLES.SUPERADMIN) {
    return apiForbidden('Solo repartidores pueden confirmar cobro');
  }

  const { orderId } = await params;
  const body = await request.json();
  const { amount } = body;

  if (typeof amount !== 'number' || amount <= 0) {
    return apiError('Monto de cobro inválido', 422);
  }

  const delivery = await db.delivery.findUnique({
    where: { orderId },
    include: { order: true },
  });

  if (!delivery) return apiNotFound('Entrega no encontrada para esta orden');

  // Verify delivery person owns this delivery
  if (auth.user.role === ROLES.DELIVERY_PERSON) {
    const dp = await db.deliveryPerson.findUnique({ where: { userId: auth.user.id } });
    if (!dp || dp.id !== delivery.deliveryPersonId) {
      return apiForbidden('No tienes permiso para confirmar cobro en esta entrega');
    }
  }

  // Only cash or card_on_delivery orders
  if (delivery.order.paymentMethod !== 'cash' && delivery.order.paymentMethod !== 'card_on_delivery') {
    return apiError('Solo se puede cobrar efectivo para órdenes con pago en efectivo o tarjeta contra entrega', 400);
  }

  const result = await db.$transaction(async (tx) => {
    const updatedDelivery = await tx.delivery.update({
      where: { orderId },
      data: {
        cashCollectedAmount: amount,
      },
    });

    // Update order payment status
    await tx.order.update({
      where: { id: orderId },
      data: { paymentStatus: 'paid' },
    });

    // Update invoice payment status
    await tx.invoice.updateMany({
      where: { orderId },
      data: {
        paymentStatus: 'paid',
        paidAt: new Date(),
      },
    });

    await createAuditLog({
      userId: auth.user.id,
      action: 'collect_cash',
      entity: 'Delivery',
      entityId: delivery.id,
      newValues: {
        orderId,
        amount,
        paymentMethod: delivery.order.paymentMethod,
      },
    });

    return updatedDelivery;
  });

  return apiSuccess({
    orderId,
    amountCollected: amount,
    paymentStatus: 'paid',
  });
}
