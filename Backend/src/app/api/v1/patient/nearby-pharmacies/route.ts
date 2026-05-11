// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - GET /api/patient/nearby-pharmacies
// Find pharmacies near a location
// Include basic inventory count
// Calculate distance using Haversine formula from oasis-utils
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError } from '@/lib/api-response';
import { getAuthUserFromHeader } from '@/lib/auth';
import { calculateDistance } from '@/lib/oasis-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = parseFloat(searchParams.get('radius') || '10'); // km
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const medicationId = searchParams.get('medication_id') || undefined; // Filter by medication availability

    if (!lat || !lng) {
      return apiError('lat y lng son requeridos', 422);
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    // Auth is optional but can enhance results
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
          distance: Math.round(distance * 10) / 10, // Round to 1 decimal
          activeInventoryCount: pharmacy._count.inventoryBatches,
          paymentMethods: pharmacy.paymentMethods
            ? (() => {
                try { return JSON.parse(pharmacy.paymentMethods); }
                catch { return null; }
              })()
            : null,
          deliverySettings: pharmacy.deliverySettings
            ? (() => {
                try { return JSON.parse(pharmacy.deliverySettings); }
                catch { return null; }
              })()
            : null,
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

    // Apply pagination
    const total = nearbyPharmacies.length;
    const paginatedPharmacies = nearbyPharmacies.slice(
      (page - 1) * limit,
      page * limit
    );

    // Update patient location if authenticated
    if (auth?.user.role === 'patient') {
      const patient = await db.patient.findUnique({
        where: { userId: auth.user.id },
      });
      if (patient) {
        await db.patient.update({
          where: { id: patient.id },
          data: { latitude: userLat, longitude: userLng },
        });
      }
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
    console.error('Error finding nearby pharmacies:', error);
    return apiError('Error al buscar farmacias cercanas', 500);
  }
}
