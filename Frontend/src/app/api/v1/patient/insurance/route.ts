// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - POST/GET /api/patient/insurance
// POST - Add insurance policy
// Body: { provider, policyNumber, coverageDetails?, copayPercentage?, validUntil? }
// GET - List insurance policies
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUserFromHeader(request);
    if (!auth) return apiUnauthorized();

    const { user } = auth;

    if (user.role !== ROLES.PATIENT && user.role !== ROLES.SUPERADMIN) {
      return apiError('Solo los pacientes pueden agregar seguros', 403);
    }

    const patient = await db.patient.findUnique({
      where: { userId: user.id },
    });

    if (!patient) return apiError('Perfil de paciente no encontrado', 404);

    const body = await request.json();
    const { provider, policyNumber, coverageDetails, copayPercentage, validUntil } = body;

    // Validate required fields
    if (!provider || !policyNumber) {
      return apiError('Proveedor y número de póliza son requeridos', 422);
    }

    // Check for duplicate policy number
    const existingPolicy = await db.insurance.findUnique({
      where: { policyNumber },
    });

    if (existingPolicy) {
      return apiError('Número de póliza ya registrado', 409);
    }

    const insurance = await db.insurance.create({
      data: {
        patientId: patient.id,
        provider,
        policyNumber,
        coverageDetails: coverageDetails
          ? (typeof coverageDetails === 'string' ? coverageDetails : JSON.stringify(coverageDetails))
          : null,
        copayPercentage: copayPercentage ? parseFloat(copayPercentage) : 0,
        isActive: true,
        validUntil: validUntil ? new Date(validUntil) : null,
      },
    });

    // Also update patient's main insurance fields
    await db.patient.update({
      where: { id: patient.id },
      data: {
        insuranceProvider: provider,
        insurancePolicyNumber: policyNumber,
      },
    });

    // Audit log
    await createAuditLog({
      userId: user.id,
      action: 'create',
      entity: 'Insurance',
      entityId: insurance.id,
      newValues: insurance as unknown as Record<string, unknown>,
    });

    return apiSuccess(insurance, { status: 201 });
  } catch (error) {
    console.error('Error adding insurance:', error);
    return apiError('Error al agregar seguro', 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUserFromHeader(request);
    if (!auth) return apiUnauthorized();

    const { user } = auth;

    if (user.role !== ROLES.PATIENT && user.role !== ROLES.SUPERADMIN) {
      return apiError('No autorizado', 403);
    }

    const patient = await db.patient.findUnique({
      where: { userId: user.id },
    });

    if (!patient) return apiError('Perfil de paciente no encontrado', 404);

    const insurances = await db.insurance.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: 'desc' },
    });

    // Parse coverageDetails JSON
    const parsedInsurances = insurances.map((ins) => ({
      ...ins,
      coverageDetails: ins.coverageDetails
        ? (() => {
            try { return JSON.parse(ins.coverageDetails!); }
            catch { return ins.coverageDetails; }
          })()
        : null,
    }));

    return apiSuccess(parsedInsurances);
  } catch (error) {
    console.error('Error listing insurance policies:', error);
    return apiError('Error al listar pólizas de seguro', 500);
  }
}
