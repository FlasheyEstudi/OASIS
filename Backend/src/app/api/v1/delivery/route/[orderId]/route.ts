// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Delivery Route API
// GET /api/v1/delivery/route/[orderId]
// Engine: GraphHopper (self-hosted or public API)
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { apiSuccess, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { getGraphHopperRoute, getFallbackRoute, sortStopsGreedy, RouteStop } from '@/lib/maps-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const allowedRoles = [ROLES.DELIVERY_PERSON, ROLES.SUPERADMIN, ROLES.PATIENT, ROLES.PHARMACY_ADMIN, ROLES.PHARMACY_STAFF];
  if (!allowedRoles.includes(auth.user.role as any)) {
    return apiForbidden('No tienes permiso para ver rutas');
  }

  const { orderId } = await params;

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      pharmacy: {
        select: { id: true, name: true, address: true, latitude: true, longitude: true }
      },
      delivery: {
        include: { deliveryPerson: true }
      },
    },
  });

  if (!order) return apiNotFound('Orden no encontrada');

  // Delivery person can only see their own route
  if (auth.user.role === ROLES.DELIVERY_PERSON) {
    const dp = await db.deliveryPerson.findUnique({ where: { userId: auth.user.id } });
    if (!dp || !order.delivery || order.delivery.deliveryPersonId !== dp.id) {
      return apiForbidden('No tienes permiso para ver esta ruta');
    }
  }

  const pickup: RouteStop = {
    latitude: order.pharmacy.latitude ?? 12.136,
    longitude: order.pharmacy.longitude ?? -86.251,
    address: order.pharmacy.address ?? '',
    name: order.pharmacy.name,
  };

  const dropoff: RouteStop = {
    latitude: order.deliveryLatitude ?? 12.140,
    longitude: order.deliveryLongitude ?? -86.245,
    address: order.deliveryAddress ?? '',
  };

  // ────────────────────────────────────────────────────────────────
  // Multi-stop: check if this delivery person has other active orders
  // If so, apply greedy sort to minimize total travel distance
  // ────────────────────────────────────────────────────────────────
  let allStops: RouteStop[] = [pickup, dropoff];

  if (order.delivery?.deliveryPersonId && auth.user.role === ROLES.DELIVERY_PERSON) {
    try {
      const siblingOrders = await db.order.findMany({
        where: {
          delivery: {
            deliveryPersonId: order.delivery.deliveryPersonId,
            status: { in: ['assigned', 'accepted', 'picked_up', 'in_transit'] },
          },
          id: { not: orderId }, // exclude current order
        },
        include: {
          pharmacy: { select: { name: true, latitude: true, longitude: true, address: true } }
        },
        take: 4, // max 4 additional stops for performance
      });

      if (siblingOrders.length > 0) {
        const extraDropoffs: RouteStop[] = siblingOrders
          .filter(o => o.deliveryLatitude && o.deliveryLongitude)
          .map(o => ({
            latitude: o.deliveryLatitude!,
            longitude: o.deliveryLongitude!,
            address: o.deliveryAddress ?? '',
          }));

        // Sort extra stops using greedy nearest-neighbor from pickup
        const sortedExtras = sortStopsGreedy(pickup, extraDropoffs);
        allStops = [pickup, dropoff, ...sortedExtras];
      }
    } catch (e) {
      // Non-critical: continue with single-stop route
      console.warn('[Route] Could not load sibling orders:', e);
    }
  }

  // ────────────────────────────────────────────────────────────────
  // Call GraphHopper (self-hosted first, public API as fallback)
  // ────────────────────────────────────────────────────────────────
  let routeData = await getGraphHopperRoute(allStops, 'motorcycle');

  if (!routeData) {
    console.warn('[Route] GraphHopper unavailable – using Haversine fallback');
    routeData = getFallbackRoute(pickup, dropoff);
  }

  return apiSuccess({
    orderId,
    pickup: routeData.pickup,
    dropoff: routeData.dropoff,
    waypoints: routeData.waypoints ?? [],
    distanceKm: routeData.distanceKm,
    estimatedMinutes: routeData.estimatedMinutes,
    geometry: routeData.geometry,     // GeoJSON LineString
    deliveryNotes: order.deliveryNotes,
    currentDeliveryStatus: order.delivery?.status ?? null,
    driverLocation: order.delivery?.currentLat ? {
      latitude: order.delivery.currentLat,
      longitude: order.delivery.currentLng
    } : null,
    engine: process.env.GRAPHHOPPER_URL?.includes('graphhopper.com') ? 'graphhopper-public' : 'graphhopper-local',
  });
}
