// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Expiring Inventory API (FEFO Compliance)
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';

// Helper: check if user can access inventory for this pharmacy
async function canAccessInventory(userId: string, role: string, pharmacyId: string): Promise<boolean> {
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

// GET /api/pharmacy/inventory/expiring - Get batches expiring within N days
export async function GET(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '30');
  const pharmacyId = searchParams.get('pharmacyId') || '';

  if (!pharmacyId) {
    return apiError('pharmacyId es requerido', 400);
  }

  const authorized = await canAccessInventory(auth.user.id, auth.user.role, pharmacyId);
  if (!authorized) return apiForbidden('No autorizado para ver inventario de esta farmacia');

  const now = new Date();
  const expiryThreshold = new Date();
  expiryThreshold.setDate(expiryThreshold.getDate() + days);

  // Get expiring batches ordered by expiry date (FEFO - First Expired First Out)
  const expiringBatches = await db.inventoryBatch.findMany({
    where: {
      pharmacyId,
      isActive: true,
      quantity: { gt: 0 },
      expiryDate: {
        gte: now,
        lte: expiryThreshold,
      },
    },
    orderBy: { expiryDate: 'asc' },
    include: {
      medication: {
        select: {
          id: true,
          name: true,
          genericName: true,
          brand: true,
          dosageForm: true,
          strength: true,
          category: true,
          controlledSubstance: true,
        },
      },
      supplier: { select: { id: true, name: true } },
    },
  });

  // Also get already expired batches that still have stock
  const expiredBatches = await db.inventoryBatch.findMany({
    where: {
      pharmacyId,
      isActive: true,
      quantity: { gt: 0 },
      expiryDate: { lt: now },
    },
    orderBy: { expiryDate: 'asc' },
    include: {
      medication: {
        select: {
          id: true,
          name: true,
          genericName: true,
          brand: true,
          dosageForm: true,
          strength: true,
          category: true,
          controlledSubstance: true,
        },
      },
      supplier: { select: { id: true, name: true } },
    },
  });

  // Enrich with computed fields
  const enrichBatch = (batch: typeof expiringBatches[0]) => ({
    ...batch,
    daysToExpiry: Math.ceil(
      (new Date(batch.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    ),
    totalValue: batch.quantity * batch.costPrice,
    isExpired: new Date(batch.expiryDate) < now,
  });

  const totalExpiringValue = expiringBatches.reduce(
    (sum, b) => sum + b.quantity * b.costPrice,
    0
  );
  const totalExpiredValue = expiredBatches.reduce(
    (sum, b) => sum + b.quantity * b.costPrice,
    0
  );

  return apiSuccess({
    expiring: expiringBatches.map(enrichBatch),
    expired: expiredBatches.map(enrichBatch),
    summary: {
      daysThreshold: days,
      expiringCount: expiringBatches.length,
      expiredCount: expiredBatches.length,
      totalExpiringValue: Math.round(totalExpiringValue * 100) / 100,
      totalExpiredValue: Math.round(totalExpiredValue * 100) / 100,
    },
  });
}
