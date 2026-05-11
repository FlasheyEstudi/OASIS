// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - GET /api/insurance/estimate
// Estimate copay based on insurance
// Params: service_type, clinic_id, medication_ids
// Returns: { estimatedCopay, coveragePercentage, estimatedTotal }
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUserFromHeader(request);
    if (!auth) return apiUnauthorized();

    const { user } = auth;

    if (user.role !== ROLES.PATIENT && user.role !== ROLES.SUPERADMIN) {
      return apiError('No autorizado', 403);
    }

    const { searchParams } = new URL(request.url);
    const serviceType = searchParams.get('service_type') || undefined;
    const clinicId = searchParams.get('clinic_id') || undefined;
    const medicationIdsParam = searchParams.get('medication_ids') || '';

    const patient = await db.patient.findUnique({
      where: { userId: user.id },
      include: {
        insurances: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!patient) return apiError('Perfil de paciente no encontrado', 404);

    // If no insurance, return full price
    if (patient.insurances.length === 0) {
      const estimatedTotal = await calculateEstimatedTotal(serviceType, clinicId, medicationIdsParam);
      return apiSuccess({
        hasInsurance: false,
        estimatedTotal,
        estimatedCopay: estimatedTotal,
        coveragePercentage: 0,
        insuranceProvider: null,
        policyNumber: null,
        breakdown: {
          consultationFee: 0,
          medicationsCost: 0,
          serviceCost: 0,
        },
      });
    }

    const insurance = patient.insurances[0];

    // Check if insurance is still valid
    if (insurance.validUntil && new Date() > insurance.validUntil) {
      const estimatedTotal = await calculateEstimatedTotal(serviceType, clinicId, medicationIdsParam);
      return apiSuccess({
        hasInsurance: true,
        insuranceExpired: true,
        estimatedTotal,
        estimatedCopay: estimatedTotal,
        coveragePercentage: 0,
        insuranceProvider: insurance.provider,
        policyNumber: insurance.policyNumber,
        breakdown: {
          consultationFee: 0,
          medicationsCost: 0,
          serviceCost: 0,
        },
      });
    }

    // Parse coverage details
    let coverageDetails: Record<string, unknown> = {};
    if (insurance.coverageDetails) {
      try {
        coverageDetails = JSON.parse(insurance.coverageDetails);
      } catch {
        coverageDetails = {};
      }
    }

    const estimatedTotal = await calculateEstimatedTotal(serviceType, clinicId, medicationIdsParam);

    // Calculate coverage
    const copayPercentage = insurance.copayPercentage || 0;
    const coveragePercentage = 100 - copayPercentage;
    const estimatedCopay = estimatedTotal * (copayPercentage / 100);

    // Build breakdown
    let consultationFee = 0;
    let medicationsCost = 0;
    let serviceCost = 0;

    if (serviceType && clinicId) {
      const services = await db.service.findMany({
        where: { clinicId, isActive: true },
      });
      const matchingService = services.find((s) =>
        s.name.toLowerCase().includes(serviceType.toLowerCase())
      );
      if (matchingService) {
        serviceCost = matchingService.price;
      }

      // Get doctor consultation fee
      const doctors = await db.doctor.findMany({
        where: { clinicId, isActive: true },
        take: 1,
      });
      if (doctors.length > 0) {
        consultationFee = doctors[0].consultationFee;
      }
    }

    if (medicationIdsParam) {
      const medIds = medicationIdsParam.split(',').filter(Boolean);
      const batches = await db.inventoryBatch.findMany({
        where: {
          medicationId: { in: medIds },
          isActive: true,
          quantity: { gt: 0 },
        },
        orderBy: { sellingPrice: 'asc' },
        distinct: ['medicationId'],
      });
      medicationsCost = batches.reduce((sum, b) => sum + b.sellingPrice, 0);
    }

    return apiSuccess({
      hasInsurance: true,
      insuranceExpired: false,
      estimatedTotal,
      estimatedCopay: Math.round(estimatedCopay * 100) / 100,
      coveragePercentage,
      copayPercentage,
      insuranceProvider: insurance.provider,
      policyNumber: insurance.policyNumber,
      coverageDetails,
      breakdown: {
        consultationFee,
        medicationsCost,
        serviceCost,
      },
    });
  } catch (error) {
    console.error('Error estimating insurance copay:', error);
    return apiError('Error al estimar copago del seguro', 500);
  }
}

async function calculateEstimatedTotal(
  serviceType?: string,
  clinicId?: string,
  medicationIdsParam?: string
): Promise<number> {
  let total = 0;

  if (serviceType && clinicId) {
    const services = await db.service.findMany({
      where: { clinicId, isActive: true },
    });
    const matchingService = services.find((s) =>
      s.name.toLowerCase().includes(serviceType.toLowerCase())
    );
    if (matchingService) {
      total += matchingService.price;
    }

    const doctors = await db.doctor.findMany({
      where: { clinicId, isActive: true },
      take: 1,
    });
    if (doctors.length > 0) {
      total += doctors[0].consultationFee;
    }
  }

  if (medicationIdsParam) {
    const medIds = medicationIdsParam.split(',').filter(Boolean);
    const batches = await db.inventoryBatch.findMany({
      where: {
        medicationId: { in: medIds },
        isActive: true,
        quantity: { gt: 0 },
      },
      orderBy: { sellingPrice: 'asc' },
      distinct: ['medicationId'],
    });
    total += batches.reduce((sum, b) => sum + b.sellingPrice, 0);
  }

  return Math.round(total * 100) / 100;
}
