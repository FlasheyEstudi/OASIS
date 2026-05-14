// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - PUT/DELETE /api/patient/family-members/[memberId]
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const auth = await getAuthUserFromHeader(request);
    if (!auth) return apiUnauthorized();

    const { memberId } = await params;
    const body = await request.json();

    // 1. Verificar existencia del familiar
    const familyMember = await db.familyMember.findUnique({
      where: { id: memberId },
      include: { patient: true }
    });

    if (!familyMember) return apiNotFound('Familiar no encontrado');

    // 2. Verificar propiedad (Solo el paciente dueño o superadmin)
    const isOwner = familyMember.patient.userId === auth.user.id;
    if (!isOwner && auth.user.role !== ROLES.SUPERADMIN) {
      return apiForbidden('No tiene permiso para editar este familiar');
    }

    // 3. Actualizar
    const updated = await db.familyMember.update({
      where: { id: memberId },
      data: {
        name: body.name,
        relationship: body.relationship,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
        gender: body.gender,
        bloodType: body.bloodType,
        allergies: body.allergies,
        chronicConditions: body.chronicConditions,
        insuranceProvider: body.insuranceProvider,
        insurancePolicyNumber: body.insurancePolicyNumber,
      }
    });

    await createAuditLog({
      userId: auth.user.id,
      action: 'update',
      entity: 'FamilyMember',
      entityId: memberId,
      oldValues: familyMember as any,
      newValues: updated as any,
    });

    return apiSuccess(updated);
  } catch (error) {
    console.error('Error updating family member:', error);
    return apiError('Error al actualizar familiar');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const auth = await getAuthUserFromHeader(request);
    if (!auth) return apiUnauthorized();

    const { memberId } = await params;

    // 1. Verificar existencia
    const familyMember = await db.familyMember.findUnique({
      where: { id: memberId },
      include: { patient: true }
    });

    if (!familyMember) return apiNotFound('Familiar no encontrado');

    // 2. Verificar propiedad
    const isOwner = familyMember.patient.userId === auth.user.id;
    if (!isOwner && auth.user.role !== ROLES.SUPERADMIN) {
      return apiForbidden('No tiene permiso para eliminar este familiar');
    }

    // 3. Verificar que no tenga citas activas
    const activeAppointments = await db.appointment.count({
      where: { 
        familyMemberId: memberId,
        status: { in: ['scheduled', 'confirmed', 'in_progress'] }
      }
    });

    if (activeAppointments > 0) {
      return apiError('No se puede eliminar un familiar con citas activas', 400);
    }

    // 4. Eliminar
    await db.familyMember.delete({ where: { id: memberId } });

    await createAuditLog({
      userId: auth.user.id,
      action: 'delete',
      entity: 'FamilyMember',
      entityId: memberId,
      oldValues: familyMember as any,
    });

    return apiSuccess({ message: 'Familiar eliminado correctamente' });
  } catch (error) {
    console.error('Error deleting family member:', error);
    return apiError('Error al eliminar familiar');
  }
}
