// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Delivery Route API
// GET /api/delivery/route/[orderId] - Get optimized route info
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { apiSuccess, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { calculateDistance } from '@/lib/oasis-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  if (auth.user.role !== ROLES.DELIVERY_PERSON && auth.user.role !== ROLES.SUPERADMIN) {
    return apiForbidden('Solo repartidores pueden ver rutas');
  }

  const { orderId } = await params;

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      pharmacy: { select: { id: true, name: true, address: true, latitude: true, longitude: true } },
      delivery: {
        include: {
          deliveryPerson: true,
        },
      },
    },
  });

  if (!order) return apiNotFound('Orden no encontrada');

  // Verify delivery person has access
  if (auth.user.role === ROLES.DELIVERY_PERSON) {
    const dp = await db.deliveryPerson.findUnique({ where: { userId: auth.user.id } });
    if (!dp || !order.delivery || order.delivery.deliveryPersonId !== dp.id) {
      return apiForbidden('No tienes permiso para ver esta ruta');
    }
  }

  const pickup = {
    latitude: order.pharmacy.latitude,
    longitude: order.pharmacy.longitude,
    address: order.pharmacy.address,
    name: order.pharmacy.name,
  };

  const dropoff = {
    latitude: order.deliveryLatitude,
    longitude: order.deliveryLongitude,
    address: order.deliveryAddress,
  };

  // Calculate distance if both coordinates available
  let distanceKm = null;
  let estimatedMinutes = null;
  if (pickup.latitude && pickup.longitude && dropoff.latitude && dropoff.longitude) {
    distanceKm = calculateDistance(
      pickup.latitude,
      pickup.longitude,
      dropoff.latitude,
      dropoff.longitude
    );
    // Rough estimate: average 25 km/h in city traffic
    estimatedMinutes = Math.round((distanceKm / 25) * 60);
  }

  // For MVP, return basic route info + simulated geometry
  const geometry = {
    type: 'LineString',
    coordinates: [
      [pickup.longitude, pickup.latitude],
      // Simulated intermediate points
      [(pickup.longitude! + dropoff.longitude!) / 2, (pickup.latitude! + dropoff.latitude!) / 2],
      [dropoff.longitude, dropoff.latitude],
    ],
  };

  return apiSuccess({
    orderId,
    pickup,
    dropoff,
    distanceKm: distanceKm ? Math.round(distanceKm * 10) / 10 : null,
    estimatedMinutes,
    geometry, // GeoJSON for Leaflet
    routeNote: 'Ruta calculada con geometría simulada. En producción se integraría con OSRM para ruta óptima.',
    deliveryNotes: order.deliveryNotes,
    currentDeliveryStatus: order.delivery?.status || null,
  });
}
