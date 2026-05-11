// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Stock Transfer Between Branches API
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

// Helper: check if user can transfer stock from/to these pharmacies
async function canTransferStock(userId: string, role: string, fromPharmacyId: string, toPharmacyId: string): Promise<boolean> {
  if (role === ROLES.SUPERADMIN) return true;
  if (role === ROLES.PHARMACY_ADMIN) {
    // Must be admin of both pharmacies (or same chain)
    const adminFrom = await db.pharmacyAdmin.findFirst({ where: { userId, pharmacyId: fromPharmacyId } });
    const adminTo = await db.pharmacyAdmin.findFirst({ where: { userId, pharmacyId: toPharmacyId } });
    // Admin of either pharmacy in the chain can transfer
    return !!(adminFrom || adminTo);
  }
  return false;
}

// POST /api/pharmacies/branches/transfer-stock - Transfer stock between branches
export async function POST(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const body = await request.json();
  const { fromPharmacyId, toPharmacyId, medicationId, batchNumber, quantity } = body;

  if (!fromPharmacyId || !toPharmacyId || !medicationId || !batchNumber || !quantity) {
    return apiError('Campos requeridos: fromPharmacyId, toPharmacyId, medicationId, batchNumber, quantity', 400);
  }

  if (fromPharmacyId === toPharmacyId) {
    return apiError('La farmacia origen y destino no pueden ser la misma', 400);
  }

  if (quantity <= 0) {
    return apiError('La cantidad debe ser mayor a 0', 400);
  }

  const authorized = await canTransferStock(auth.user.id, auth.user.role, fromPharmacyId, toPharmacyId);
  if (!authorized) return apiForbidden('No autorizado para transferir inventario');

  // Validate both pharmacies exist
  const [fromPharmacy, toPharmacy] = await Promise.all([
    db.pharmacy.findUnique({ where: { id: fromPharmacyId } }),
    db.pharmacy.findUnique({ where: { id: toPharmacyId } }),
  ]);

  if (!fromPharmacy) return apiNotFound('Farmacia origen no encontrada');
  if (!toPharmacy) return apiNotFound('Farmacia destino no encontrada');

  // Find source batch
  const sourceBatch = await db.inventoryBatch.findUnique({
    where: {
      pharmacyId_medicationId_batchNumber: {
        pharmacyId: fromPharmacyId,
        medicationId,
        batchNumber,
      },
    },
  });

  if (!sourceBatch) return apiNotFound('Lote de origen no encontrado');
  if (sourceBatch.quantity < quantity) {
    return apiError(`Stock insuficiente. Disponible: ${sourceBatch.quantity}, Solicitado: ${quantity}`, 400);
  }

  // Execute transfer in a transaction
  const result = await db.$transaction(async (tx) => {
    // Decrease source batch quantity
    const updatedSource = await tx.inventoryBatch.update({
      where: { id: sourceBatch.id },
      data: { quantity: sourceBatch.quantity - quantity },
    });

    // Check if destination batch exists
    const existingDestBatch = await tx.inventoryBatch.findUnique({
      where: {
        pharmacyId_medicationId_batchNumber: {
          pharmacyId: toPharmacyId,
          medicationId,
          batchNumber,
        },
      },
    });

    let destBatch;

    if (existingDestBatch) {
      // Add to existing batch
      destBatch = await tx.inventoryBatch.update({
        where: { id: existingDestBatch.id },
        data: {
          quantity: existingDestBatch.quantity + quantity,
          costPrice: sourceBatch.costPrice,
          sellingPrice: sourceBatch.sellingPrice,
        },
      });
    } else {
      // Create new batch at destination
      destBatch = await tx.inventoryBatch.create({
        data: {
          pharmacyId: toPharmacyId,
          medicationId,
          batchNumber,
          quantity,
          expiryDate: sourceBatch.expiryDate,
          costPrice: sourceBatch.costPrice,
          sellingPrice: sourceBatch.sellingPrice,
          supplierId: sourceBatch.supplierId,
          minStockAlert: sourceBatch.minStockAlert,
          maxStock: sourceBatch.maxStock,
          location: 'Transferido',
        },
      });
    }

    return { source: updatedSource, destination: destBatch };
  });

  // Create audit log for transfer
  await createAuditLog({
    userId: auth.user.id,
    action: 'transfer_stock',
    entity: 'InventoryBatch',
    entityId: sourceBatch.id,
    newValues: {
      fromPharmacyId,
      toPharmacyId,
      medicationId,
      batchNumber,
      quantity,
      sourceNewQty: result.source.quantity,
      destNewQty: result.destination.quantity,
    },
  });

  return apiSuccess({
    message: 'Transferencia exitosa',
    transfer: {
      from: { pharmacyId: fromPharmacyId, pharmacyName: fromPharmacy.name, newQuantity: result.source.quantity },
      to: { pharmacyId: toPharmacyId, pharmacyName: toPharmacy.name, newQuantity: result.destination.quantity },
      medicationId,
      batchNumber,
      quantity,
    },
  });
}
