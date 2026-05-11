// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - GET /api/doctors/[id]/appointments - Doctor's appointments
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound, apiPaginated } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';

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

    const doctor = await db.doctor.findUnique({ where: { id } });
    if (!doctor) {
      return apiNotFound('Doctor no encontrado');
    }

    // Only the doctor, clinic_admin of same clinic, or superadmin can list appointments
    const isOwnDoctor = doctor.userId === auth.user.id;
    const isSuperadmin = auth.user.role === ROLES.SUPERADMIN;
    const isPatient = auth.user.role === ROLES.PATIENT;

    let isClinicAdmin = false;
    if (auth.user.role === ROLES.CLINIC_ADMIN) {
      const clinicAdmin = await db.clinicAdmin.findFirst({
        where: { userId: auth.user.id, clinicId: doctor.clinicId },
      });
      isClinicAdmin = !!clinicAdmin;
    }

    let isReceptionist = false;
    if (auth.user.role === ROLES.RECEPTIONIST) {
      const receptionist = await db.receptionist.findFirst({
        where: { userId: auth.user.id, clinicId: doctor.clinicId },
      });
      isReceptionist = !!receptionist;
    }

    // Patients can only see their own appointments with this doctor
    if (!isOwnDoctor && !isSuperadmin && !isClinicAdmin && !isReceptionist && !isPatient) {
      return apiForbidden('No tiene permisos para ver las citas de este doctor');
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = { doctorId: id };

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      where.date = { gte: startDate, lte: endDate };
    }

    if (status) {
      where.status = status;
    }

    // If patient, only show their own appointments
    if (isPatient && !isOwnDoctor && !isSuperadmin) {
      const patient = await db.patient.findFirst({
        where: { userId: auth.user.id },
      });
      if (patient) {
        where.patientId = patient.id;
      }
    }

    const [appointments, total] = await Promise.all([
      db.appointment.findMany({
        where,
        include: {
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
          service: {
            select: {
              id: true,
              name: true,
              duration: true,
              price: true,
            },
          },
          clinic: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
        },
        orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.appointment.count({ where }),
    ]);

    return apiPaginated(appointments, page, limit, total);
  } catch (error) {
    console.error('Error listing doctor appointments:', error);
    return apiError('Error al listar citas del doctor', 500);
  }
}
