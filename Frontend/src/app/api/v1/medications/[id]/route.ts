// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Medication Detail API Routes
// GET /api/medications/[id] - Get medication details (public)
// PUT /api/medications/[id] - Update medication (superadmin)
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

// GET /api/medications/[id] - Get medication details (PUBLIC)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const medication = await db.medication.findUnique({
    where: { id },
  });

  if (!medication || !medication.isActive) return apiNotFound('Medicamento no encontrado');

  return apiSuccess(medication);
}

// PUT /api/medications/[id] - Update medication (superadmin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();
  if (auth.user.role !== ROLES.SUPERADMIN) return apiForbidden('Solo superadmin puede actualizar medicamentos');

  const { id } = await params;

  const medication = await db.medication.findUnique({ where: { id } });
  if (!medication) return apiNotFound('Medicamento no encontrado');

  const body = await request.json();
  const {
    name, genericName, brand, description, dosageForm, strength,
    manufacturer, requiresPrescription, controlledSubstance, controlledLevel,
    interactionGroups, sideEffects, contraindications, category, imageUrl,
    isActive,
  } = body;

  const oldValues = {
    name: medication.name,
    genericName: medication.genericName,
    brand: medication.brand,
    requiresPrescription: medication.requiresPrescription,
    category: medication.category,
    isActive: medication.isActive,
  };

  const updated = await db.medication.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(genericName !== undefined && { genericName }),
      ...(brand !== undefined && { brand }),
      ...(description !== undefined && { description }),
      ...(dosageForm !== undefined && { dosageForm }),
      ...(strength !== undefined && { strength }),
      ...(manufacturer !== undefined && { manufacturer }),
      ...(requiresPrescription !== undefined && { requiresPrescription }),
      ...(controlledSubstance !== undefined && { controlledSubstance }),
      ...(controlledLevel !== undefined && { controlledLevel }),
      ...(interactionGroups !== undefined && { interactionGroups: typeof interactionGroups === 'object' ? JSON.stringify(interactionGroups) : interactionGroups }),
      ...(sideEffects !== undefined && { sideEffects: typeof sideEffects === 'object' ? JSON.stringify(sideEffects) : sideEffects }),
      ...(contraindications !== undefined && { contraindications: typeof contraindications === 'object' ? JSON.stringify(contraindications) : contraindications }),
      ...(category !== undefined && { category }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  await createAuditLog({
    userId: auth.user.id,
    action: 'update',
    entity: 'Medication',
    entityId: id,
    oldValues,
    newValues: { name, genericName, brand, requiresPrescription, category, isActive },
  });

  return apiSuccess(updated);
}
