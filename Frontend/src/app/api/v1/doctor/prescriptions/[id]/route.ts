// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - GET/PUT /api/doctor/prescriptions/[id] - Prescription detail
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await getAuthUserFromHeader(request);

    if (!auth) {
      return apiUnauthorized();
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
                id: true,
                name: true,
                email: true,
                phone: true,
                avatarUrl: true,
              },
            },
          },
        },
        doctor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
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

    // Access control: doctor who wrote it, patient it's for, clinic_admin, or superadmin
    const isPrescribingDoctor = prescription.doctor.userId === auth.user.id;
    const isSuperadmin = auth.user.role === ROLES.SUPERADMIN;
    const isPatient = prescription.patient.userId === auth.user.id;

    let isClinicAdmin = false;
    if (auth.user.role === ROLES.CLINIC_ADMIN) {
      const clinicAdmin = await db.clinicAdmin.findFirst({
        where: { userId: auth.user.id, clinicId: prescription.doctor.clinicId },
      });
      isClinicAdmin = !!clinicAdmin;
    }

    if (!isPrescribingDoctor && !isSuperadmin && !isPatient && !isClinicAdmin) {
      return apiForbidden('No tiene permisos para ver esta receta');
    }

    return apiSuccess(prescription);
  } catch (error) {
    console.error('Error getting prescription:', error);
    return apiError('Error al obtener receta', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await getAuthUserFromHeader(request);

    if (!auth) {
      return apiUnauthorized();
    }

    const prescription = await db.prescription.findUnique({
      where: { id },
      include: { items: true, doctor: true },
    });

    if (!prescription) {
      return apiNotFound('Receta no encontrada');
    }

    // Only the prescribing doctor or superadmin can update
    const isPrescribingDoctor = prescription.doctor.userId === auth.user.id;
    const isSuperadmin = auth.user.role === ROLES.SUPERADMIN;

    if (!isPrescribingDoctor && !isSuperadmin) {
      return apiForbidden('Solo el doctor que emitió la receta puede actualizarla');
    }

    // Can only update active prescriptions
    if (prescription.status !== 'active') {
      return apiError('Solo se pueden actualizar recetas activas', 400);
    }

    const body = await request.json();
    const { diagnosis, notes, status, refillsRemaining, validUntil, items } = body;

    const oldPrescription = { ...prescription };

    // Update prescription in a transaction
    const updatedPrescription = await db.$transaction(async (tx) => {
      const updateData: Record<string, unknown> = {};
      if (diagnosis !== undefined) updateData.diagnosis = diagnosis;
      if (notes !== undefined) updateData.notes = notes;
      if (status !== undefined) updateData.status = status;
      if (refillsRemaining !== undefined) updateData.refillsRemaining = refillsRemaining;
      if (validUntil !== undefined) updateData.validUntil = new Date(validUntil);

      const updated = await tx.prescription.update({
        where: { id },
        data: updateData,
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
            },
          },
        },
      });

      // If items are provided, replace all items
      if (items && Array.isArray(items) && items.length > 0) {
        // Delete existing items
        await tx.prescriptionItem.deleteMany({
          where: { prescriptionId: id },
        });

        // Get medications for the new items
        const medicationIds = items.map((item: { medicationId: string }) => item.medicationId);
        const medications = await tx.medication.findMany({
          where: { id: { in: medicationIds } },
        });

        // Check for controlled substances
        const hasControlled = medications.some((m) => m.controlledSubstance);

        // Create new items
        await tx.prescriptionItem.createMany({
          data: items.map((item: {
            medicationId: string;
            dosage: string;
            duration?: string;
            quantity: number;
            instructions?: string;
          }) => {
            const med = medications.find((m) => m.id === item.medicationId);
            return {
              prescriptionId: id,
              medicationId: item.medicationId,
              dosage: item.dosage,
              duration: item.duration || null,
              quantity: item.quantity,
              instructions: item.instructions || null,
              isControlled: med?.controlledSubstance || false,
            };
          }),
        });

        // Update isControlled flag
        await tx.prescription.update({
          where: { id },
          data: { isControlled: hasControlled },
        });

        // Re-fetch with updated items
        const refetched = await tx.prescription.findUnique({
          where: { id },
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
              },
            },
          },
        });

        return refetched!;
      }

      return updated;
    });

    await createAuditLog({
      userId: auth.user.id,
      clinicId: prescription.doctor.clinicId,
      action: 'update',
      entity: 'Prescription',
      entityId: id,
      oldValues: {
        diagnosis: oldPrescription.diagnosis,
        notes: oldPrescription.notes,
        status: oldPrescription.status,
        refillsRemaining: oldPrescription.refillsRemaining,
      },
      newValues: {
        diagnosis,
        notes,
        status,
        refillsRemaining,
        itemsUpdated: !!items,
      },
    });

    return apiSuccess(updatedPrescription);
  } catch (error) {
    console.error('Error updating prescription:', error);
    return apiError('Error al actualizar receta', 500);
  }
}
