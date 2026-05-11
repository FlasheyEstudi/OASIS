// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Medication Detail API: Get & Update
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

// GET /api/pharmacy/medications/[id] - Get medication details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { id } = await params;

  const medication = await db.medication.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          inventoryBatches: { where: { isActive: true, quantity: { gt: 0 } } },
          prescriptionItems: true,
        },
      },
    },
  });

  if (!medication) return apiNotFound('Medicamento no encontrado');

  return apiSuccess(medication);
}

// PUT /api/pharmacy/medications/[id] - Update medication
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  if (auth.user.role !== ROLES.SUPERADMIN) {
    return apiForbidden('Solo el superadmin puede modificar medicamentos');
  }

  const { id } = await params;

  const existing = await db.medication.findUnique({ where: { id } });
  if (!existing) return apiNotFound('Medicamento no encontrado');

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
    isActive,
  } = body;

  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name;
  if (genericName !== undefined) updateData.genericName = genericName;
  if (brand !== undefined) updateData.brand = brand;
  if (description !== undefined) updateData.description = description;
  if (dosageForm !== undefined) updateData.dosageForm = dosageForm;
  if (strength !== undefined) updateData.strength = strength;
  if (manufacturer !== undefined) updateData.manufacturer = manufacturer;
  if (requiresPrescription !== undefined) updateData.requiresPrescription = requiresPrescription;
  if (controlledSubstance !== undefined) updateData.controlledSubstance = controlledSubstance;
  if (controlledLevel !== undefined) updateData.controlledLevel = controlledLevel;
  if (interactionGroups !== undefined) updateData.interactionGroups = JSON.stringify(interactionGroups);
  if (sideEffects !== undefined) updateData.sideEffects = JSON.stringify(sideEffects);
  if (contraindications !== undefined) updateData.contraindications = JSON.stringify(contraindications);
  if (category !== undefined) updateData.category = category;
  if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
  if (isActive !== undefined) updateData.isActive = isActive;

  const medication = await db.medication.update({
    where: { id },
    data: updateData,
  });

  await createAuditLog({
    userId: auth.user.id,
    action: 'update',
    entity: 'Medication',
    entityId: id,
    oldValues: existing,
    newValues: medication,
  });

  return apiSuccess(medication);
}
