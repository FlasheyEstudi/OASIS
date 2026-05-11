// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Inventory Batch API: Add, Update & List
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound, apiPaginated } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

// Helper: check if user can manage inventory for this pharmacy
async function canManageInventory(userId: string, role: string, pharmacyId: string): Promise<boolean> {
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

// Helper: Get user's pharmacyId
async function getUserPharmacyId(userId: string, role: string): Promise<string | null> {
  if (role === ROLES.PHARMACY_ADMIN) {
    const admin = await db.pharmacyAdmin.findFirst({ where: { userId } });
    return admin?.pharmacyId || null;
  }
  if (role === ROLES.PHARMACY_STAFF) {
    const staff = await db.pharmacyStaff.findFirst({ where: { userId } });
    return staff?.pharmacyId || null;
  }
  return null;
}

// GET /api/pharmacy/inventory - List inventory batches
export async function GET(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const skip = (page - 1) * limit;

  const pharmacyId = await getUserPharmacyId(auth.user.id, auth.user.role);
  if (!pharmacyId && auth.user.role !== ROLES.SUPERADMIN) {
    return apiForbidden('No tienes una farmacia asociada');
  }

  const where: any = {
    isActive: true,
  };

  if (pharmacyId) {
    where.pharmacyId = pharmacyId;
  }

  if (search || category) {
    where.medication = {
      OR: [
        { name: { contains: search } },
        { genericName: { contains: search } },
        { brand: { contains: search } },
      ],
    };
    if (category && category !== 'Todos') {
      where.medication.category = { contains: category };
    }
  }

  const [batches, total] = await Promise.all([
    db.inventoryBatch.findMany({
      where,
      include: {
        medication: true,
        supplier: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    db.inventoryBatch.count({ where }),
  ]);

  return apiPaginated(batches, page, limit, total);
}

// POST /api/pharmacy/inventory - Add inventory batch
export async function POST(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const body = await request.json();
  const {
    pharmacyId: bodyPharmacyId,
    medicationId,
    batchNumber,
    quantity,
    expiryDate,
    costPrice,
    sellingPrice,
    supplierId,
    minStockAlert,
    maxStock,
    location,
  } = body;

  const pharmacyId = bodyPharmacyId || await getUserPharmacyId(auth.user.id, auth.user.role);

  if (!pharmacyId || !medicationId || !batchNumber || quantity === undefined || !expiryDate || costPrice === undefined || sellingPrice === undefined) {
    return apiError('Campos requeridos: pharmacyId, medicationId, batchNumber, quantity, expiryDate, costPrice, sellingPrice', 400);
  }

  const authorized = await canManageInventory(auth.user.id, auth.user.role, pharmacyId);
  if (!authorized) return apiForbidden('No autorizado para agregar inventario a esta farmacia');

  // Validate pharmacy exists
  const pharmacy = await db.pharmacy.findUnique({ where: { id: pharmacyId } });
  if (!pharmacy) return apiNotFound('Farmacia no encontrada');

  // Validate medication exists
  const medication = await db.medication.findUnique({ where: { id: medicationId } });
  if (!medication) return apiNotFound('Medicamento no encontrado');

  // Validate supplier if provided
  if (supplierId) {
    const supplier = await db.supplier.findUnique({ where: { id: supplierId } });
    if (!supplier) return apiNotFound('Proveedor no encontrado');
  }

  // Check for duplicate batch
  const existingBatch = await db.inventoryBatch.findUnique({
    where: {
      pharmacyId_medicationId_batchNumber: {
        pharmacyId,
        medicationId,
        batchNumber,
      },
    },
  });

  if (existingBatch) {
    // Update quantity if batch already exists
    const updated = await db.inventoryBatch.update({
      where: { id: existingBatch.id },
      data: {
        quantity: existingBatch.quantity + quantity,
        costPrice,
        sellingPrice,
        minStockAlert: minStockAlert ?? existingBatch.minStockAlert,
        maxStock: maxStock ?? existingBatch.maxStock,
        location: location ?? existingBatch.location,
        supplierId: supplierId ?? existingBatch.supplierId,
      },
      include: {
        medication: { select: { id: true, name: true, genericName: true } },
      },
    });

    await createAuditLog({
      userId: auth.user.id,
      action: 'update',
      entity: 'InventoryBatch',
      entityId: existingBatch.id,
      newValues: { action: 'quantity_added', previousQty: existingBatch.quantity, addedQty: quantity, newQty: updated.quantity },
    });

    return apiSuccess(updated);
  }

  const batch = await db.inventoryBatch.create({
    data: {
      pharmacyId,
      medicationId,
      batchNumber,
      quantity,
      expiryDate: new Date(expiryDate),
      costPrice,
      sellingPrice,
      supplierId,
      minStockAlert: minStockAlert ?? 10,
      maxStock: maxStock ?? 1000,
      location,
    },
    include: {
      medication: { select: { id: true, name: true, genericName: true } },
    },
  });

  await createAuditLog({
    userId: auth.user.id,
    action: 'create',
    entity: 'InventoryBatch',
    entityId: batch.id,
    newValues: batch,
  });

  return apiSuccess(batch, { status: 201 });
}

// PUT /api/pharmacy/inventory - Update inventory batch
export async function PUT(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const body = await request.json();
  const { batchId, ...fields } = body;

  if (!batchId) {
    return apiError('batchId es requerido', 400);
  }

  const existing = await db.inventoryBatch.findUnique({
    where: { id: batchId },
  });

  if (!existing) return apiNotFound('Lote de inventario no encontrado');

  const authorized = await canManageInventory(auth.user.id, auth.user.role, existing.pharmacyId);
  if (!authorized) return apiForbidden('No autorizado para modificar este inventario');

  const updateData: Record<string, unknown> = {};
  if (fields.quantity !== undefined) updateData.quantity = fields.quantity;
  if (fields.costPrice !== undefined) updateData.costPrice = fields.costPrice;
  if (fields.sellingPrice !== undefined) updateData.sellingPrice = fields.sellingPrice;
  if (fields.expiryDate !== undefined) updateData.expiryDate = new Date(fields.expiryDate);
  if (fields.minStockAlert !== undefined) updateData.minStockAlert = fields.minStockAlert;
  if (fields.maxStock !== undefined) updateData.maxStock = fields.maxStock;
  if (fields.location !== undefined) updateData.location = fields.location;
  if (fields.supplierId !== undefined) updateData.supplierId = fields.supplierId;
  if (fields.isActive !== undefined) updateData.isActive = fields.isActive;

  const batch = await db.inventoryBatch.update({
    where: { id: batchId },
    data: updateData,
    include: {
      medication: { select: { id: true, name: true, genericName: true } },
      supplier: { select: { id: true, name: true } },
    },
  });

  await createAuditLog({
    userId: auth.user.id,
    action: 'update',
    entity: 'InventoryBatch',
    entityId: batchId,
    oldValues: existing,
    newValues: batch,
  });

  return apiSuccess(batch);
}

