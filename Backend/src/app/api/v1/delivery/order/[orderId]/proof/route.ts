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
  const { proofPhotoBase64, signatureBase64 } = body;

  if (!proofPhotoBase64 && !signatureBase64) {
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

  let proofPhotoUrl = delivery.proofPhotoUrl;
  let signatureUrl = delivery.signatureUrl;

  const { uploadFile } = await import('@/lib/storage-service');

  if (proofPhotoBase64) {
    const buffer = Buffer.from(proofPhotoBase64.split(',')[1] || proofPhotoBase64, 'base64');
    proofPhotoUrl = await uploadFile(`proof-${orderId}.jpg`, 'image/jpeg', buffer);
  }

  if (signatureBase64) {
    const buffer = Buffer.from(signatureBase64.split(',')[1] || signatureBase64, 'base64');
    signatureUrl = await uploadFile(`sig-${orderId}.png`, 'image/png', buffer);
  }

  const updatedDelivery = await db.delivery.update({
    where: { orderId },
    data: {
      proofPhotoUrl,
      signatureUrl,
      status: 'delivered',
      deliveryTime: new Date(),
    },
    include: {
      order: {
        select: { patientId: true }
      }
    }
  });

  // Notificar al paciente
  const { sendPushNotification } = await import('@/lib/fcm');
  await sendPushNotification(
    updatedDelivery.order.patientId,
    '¡Pedido Entregado!',
    `Tu pedido #${orderId.substring(0, 6)} ha sido entregado exitosamente.`,
    { orderId, type: 'DELIVERY_COMPLETED' }
  );

  return apiSuccess(updatedDelivery);
}
