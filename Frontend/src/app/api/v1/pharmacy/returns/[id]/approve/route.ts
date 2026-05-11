// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Pharmacy Return Approve/Reject API
// PUT /api/pharmacy/returns/[id]/approve
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { createAuditLog } from '@/lib/oasis-utils';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  if (
    auth.user.role !== ROLES.PHARMACY_ADMIN &&
    auth.user.role !== ROLES.SUPERADMIN
  ) {
    return apiForbidden('Solo administradores de farmacia pueden aprobar devoluciones');
  }

  const { id } = await params;
  const body = await request.json();
  const { approved, returnToStock, refundAmount, notes } = body;

  if (typeof approved !== 'boolean') return apiError('approved (boolean) es requerido', 422);
  if (approved && typeof refundAmount !== 'number') return apiError('refundAmount es requerido al aprobar', 422);

  const returnRequest = await db.returnRequest.findUnique({
    where: { id },
    include: {
      order: {
        include: {
          items: true,
          invoice: true,
        },
      },
    },
  });

  if (!returnRequest) return apiNotFound('Solicitud de devolución no encontrada');

  if (returnRequest.status !== 'pending') {
    return apiError(`La solicitud ya fue procesada (estado: ${returnRequest.status})`, 400);
  }

  // Verify pharmacy access
  if (auth.user.role === ROLES.PHARMACY_ADMIN) {
    const pharmacyAdmin = await db.pharmacyAdmin.findUnique({ where: { userId: auth.user.id } });
    if (!pharmacyAdmin || pharmacyAdmin.pharmacyId !== returnRequest.order.pharmacyId) {
      return apiForbidden('No tienes acceso a esta devolución');
    }
  }

  const result = await db.$transaction(async (tx) => {
    const newStatus = approved ? 'approved' : 'rejected';

    const updatedReturn = await tx.returnRequest.update({
      where: { id },
      data: {
        status: newStatus,
        returnToStock: approved ? (returnToStock || false) : false,
        refundAmount: approved ? refundAmount : 0,
        notes: notes || null,
        processedById: auth.user.id,
        processedAt: new Date(),
      },
    });

    // If approved and returnToStock, re-add inventory
    if (approved && returnToStock) {
      for (const item of returnRequest.order.items) {
        if (item.batchId) {
          await tx.inventoryBatch.update({
            where: { id: item.batchId },
            data: { quantity: { increment: item.quantity } },
          });
        }
      }
    }

    // Update invoice payment status if approved
    if (approved && returnRequest.order.invoice) {
      await tx.invoice.update({
        where: { id: returnRequest.order.invoice.id },
        data: { paymentStatus: 'refunded' },
      });
    }

    // Update order payment status if approved
    if (approved) {
      await tx.order.update({
        where: { id: returnRequest.orderId },
        data: { paymentStatus: 'refunded' },
      });
    }

    // If rejected, revert order status back to delivered
    if (!approved) {
      await tx.order.update({
        where: { id: returnRequest.orderId },
        data: { status: 'delivered' },
      });
    }

    await createAuditLog({
      userId: auth.user.id,
      action: approved ? 'approve' : 'reject',
      entity: 'ReturnRequest',
      entityId: id,
      oldValues: { status: 'pending' },
      newValues: {
        status: newStatus,
        returnToStock: approved ? returnToStock : false,
        refundAmount: approved ? refundAmount : 0,
      },
    });

    return updatedReturn;
  });

  const completeReturn = await db.returnRequest.findUnique({
    where: { id: result.id },
    include: {
      order: {
        include: {
          items: { include: { medication: { select: { name: true } } } },
          invoice: true,
        },
      },
    },
  });

  return apiSuccess(completeReturn);
}
