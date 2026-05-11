// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Medications API: List & Create
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiPaginated } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

// GET /api/pharmacy/medications - List all medications
export async function GET(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const requiresPrescription = searchParams.get('requiresPrescription');
  const controlledSubstance = searchParams.get('controlledSubstance');
  const dosageForm = searchParams.get('dosageForm') || '';
  const isActive = searchParams.get('isActive');

  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { genericName: { contains: search } },
      { brand: { contains: search } },
      { manufacturer: { contains: search } },
    ];
  }
  if (category) where.category = { contains: category };
  if (dosageForm) where.dosageForm = { contains: dosageForm };
  if (requiresPrescription !== null && requiresPrescription !== undefined && requiresPrescription !== '') {
    where.requiresPrescription = requiresPrescription === 'true';
  }
  if (controlledSubstance !== null && controlledSubstance !== undefined && controlledSubstance !== '') {
    where.controlledSubstance = controlledSubstance === 'true';
  }
  if (isActive !== null && isActive !== undefined && isActive !== '') {
    where.isActive = isActive === 'true';
  } else {
    where.isActive = true;
  }

  const [medications, total] = await Promise.all([
    db.medication.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
    }),
    db.medication.count({ where }),
  ]);

  return apiPaginated(medications, page, limit, total);
}

// POST /api/pharmacy/medications - Create medication (superadmin)
export async function POST(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  if (auth.user.role !== ROLES.SUPERADMIN) {
    return apiForbidden('Solo el superadmin puede crear medicamentos');
  }

  const body = await request.json();
  const {
    name,
    genericName,
    brand,
    description,
    dosageForm,
    strength,
    manufacturer,
    requiresPrescription,
    controlledSubstance,
    controlledLevel,
    interactionGroups,
    sideEffects,
    contraindications,
    category,
    imageUrl,
  } = body;

  if (!name) {
    return apiError('El nombre del medicamento es requerido', 400);
  }

  const medication = await db.medication.create({
    data: {
      name,
      genericName,
      brand,
      description,
      dosageForm,
      strength,
      manufacturer,
      requiresPrescription: requiresPrescription ?? false,
      controlledSubstance: controlledSubstance ?? false,
      controlledLevel,
      interactionGroups: interactionGroups ? JSON.stringify(interactionGroups) : null,
      sideEffects: sideEffects ? JSON.stringify(sideEffects) : null,
      contraindications: contraindications ? JSON.stringify(contraindications) : null,
      category,
      imageUrl,
    },
  });

  await createAuditLog({
    userId: auth.user.id,
    action: 'create',
    entity: 'Medication',
    entityId: medication.id,
    newValues: medication,
  });

  return apiSuccess(medication, { status: 201 });
}
