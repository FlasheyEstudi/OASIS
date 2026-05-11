// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Order Return Request API
// POST /api/orders/[id]/return - Request return for an order
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { createAuditLog } from '@/lib/oasis-utils';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { id } = await params;
  const body = await request.json();
  const { reason } = body;

  if (!reason) return apiError('Motivo de devolución requerido', 422);

  const order = await db.order.findUnique({
    where: { id },
    include: { invoice: true, returnRequest: true },
  });

  if (!order) return apiNotFound('Orden no encontrada');

  // Only the patient who owns the order can request a return
  if (auth.user.role === ROLES.PATIENT) {
    const patient = await db.patient.findUnique({ where: { userId: auth.user.id } });
    if (!patient || patient.id !== order.patientId) {
      return apiForbidden('Solo el paciente puede solicitar una devolución');
    }
  } else if (auth.user.role !== ROLES.SUPERADMIN) {
    return apiForbidden('Solo el paciente puede solicitar una devolución');
  }

  // Order must be delivered
  if (order.status !== 'delivered') {
    return apiError('Solo se pueden devolver órdenes entregadas', 400);
  }

  // Check if return already exists
  if (order.returnRequest) {
    return apiError('Ya existe una solicitud de devolución para esta orden', 400);
  }

  const returnRequest = await db.$transaction(async (tx) => {
    const returnReq = await tx.returnRequest.create({
      data: {
        orderId: id,
        patientId: order.patientId,
        reason,
        status: 'pending',
        returnToStock: false,
        refundAmount: order.totalAmount,
        invoiceId: order.invoice?.id || null,
      },
    });

    // Update order status
    await tx.order.update({
      where: { id },
      data: { status: 'returned' },
    });

    await createAuditLog({
      userId: auth.user.id,
      action: 'create',
      entity: 'ReturnRequest',
      entityId: returnReq.id,
      newValues: {
        orderId: id,
        reason,
        refundAmount: order.totalAmount,
      },
    });

    return returnReq;
  });

  const completeReturn = await db.returnRequest.findUnique({
    where: { id: returnRequest.id },
    include: {
      order: {
        include: {
          items: { include: { medication: { select: { name: true } } } },
          invoice: true,
        },
      },
    },
  });

  return apiSuccess(completeReturn, { status: 201 });
}
