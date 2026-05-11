// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Audit Logs de Clínica
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiUnauthorized, apiForbidden, apiNotFound, apiPaginated } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/clinics/[id]/audit-logs - Trail de auditoría de la clínica
export async function GET(request: NextRequest, { params }: RouteParams) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  if (auth.user.role !== ROLES.SUPERADMIN && auth.user.role !== ROLES.CLINIC_ADMIN) {
    return apiForbidden('No tienes permisos para ver los logs de auditoría');
  }

  const { id } = await params;

  const clinic = await db.clinic.findUnique({ where: { id } });
  if (!clinic) return apiNotFound('Clínica no encontrada');

  // clinic_admin solo puede ver logs de su clínica
  if (auth.user.role === ROLES.CLINIC_ADMIN) {
    const clinicAdmin = await db.clinicAdmin.findUnique({
      where: { userId: auth.user.id },
    });
    if (!clinicAdmin || clinicAdmin.clinicId !== id) {
      return apiForbidden('No tienes acceso a esta clínica');
    }
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const action = searchParams.get('action') || '';
  const entity = searchParams.get('entity') || '';
  const userId = searchParams.get('userId') || '';
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { clinicId: id };
  if (action) where.action = action;
  if (entity) where.entity = entity;
  if (userId) where.userId = userId;

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    }),
    db.auditLog.count({ where }),
  ]);

  // Parsear JSON strings de oldValues y newValues
  const parsedLogs = logs.map((log) => ({
    ...log,
    oldValues: log.oldValues ? JSON.parse(log.oldValues) : null,
    newValues: log.newValues ? JSON.parse(log.newValues) : null,
  }));

  return apiPaginated(parsedLogs, page, limit, total);
}
