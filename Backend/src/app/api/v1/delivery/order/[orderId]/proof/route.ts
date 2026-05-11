// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Delivery Proof Upload API
// POST /api/delivery/order/[orderId]/proof
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  if (auth.user.role !== ROLES.DELIVERY_PERSON && auth.user.role !== ROLES.SUPERADMIN) {
    return apiForbidden('Solo repartidores pueden subir comprobante');
  }

  const { orderId } = await params;
  const body = await request.json();
  const { proofPhotoUrl, signatureUrl } = body;

  if (!proofPhotoUrl && !signatureUrl) {
    return apiError('Se requiere al menos una foto o firma como comprobante', 422);
  }

  const delivery = await db.delivery.findUnique({
    where: { orderId },
    include: { deliveryPerson: true },
  });

  if (!delivery) return apiNotFound('Entrega no encontrada para esta orden');

  // Verify this delivery person owns this delivery
  if (auth.user.role === ROLES.DELIVERY_PERSON) {
    const dp = await db.deliveryPerson.findUnique({ where: { userId: auth.user.id } });
    if (!dp || dp.id !== delivery.deliveryPersonId) {
      return apiForbidden('No tienes permiso para actualizar esta entrega');
    }
  }

  const updatedDelivery = await db.delivery.update({
    where: { orderId },
    data: {
      proofPhotoUrl: proofPhotoUrl || undefined,
      signatureUrl: signatureUrl || undefined,
    },
  });

  return apiSuccess(updatedDelivery);
}
