// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Reporte de Ingresos de Clínica
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/clinics/[id]/reports/revenue - Reporte de ingresos
export async function GET(request: NextRequest, { params }: RouteParams) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  if (auth.user.role !== ROLES.SUPERADMIN && auth.user.role !== ROLES.CLINIC_ADMIN) {
    return apiForbidden('No tienes permisos para ver reportes');
  }

  const { id } = await params;

  const clinic = await db.clinic.findUnique({ where: { id } });
  if (!clinic) return apiNotFound('Clínica no encontrada');

  // clinic_admin solo puede ver reportes de su clínica
  if (auth.user.role === ROLES.CLINIC_ADMIN) {
    const clinicAdmin = await db.clinicAdmin.findUnique({
      where: { userId: auth.user.id },
    });
    if (!clinicAdmin || clinicAdmin.clinicId !== id) {
      return apiForbidden('No tienes acceso a esta clínica');
    }
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const groupBy = searchParams.get('groupBy') || 'service'; // doctor | service

  // Construir filtros de fecha
  const dateFilter: Record<string, unknown> = {};
  if (from) dateFilter.gte = new Date(from);
  if (to) dateFilter.lte = new Date(to);

  const where: Record<string, unknown> = {
    clinicId: id,
    paymentStatus: 'paid',
  };
  if (from || to) {
    where.issuedAt = dateFilter;
  }

  // Obtener facturas con relaciones
  const invoices = await db.invoice.findMany({
    where,
    include: {
      appointment: {
        include: {
          doctor: {
            include: {
              user: { select: { id: true, name: true } },
            },
          },
          service: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { issuedAt: 'desc' },
  });

  // Calcular totales generales
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalSubtotal = invoices.reduce((sum, inv) => sum + inv.subtotal, 0);
  const totalTax = invoices.reduce((sum, inv) => sum + inv.tax, 0);
  const totalDiscount = invoices.reduce((sum, inv) => sum + inv.discount, 0);
  const totalInsurance = invoices.reduce((sum, inv) => sum + (inv.insuranceAmount || 0), 0);
  const invoiceCount = invoices.length;

  // Agrupar según el parámetro
  const grouped: Record<string, { id: string; name: string; revenue: number; invoiceCount: number; subtotal: number }> = {};

  if (groupBy === 'doctor') {
    for (const inv of invoices) {
      const doctor = inv.appointment?.doctor;
      const key = doctor?.id || 'sin_doctor';
      if (!grouped[key]) {
        grouped[key] = {
          id: doctor?.id || 'sin_doctor',
          name: doctor?.user?.name || 'Sin doctor asignado',
          revenue: 0,
          invoiceCount: 0,
          subtotal: 0,
        };
      }
      grouped[key].revenue += inv.total;
      grouped[key].subtotal += inv.subtotal;
      grouped[key].invoiceCount += 1;
    }
  } else {
    // groupBy === 'service'
    for (const inv of invoices) {
      const service = inv.appointment?.service;
      const key = service?.id || 'sin_servicio';
      if (!grouped[key]) {
        grouped[key] = {
          id: service?.id || 'sin_servicio',
          name: service?.name || 'Sin servicio asignado',
          revenue: 0,
          invoiceCount: 0,
          subtotal: 0,
        };
      }
      grouped[key].revenue += inv.total;
      grouped[key].subtotal += inv.subtotal;
      grouped[key].invoiceCount += 1;
    }
  }

  const groupedArray = Object.values(grouped).sort((a, b) => b.revenue - a.revenue);

  return apiSuccess({
    clinic: { id: clinic.id, name: clinic.name },
    period: { from: from || null, to: to || null },
    summary: {
      totalRevenue,
      totalSubtotal,
      totalTax,
      totalDiscount,
      totalInsurance,
      invoiceCount,
    },
    groupBy,
    groups: groupedArray,
    invoices: invoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      total: inv.total,
      subtotal: inv.subtotal,
      paymentMethod: inv.paymentMethod,
      paymentStatus: inv.paymentStatus,
      issuedAt: inv.issuedAt,
      doctor: inv.appointment?.doctor
        ? { id: inv.appointment.doctor.id, name: inv.appointment.doctor.user.name }
        : null,
      service: inv.appointment?.service
        ? { id: inv.appointment.service.id, name: inv.appointment.service.name }
        : null,
    })),
  });
}
