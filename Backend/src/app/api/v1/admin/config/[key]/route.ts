import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { apiSuccess, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { handleError } from '@/lib/handle-error';
import { AppError } from '@/lib/errors';
import logger from '@/lib/logger';
import { createAuditLog } from '@/lib/oasis-utils';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const requestId = request.headers.get('X-Request-Id') || 'unknown';
  try {
    const auth = await getAuthUserFromHeader(request);
    if (!auth) throw AppError.unauthorized();
    if (auth.user.role !== ROLES.SUPERADMIN) throw AppError.forbidden();

    const { key } = await params;
    const body = await request.json();
    const { value } = body;

    if (value === undefined) {
      throw AppError.badRequest('El valor es requerido');
    }

    const existingConfig = await db.systemConfig.findUnique({
      where: { key },
    });

    if (!existingConfig) {
      throw AppError.notFound(`Configuración "${key}" no encontrada`);
    }

    const updatedConfig = await db.systemConfig.update({
      where: { key },
      data: { value: String(value) },
    });

    await createAuditLog({
      userId: auth.user.id,
      action: 'update_config',
      entity: 'SystemConfig',
      entityId: String(updatedConfig.id),
      oldValues: { value: existingConfig.value },
      newValues: { value: updatedConfig.value },
    });

    logger.info({ requestId, key, newValue: value }, 'System config updated');

    return apiSuccess(updatedConfig);
  } catch (error) {
    logger.error({ requestId, error }, 'Error updating system config');
    return handleError(error);
  }
}
