// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Stock Value Report API
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';

// Helper: check if user can view reports
async function canViewReports(userId: string, role: string, pharmacyId: string): Promise<boolean> {
  if (role === ROLES.SUPERADMIN) return true;
  if (role === ROLES.PHARMACY_ADMIN) {
    const admin = await db.pharmacyAdmin.findFirst({ where: { userId, pharmacyId } });
    return !!admin;
  }
  return false;
}

// GET /api/pharmacies/[id]/reports/stock-value - Current stock value
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { id } = await params;

  const authorized = await canViewReports(auth.user.id, auth.user.role, id);
  if (!authorized) return apiForbidden('No autorizado para ver reportes');

  const pharmacy = await db.pharmacy.findUnique({ where: { id } });
  if (!pharmacy) return apiNotFound('Farmacia no encontrada');

  // Get all active inventory batches with stock
  const batches = await db.inventoryBatch.findMany({
    where: {
      pharmacyId: id,
      isActive: true,
      quantity: { gt: 0 },
    },
    include: {
      medication: {
        select: {
          id: true,
          name: true,
          category: true,
          genericName: true,
          controlledSubstance: true,
        },
      },
    },
  });

  // Calculate totals
  const totalItems = batches.reduce((sum, b) => sum + b.quantity, 0);
  const totalCostValue = batches.reduce((sum, b) => sum + b.quantity * b.costPrice, 0);
  const totalSellingValue = batches.reduce((sum, b) => sum + b.quantity * b.sellingPrice, 0);
  const potentialProfit = totalSellingValue - totalCostValue;

  // Value by category
  const categoryMap: Record<string, {
    category: string;
    items: number;
    costValue: number;
    sellingValue: number;
    batches: number;
  }> = {};

  for (const batch of batches) {
    const cat = batch.medication.category || 'Sin categoría';
    if (!categoryMap[cat]) {
      categoryMap[cat] = {
        category: cat,
        items: 0,
        costValue: 0,
        sellingValue: 0,
        batches: 0,
      };
    }
    categoryMap[cat].items += batch.quantity;
    categoryMap[cat].costValue += batch.quantity * batch.costPrice;
    categoryMap[cat].sellingValue += batch.quantity * batch.sellingPrice;
    categoryMap[cat].batches += 1;
  }

  // Low stock items
  const lowStockItems = batches.filter((b) => b.quantity <= b.minStockAlert);

  // Expiring soon (30 days)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  const expiringItems = batches.filter(
    (b) => new Date(b.expiryDate) <= thirtyDaysFromNow
  );

  // Controlled substances
  const controlledBatches = batches.filter(
    (b) => b.medication.controlledSubstance
  );
  const controlledValue = controlledBatches.reduce(
    (sum, b) => sum + b.quantity * b.costPrice,
    0
  );

  // Sort categories by value
  const categoriesByValue = Object.values(categoryMap)
    .sort((a, b) => b.costValue - a.costValue)
    .map((c) => ({
      ...c,
      costValue: Math.round(c.costValue * 100) / 100,
      sellingValue: Math.round(c.sellingValue * 100) / 100,
    }));

  return apiSuccess({
    summary: {
      totalItems,
      totalBatches: batches.length,
      totalCostValue: Math.round(totalCostValue * 100) / 100,
      totalSellingValue: Math.round(totalSellingValue * 100) / 100,
      potentialProfit: Math.round(potentialProfit * 100) / 100,
      currency: 'NIO',
    },
    categories: categoriesByValue,
    alerts: {
      lowStockCount: lowStockItems.length,
      expiringCount: expiringItems.length,
      controlledSubstances: {
        batches: controlledBatches.length,
        items: controlledBatches.reduce((s, b) => s + b.quantity, 0),
        value: Math.round(controlledValue * 100) / 100,
      },
    },
    lowStockItems: lowStockItems.map((b) => ({
      id: b.id,
      medicationName: b.medication.name,
      quantity: b.quantity,
      minStockAlert: b.minStockAlert,
      batchNumber: b.batchNumber,
    })),
  });
}
