// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - GET /api/patient/prescriptions
// List patient's prescriptions (active, dispensed, expired)
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiPaginated } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUserFromHeader(request);
    if (!auth) return apiUnauthorized();

    const { user } = auth;

    // Only patients can view their prescriptions (or superadmin)
    if (user.role !== ROLES.PATIENT && user.role !== ROLES.SUPERADMIN && user.role !== ROLES.DOCTOR) {
      return apiError('No autorizado', 403);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined; // active, dispensed, expired, cancelled
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Determine patient ID
    let patientId: string | undefined;

    if (user.role === ROLES.PATIENT) {
      const patient = await db.patient.findUnique({ where: { userId: user.id } });
      if (!patient) return apiError('Perfil de paciente no encontrado', 404);
      patientId = patient.id;
    } else if (user.role === ROLES.DOCTOR) {
      // Doctor can view prescriptions for specific patient via query param
      const queryPatientId = searchParams.get('patientId');
      if (!queryPatientId) return apiError('patientId es requerido para doctores', 422);
      // Verify assignment
      const assignment = await db.doctorPatient.findFirst({
        where: { patientId: queryPatientId, doctor: { userId: user.id } },
      });
      if (!assignment) return apiError('No autorizado para ver estas recetas', 403);
      patientId = queryPatientId;
    }
    // superadmin can specify patientId or see all

    if (user.role === ROLES.SUPERADMIN) {
      patientId = searchParams.get('patientId') || undefined;
    }

    const where: Record<string, unknown> = {};
    if (patientId) where.patientId = patientId;
    if (status) where.status = status;

    const [prescriptions, total] = await Promise.all([
      db.prescription.findMany({
        where,
        skip,
        take: limit,
        include: {
          doctor: {
            include: {
              user: { select: { id: true, name: true } },
            },
          },
          patient: {
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
          refillRequests: {
            orderBy: { requestedAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { date: 'desc' },
      }),
      db.prescription.count({ where }),
    ]);

    return apiPaginated(prescriptions, page, limit, total);
  } catch (error) {
    console.error('Error listing prescriptions:', error);
    return apiError('Error al listar recetas', 500);
  }
}
