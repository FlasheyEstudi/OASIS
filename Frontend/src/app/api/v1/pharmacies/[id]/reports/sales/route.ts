// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Sales Report API
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
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

// GET /api/pharmacies/[id]/reports/sales - Sales report
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

  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const groupBy = searchParams.get('groupBy') || 'product'; // product | category

  const dateFilter: Record<string, unknown> = { pharmacyId: id };
  if (from || to) {
    dateFilter.createdAt = {};
    if (from) (dateFilter.createdAt as Record<string, unknown>).gte = new Date(from);
    if (to) (dateFilter.createdAt as Record<string, unknown>).lte = new Date(to);
  }

  // Get orders with items for the period
  const orders = await db.order.findMany({
    where: {
      pharmacyId: id,
      status: { notIn: ['cancelled', 'returned'] },
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    },
    include: {
      items: {
        include: {
          medication: {
            select: {
              id: true,
              name: true,
              category: true,
              genericName: true,
            },
          },
        },
      },
    },
  });

  // Aggregate data
  const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  // Group by product or category
  const grouped: Record<string, {
    name: string;
    quantity: number;
    revenue: number;
    orders: number;
  }> = {};

  for (const order of orders) {
    for (const item of order.items) {
      const key =
        groupBy === 'category'
          ? item.medication.category || 'Sin categoría'
          : item.medication.id;

      if (!grouped[key]) {
        grouped[key] = {
          name:
            groupBy === 'category'
              ? item.medication.category || 'Sin categoría'
              : item.medication.name,
          quantity: 0,
          revenue: 0,
          orders: 0,
        };
      }

      grouped[key].quantity += item.quantity;
      grouped[key].revenue += item.totalPrice;
      grouped[key].orders += 1;
    }
  }

  // Sort by revenue descending
  const groupedArray = Object.values(grouped).sort((a, b) => b.revenue - a.revenue);

  // Payment method breakdown
  const paymentBreakdown: Record<string, { count: number; total: number }> = {};
  for (const order of orders) {
    const method = order.paymentMethod;
    if (!paymentBreakdown[method]) {
      paymentBreakdown[method] = { count: 0, total: 0 };
    }
    paymentBreakdown[method].count += 1;
    paymentBreakdown[method].total += order.totalAmount;
  }

  return apiSuccess({
    period: {
      from: from || 'inicio',
      to: to || 'ahora',
    },
    summary: {
      totalSales: Math.round(totalSales * 100) / 100,
      totalOrders,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      currency: 'NIO',
    },
    grouped: groupedArray.map((g) => ({
      ...g,
      revenue: Math.round(g.revenue * 100) / 100,
    })),
    groupBy,
    paymentBreakdown: Object.fromEntries(
      Object.entries(paymentBreakdown).map(([k, v]) => [
        k,
        { ...v, total: Math.round(v.total * 100) / 100 },
      ])
    ),
  });
}
