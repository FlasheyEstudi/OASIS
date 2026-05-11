// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Failed Delivery Report API
// POST /api/delivery/order/[orderId]/failed-delivery
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { createAuditLog } from '@/lib/oasis-utils';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  if (auth.user.role !== ROLES.DELIVERY_PERSON && auth.user.role !== ROLES.SUPERADMIN) {
    return apiForbidden('Solo repartidores pueden reportar entregas fallidas');
  }

  const { orderId } = await params;
  const body = await request.json();
  const { reason, notes } = body;

  if (!reason) return apiError('Motivo de entrega fallida requerido', 422);

  const delivery = await db.delivery.findUnique({
    where: { orderId },
    include: { order: true, deliveryPerson: true },
  });

  if (!delivery) return apiNotFound('Entrega no encontrada para esta orden');

  // Verify delivery person owns this delivery
  if (auth.user.role === ROLES.DELIVERY_PERSON) {
    const dp = await db.deliveryPerson.findUnique({ where: { userId: auth.user.id } });
    if (!dp || dp.id !== delivery.deliveryPersonId) {
      return apiForbidden('No tienes permiso para reportar esta entrega');
    }
  }

  const newFailedAttempts = delivery.order.failedDeliveryAttempts + 1;

  const result = await db.$transaction(async (tx) => {
    // Update delivery record
    await tx.delivery.update({
      where: { orderId },
      data: {
        status: 'failed',
        failedReason: reason,
        notes: notes || undefined,
      },
    });

    // Increment failed attempts on order
    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: {
        failedDeliveryAttempts: newFailedAttempts,
      },
    });

    // If 3+ failed attempts, cancel the order and restore inventory
    if (newFailedAttempts >= 3) {
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'cancelled' },
      });

      // Restore inventory
      const orderItems = await tx.orderItem.findMany({ where: { orderId } });
      for (const item of orderItems) {
        if (item.batchId) {
          await tx.inventoryBatch.update({
            where: { id: item.batchId },
            data: { quantity: { increment: item.quantity } },
          });
        }
      }

      // Update invoice
      await tx.invoice.updateMany({
        where: { orderId },
        data: { paymentStatus: 'refunded' },
      });
    } else {
      // Reset order to ready for re-assignment
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'ready' },
      });

      // Remove the delivery record so another delivery person can pick it up
      await tx.delivery.delete({
        where: { orderId },
      });
    }

    return updatedOrder;
  }, { timeout: 30000 });

  createAuditLog({
    userId: auth.user.id,
    action: 'failed_delivery',
    entity: 'Delivery',
    entityId: delivery.id,
    newValues: {
      orderId,
      reason,
      failedAttempts: newFailedAttempts,
      cancelled: newFailedAttempts >= 3,
    },
  }).catch(err => console.error('AuditLog error (ignored):', err));

  return apiSuccess({
    orderId,
    failedAttempts: newFailedAttempts,
    cancelled: newFailedAttempts >= 3,
    message: newFailedAttempts >= 3
      ? 'Orden cancelada después de 3 intentos fallidos'
      : `Intento fallido ${newFailedAttempts}/3. Orden devuelta a disponible.`,
  });
}
