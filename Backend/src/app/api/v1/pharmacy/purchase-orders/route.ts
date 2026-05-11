// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Purchase Orders API: List & Create
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound, apiPaginated } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

// Helper: check if user can manage purchase orders
async function canManagePurchaseOrders(userId: string, role: string, pharmacyId: string): Promise<boolean> {
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

// GET /api/pharmacy/purchase-orders - List purchase orders
export async function GET(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { searchParams } = new URL(request.url);
  const pharmacyId = searchParams.get('pharmacyId') || '';
  const status = searchParams.get('status') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  if (!pharmacyId) {
    return apiError('pharmacyId es requerido', 400);
  }

  const authorized = await canManagePurchaseOrders(auth.user.id, auth.user.role, pharmacyId);
  if (!authorized) return apiForbidden('No autorizado para ver órdenes de compra');

  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { pharmacyId };
  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    db.purchaseOrder.findMany({
      where,
      skip,
      take: limit,
      orderBy: { orderDate: 'desc' },
      include: {
        supplier: { select: { id: true, name: true, contactName: true } },
        _count: { select: { items: true } },
      },
    }),
    db.purchaseOrder.count({ where }),
  ]);

  return apiPaginated(orders, page, limit, total);
}

// POST /api/pharmacy/purchase-orders - Create purchase order
export async function POST(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const body = await request.json();
  const { pharmacyId, supplierId, items, notes, expectedDate } = body;

  if (!pharmacyId || !supplierId || !items || !items.length) {
    return apiError('pharmacyId, supplierId e items son requeridos', 400);
  }

  const authorized = await canManagePurchaseOrders(auth.user.id, auth.user.role, pharmacyId);
  if (!authorized) return apiForbidden('No autorizado para crear órdenes de compra');

  // Validate pharmacy and supplier
  const pharmacy = await db.pharmacy.findUnique({ where: { id: pharmacyId } });
  if (!pharmacy) return apiNotFound('Farmacia no encontrada');

  const supplier = await db.supplier.findUnique({ where: { id: supplierId } });
  if (!supplier) return apiNotFound('Proveedor no encontrado');

  // Calculate total amount from items
  let totalAmount = 0;
  const orderItems: any[] = [];

  for (const item of items) {
    if (!item.medicationId || !item.quantity || !item.unitCost) {
      return apiError('Cada item requiere medicationId, quantity y unitCost', 400);
    }

    // Validate medication exists
    const medication = await db.medication.findUnique({ where: { id: item.medicationId } });
    if (!medication) return apiNotFound(`Medicamento ${item.medicationId} no encontrado`);

    const totalCost = item.quantity * item.unitCost;
    totalAmount += totalCost;

    orderItems.push({
      medicationId: item.medicationId,
      quantity: item.quantity,
      unitCost: item.unitCost,
      totalCost,
    });
  }

  const purchaseOrder = await db.$transaction(async (tx) => {
    const po = await tx.purchaseOrder.create({
      data: {
        pharmacyId,
        supplierId,
        totalAmount: Math.round(totalAmount * 100) / 100,
        notes,
        expectedDate: expectedDate ? new Date(expectedDate) : null,
        status: 'pending',
      },
    });

    await tx.purchaseOrderItem.createMany({
      data: orderItems.map((item: any) => ({
        medicationId: item.medicationId,
        quantity: item.quantity,
        unitCost: item.unitCost,
        totalCost: item.totalCost,
        purchaseOrderId: po.id,
      })),
    });

    return po;
  });

  // Fetch the complete purchase order with items
  const completePO = await db.purchaseOrder.findUnique({
    where: { id: purchaseOrder.id },
    include: {
      supplier: { select: { id: true, name: true } },
      items: {
        include: {
          medication: { select: { id: true, name: true, genericName: true, strength: true } },
        },
      },
    },
  });

  await createAuditLog({
    userId: auth.user.id,
    action: 'create',
    entity: 'PurchaseOrder',
    entityId: purchaseOrder.id,
    newValues: { totalAmount, itemCount: items.length, supplierId },
  });

  return apiSuccess(completePO, { status: 201 });
}
