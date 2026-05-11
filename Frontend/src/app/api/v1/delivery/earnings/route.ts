// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Delivery Earnings API
// GET /api/delivery/earnings?from=&to=
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { apiSuccess, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';

// Delivery fee per delivery for earnings calculation (MVP: deliveryFee from order)
const DELIVERY_EARNINGS_RATE = 0.7; // 70% of delivery fee goes to driver

export async function GET(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  if (auth.user.role !== ROLES.DELIVERY_PERSON && auth.user.role !== ROLES.SUPERADMIN) {
    return apiForbidden('Solo repartidores pueden ver sus ganancias');
  }

  const deliveryPerson = await db.deliveryPerson.findUnique({
    where: { userId: auth.user.id },
  });

  if (!deliveryPerson) return apiNotFound('Perfil de repartidor no encontrado');

  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const dateFilter: Record<string, unknown> = {};
  if (from) dateFilter.gte = new Date(from);
  if (to) dateFilter.lte = new Date(to);

  const where: Record<string, unknown> = {
    deliveryPersonId: deliveryPerson.id,
    status: 'delivered',
  };
  if (from || to) {
    where.deliveryTime = dateFilter;
  }

  const deliveries = await db.delivery.findMany({
    where,
    include: {
      order: {
        select: {
          id: true,
          deliveryFee: true,
          totalAmount: true,
          createdAt: true,
        },
      },
    },
    orderBy: { deliveryTime: 'desc' },
  });

  const totalEarnings = deliveries.reduce((sum, d) => {
    return sum + (d.order.deliveryFee * DELIVERY_EARNINGS_RATE);
  }, 0);

  const numberOfDeliveries = deliveries.length;
  const averagePerDelivery = numberOfDeliveries > 0 ? totalEarnings / numberOfDeliveries : 0;

  return apiSuccess({
    totalEarnings: Math.round(totalEarnings * 100) / 100,
    numberOfDeliveries,
    averagePerDelivery: Math.round(averagePerDelivery * 100) / 100,
    currency: 'NIO',
    period: {
      from: from || null,
      to: to || null,
    },
    deliveries: deliveries.map((d) => ({
      deliveryId: d.id,
      orderId: d.order.id,
      deliveryFee: d.order.deliveryFee,
      earnings: Math.round(d.order.deliveryFee * DELIVERY_EARNINGS_RATE * 100) / 100,
      deliveryTime: d.deliveryTime,
    })),
  });
}
