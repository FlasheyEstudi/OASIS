// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Pharmacy Dashboard API
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  // Find pharmacyId
  let pharmacyId = '';
  if (auth.user.role === ROLES.PHARMACY_ADMIN) {
    const admin = await db.pharmacyAdmin.findFirst({ where: { userId: auth.user.id } });
    pharmacyId = admin?.pharmacyId || '';
  } else if (auth.user.role === ROLES.PHARMACY_STAFF) {
    const staff = await db.pharmacyStaff.findFirst({ where: { userId: auth.user.id } });
    pharmacyId = staff?.pharmacyId || '';
  }

  if (!pharmacyId) return apiForbidden('No tienes una farmacia asociada');

  try {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    // 1. Metrics
    const todaySales = await db.order.aggregate({
      where: { pharmacyId, createdAt: { gte: startOfDay }, status: 'delivered', paymentStatus: 'paid' },
      _sum: { totalAmount: true },
      _count: true
    });

    const pendingOrders = await db.order.count({
      where: { pharmacyId, status: 'pending' }
    });

    const lowStockCount = await db.inventoryBatch.count({
      where: { pharmacyId, quantity: { lte: db.inventoryBatch.fields.minStockAlert } }
    });

    const expiringSoonCount = await db.inventoryBatch.count({
      where: { pharmacyId, expiryDate: { lte: thirtyDaysFromNow, gte: new Date() } }
    });

    // 2. Weekly Sales Chart Data
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);
    
    const salesLast7Days = await db.order.groupBy({
      by: ['createdAt'],
      where: { pharmacyId, createdAt: { gte: weekAgo }, status: 'delivered' },
      _sum: { totalAmount: true },
    });

    // 3. Alerts
    const lowStockItems = await db.inventoryBatch.findMany({
      where: { pharmacyId, quantity: { lte: 20 } }, // For demo, alert if < 20
      include: { medication: { select: { name: true } } },
      take: 5
    });

    return apiSuccess({
      metrics: {
        todayTotal: todaySales._sum.totalAmount || 0,
        todayCount: todaySales._count || 0,
        pendingOrders,
        lowStockCount,
        expiringSoonCount
      },
      chartData: salesLast7Days.map(s => ({
        date: s.createdAt.toISOString().split('T')[0],
        amount: s._sum.totalAmount || 0
      })),
      alerts: lowStockItems.map(i => ({
        type: i.quantity <= 0 ? 'out_of_stock' : 'low_stock',
        message: `${i.medication.name} tiene stock bajo (${i.quantity} unidades)`,
        severity: i.quantity <= 0 ? 'high' : 'medium'
      }))
    });

  } catch (error) {
    console.error('Pharmacy Dashboard Error:', error);
    return apiError('Error al cargar dashboard de farmacia');
  }
}
