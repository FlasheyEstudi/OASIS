// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Pharmacy Reports API
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth || auth.user.role !== ROLES.PHARMACY_ADMIN) return apiForbidden();

  const admin = await db.pharmacyAdmin.findFirst({ where: { userId: auth.user.id } });
  if (!admin) return apiForbidden();

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'sales'; // sales, inventory, customers

  try {
    if (type === 'sales') {
      const salesByProduct = await db.orderItem.groupBy({
        by: ['medicationId'],
        where: { order: { pharmacyId: admin.pharmacyId, status: 'delivered' } },
        _sum: { quantity: true, totalPrice: true },
      });
      
      // Hydrate with medication names
      const medicationIds = salesByProduct.map(s => s.medicationId);
      const medications = await db.medication.findMany({
        where: { id: { in: medicationIds } },
        select: { id: true, name: true }
      });

      const report = salesByProduct.map(s => ({
        ...s,
        medicationName: medications.find(m => m.id === s.medicationId)?.name || 'Desconocido'
      }));

      return apiSuccess(report);
    }

    if (type === 'inventory') {
      const inventoryValue = await db.inventoryBatch.aggregate({
        where: { pharmacyId: admin.pharmacyId, isActive: true },
        _sum: { quantity: true },
      });
      return apiSuccess({ totalItems: inventoryValue._sum.quantity || 0 });
    }

    return apiError('Tipo de reporte no soportado');
  } catch (error) {
    return apiError('Error al generar reporte');
  }
}
