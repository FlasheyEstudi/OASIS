import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiUnauthorized, apiForbidden } from '@/lib/api-response';
import { getAuthUserFromHeader } from '@/lib/auth';
import { calculateDistance, safeJsonParse } from '@/lib/oasis-utils';
import { handleError } from '@/lib/handle-error';
import { AppError } from '@/lib/errors';
import logger from '@/lib/logger';
import { getClientIp, apiLimiter } from '@/lib/rate-limit';
import { z } from 'zod';

const nearbySchema = z.object({
  lat: z.string().transform(v => parseFloat(v)),
  lng: z.string().transform(v => parseFloat(v)),
  radius: z.string().optional().transform(v => v ? parseFloat(v) : 10),
  page: z.string().optional().transform(v => v ? parseInt(v) : 1),
  limit: z.string().optional().transform(v => v ? parseInt(v) : 20),
  medication_id: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const requestId = request.headers.get('X-Request-Id') || 'unknown';
  try {
    const ip = getClientIp(request);
    await apiLimiter.limit(ip);

    logger.info({ requestId, endpoint: '/api/v1/patient/nearby-pharmacies' }, 'Searching nearby pharmacies');

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams.entries());
    
    const parsed = nearbySchema.safeParse(query);
    if (!parsed.success) {
      throw AppError.badRequest('Parámetros de ubicación inválidos', parsed.error.flatten().fieldErrors as any);
    }

    const { lat: userLat, lng: userLng, radius, page, limit, medication_id: medicationId } = parsed.data;

    // Auth is optional
    const auth = await getAuthUserFromHeader(request);

    // Get all active pharmacies with coordinates
    const pharmacies = await db.pharmacy.findMany({
      where: {
        isActive: true,
        latitude: { not: null },
        longitude: { not: null },
      },
      include: {
        _count: {
          select: {
            inventoryBatches: {
              where: {
                isActive: true,
                quantity: { gt: 0 },
                expiryDate: { gt: new Date() },
              },
            },
          },
        },
      },
    });

    // Calculate distance and filter by radius
    let nearbyPharmacies = pharmacies
      .map((pharmacy) => {
        const distance = calculateDistance(
          userLat,
          userLng,
          pharmacy.latitude!,
          pharmacy.longitude!
        );

        return {
          id: pharmacy.id,
          name: pharmacy.name,
          description: pharmacy.description,
          address: pharmacy.address,
          city: pharmacy.city,
          department: pharmacy.department,
          phone: pharmacy.phone,
          email: pharmacy.email,
          logoUrl: pharmacy.logoUrl,
          latitude: pharmacy.latitude,
          longitude: pharmacy.longitude,
          distance: Math.round(distance * 10) / 10,
          activeInventoryCount: pharmacy._count.inventoryBatches,
          paymentMethods: safeJsonParse(pharmacy.paymentMethods, null),
          deliverySettings: safeJsonParse(pharmacy.deliverySettings, null),
        };
      })
      .filter((p) => p.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    // If medication filter is provided, check availability
    if (medicationId) {
      const pharmaciesWithMedication = await db.inventoryBatch.findMany({
        where: {
          medicationId,
          isActive: true,
          quantity: { gt: 0 },
          expiryDate: { gt: new Date() },
        },
        select: {
          pharmacyId: true,
          sellingPrice: true,
          quantity: true,
        },
      });

      const medicationAvailability = new Map<string, { price: number; quantity: number }>();
      for (const batch of pharmaciesWithMedication) {
        const existing = medicationAvailability.get(batch.pharmacyId);
        if (!existing || batch.sellingPrice < existing.price) {
          medicationAvailability.set(batch.pharmacyId, {
            price: batch.sellingPrice,
            quantity: batch.quantity,
          });
        }
      }

      nearbyPharmacies = nearbyPharmacies
        .map((p) => ({
          ...p,
          medicationAvailable: medicationAvailability.has(p.id),
          medicationPrice: medicationAvailability.get(p.id)?.price || null,
          medicationQuantity: medicationAvailability.get(p.id)?.quantity || null,
        }))
        .filter((p) => p.medicationAvailable);
    }

    const total = nearbyPharmacies.length;
    const paginatedPharmacies = nearbyPharmacies.slice(
      (page - 1) * limit,
      page * limit
    );

    // Update patient location if authenticated
    if (auth?.user.role === 'patient') {
      await db.patient.update({
        where: { userId: auth.user.id },
        data: { latitude: userLat, longitude: userLng },
      }).catch(err => logger.warn({ err }, 'Could not update patient location'));
    }

    return apiSuccess({
      pharmacies: paginatedPharmacies,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
        radius,
        searchLocation: { latitude: userLat, longitude: userLng },
      },
    });
  } catch (error) {
    logger.error({ requestId, error }, 'Error finding nearby pharmacies');
    return handleError(error);
  }
}
