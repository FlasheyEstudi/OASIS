import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUserFromHeader } from '@/lib/auth';
import { apiSuccess, apiUnauthorized, apiNotFound, apiForbidden } from '@/lib/api-response';
import { handleError } from '@/lib/handle-error';
import { AppError } from '@/lib/errors';
import logger from '@/lib/logger';
import { z } from 'zod';

const updateAllergySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  severity: z.enum(['mild', 'moderate', 'severe', 'life_threatening']).optional(),
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
    const allergyId = parseInt(id);

    const allergy = await db.allergy.findUnique({
      where: { id: allergyId },
      include: { patient: true },
    });

    if (!allergy) throw AppError.notFound('Alergia no encontrada');
    if (allergy.patient.userId !== auth.user.id) throw AppError.forbidden();

    const body = await request.json();
    const parsed = updateAllergySchema.safeParse(body);
    if (!parsed.success) {
      throw AppError.badRequest('Datos inválidos', parsed.error.flatten().fieldErrors as any);
    }

    const updated = await db.allergy.update({
      where: { id: allergyId },
      data: parsed.data,
    });

    return apiSuccess(updated);
  } catch (error) {
    logger.error({ requestId, error }, 'Error updating allergy');
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
    const allergyId = parseInt(id);

    const allergy = await db.allergy.findUnique({
      where: { id: allergyId },
      include: { patient: true },
    });

    if (!allergy) throw AppError.notFound('Alergia no encontrada');
    if (allergy.patient.userId !== auth.user.id) throw AppError.forbidden();

    await db.allergy.delete({ where: { id: allergyId } });

    return apiSuccess({ deleted: true });
  } catch (error) {
    logger.error({ requestId, error }, 'Error deleting allergy');
    return handleError(error);
  }
}
