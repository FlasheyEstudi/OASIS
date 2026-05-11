// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Clinic Dashboard Stats API
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  // Find the clinicId for this user
  let clinicId = '';
  if (auth.user.role === ROLES.CLINIC_ADMIN) {
    const admin = await db.clinicAdmin.findFirst({ where: { userId: auth.user.id } });
    clinicId = admin?.clinicId || '';
  } else if (auth.user.role === ROLES.DOCTOR) {
    const doctor = await db.doctor.findFirst({ where: { userId: auth.user.id } });
    clinicId = doctor?.clinicId || '';
  } else if (auth.user.role === ROLES.RECEPTIONIST) {
    const recep = await db.receptionist.findFirst({ where: { userId: auth.user.id } });
    clinicId = recep?.clinicId || '';
  } else if (auth.user.role === ROLES.SUPERADMIN) {
    clinicId = new URL(request.url).searchParams.get('clinicId') || '';
  }

  if (!clinicId) return apiForbidden('No tienes una clínica asociada');

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // 1. Metrics
    const [patientCount, todayAptCount, rxCount, revenueRes] = await Promise.all([
      db.patient.count({ where: { appointments: { some: { doctor: { clinicId } } } } }),
      db.appointment.count({ where: { doctor: { clinicId }, date: { gte: today, lt: tomorrow } } }),
      db.prescription.count({ where: { doctor: { clinicId }, createdAt: { gte: monthStart } } }),
      db.payment.aggregate({
        where: { appointment: { doctor: { clinicId } }, status: 'completed', createdAt: { gte: monthStart } },
        _sum: { amount: true }
      })
    ]);

    // 2. Upcoming appointments
    const upcomingAppointments = await db.appointment.findMany({
      where: { doctor: { clinicId }, date: { gte: today } },
      include: {
        patient: { include: { user: { select: { name: true, avatarUrl: true } } } },
        doctor: { include: { user: { select: { name: true } } } }
      },
      orderBy: { date: 'asc' },
      take: 10
    });

    // 3. Weekly chart data (last 7 days)
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);

      const dayRevenue = await db.payment.aggregate({
        where: { appointment: { doctor: { clinicId } }, status: 'completed', createdAt: { gte: d, lt: nextD } },
        _sum: { amount: true }
      });

      weeklyData.push({
        day: d.toLocaleDateString('es-NI', { weekday: 'short' }),
        value: dayRevenue._sum.amount || 0
      });
    }

    return apiSuccess({
      metrics: {
        patients: patientCount,
        appointmentsToday: todayAptCount,
        prescriptionsMonth: rxCount,
        revenueMonth: revenueRes._sum.amount || 0,
      },
      upcomingAppointments: upcomingAppointments.map(a => ({
        id: a.id,
        name: a.patient.user.name,
        time: a.date.toLocaleTimeString('es-NI', { hour: '2-digit', minute: '2-digit' }),
        type: a.type,
        initials: a.patient.user.name.split(' ').map(n => n[0]).join('').slice(0, 2),
        color: '#0E8C5E'
      })),
      weeklyData
    });

  } catch (error) {
    console.error('Error fetching clinic stats:', error);
    return apiError('Error al cargar estadísticas', 500);
  }
}
