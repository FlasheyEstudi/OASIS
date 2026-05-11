// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - GET /api/patients - List patients
// doctor: sees own assigned patients
// clinic_admin/receptionist: sees clinic patients
// superadmin: sees all
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiPaginated } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUserFromHeader(request);
    if (!auth) return apiUnauthorized();

    const { user, dbUser } = auth;
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;

    // Build where clause based on role
    let where: Record<string, unknown> = { isActive: true };

    if (user.role === ROLES.DOCTOR) {
      // Doctor sees only their assigned patients
      const doctor = await db.doctor.findUnique({ where: { userId: user.id } });
      if (!doctor) return apiError('Perfil de doctor no encontrado', 404);

      where.doctorPatients = { some: { doctorId: doctor.id } };
    } else if (user.role === ROLES.CLINIC_ADMIN) {
      // Clinic admin sees patients from their clinic
      const clinicAdmin = await db.clinicAdmin.findUnique({ where: { userId: user.id } });
      if (!clinicAdmin) return apiError('Perfil de administrador no encontrado', 404);

      where.appointments = { some: { clinicId: clinicAdmin.clinicId } };
    } else if (user.role === ROLES.RECEPTIONIST) {
      // Receptionist sees patients from their clinic
      const receptionist = await db.receptionist.findUnique({ where: { userId: user.id } });
      if (!receptionist) return apiError('Perfil de recepcionista no encontrado', 404);

      where.appointments = { some: { clinicId: receptionist.clinicId } };
    }
    // superadmin sees all - no additional filter

    // Add search filter
    if (search) {
      where.OR = [
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
        { user: { phone: { contains: search } } },
        { insurancePolicyNumber: { contains: search } },
        { insuranceProvider: { contains: search } },
        { city: { contains: search } },
      ];
    }

    const [patients, total] = await Promise.all([
      db.patient.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true, avatarUrl: true },
          },
          doctorPatients: {
            include: {
              doctor: {
                include: {
                  user: { select: { id: true, name: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.patient.count({ where }),
    ]);

    return apiPaginated(patients, page, limit, total);
  } catch (error) {
    console.error('Error listing patients:', error);
    return apiError('Error al listar pacientes', 500);
  }
}
