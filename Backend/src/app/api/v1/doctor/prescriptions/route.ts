// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - POST/GET /api/doctor/prescriptions - Prescriptions
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound, apiPaginated } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog, generateVerificationCode } from '@/lib/oasis-utils';

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUserFromHeader(request);

    if (!auth) {
      return apiUnauthorized();
    }

    // Only doctors can create prescriptions
    if (auth.user.role !== ROLES.DOCTOR && auth.user.role !== ROLES.SUPERADMIN) {
      return apiForbidden('Solo los doctores pueden crear recetas');
    }

    const body = await request.json();
    const { patientId, familyMemberId, diagnosis, notes, items, refillsRemaining, validUntil } = body;

    // Validate required fields
    if (!patientId) {
      return apiError('patientId es requerido', 422);
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return apiError('Se requiere al menos un medicamento', 422);
    }

    // Get the doctor record
    const doctor = await db.doctor.findFirst({
      where: { userId: auth.user.id },
    });

    if (!doctor) {
      return apiNotFound('Perfil de doctor no encontrado');
    }

    // Verify patient exists
    const patient = await db.patient.findUnique({ where: { id: patientId } });
    if (!patient) {
      return apiNotFound('Paciente no encontrado');
    }

    // Verify family member if provided
    if (familyMemberId) {
      const familyMember = await db.familyMember.findFirst({
        where: { id: familyMemberId, patientId },
      });
      if (!familyMember) {
        return apiNotFound('Miembro familiar no encontrado');
      }
    }

    // Validate all medications exist and check for controlled substances
    const medicationIds = items.map((item: { medicationId: string }) => item.medicationId);
    const medications = await db.medication.findMany({
      where: { id: { in: medicationIds } },
    });

    if (medications.length !== medicationIds.length) {
      const foundIds = medications.map((m) => m.id);
      const missing = medicationIds.filter((id: string) => !foundIds.includes(id));
      return apiError(`Medicamentos no encontrados: ${missing.join(', ')}`, 422);
    }

    // Check if any medication is a controlled substance
    const hasControlled = medications.some((m) => m.controlledSubstance);

    // Generate verification code (ensure uniqueness)
    let verificationCode = generateVerificationCode();
    let codeExists = await db.prescription.findUnique({ where: { verificationCode } });
    while (codeExists) {
      verificationCode = generateVerificationCode();
      codeExists = await db.prescription.findUnique({ where: { verificationCode } });
    }

    // Set validUntil: 30 days from now by default
    const prescriptionValidUntil = validUntil
      ? new Date(validUntil)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Create prescription with items in a transaction
    const prescription = await db.$transaction(async (tx) => {
      const newPrescription = await tx.prescription.create({
        data: {
          doctorId: doctor.id,
          patientId,
          familyMemberId: familyMemberId || null,
          diagnosis: diagnosis || null,
          notes: notes || null,
          isControlled: hasControlled,
          validUntil: prescriptionValidUntil,
          refillsRemaining: refillsRemaining ?? 0,
          verificationCode,
          status: 'active',
          items: {
            create: items.map((item: {
              medicationId: string;
              dosage: string;
              duration?: string;
              quantity: number;
              instructions?: string;
            }) => {
              const med = medications.find((m) => m.id === item.medicationId);
              return {
                medicationId: item.medicationId,
                dosage: item.dosage,
                duration: item.duration || null,
                quantity: item.quantity,
                instructions: item.instructions || null,
                isControlled: med?.controlledSubstance || false,
              };
            }),
          },
        },
        include: {
          items: {
            include: {
              medication: {
                select: {
                  id: true,
                  name: true,
                  genericName: true,
                  dosageForm: true,
                  strength: true,
                  controlledSubstance: true,
                },
              },
            },
          },
          patient: {
            include: {
              user: {
                select: { name: true, email: true },
              },
            },
          },
          doctor: {
            include: {
              user: {
                select: { name: true },
              },
            },
          },
        },
      });

      return newPrescription;
    });

    await createAuditLog({
      userId: auth.user.id,
      clinicId: doctor.clinicId,
      action: 'create',
      entity: 'Prescription',
      entityId: prescription.id,
      newValues: {
        patientId,
        diagnosis,
        isControlled: hasControlled,
        itemsCount: items.length,
        verificationCode,
      },
    });

    return apiSuccess(prescription, { status: 201 });
  } catch (error) {
    console.error('Error creating prescription:', error);
    return apiError('Error al crear receta', 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUserFromHeader(request);

    if (!auth) {
      return apiUnauthorized();
    }

    // Only doctors, clinic_admin, or superadmin can list doctor prescriptions
    if (
      auth.user.role !== ROLES.DOCTOR &&
      auth.user.role !== ROLES.CLINIC_ADMIN &&
      auth.user.role !== ROLES.SUPERADMIN &&
      auth.user.role !== ROLES.PATIENT
    ) {
      return apiForbidden('No tiene permisos para listar recetas');
    }

    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = {};

    // If doctor, only show their own prescriptions
    if (auth.user.role === ROLES.DOCTOR) {
      const doctor = await db.doctor.findFirst({
        where: { userId: auth.user.id },
      });
      if (doctor) {
        where.doctorId = doctor.id;
      }
    }

    // If patient, only show their own prescriptions
    if (auth.user.role === ROLES.PATIENT) {
      const patient = await db.patient.findFirst({
        where: { userId: auth.user.id },
      });
      if (patient) {
        where.patientId = patient.id;
      }
    }

    if (patientId && auth.user.role !== ROLES.PATIENT) {
      where.patientId = patientId;
    }

    if (status) {
      where.status = status;
    }

    const [prescriptions, total] = await Promise.all([
      db.prescription.findMany({
        where,
        include: {
          items: {
            include: {
              medication: {
                select: {
                  id: true,
                  name: true,
                  genericName: true,
                  dosageForm: true,
                  strength: true,
                },
              },
            },
          },
          patient: {
            include: {
              user: {
                select: { name: true, avatarUrl: true },
              },
            },
          },
          doctor: {
            include: {
              user: {
                select: { name: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.prescription.count({ where }),
    ]);

    return apiPaginated(prescriptions, page, limit, total);
  } catch (error) {
    console.error('Error listing prescriptions:', error);
    return apiError('Error al listar recetas', 500);
  }
}
