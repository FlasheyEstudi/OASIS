// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - PUT/DELETE /api/patient/family-members/[memberId]
// PUT - Update family member
// DELETE - Remove family member
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

type RouteParams = { params: Promise<{ memberId: string }> };

// PUT /api/patient/family-members/[memberId] - Update family member
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await getAuthUserFromHeader(request);
    if (!auth) return apiUnauthorized();

    const { user } = auth;

    // Only patients can update their family members
    if (user.role !== ROLES.PATIENT && user.role !== ROLES.SUPERADMIN) {
      return apiForbidden('Solo los pacientes pueden actualizar familiares');
    }

    const { memberId } = await params;

    // Find patient profile
    const patient = await db.patient.findUnique({
      where: { userId: user.id },
    });

    if (!patient) return apiError('Perfil de paciente no encontrado', 404);

    // Find family member and verify ownership
    const familyMember = await db.familyMember.findUnique({
      where: { id: memberId },
    });

    if (!familyMember) return apiNotFound('Familiar no encontrado');

    if (familyMember.patientId !== patient.id && user.role !== ROLES.SUPERADMIN) {
      return apiForbidden('Este familiar no pertenece a tu perfil');
    }

    const body = await request.json();
    const {
      name,
      relationship,
      dateOfBirth,
      gender,
      bloodType,
      allergies,
      chronicConditions,
      insuranceProvider,
      insurancePolicyNumber,
    } = body;

    const oldValues = { ...familyMember };

    const updated = await db.familyMember.update({
      where: { id: memberId },
      data: {
        ...(name !== undefined && { name }),
        ...(relationship !== undefined && { relationship }),
        ...(dateOfBirth !== undefined && { dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null }),
        ...(gender !== undefined && { gender }),
        ...(bloodType !== undefined && { bloodType }),
        ...(allergies !== undefined && {
          allergies: allergies ? (typeof allergies === 'string' ? allergies : JSON.stringify(allergies)) : null,
        }),
        ...(chronicConditions !== undefined && {
          chronicConditions: chronicConditions
            ? (typeof chronicConditions === 'string' ? chronicConditions : JSON.stringify(chronicConditions))
            : null,
        }),
        ...(insuranceProvider !== undefined && { insuranceProvider }),
        ...(insurancePolicyNumber !== undefined && { insurancePolicyNumber }),
      },
    });

    // Audit log
    await createAuditLog({
      userId: user.id,
      action: 'update',
      entity: 'FamilyMember',
      entityId: memberId,
      oldValues: oldValues as unknown as Record<string, unknown>,
      newValues: updated as unknown as Record<string, unknown>,
    });

    return apiSuccess(updated);
  } catch (error) {
    console.error('Error updating family member:', error);
    return apiError('Error al actualizar familiar', 500);
  }
}

// DELETE /api/patient/family-members/[memberId] - Remove family member
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await getAuthUserFromHeader(request);
    if (!auth) return apiUnauthorized();

    const { user } = auth;

    // Only patients can delete their family members
    if (user.role !== ROLES.PATIENT && user.role !== ROLES.SUPERADMIN) {
      return apiForbidden('Solo los pacientes pueden eliminar familiares');
    }

    const { memberId } = await params;

    // Find patient profile
    const patient = await db.patient.findUnique({
      where: { userId: user.id },
    });

    if (!patient) return apiError('Perfil de paciente no encontrado', 404);

    // Find family member and verify ownership
    const familyMember = await db.familyMember.findUnique({
      where: { id: memberId },
    });

    if (!familyMember) return apiNotFound('Familiar no encontrado');

    if (familyMember.patientId !== patient.id && user.role !== ROLES.SUPERADMIN) {
      return apiForbidden('Este familiar no pertenece a tu perfil');
    }

    await db.familyMember.delete({
      where: { id: memberId },
    });

    // Audit log
    await createAuditLog({
      userId: user.id,
      action: 'delete',
      entity: 'FamilyMember',
      entityId: memberId,
      oldValues: familyMember as unknown as Record<string, unknown>,
    });

    return apiSuccess({ message: 'Familiar eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting family member:', error);
    return apiError('Error al eliminar familiar', 500);
  }
}
