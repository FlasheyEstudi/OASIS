// 🌿 OASIS - Pharmacy Reports API
// GET /api/v1/pharmacy/reports
import { NextRequest } from 'next/server';
import { apiSuccess, apiError } from '@/lib/api-response';
import { db } from '@/lib/db';
import { getAuthUserFromHeader } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUserFromHeader(request);
    if (!auth) return apiError('No autorizado', 401);
    const user = auth.user;

    const pharmacyStaff = await db.pharmacyStaff.findUnique({
      where: { userId: user.id },
      include: { pharmacy: true }
    });

    const pharmacyAdmin = await db.pharmacyAdmin.findUnique({
      where: { userId: user.id },
      include: { pharmacy: true }
    });

    if (!pharmacyAdmin) return apiError('Solo los administradores pueden ver reportes', 403);

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'sales';
    const pharmacyId = pharmacyAdmin.pharmacyId;

    if (type === 'sales') {
      const orders = await db.order.findMany({
        where: { pharmacyId, status: 'delivered' },
        orderBy: { createdAt: 'asc' }
      });

      const totalSales = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const totalOrders = orders.length;
      const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0;

      // Group by day for trends
      const dailyTrendsMap = new Map();
      orders.forEach(o => {
        const date = o.createdAt.toISOString().split('T')[0];
        dailyTrendsMap.set(date, (dailyTrendsMap.get(date) || 0) + (o.totalAmount || 0));
      });

      const dailyTrends = Array.from(dailyTrendsMap.entries()).map(([date, total]) => ({
        date,
        total
      }));

      return apiSuccess({
        summary: { totalSales, totalOrders, averageTicket },
        dailyTrends
      });
    }

    if (type === 'stock') {
      const batches = await db.inventoryBatch.findMany({
        where: { pharmacyId, isActive: true }
      });

      const totalCostValue = batches.reduce((sum, b) => sum + (b.quantity * (b.costPrice || 0)), 0);
      const totalSellingValue = batches.reduce((sum, b) => sum + (b.quantity * (b.sellingPrice || 0)), 0);
      const potentialProfit = totalSellingValue - totalCostValue;

      return apiSuccess({
        totalCostValue,
        totalSellingValue,
        potentialProfit,
        categoryProfit: [
          { name: 'Antibióticos', profit: potentialProfit * 0.4 },
          { name: 'Vitaminas', profit: potentialProfit * 0.3 },
          { name: 'Analgésicos', profit: potentialProfit * 0.2 },
          { name: 'Gastro', profit: potentialProfit * 0.1 }
        ]
      });
    }

    if (type === 'customers') {
      const patientOrders = await db.order.groupBy({
        by: ['patientId'],
        where: { pharmacyId, status: 'delivered' },
        _count: { id: true },
        _sum: { totalAmount: true }
      });

      const patientDetails = await db.patient.findMany({
        where: { id: { in: patientOrders.map(p => p.patientId) } },
        include: { user: { select: { name: true, phone: true } } }
      });

      const report = patientOrders.map(p => {
        const detail = patientDetails.find(d => d.id === p.patientId);
        return {
          user: detail?.user,
          totalOrders: p._count.id,
          totalSpent: p._sum.totalAmount || 0
        };
      });

      return apiSuccess(report);
    }

    return apiError('Tipo de reporte no soportado', 400);
  } catch (error) {
    console.error('[Reports GET] Error:', error);
    return apiError('Error al generar reporte', 500);
  }
}
