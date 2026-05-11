// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Global Search API
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  if (query.length < 2) return apiSuccess({ results: [] });

  try {
    const results: any[] = [];

    // 1. Search Patients (If admin, doctor, or receptionist)
    if ([ROLES.SUPERADMIN, ROLES.CLINIC_ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST].includes(auth.user.role as any)) {
      const patients = await db.patient.findMany({
        where: {
          OR: [
            { user: { name: { contains: query } } },
            { user: { email: { contains: query } } },
            { id: { contains: query } },
          ]
        },
        include: { user: { select: { name: true, avatarUrl: true } } },
        take: 5
      });
      results.push(...patients.map(p => ({
        id: p.id,
        title: p.user.name,
        subtitle: 'Paciente',
        type: 'patient',
        view: 'platform-patients', // Adjust based on role
        icon: 'user'
      })));
    }

    // 2. Search Medications (If pharmacy or clinic)
    const medications = await db.medication.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { genericName: { contains: query } },
        ]
      },
      take: 5
    });
    results.push(...medications.map(m => ({
      id: m.id,
      title: m.name,
      subtitle: m.category || 'Medicamento',
      type: 'medication',
      view: auth.user.role.startsWith('pharmacy') ? 'pharmacy-inventory' : 'platform-prescriptions',
      icon: 'pill'
    })));

    return apiSuccess({ results });
  } catch (error) {
    console.error('Global search error:', error);
    return apiError('Error en búsqueda global');
  }
}
