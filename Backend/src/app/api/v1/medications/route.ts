// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Medications API Route (PUBLIC)
// GET /api/medications - List/search medications (public)
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiPaginated } from '@/lib/api-response';

// GET /api/medications - List/search medications (PUBLIC - no auth required)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || undefined;
  const category = searchParams.get('category') || undefined;
  const requiresPrescription = searchParams.get('requiresPrescription');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const skip = (page - 1) * limit;

  let where: Record<string, unknown> = { isActive: true };

  // Text search on name, genericName, brand
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { genericName: { contains: search } },
      { brand: { contains: search } },
    ];
  }

  if (category) where.category = category;
  if (requiresPrescription !== null && requiresPrescription !== undefined && requiresPrescription !== '') {
    where.requiresPrescription = requiresPrescription === 'true';
  }

  const [medications, total] = await Promise.all([
    db.medication.findMany({
      where,
      select: {
        id: true,
        name: true,
        genericName: true,
        brand: true,
        description: true,
        dosageForm: true,
        strength: true,
        manufacturer: true,
        requiresPrescription: true,
        controlledSubstance: true,
        category: true,
        imageUrl: true,
        sideEffects: true,
        contraindications: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
      skip,
      take: limit,
    }),
    db.medication.count({ where }),
  ]);

  return apiPaginated(medications, page, limit, total);
}
