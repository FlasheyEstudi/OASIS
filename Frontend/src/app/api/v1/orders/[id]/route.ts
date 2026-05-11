// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Order Detail API
// GET /api/orders/[id] - Get order details
// PUT /api/orders/[id] - Update order status
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { createAuditLog } from '@/lib/oasis-utils';

// Valid status transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing'],
  preparing: ['ready'],
  ready: ['delivering', 'cancelled'],
  delivering: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
  returned: [],
};

// ─── GET /api/orders/[id] ──────────────────────────────────
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      patient: { include: { user: { select: { name: true, email: true, phone: true } } } },
      pharmacy: { select: { id: true, name: true, address: true, phone: true, latitude: true, longitude: true } },
      items: {
        include: {
          medication: { select: { id: true, name: true, genericName: true, strength: true, dosageForm: true, imageUrl: true } },
        },
      },
      delivery: {
        include: {
          deliveryPerson: { include: { user: { select: { name: true, phone: true } } } },
        },
      },
      invoice: true,
      returnRequest: true,
    },
  });

  if (!order) return apiNotFound('Orden no encontrada');

  // Access control
  if (auth.user.role === ROLES.PATIENT) {
    const patient = await db.patient.findUnique({ where: { userId: auth.user.id } });
    if (!patient || patient.id !== order.patientId) {
      return apiForbidden('No tienes acceso a esta orden');
    }
  } else if (auth.user.role === ROLES.PHARMACY_ADMIN || auth.user.role === ROLES.PHARMACY_STAFF) {
    const staff = await db.pharmacyAdmin.findUnique({ where: { userId: auth.user.id } }) ||
                  await db.pharmacyStaff.findUnique({ where: { userId: auth.user.id } });
    if (!staff || staff.pharmacyId !== order.pharmacyId) {
      return apiForbidden('No tienes acceso a esta orden');
    }
  } else if (auth.user.role === ROLES.DELIVERY_PERSON) {
    const dp = await db.deliveryPerson.findUnique({ where: { userId: auth.user.id } });
    if (!dp || !order.delivery || order.delivery.deliveryPersonId !== dp.id) {
      return apiForbidden('No tienes acceso a esta orden');
    }
  }

  return apiSuccess(order);
}

// ─── PUT /api/orders/[id] ──────────────────────────────────
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { id } = await params;

  // Only pharmacy_admin, pharmacy_staff, or superadmin can update order status
  if (
    auth.user.role !== ROLES.PHARMACY_ADMIN &&
    auth.user.role !== ROLES.PHARMACY_STAFF &&
    auth.user.role !== ROLES.SUPERADMIN
  ) {
    return apiForbidden('Solo personal de farmacia puede actualizar el estado de la orden');
  }

  const body = await request.json();
  const { status } = body;

  if (!status) return apiError('Estado requerido', 422);

  const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled', 'returned'];
  if (!validStatuses.includes(status)) {
    return apiError(`Estado inválido. Válidos: ${validStatuses.join(', ')}`, 422);
  }

  const order = await db.order.findUnique({
    where: { id },
    include: { delivery: true },
  });

  if (!order) return apiNotFound('Orden no encontrada');

  // Verify pharmacy access
  if (auth.user.role === ROLES.PHARMACY_ADMIN || auth.user.role === ROLES.PHARMACY_STAFF) {
    const staff = await db.pharmacyAdmin.findUnique({ where: { userId: auth.user.id } }) ||
                  await db.pharmacyStaff.findUnique({ where: { userId: auth.user.id } });
    if (!staff || staff.pharmacyId !== order.pharmacyId) {
      return apiForbidden('No tienes acceso a esta orden');
    }
  }

  // Validate status transition
  const allowedTransitions = VALID_TRANSITIONS[order.status] || [];
  if (!allowedTransitions.includes(status)) {
    return apiError(
      `Transición de estado inválida: ${order.status} → ${status}. Transiciones permitidas: ${allowedTransitions.join(', ') || 'ninguna'}`,
      422
    );
  }

  const result = await db.$transaction(async (tx) => {
    const updatedOrder = await tx.order.update({
      where: { id },
      data: { status },
    });

    // If cancelled, restore inventory
    if (status === 'cancelled') {
      const orderItems = await tx.orderItem.findMany({ where: { orderId: id } });
      for (const item of orderItems) {
        if (item.batchId) {
          await tx.inventoryBatch.update({
            where: { id: item.batchId },
            data: { quantity: { increment: item.quantity } },
          });
        }
      }

      // Update invoice status
      await tx.invoice.updateMany({
        where: { orderId: id },
        data: { paymentStatus: 'refunded' },
      });
    }

    // If delivered, update delivery record
    if (status === 'delivered' && order.deliveryType === 'delivery') {
      await tx.delivery.updateMany({
        where: { orderId: id },
        data: {
          status: 'delivered',
          deliveryTime: new Date(),
        },
      });
    }

    await createAuditLog({
      userId: auth.user.id,
      action: 'update',
      entity: 'Order',
      entityId: id,
      oldValues: { status: order.status },
      newValues: { status },
    });

    return updatedOrder;
  });

  const completeOrder = await db.order.findUnique({
    where: { id: result.id },
    include: {
      patient: { include: { user: { select: { name: true, phone: true } } } },
      pharmacy: { select: { id: true, name: true, address: true } },
      items: { include: { medication: { select: { id: true, name: true, genericName: true } } } },
      delivery: true,
      invoice: true,
    },
  });

  return apiSuccess(completeOrder);
}
