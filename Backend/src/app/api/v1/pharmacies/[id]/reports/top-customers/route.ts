// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Top Customers Report API
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

// GET /api/pharmacies/[id]/reports/top-customers - Top customers by purchase amount
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
  const limit = parseInt(searchParams.get('limit') || '10');

  // Get orders with patient data
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
      patient: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      },
    },
  });

  // Aggregate by patient
  const customerMap: Record<string, {
    patientId: string;
    name: string;
    email: string;
    phone: string;
    totalSpent: number;
    orderCount: number;
    loyaltyPoints: number;
    loyaltyLevel: string;
  }> = {};

  for (const order of orders) {
    const pid = order.patientId;
    if (!customerMap[pid]) {
      customerMap[pid] = {
        patientId: pid,
        name: order.patient.user.name,
        email: order.patient.user.email,
        phone: order.patient.user.phone || '',
        totalSpent: 0,
        orderCount: 0,
        loyaltyPoints: order.patient.loyaltyPoints,
        loyaltyLevel: order.patient.loyaltyLevel,
      };
    }
    customerMap[pid].totalSpent += order.totalAmount;
    customerMap[pid].orderCount += 1;
  }

  // Sort by total spent and limit
  const topCustomers = Object.values(customerMap)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, limit)
    .map((c) => ({
      ...c,
      totalSpent: Math.round(c.totalSpent * 100) / 100,
      avgOrderValue: Math.round((c.totalSpent / c.orderCount) * 100) / 100,
    }));

  return apiSuccess({
    period: {
      from: from || 'inicio',
      to: to || 'ahora',
    },
    topCustomers,
    totalCustomers: Object.keys(customerMap).length,
    currency: 'NIO',
  });
}
