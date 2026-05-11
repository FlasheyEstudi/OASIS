// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - GET /api/prescriptions/[id]/verify - Verify prescription
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiNotFound } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const code = searchParams.get('code');

    if (!code) {
      return apiError('Código de verificación es requerido', 422);
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
                brand: true,
                dosageForm: true,
                strength: true,
                controlledSubstance: true,
                controlledLevel: true,
              },
            },
          },
        },
        patient: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        doctor: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
            clinic: {
              select: {
                id: true,
                name: true,
                address: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!prescription) {
      return apiNotFound('Receta no encontrada');
    }

    // Check verification code matches
    if (prescription.verificationCode !== code) {
      return apiError('Código de verificación no coincide', 400, {
        valid: false,
        reason: 'invalid_code',
      });
    }

    // Check patientId matches if provided
    if (patientId && prescription.patientId !== patientId) {
      return apiError('La receta no pertenece al paciente indicado', 400, {
        valid: false,
        reason: 'patient_mismatch',
      });
    }

    // Check prescription status
    if (prescription.status === 'cancelled') {
      return apiError('La receta ha sido cancelada', 400, {
        valid: false,
        reason: 'cancelled',
      });
    }

    if (prescription.status === 'expired') {
      return apiError('La receta ha expirado', 400, {
        valid: false,
        reason: 'expired',
      });
    }

    // Check if prescription has expired based on validUntil
    if (prescription.validUntil && new Date(prescription.validUntil) < new Date()) {
      // Auto-update status to expired
      await db.prescription.update({
        where: { id },
        data: { status: 'expired' },
      });

      return apiError('La receta ha expirado', 400, {
        valid: false,
        reason: 'expired_by_date',
        expiredAt: prescription.validUntil,
      });
    }

    // Check if prescription is active
    if (prescription.status !== 'active' && prescription.status !== 'dispensed') {
      return apiError('La receta no está activa', 400, {
        valid: false,
        reason: 'not_active',
        currentStatus: prescription.status,
      });
    }

    // Check if prescription has been digitally signed
    const isSigned = !!prescription.digitalSignature;

    // Check refills
    const hasRefills = prescription.refillsRemaining > 0;

    // Prescription is valid
    return apiSuccess({
      valid: true,
      prescription: {
        id: prescription.id,
        date: prescription.date,
        diagnosis: prescription.diagnosis,
        isControlled: prescription.isControlled,
        status: prescription.status,
        validUntil: prescription.validUntil,
        refillsRemaining: prescription.refillsRemaining,
        isSigned,
        hasRefills,
        patient: {
          id: prescription.patient.id,
          name: prescription.patient.user.name,
        },
        doctor: {
          id: prescription.doctor.id,
          name: prescription.doctor.user.name,
          licenseNumber: prescription.doctor.licenseNumber,
          clinic: prescription.doctor.clinic,
        },
        items: prescription.items.map((item) => ({
          id: item.id,
          medication: item.medication,
          dosage: item.dosage,
          duration: item.duration,
          quantity: item.quantity,
          instructions: item.instructions,
          isControlled: item.isControlled,
        })),
        digitalSignature: prescription.digitalSignature,
        verificationCode: prescription.verificationCode,
      },
    });
  } catch (error) {
    console.error('Error verifying prescription:', error);
    return apiError('Error al verificar receta', 500);
  }
}
