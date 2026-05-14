import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { apiSuccess, apiUnauthorized, apiForbidden } from '@/lib/api-response';
import { handleError } from '@/lib/handle-error';
import { AppError } from '@/lib/errors';
import logger from '@/lib/logger';

export async function GET(request: NextRequest) {
  const requestId = request.headers.get('X-Request-Id') || 'unknown';
  try {
    const auth = await getAuthUserFromHeader(request);
    if (!auth) throw AppError.unauthorized();
    if (auth.user.role !== ROLES.SUPERADMIN) throw AppError.forbidden();

    const configs = await db.systemConfig.findMany({
      orderBy: { key: 'asc' },
    });

    return apiSuccess(configs);
  } catch (error) {
    logger.error({ requestId, error }, 'Error fetching system configs');
    return handleError(error);
  }
}
