import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUserFromHeader } from '@/lib/auth';
import { apiSuccess, apiUnauthorized } from '@/lib/api-response';
import { handleError } from '@/lib/handle-error';
import { AppError } from '@/lib/errors';
import logger from '@/lib/logger';
import { z } from 'zod';

const conditionSchema = z.object({
  name: z.string().min(2).max(100),
  diagnosedAt: z.string().datetime().optional().nullable(),
  notes: z.string().max(500).optional(),
});

export async function GET(request: NextRequest) {
  const requestId = request.headers.get('X-Request-Id') || 'unknown';
  try {
    const auth = await getAuthUserFromHeader(request);
    if (!auth) throw AppError.unauthorized();
    
    const patient = await db.patient.findUnique({
      where: { userId: auth.user.id },
    });

    if (!patient) throw AppError.notFound('Perfil de paciente no encontrado');

    const conditions = await db.chronicCondition.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: 'desc' },
    });

    return apiSuccess(conditions);
  } catch (error) {
    logger.error({ requestId, error }, 'Error fetching chronic conditions');
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
    const parsed = conditionSchema.safeParse(body);
    if (!parsed.success) {
      throw AppError.badRequest('Datos inválidos', parsed.error.flatten().fieldErrors as any);
    }

    const condition = await db.chronicCondition.create({
      data: {
        ...parsed.data,
        diagnosedAt: parsed.data.diagnosedAt ? new Date(parsed.data.diagnosedAt) : null,
        patientId: patient.id,
      },
    });

    return apiSuccess(condition, { status: 201 });
  } catch (error) {
    logger.error({ requestId, error }, 'Error adding chronic condition');
    return handleError(error);
  }
}
