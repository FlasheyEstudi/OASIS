// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - GET /api/patients - List patients
// doctor: sees own assigned patients
// clinic_admin/receptionist: sees clinic patients
// superadmin: sees all
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiPaginated } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { paginationSchema } from '@/lib/validations/common';
import { AppError } from '@/lib/errors';
import { handleError } from '@/lib/handle-error';
import { getClientIp, apiLimiter, getRateLimitHeaders } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    // ── Rate Limiting ──
    const ip = getClientIp(request);
    const { success, remaining, reset } = await apiLimiter.limit(ip);

    if (!success) {
      throw AppError.tooManyRequests('Muchas solicitudes. Intenta de nuevo en un minuto.');
    }

    const auth = await getAuthUserFromHeader(request);
    if (!auth) throw AppError.unauthorized();

    const { user } = auth;
    const { searchParams } = new URL(request.url);

    // ── Validate Query Params with Zod ──
    const queryParams = Object.fromEntries(searchParams.entries());
    const parsedQuery = paginationSchema.safeParse(queryParams);
    if (!parsedQuery.success) {
      throw AppError.badRequest('Parámetros de búsqueda inválidos', parsedQuery.error.flatten().fieldErrors as any);
    }

    const { page, limit, search } = parsedQuery.data;
    const skip = (page - 1) * limit;

    // Build where clause based on role
    let where: Record<string, unknown> = { isActive: true };

    if (user.role === ROLES.DOCTOR) {
      // Doctor sees only their assigned patients
      const doctor = await db.doctor.findUnique({ where: { userId: user.id } });
      if (!doctor) throw AppError.notFound('Perfil de doctor no encontrado');

      where.doctorPatients = { some: { doctorId: doctor.id } };
    } else if (user.role === ROLES.CLINIC_ADMIN) {
      // Clinic admin sees patients from their clinic
      const clinicAdmin = await db.clinicAdmin.findUnique({ where: { userId: user.id } });
      if (!clinicAdmin) throw AppError.notFound('Perfil de administrador no encontrado');

      where.appointments = { some: { clinicId: clinicAdmin.clinicId } };
    } else if (user.role === ROLES.RECEPTIONIST) {
      // Receptionist sees patients from their clinic
      const receptionist = await db.receptionist.findUnique({ where: { userId: user.id } });
      if (!receptionist) throw AppError.notFound('Perfil de recepcionista no encontrado');

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

    const response = apiPaginated(patients, page, limit, total);
    
    // Añadir headers de rate limit
    const headers = getRateLimitHeaders(remaining, reset);
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    return handleError(error);
  }
}
