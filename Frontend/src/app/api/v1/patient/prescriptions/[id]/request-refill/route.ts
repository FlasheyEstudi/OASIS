// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - POST /api/patient/prescriptions/[id]/request-refill
// Request medication refill
// Checks refillsRemaining > 0
// Creates RefillRequest
// Notifies doctor (creates notification in MVP)
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUserFromHeader(request);
    if (!auth) return apiUnauthorized();

    const { user } = auth;
    const { id } = await params; // prescription ID

    // Only patients can request refills
    if (user.role !== ROLES.PATIENT && user.role !== ROLES.SUPERADMIN) {
      return apiForbidden('Solo los pacientes pueden solicitar recargas');
    }

    // Find patient
    const patient = await db.patient.findUnique({
      where: { userId: user.id },
    });

    if (!patient) return apiError('Perfil de paciente no encontrado', 404);

    // Find prescription
    const prescription = await db.prescription.findUnique({
      where: { id },
      include: {
        doctor: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
        items: {
          include: {
            medication: {
              select: { id: true, name: true, genericName: true },
            },
          },
        },
      },
    });

    if (!prescription) return apiNotFound('Receta no encontrada');

    // Verify prescription belongs to patient
    if (prescription.patientId !== patient.id && user.role !== ROLES.SUPERADMIN) {
      return apiForbidden('Esta receta no te pertenece');
    }

    // Check if prescription is active
    if (prescription.status !== 'active') {
      return apiError('Solo se pueden recargar recetas activas', 400);
    }

    // Check refills remaining
    if (prescription.refillsRemaining <= 0) {
      return apiError('No quedan recargas disponibles para esta receta', 400);
    }

    // Check for existing pending refill request
    const existingRequest = await db.refillRequest.findFirst({
      where: {
        prescriptionId: id,
        patientId: patient.id,
        status: 'pending',
      },
    });

    if (existingRequest) {
      return apiError('Ya tienes una solicitud de recarga pendiente para esta receta', 409);
    }

    // Check if prescription has expired
    if (prescription.validUntil && new Date() > prescription.validUntil) {
      return apiError('Esta receta ha expirado', 400);
    }

    // Parse body for optional notes
    const body = await request.json().catch(() => ({}));
    const { notes } = body;

    // Create refill request
    const refillRequest = await db.refillRequest.create({
      data: {
        prescriptionId: id,
        patientId: patient.id,
        status: 'pending',
        doctorNotes: notes || null,
      },
    });

    // Decrement refills remaining
    await db.prescription.update({
      where: { id },
      data: {
        refillsRemaining: prescription.refillsRemaining - 1,
      },
    });

    // Notify doctor (create notification)
    await db.notification.create({
      data: {
        userId: prescription.doctor.user.id,
        title: 'Solicitud de recarga de receta',
        message: `El paciente ha solicitado una recarga para la receta con ${prescription.items.length} medicamento(s)`,
        type: 'medication',
        data: JSON.stringify({
          prescriptionId: id,
          refillRequestId: refillRequest.id,
          patientId: patient.id,
          patientName: (await db.user.findUnique({ where: { id: user.id } }))?.name,
        }),
        sentVia: 'in_app',
      },
    });

    // Audit log
    await createAuditLog({
      userId: user.id,
      action: 'create',
      entity: 'RefillRequest',
      entityId: refillRequest.id,
      newValues: {
        prescriptionId: id,
        patientId: patient.id,
        refillsRemaining: prescription.refillsRemaining - 1,
      },
    });

    return apiSuccess(refillRequest, { status: 201 });
  } catch (error) {
    console.error('Error requesting refill:', error);
    return apiError('Error al solicitar recarga', 500);
  }
}
