// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - GET/POST /api/doctors/[id]/patients - Doctor's patients
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound, apiPaginated } from '@/lib/api-response';
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

    const doctor = await db.doctor.findUnique({ where: { id } });
    if (!doctor) {
      return apiNotFound('Doctor no encontrado');
    }

    // Only the doctor, clinic_admin of same clinic, or superadmin can list patients
    const isOwnDoctor = doctor.userId === auth.user.id;
    const isSuperadmin = auth.user.role === ROLES.SUPERADMIN;

    let isClinicAdmin = false;
    if (auth.user.role === ROLES.CLINIC_ADMIN) {
      const clinicAdmin = await db.clinicAdmin.findFirst({
        where: { userId: auth.user.id, clinicId: doctor.clinicId },
      });
      isClinicAdmin = !!clinicAdmin;
    }

    if (!isOwnDoctor && !isSuperadmin && !isClinicAdmin) {
      return apiForbidden('No tiene permisos para ver los pacientes de este doctor');
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = { doctorId: id };

    if (search) {
      where.patient = {
        OR: [
          { user: { name: { contains: search } } },
          { user: { email: { contains: search } } },
        ],
      };
    }

    const [doctorPatients, total] = await Promise.all([
      db.doctorPatient.findMany({
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
        },
        orderBy: { assignedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.doctorPatient.count({ where }),
    ]);

    return apiPaginated(doctorPatients, page, limit, total);
  } catch (error) {
    console.error('Error listing doctor patients:', error);
    return apiError('Error al listar pacientes del doctor', 500);
  }
}

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

    const doctor = await db.doctor.findUnique({ where: { id } });
    if (!doctor) {
      return apiNotFound('Doctor no encontrado');
    }

    // Only the doctor themselves, clinic_admin, or superadmin can assign patients
    const isOwnDoctor = doctor.userId === auth.user.id;
    const isSuperadmin = auth.user.role === ROLES.SUPERADMIN;

    let isClinicAdmin = false;
    if (auth.user.role === ROLES.CLINIC_ADMIN) {
      const clinicAdmin = await db.clinicAdmin.findFirst({
        where: { userId: auth.user.id, clinicId: doctor.clinicId },
      });
      isClinicAdmin = !!clinicAdmin;
    }

    if (!isOwnDoctor && !isSuperadmin && !isClinicAdmin) {
      return apiForbidden('No tiene permisos para asignar pacientes a este doctor');
    }

    const body = await request.json();
    const { patientId } = body;

    if (!patientId) {
      return apiError('patientId es requerido', 422);
    }

    // Verify patient exists
    const patient = await db.patient.findUnique({ where: { id: patientId } });
    if (!patient) {
      return apiNotFound('Paciente no encontrado');
    }

    // Check if already assigned
    const existing = await db.doctorPatient.findUnique({
      where: {
        doctorId_patientId: { doctorId: id, patientId },
      },
    });

    if (existing) {
      return apiError('El paciente ya está asignado a este doctor', 409);
    }

    const doctorPatient = await db.doctorPatient.create({
      data: {
        doctorId: id,
        patientId,
      },
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
      },
    });

    await createAuditLog({
      userId: auth.user.id,
      clinicId: doctor.clinicId,
      action: 'create',
      entity: 'DoctorPatient',
      entityId: doctorPatient.id,
      newValues: { doctorId: id, patientId },
    });

    return apiSuccess(doctorPatient, { status: 201 });
  } catch (error) {
    console.error('Error assigning patient to doctor:', error);
    return apiError('Error al asignar paciente al doctor', 500);
  }
}
