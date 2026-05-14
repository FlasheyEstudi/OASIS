// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - GET /api/clinics/[id]/audit-logs/export - Export to CSV
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { id } = await params;

  // Authorization
  if (auth.user.role !== ROLES.SUPERADMIN && auth.user.role !== ROLES.CLINIC_ADMIN) {
    return apiForbidden('No autorizado');
  }

  if (auth.user.role === ROLES.CLINIC_ADMIN) {
    const clinicAdmin = await db.clinicAdmin.findUnique({ where: { userId: auth.user.id } });
    if (!clinicAdmin || clinicAdmin.clinicId !== id) return apiForbidden();
  }

  const logs = await db.auditLog.findMany({
    where: { clinicId: id },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true, email: true } } },
    take: 1000, // Limit export to last 1000 logs
  });

  // Generate CSV content
  const headers = ['Fecha', 'Usuario', 'Email', 'Acción', 'Entidad', 'Detalles'];
  const rows = logs.map(log => [
    log.createdAt.toISOString(),
    log.user?.name || 'Sistema',
    log.user?.email || 'N/A',
    log.action,
    log.entity,
    `"${log.newValues?.substring(0, 100).replace(/"/g, '""') || ''}"`
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="audit-logs-${id.substring(0, 8)}.csv"`,
    },
  });
}
