// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - GET /api/patients/[id]/history
// Unified clinical history: prescriptions, appointments, allergies, chronic conditions
// Doctor or own patient can access
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { safeJsonParse } from '@/lib/oasis-utils';
import { handleError } from '@/lib/handle-error';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUserFromHeader(request);
    if (!auth) return apiUnauthorized();

    const { id } = await params;
    const { user } = auth;

    // Find patient
    const patient = await db.patient.findUnique({
      where: { id },
    });

    if (!patient) return apiNotFound('Paciente no encontrado');

    // Authorization: own patient or assigned doctor or superadmin
    const isOwnPatient = patient.userId === user.id;
    const isSuperadmin = user.role === ROLES.SUPERADMIN;

    if (!isOwnPatient && !isSuperadmin) {
      if (user.role === ROLES.DOCTOR) {
        const assignment = await db.doctorPatient.findFirst({
          where: { patientId: id, doctor: { userId: user.id } },
        });
        if (!assignment) return apiForbidden();
      } else if (user.role === ROLES.CLINIC_ADMIN) {
        const clinicAdmin = await db.clinicAdmin.findUnique({ where: { userId: user.id } });
        if (!clinicAdmin) return apiForbidden();
        const hasAppointment = await db.appointment.findFirst({
          where: { patientId: id, clinicId: clinicAdmin.clinicId },
        });
        if (!hasAppointment) return apiForbidden();
      } else {
        return apiForbidden();
      }
    }

    // Contextual filtering for patients
    const familyMemberId = user.familyMemberId || null;
    const historyWhere = user.role === ROLES.PATIENT 
      ? { patientId: id, familyMemberId } 
      : { patientId: id };

    // Fetch all clinical history data in parallel
    const [prescriptions, appointments, refillRequests] = await Promise.all([
      db.prescription.findMany({
        where: historyWhere,
        include: {
          doctor: {
            include: {
              user: { select: { id: true, name: true } },
            },
          },
          items: {
            include: {
              medication: {
                select: { id: true, name: true, genericName: true, dosageForm: true, strength: true },
              },
            },
          },
        },
        orderBy: { date: 'desc' },
      }),
      db.appointment.findMany({
        where: historyWhere,
        include: {
          doctor: {
            include: {
              user: { select: { id: true, name: true } },
            },
          },
          clinic: { select: { id: true, name: true, address: true } },
          service: { select: { id: true, name: true, price: true } },
        },
        orderBy: { date: 'desc' },
      }),
      db.refillRequest.findMany({
        where: { patientId: id }, // Refills are usually handled by the primary patient
        include: {
          prescription: {
            include: {
              items: {
                include: {
                  medication: {
                    select: { id: true, name: true, genericName: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { requestedAt: 'desc' },
      }),
    ]);

    // Parse JSON fields safely
    const clinicalHistory = {
      patient: {
        id: patient.id,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        bloodType: patient.bloodType,
        allergies: safeJsonParse<string[]>(patient.allergies, []),
        chronicConditions: safeJsonParse<string[]>(patient.chronicConditions, []),
        emergencyContact: safeJsonParse<Record<string, unknown> | null>(patient.emergencyContact, null),
      },
      prescriptions,
      appointments,
      refillRequests,
      summary: {
        totalPrescriptions: prescriptions.length,
        activePrescriptions: prescriptions.filter((p) => p.status === 'active').length,
        totalAppointments: appointments.length,
        completedAppointments: appointments.filter((a) => a.status === 'completed').length,
        upcomingAppointments: appointments.filter(
          (a) => a.status === 'scheduled' || a.status === 'confirmed'
        ).length,
        pendingRefillRequests: refillRequests.filter((r) => r.status === 'pending').length,
      },
    };

    return apiSuccess(clinicalHistory);
  } catch (error) {
    return handleError(error);
  }
}
