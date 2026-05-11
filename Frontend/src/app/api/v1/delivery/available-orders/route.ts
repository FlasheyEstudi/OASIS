// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Available Orders for Delivery API
// GET /api/delivery/available-orders
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { apiSuccess, apiUnauthorized, apiForbidden, apiError, apiNotFound } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  if (auth.user.role !== ROLES.DELIVERY_PERSON && auth.user.role !== ROLES.SUPERADMIN) {
    return apiForbidden('Solo repartidores pueden ver órdenes disponibles');
  }

  const deliveryPerson = await db.deliveryPerson.findUnique({
    where: { userId: auth.user.id },
  });

  if (!deliveryPerson) return apiNotFound('Perfil de repartidor no encontrado');

  if (!deliveryPerson.isAvailable) {
    return apiError('Debes estar disponible para ver órdenes', 400);
  }

  // Find orders with status 'ready', deliveryType='delivery', no delivery assigned
  const availableOrders = await db.order.findMany({
    where: {
      status: 'ready',
      deliveryType: 'delivery',
      delivery: null,
      pharmacy: { isActive: true },
    },
    include: {
      pharmacy: {
        select: {
          id: true,
          name: true,
          address: true,
          phone: true,
          latitude: true,
          longitude: true,
        },
      },
      patient: {
        select: {
          id: true,
          user: { select: { name: true, phone: true } },
        },
      },
      items: {
        select: {
          id: true,
          medication: { select: { name: true } },
          quantity: true,
          unitPrice: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  // If delivery person has zones, filter by zones
  let filteredOrders = availableOrders;
  if (deliveryPerson.zones) {
    try {
      const personZones: string[] = JSON.parse(deliveryPerson.zones);
      if (personZones.length > 0) {
        // For MVP, filter by city/department match if deliveryAddress contains zone keywords
        // In production, this would use geofencing
        filteredOrders = availableOrders.filter((order) => {
          if (!order.deliveryAddress) return true; // Include if no address
          const addr = order.deliveryAddress.toLowerCase();
          return personZones.some((zone) => addr.includes(zone.toLowerCase()));
        });
      }
    } catch {
      // If zones can't be parsed, show all orders
    }
  }

  // For internal delivery persons, only show orders from their pharmacy
  if (deliveryPerson.isInternal && deliveryPerson.pharmacyId) {
    filteredOrders = filteredOrders.filter(
      (order) => order.pharmacyId === deliveryPerson.pharmacyId
    );
  }

  return apiSuccess(filteredOrders);
}
