import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUserFromHeader } from '@/lib/auth';
import { apiSuccess, apiUnauthorized, apiNotFound, apiForbidden } from '@/lib/api-response';
import { handleError } from '@/lib/handle-error';
import { AppError } from '@/lib/errors';
import logger from '@/lib/logger';
import { z } from 'zod';

const updateConditionSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  diagnosedAt: z.string().datetime().optional().nullable(),
  notes: z.string().max(500).optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = request.headers.get('X-Request-Id') || 'unknown';
  try {
    const auth = await getAuthUserFromHeader(request);
    if (!auth) throw AppError.unauthorized();

    const { id } = await params;
    const conditionId = parseInt(id);

    const condition = await db.chronicCondition.findUnique({
      where: { id: conditionId },
      include: { patient: true },
    });

    if (!condition) throw AppError.notFound('Condición no encontrada');
    if (condition.patient.userId !== auth.user.id) throw AppError.forbidden();

    const body = await request.json();
    const parsed = updateConditionSchema.safeParse(body);
    if (!parsed.success) {
      throw AppError.badRequest('Datos inválidos', parsed.error.flatten().fieldErrors as any);
    }

    const updated = await db.chronicCondition.update({
      where: { id: conditionId },
      data: {
        ...parsed.data,
        diagnosedAt: parsed.data.diagnosedAt ? new Date(parsed.data.diagnosedAt) : undefined,
      },
    });

    return apiSuccess(updated);
  } catch (error) {
    logger.error({ requestId, error }, 'Error updating chronic condition');
    return handleError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = request.headers.get('X-Request-Id') || 'unknown';
  try {
    const auth = await getAuthUserFromHeader(request);
    if (!auth) throw AppError.unauthorized();

    const { id } = await params;
    const conditionId = parseInt(id);

    const condition = await db.chronicCondition.findUnique({
      where: { id: conditionId },
      include: { patient: true },
    });

    if (!condition) throw AppError.notFound('Condición no encontrada');
    if (condition.patient.userId !== auth.user.id) throw AppError.forbidden();

    await db.chronicCondition.delete({ where: { id: conditionId } });

    return apiSuccess({ deleted: true });
  } catch (error) {
    logger.error({ requestId, error }, 'Error deleting chronic condition');
    return handleError(error);
  }
}
