// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Purchase Order Receive API
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
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

// PUT /api/pharmacy/purchase-orders/[id]/receive - Receive merchandise
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { id } = await params;

  const purchaseOrder = await db.purchaseOrder.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!purchaseOrder) return apiNotFound('Orden de compra no encontrada');

  if (purchaseOrder.status === 'received') {
    return apiError('Esta orden de compra ya fue recibida completamente', 400);
  }

  if (purchaseOrder.status === 'cancelled') {
    return apiError('Esta orden de compra fue cancelada', 400);
  }

  const authorized = await canManagePurchaseOrders(
    auth.user.id,
    auth.user.role,
    purchaseOrder.pharmacyId
  );
  if (!authorized) return apiForbidden('No autorizado para recibir mercancía');

  const body = await request.json();
  const { items } = body;

  if (!items || !items.length) {
    return apiError('Items recibidos son requeridos', 400);
  }

  // Process received items in a transaction
  const result = await db.$transaction(async (tx) => {
    const createdBatches: any[] = [];

    for (const receivedItem of items) {
      const { medicationId, receivedQuantity, batchNumber, expiryDate } = receivedItem;

      if (!medicationId || receivedQuantity === undefined) {
        throw new Error('Cada item requiere medicationId y receivedQuantity');
      }

      // Find the corresponding PO item
      const poItem = purchaseOrder.items.find(
        (i) => i.medicationId === medicationId
      );

      if (!poItem) {
        throw new Error(`Medicamento ${medicationId} no está en la orden de compra`);
      }

      // Update PO item received quantity
      const newReceivedQty = poItem.receivedQuantity + receivedQuantity;
      await tx.purchaseOrderItem.update({
        where: { id: poItem.id },
        data: {
          receivedQuantity: newReceivedQty,
          batchNumber: batchNumber || poItem.batchNumber,
          expiryDate: expiryDate ? new Date(expiryDate) : poItem.expiryDate,
        },
      });

      // Create inventory batch for received items
      if (receivedQuantity > 0) {
        const batchNum = batchNumber || `PO-${purchaseOrder.id.substring(0, 8)}-${medicationId.substring(0, 8)}`;
        const expDate = expiryDate ? new Date(expiryDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // Default 1 year

        // Check if batch already exists
        const existingBatch = await tx.inventoryBatch.findUnique({
          where: {
            pharmacyId_medicationId_batchNumber: {
              pharmacyId: purchaseOrder.pharmacyId,
              medicationId,
              batchNumber: batchNum,
            },
          },
        });

        if (existingBatch) {
          // Add to existing batch
          const updated = await tx.inventoryBatch.update({
            where: { id: existingBatch.id },
            data: {
              quantity: existingBatch.quantity + receivedQuantity,
              costPrice: poItem.unitCost,
            },
          });
          createdBatches.push(updated);
        } else {
          // Create new batch
          const newBatch = await tx.inventoryBatch.create({
            data: {
              pharmacyId: purchaseOrder.pharmacyId,
              medicationId,
              batchNumber: batchNum,
              quantity: receivedQuantity,
              expiryDate: expDate,
              costPrice: poItem.unitCost,
              sellingPrice: poItem.unitCost * 1.3, // Default 30% markup
              supplierId: purchaseOrder.supplierId,
            },
          });
          createdBatches.push(newBatch);
        }
      }
    }

    // Check if all items are fully received
    const allItems = await tx.purchaseOrderItem.findMany({
      where: { purchaseOrderId: id },
    });

    const isFullyReceived = allItems.every(
      (item) => item.receivedQuantity >= item.quantity
    );

    // Update PO status
    const updateData: Record<string, unknown> = {
      status: isFullyReceived ? 'received' : 'partial',
    };

    if (isFullyReceived) {
      updateData.receivedDate = new Date();
    }

    await tx.purchaseOrder.update({
      where: { id },
      data: updateData,
    });

    return { createdBatches, isFullyReceived };
  });

  await createAuditLog({
    userId: auth.user.id,
    action: 'receive',
    entity: 'PurchaseOrder',
    entityId: id,
    newValues: {
      receivedItems: items.length,
      isFullyReceived: result.isFullyReceived,
      batchesCreated: result.createdBatches.length,
    },
  });

  // Fetch updated PO
  const updatedPO = await db.purchaseOrder.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          medication: { select: { id: true, name: true, genericName: true } },
        },
      },
    },
  });

  return apiSuccess({
    purchaseOrder: updatedPO,
    batchesCreated: result.createdBatches.length,
    isFullyReceived: result.isFullyReceived,
  });
}
