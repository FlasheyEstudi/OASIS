// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Purchase Order Detail API
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';

// Helper: check if user can access purchase orders
async function canAccessPurchaseOrders(userId: string, role: string, pharmacyId: string): Promise<boolean> {
  if (role === ROLES.SUPERADMIN) return true;
  if (role === ROLES.PHARMACY_ADMIN) {
    const admin = await db.pharmacyAdmin.findFirst({ where: { userId, pharmacyId } });
    return !!admin;
  }
  if (role === ROLES.PHARMACY_STAFF) {
    const staff = await db.pharmacyStaff.findFirst({ where: { userId, pharmacyId } });
    return !!staff;
  }
  return false;
}

// GET /api/pharmacy/purchase-orders/[id] - Get purchase order with items
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { id } = await params;

  const purchaseOrder = await db.purchaseOrder.findUnique({
    where: { id },
    include: {
      supplier: {
        select: { id: true, name: true, contactName: true, phone: true, email: true },
      },
      pharmacy: {
        select: { id: true, name: true, address: true, city: true },
      },
      items: {
        include: {
          medication: {
            select: {
              id: true,
              name: true,
              genericName: true,
              brand: true,
              strength: true,
              dosageForm: true,
              category: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!purchaseOrder) return apiNotFound('Orden de compra no encontrada');

  const authorized = await canAccessPurchaseOrders(
    auth.user.id,
    auth.user.role,
    purchaseOrder.pharmacyId
  );
  if (!authorized) return apiForbidden('No autorizado para ver esta orden de compra');

  // Add computed fields
  const receivedItems = purchaseOrder.items.filter((i) => i.receivedQuantity > 0);
  const isFullyReceived = purchaseOrder.items.every(
    (i) => i.receivedQuantity >= i.quantity
  );
  const isPartiallyReceived = receivedItems.length > 0 && !isFullyReceived;

  return apiSuccess({
    ...purchaseOrder,
    computed: {
      totalItems: purchaseOrder.items.length,
      receivedItems: receivedItems.length,
      isFullyReceived,
      isPartiallyReceived,
      totalOrdered: purchaseOrder.items.reduce((sum, i) => sum + i.quantity, 0),
      totalReceived: purchaseOrder.items.reduce((sum, i) => sum + i.receivedQuantity, 0),
    },
  });
}
