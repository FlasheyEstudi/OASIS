// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - POST /api/doctor/prescriptions/[id]/sign - Sign prescription
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog, generateSignatureHash } from '@/lib/oasis-utils';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await getAuthUserFromHeader(request);

    if (!auth) {
      return apiUnauthorized();
    }

    // Only doctors can sign prescriptions
    if (auth.user.role !== ROLES.DOCTOR && auth.user.role !== ROLES.SUPERADMIN) {
      return apiForbidden('Solo los doctores pueden firmar recetas');
    }

    const prescription = await db.prescription.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            medication: {
              select: {
                id: true,
                name: true,
                genericName: true,
                strength: true,
              },
            },
          },
        },
        doctor: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });

    if (!prescription) {
      return apiNotFound('Receta no encontrada');
    }

    // Only the prescribing doctor can sign
    const isPrescribingDoctor = prescription.doctor.userId === auth.user.id;
    const isSuperadmin = auth.user.role === ROLES.SUPERADMIN;

    if (!isPrescribingDoctor && !isSuperadmin) {
      return apiForbidden('Solo el doctor que emitió la receta puede firmarla');
    }

    // Can only sign active prescriptions
    if (prescription.status !== 'active') {
      return apiError('Solo se pueden firmar recetas activas', 400);
    }

    // Check if already signed
    if (prescription.digitalSignature) {
      return apiError('La receta ya está firmada digitalmente', 400);
    }

    // Get the doctor's digital signature certificate
    const doctor = await db.doctor.findFirst({
      where: { userId: auth.user.id },
    });

    if (!doctor) {
      return apiNotFound('Perfil de doctor no encontrado');
    }

    // Build signature data from prescription content
    const prescriptionData = JSON.stringify({
      id: prescription.id,
      doctorId: prescription.doctorId,
      patientId: prescription.patientId,
      diagnosis: prescription.diagnosis,
      date: prescription.date,
      items: prescription.items.map((item) => ({
        medicationId: item.medicationId,
        medicationName: item.medication.name,
        dosage: item.dosage,
        quantity: item.quantity,
        duration: item.duration,
      })),
      isControlled: prescription.isControlled,
      verificationCode: prescription.verificationCode,
    });

    // Generate signature hash using doctor's certificate
    const certData = doctor.digitalSignatureCert || doctor.licenseNumber;
    const signatureData = `${prescriptionData}:${certData}`;
    const digitalSignature = generateSignatureHash(signatureData);

    // Update prescription with digital signature
    const updatedPrescription = await db.prescription.update({
      where: { id },
      data: { digitalSignature },
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
            user: { select: { name: true } },
          },
        },
        doctor: {
          include: {
            user: { select: { name: true } },
            clinic: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    await createAuditLog({
      userId: auth.user.id,
      clinicId: doctor.clinicId,
      action: 'sign',
      entity: 'Prescription',
      entityId: id,
      newValues: {
        digitalSignature,
        signedAt: new Date().toISOString(),
      },
    });

    return apiSuccess({
      ...updatedPrescription,
      signatureInfo: {
        signedBy: doctor.user.name,
        signedAt: new Date().toISOString(),
        signatureHash: digitalSignature,
      },
    });
  } catch (error) {
    console.error('Error signing prescription:', error);
    return apiError('Error al firmar receta', 500);
  }
}
