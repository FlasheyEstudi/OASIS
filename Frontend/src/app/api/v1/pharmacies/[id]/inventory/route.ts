// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Pharmacy Inventory API
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiUnauthorized, apiForbidden, apiNotFound, apiPaginated } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';

// Helper: check if user can access this pharmacy
async function canAccessPharmacy(userId: string, role: string, pharmacyId: string): Promise<boolean> {
  if (role === ROLES.SUPERADMIN) return true;
  if (role === ROLES.PHARMACY_ADMIN) {
    const admin = await db.pharmacyAdmin.findFirst({ where: { userId, pharmacyId } });
    return !!admin;
  }
  if (role === ROLES.PHARMACY_STAFF) {
    const staff = await db.pharmacyStaff.findFirst({ where: { userId, pharmacyId } });
    return !!staff;
  }
  return false;
}

// GET /api/pharmacies/[id]/inventory - List inventory for pharmacy
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { id } = await params;

  const authorized = await canAccessPharmacy(auth.user.id, auth.user.role, id);
  if (!authorized) return apiForbidden('No autorizado para ver inventario de esta farmacia');

  const pharmacy = await db.pharmacy.findUnique({ where: { id } });
  if (!pharmacy) return apiNotFound('Farmacia no encontrada');

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const includeBranches = searchParams.get('include_branches') === 'true';
  const medicationId = searchParams.get('medication_id') || '';
  const search = searchParams.get('search') || '';

  const skip = (page - 1) * limit;

  // Build pharmacy IDs to include
  let pharmacyIds = [id];
  if (includeBranches) {
    const branches = await db.pharmacy.findMany({
      where: { parentPharmacyId: id, isActive: true },
      select: { id: true },
    });
    pharmacyIds = [id, ...branches.map((b) => b.id)];
  }

  const where: Record<string, unknown> = {
    pharmacyId: { in: pharmacyIds },
    isActive: true,
    quantity: { gt: 0 },
  };

  if (medicationId) {
    where.medicationId = medicationId;
  }

  if (search) {
    where.medication = {
      OR: [
        { name: { contains: search } },
        { genericName: { contains: search } },
        { brand: { contains: search } },
      ],
    };
  }

  const [batches, total] = await Promise.all([
    db.inventoryBatch.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ expiryDate: 'asc' }, { medication: { name: 'asc' } }],
      include: {
        medication: {
          select: {
            id: true,
            name: true,
            genericName: true,
            brand: true,
            dosageForm: true,
            strength: true,
            category: true,
            requiresPrescription: true,
            controlledSubstance: true,
          },
        },
        supplier: { select: { id: true, name: true } },
        pharmacy: { select: { id: true, name: true } },
      },
    }),
    db.inventoryBatch.count({ where }),
  ]);

  // Add low stock alert flag
  const enrichedBatches = batches.map((batch) => ({
    ...batch,
    isLowStock: batch.quantity <= batch.minStockAlert,
    daysToExpiry: Math.ceil(
      (new Date(batch.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    ),
  }));

  return apiPaginated(enrichedBatches, page, limit, total);
}
