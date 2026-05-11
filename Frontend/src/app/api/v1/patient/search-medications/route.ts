// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - GET /api/patient/search-medications
// Search medications by name/genericName
// If lat/lng provided, find pharmacies with stock nearby
// PUBLIC endpoint (no auth required) but enhanced with auth
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiPaginated } from '@/lib/api-response';
import { getAuthUserFromHeader } from '@/lib/auth';
import { calculateDistance } from '@/lib/oasis-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const q = searchParams.get('q') || '';
    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null;
    const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null;
    const radius = parseFloat(searchParams.get('radius') || '10'); // km
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'name'; // name, price, distance
    const skip = (page - 1) * limit;

    // Auth is optional - enhance results if authenticated
    const auth = await getAuthUserFromHeader(request);

    if (!q || q.length < 2) {
      return apiError('Búsqueda debe tener al menos 2 caracteres', 422);
    }

    // Search medications by name or genericName
    const medications = await db.medication.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q } },
          { genericName: { contains: q } },
          { brand: { contains: q } },
          { category: { contains: q } },
        ],
      },
      include: {
        inventoryBatches: {
          where: {
            isActive: true,
            quantity: { gt: 0 },
            expiryDate: { gt: new Date() },
          },
          include: {
            pharmacy: {
              select: {
                id: true,
                name: true,
                address: true,
                city: true,
                latitude: true,
                longitude: true,
                phone: true,
                isActive: true,
              },
            },
          },
        },
      },
      skip,
      take: limit,
    });

    // If coordinates provided, enrich with pharmacy distance and sort
    let enrichedMedications = medications.map((med) => {
      const pharmacies = med.inventoryBatches
        .map((batch) => {
          const pharmacy = batch.pharmacy;
          let distance: number | null = null;

          if (lat !== null && lng !== null && pharmacy.latitude && pharmacy.longitude) {
            distance = calculateDistance(lat, lng, pharmacy.latitude, pharmacy.longitude);
          }

          return {
            pharmacyId: pharmacy.id,
            pharmacyName: pharmacy.name,
            pharmacyAddress: pharmacy.address,
            pharmacyCity: pharmacy.city,
            pharmacyPhone: pharmacy.phone,
            batchId: batch.id,
            quantity: batch.quantity,
            sellingPrice: batch.sellingPrice,
            expiryDate: batch.expiryDate,
            distance,
          };
        })
        // Filter by radius if coordinates provided
        .filter((p) => {
          if (lat === null || lng === null) return true;
          return p.distance !== null && p.distance <= radius;
        })
        // Sort pharmacies
        .sort((a, b) => {
          if (sortBy === 'price') return a.sellingPrice - b.sellingPrice;
          if (sortBy === 'distance' && a.distance !== null && b.distance !== null) {
            return a.distance - b.distance;
          }
          return 0;
        });

      // Calculate min price across pharmacies
      const minPrice = pharmacies.length > 0
        ? Math.min(...pharmacies.map((p) => p.sellingPrice))
        : null;

      return {
        id: med.id,
        name: med.name,
        genericName: med.genericName,
        brand: med.brand,
        dosageForm: med.dosageForm,
        strength: med.strength,
        requiresPrescription: med.requiresPrescription,
        category: med.category,
        imageUrl: med.imageUrl,
        minPrice,
        availablePharmacies: pharmacies.length,
        pharmacies,
      };
    });

    // Filter out medications with no available pharmacies if location is provided
    if (lat !== null && lng !== null) {
      enrichedMedications = enrichedMedications.filter((m) => m.availablePharmacies > 0);
    }

    // Sort medications
    enrichedMedications.sort((a, b) => {
      if (sortBy === 'price' && a.minPrice !== null && b.minPrice !== null) {
        return a.minPrice - b.minPrice;
      }
      if (sortBy === 'distance') {
        const aMin = a.pharmacies[0]?.distance ?? Infinity;
        const bMin = b.pharmacies[0]?.distance ?? Infinity;
        return aMin - bMin;
      }
      return a.name.localeCompare(b.name);
    });

    // Get total count for pagination
    const total = await db.medication.count({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q } },
          { genericName: { contains: q } },
          { brand: { contains: q } },
          { category: { contains: q } },
        ],
      },
    });

    // If authenticated patient, log search for recommendations
    if (auth?.user.role === 'patient') {
      // Could store search history for personalization in the future
    }

    return apiPaginated(enrichedMedications, page, limit, total);
  } catch (error) {
    console.error('Error searching medications:', error);
    return apiError('Error al buscar medicamentos', 500);
  }
}
