// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Pharmacy Promotions API
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound, apiPaginated } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

// Helper: check if user can manage promotions
async function canManagePromotions(userId: string, role: string, pharmacyId: string): Promise<boolean> {
  if (role === ROLES.SUPERADMIN) return true;
  if (role === ROLES.PHARMACY_ADMIN) {
    const admin = await db.pharmacyAdmin.findFirst({ where: { userId, pharmacyId } });
    return !!admin;
  }
  return false;
}

async function canReadPromotions(userId: string, role: string, pharmacyId: string): Promise<boolean> {
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

// GET /api/pharmacies/[id]/promotions - List promotions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { id } = await params;

  const authorized = await canReadPromotions(auth.user.id, auth.user.role, id);
  if (!authorized) return apiForbidden('No autorizado para ver promociones');

  const pharmacy = await db.pharmacy.findUnique({ where: { id } });
  if (!pharmacy) return apiNotFound('Farmacia no encontrada');

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const isActive = searchParams.get('isActive');
  const type = searchParams.get('type') || '';
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { pharmacyId: id };
  if (isActive !== null && isActive !== undefined && isActive !== '') {
    where.isActive = isActive === 'true';
  }
  if (type) where.type = type;

  const [promotions, total] = await Promise.all([
    db.promotion.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            medication: { select: { id: true, name: true, genericName: true } },
          },
        },
      },
    }),
    db.promotion.count({ where }),
  ]);

  // Add computed fields
  const now = new Date();
  const enriched = promotions.map((p) => ({
    ...p,
    isActive: p.isActive && new Date(p.startDate) <= now && new Date(p.endDate) >= now,
    daysRemaining: Math.ceil(
      (new Date(p.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    ),
  }));

  return apiPaginated(enriched, page, limit, total);
}

// POST /api/pharmacies/[id]/promotions - Create promotion
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { id } = await params;

  const authorized = await canManagePromotions(auth.user.id, auth.user.role, id);
  if (!authorized) return apiForbidden('No autorizado para crear promociones');

  const pharmacy = await db.pharmacy.findUnique({ where: { id } });
  if (!pharmacy) return apiNotFound('Farmacia no encontrada');

  const body = await request.json();
  const {
    name,
    description,
    type,
    value,
    code,
    minPurchase,
    maxDiscount,
    startDate,
    endDate,
    usageLimit,
    items,
  } = body;

  if (!name || !type || value === undefined || !startDate || !endDate) {
    return apiError('Campos requeridos: name, type, value, startDate, endDate', 400);
  }

  // Validate type
  const validTypes = ['percentage', 'fixed', 'bogo', 'loyalty_discount'];
  if (!validTypes.includes(type)) {
    return apiError(`Tipo inválido. Válidos: ${validTypes.join(', ')}`, 400);
  }

  // Validate code uniqueness if provided
  if (code) {
    const existingCode = await db.promotion.findUnique({ where: { code } });
    if (existingCode) {
      return apiError('El código de promoción ya existe', 409);
    }
  }

  // Create promotion with optional items
  const promotion = await db.$transaction(async (tx) => {
    const promo = await tx.promotion.create({
      data: {
        pharmacyId: id,
        name,
        description,
        type,
        value,
        code,
        minPurchase: minPurchase ?? 0,
        maxDiscount,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        usageLimit,
      },
    });

    // Create promotion items if provided
    if (items && items.length > 0) {
      for (const item of items) {
        if (item.medicationId) {
          // Validate medication exists
          const med = await tx.medication.findUnique({ where: { id: item.medicationId } });
          if (!med) throw new Error(`Medicamento ${item.medicationId} no encontrado`);
        }

        await tx.promotionItem.create({
          data: {
            promotionId: promo.id,
            medicationId: item.medicationId || null,
            category: item.category || null,
          },
        });
      }
    }

    return promo;
  });

  // Fetch complete promotion
  const completePromotion = await db.promotion.findUnique({
    where: { id: promotion.id },
    include: {
      items: {
        include: {
          medication: { select: { id: true, name: true, genericName: true } },
        },
      },
    },
  });

  await createAuditLog({
    userId: auth.user.id,
    action: 'create',
    entity: 'Promotion',
    entityId: promotion.id,
    newValues: { name, type, value, pharmacyId: id },
  });

  return apiSuccess(completePromotion, { status: 201 });
}
