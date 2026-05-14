// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Pharmacy Dashboard API
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

export async function GET(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  // Find pharmacyId
  let pharmacyId = '';
  let profileId = '';
  if (auth.user.role === ROLES.PHARMACY_ADMIN) {
    const admin = await db.pharmacyAdmin.findFirst({ where: { userId: auth.user.id } });
    pharmacyId = admin?.pharmacyId || '';
    profileId = admin?.id || '';
  } else if (auth.user.role === ROLES.PHARMACY_STAFF) {
    const staff = await db.pharmacyStaff.findFirst({ where: { userId: auth.user.id } });
    pharmacyId = staff?.pharmacyId || '';
    profileId = staff?.id || '';
  }

  if (!pharmacyId) return apiForbidden('No tienes una farmacia asociada');

  try {
    // Registro de auditoría
    await createAuditLog({
      userId: auth.user.id,
      action: 'view_dashboard',
      entity: 'Pharmacy',
      entityId: profileId || pharmacyId,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      details: { section: 'dashboard', pharmacyId }
    });
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

    // 4. Recent Orders
    const recentOrders = await db.order.findMany({
      where: { pharmacyId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { patient: { include: { user: { select: { name: true } } } }, items: true }
    });

    const expiringItems = await db.inventoryBatch.findMany({
      where: { pharmacyId, expiryDate: { lte: thirtyDaysFromNow, gte: new Date() } },
      include: { medication: { select: { name: true } } },
      take: 5
    });

    return apiSuccess({
      todayRevenue: todaySales._sum.totalAmount || 0,
      revenueTrend: "+12%", // Placeholder o cálculo real si hay datos previos
      totalOrders: await db.order.count({ where: { pharmacyId } }),
      totalInventoryItems: await db.inventoryBatch.count({ where: { pharmacyId } }),
      expiringItemsCount: expiringSoonCount,
      recentOrders,
      lowStockItems,
      expiringItems
    });

  } catch (error) {
    console.error('Pharmacy Dashboard Error:', error);
    return apiError('Error al cargar dashboard de farmacia');
  }
}
