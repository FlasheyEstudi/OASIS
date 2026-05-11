// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - POST/GET /api/patient/family-members
// POST - Add family member (patient only)
// GET - List family members (patient only)
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUserFromHeader(request);
    if (!auth) return apiUnauthorized();

    const { user } = auth;

    // Only patients can add family members
    if (user.role !== ROLES.PATIENT && user.role !== ROLES.SUPERADMIN) {
      return apiForbidden('Solo los pacientes pueden agregar familiares');
    }

    // Find patient profile
    const patient = await db.patient.findUnique({
      where: { userId: user.id },
    });

    if (!patient) return apiError('Perfil de paciente no encontrado', 404);

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

    // Validate required fields
    if (!name || !relationship) {
      return apiError('Nombre y parentesco son requeridos', 422);
    }

    const familyMember = await db.familyMember.create({
      data: {
        patientId: patient.id,
        name,
        relationship,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender: gender || null,
        bloodType: bloodType || null,
        allergies: allergies ? (typeof allergies === 'string' ? allergies : JSON.stringify(allergies)) : null,
        chronicConditions: chronicConditions ? (typeof chronicConditions === 'string' ? chronicConditions : JSON.stringify(chronicConditions)) : null,
        insuranceProvider: insuranceProvider || null,
        insurancePolicyNumber: insurancePolicyNumber || null,
      },
    });

    // Audit log
    await createAuditLog({
      userId: user.id,
      action: 'create',
      entity: 'FamilyMember',
      entityId: familyMember.id,
      newValues: familyMember as unknown as Record<string, unknown>,
    });

    return apiSuccess(familyMember, { status: 201 });
  } catch (error) {
    console.error('Error adding family member:', error);
    return apiError('Error al agregar familiar', 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUserFromHeader(request);
    if (!auth) return apiUnauthorized();

    const { user } = auth;

    // Only patients (or superadmin) can list their family members
    if (user.role !== ROLES.PATIENT && user.role !== ROLES.SUPERADMIN) {
      return apiForbidden('Solo los pacientes pueden ver sus familiares');
    }

    const patient = await db.patient.findUnique({
      where: { userId: user.id },
    });

    if (!patient) return apiError('Perfil de paciente no encontrado', 404);

    const familyMembers = await db.familyMember.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: 'desc' },
    });

    return apiSuccess(familyMembers);
  } catch (error) {
    console.error('Error listing family members:', error);
    return apiError('Error al listar familiares', 500);
  }
}
