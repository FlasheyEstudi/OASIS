// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - GET /api/v1/delivery/route/[orderId]
// Returns route geometry and ETA for a specific order
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiNotFound } from '@/lib/api-response';
import { getGraphHopperRoute, getFallbackRoute } from '@/lib/maps-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;

    // 1. Fetch order with locations
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        pharmacy: { select: { latitude: true, longitude: true, name: true, address: true } },
        delivery: {
          include: {
            deliveryPerson: {
              select: { latitude: true, longitude: true }
            }
          }
        }
      }
    });

    if (!order) return apiNotFound('Orden no encontrada');

    // 2. Determine start (driver or pharmacy) and end (delivery location)
    // If delivery is already assigned and has a location, use it as start
    const startLat = order.delivery?.deliveryPerson?.latitude || order.pharmacy.latitude;
    const startLng = order.delivery?.deliveryPerson?.longitude || order.pharmacy.longitude;

    // End is the order's delivery location
    const endLat = order.deliveryLatitude;
    const endLng = order.deliveryLongitude;

    if (!startLat || !startLng || !endLat || !endLng) {
      return apiError('Coordenadas de origen o destino no disponibles', 422);
    }

    const pickup = {
      latitude: startLat,
      longitude: startLng,
      name: order.pharmacy.name,
      address: order.pharmacy.address
    };

    const dropoff = {
      latitude: endLat,
      longitude: endLng,
      name: 'Entrega'
    };

    // 3. Calculate route
    let route = await getGraphHopperRoute([pickup, dropoff]);

    // 4. Fallback if GraphHopper fails
    if (!route) {
      console.warn(`[RouteAPI] GraphHopper failed for order ${orderId}, using fallback.`);
      route = getFallbackRoute(pickup, dropoff);
    }

    return apiSuccess({
      ...route,
      orderId,
      driverLocation: order.delivery?.deliveryPerson ? {
        latitude: order.delivery.deliveryPerson.latitude,
        longitude: order.delivery.deliveryPerson.longitude
      } : null
    });

  } catch (error) {
    console.error('[RouteAPI] Error:', error);
    return apiError('Error al calcular la ruta', 500);
  }
}
