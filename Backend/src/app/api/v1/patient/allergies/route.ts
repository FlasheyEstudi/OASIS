import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { apiSuccess, apiUnauthorized, apiForbidden } from '@/lib/api-response';
import { handleError } from '@/lib/handle-error';
import { AppError } from '@/lib/errors';
import logger from '@/lib/logger';
import { z } from 'zod';

const allergySchema = z.object({
  name: z.string().min(2).max(100),
  severity: z.enum(['mild', 'moderate', 'severe', 'life_threatening']).default('moderate'),
  notes: z.string().max(500).optional(),
});

export async function GET(request: NextRequest) {
  const requestId = request.headers.get('X-Request-Id') || 'unknown';
  try {
    const auth = await getAuthUserFromHeader(request);
    if (!auth) throw AppError.unauthorized();
    
    // Only patient can see their own allergies, or doctor assigned
    const patient = await db.patient.findUnique({
      where: { userId: auth.user.id },
    });

    if (!patient) throw AppError.notFound('Perfil de paciente no encontrado');

    const allergies = await db.allergy.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: 'desc' },
    });

    return apiSuccess(allergies);
  } catch (error) {
    logger.error({ requestId, error }, 'Error fetching allergies');
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  const requestId = request.headers.get('X-Request-Id') || 'unknown';
  try {
    const auth = await getAuthUserFromHeader(request);
    if (!auth) throw AppError.unauthorized();

    const patient = await db.patient.findUnique({
      where: { userId: auth.user.id },
    });

    if (!patient) throw AppError.notFound('Perfil de paciente no encontrado');

    const body = await request.json();
    const parsed = allergySchema.safeParse(body);
    if (!parsed.success) {
      throw AppError.badRequest('Datos de alergia inválidos', parsed.error.flatten().fieldErrors as any);
    }

    const allergy = await db.allergy.create({
      data: {
        ...parsed.data,
        patientId: patient.id,
      },
    });

    logger.info({ requestId, allergyId: allergy.id, patientId: patient.id }, 'Allergy added');

    return apiSuccess(allergy, { status: 201 });
  } catch (error) {
    logger.error({ requestId, error }, 'Error adding allergy');
    return handleError(error);
  }
}
