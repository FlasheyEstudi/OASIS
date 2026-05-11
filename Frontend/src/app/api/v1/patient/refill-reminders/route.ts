// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - GET /api/patient/refill-reminders
// Get refill reminders for prescriptions that:
// - Have refills remaining and are close to validUntil
// - Are active and medication might need refilling
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUserFromHeader(request);
    if (!auth) return apiUnauthorized();

    const { user } = auth;

    if (user.role !== ROLES.PATIENT && user.role !== ROLES.SUPERADMIN) {
      return apiError('No autorizado', 403);
    }

    const patient = await db.patient.findUnique({
      where: { userId: user.id },
    });

    if (!patient) return apiError('Perfil de paciente no encontrado', 404);

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Find active prescriptions with refills remaining
    const activePrescriptions = await db.prescription.findMany({
      where: {
        patientId: patient.id,
        status: 'active',
        refillsRemaining: { gt: 0 },
      },
      include: {
        doctor: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
        items: {
          include: {
            medication: {
              select: { id: true, name: true, genericName: true, dosageForm: true },
            },
          },
        },
      },
      orderBy: { validUntil: 'asc' },
    });

    // Categorize reminders
    const expiringSoon = activePrescriptions.filter(
      (p) => p.validUntil && new Date(p.validUntil) <= sevenDaysFromNow
    );

    const expiringThisMonth = activePrescriptions.filter(
      (p) =>
        p.validUntil &&
        new Date(p.validUntil) > sevenDaysFromNow &&
        new Date(p.validUntil) <= thirtyDaysFromNow
    );

    const needsRefill = activePrescriptions.filter(
      (p) => !p.validUntil || new Date(p.validUntil) > thirtyDaysFromNow
    );

    // Check for pending refill requests to avoid duplicate reminders
    const pendingRefills = await db.refillRequest.findMany({
      where: {
        patientId: patient.id,
        status: 'pending',
      },
      select: { prescriptionId: true },
    });

    const pendingPrescriptionIds = new Set(pendingRefills.map((r) => r.prescriptionId));

    // Filter out prescriptions with pending refill requests
    const filterPending = (prescriptions: typeof activePrescriptions) =>
      prescriptions.filter((p) => !pendingPrescriptionIds.has(p.id));

    const reminders = {
      urgent: filterPending(expiringSoon).map((p) => ({
        prescriptionId: p.id,
        medications: p.items.map((i) => ({
          name: i.medication.name,
          genericName: i.medication.genericName,
          dosage: i.dosage,
          duration: i.duration,
        })),
        doctorName: p.doctor.user.name,
        validUntil: p.validUntil,
        refillsRemaining: p.refillsRemaining,
        daysUntilExpiry: p.validUntil
          ? Math.ceil((new Date(p.validUntil).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : null,
        urgency: 'urgent' as const,
      })),
      upcoming: filterPending(expiringThisMonth).map((p) => ({
        prescriptionId: p.id,
        medications: p.items.map((i) => ({
          name: i.medication.name,
          genericName: i.medication.genericName,
          dosage: i.dosage,
          duration: i.duration,
        })),
        doctorName: p.doctor.user.name,
        validUntil: p.validUntil,
        refillsRemaining: p.refillsRemaining,
        daysUntilExpiry: p.validUntil
          ? Math.ceil((new Date(p.validUntil).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : null,
        urgency: 'upcoming' as const,
      })),
      suggested: filterPending(needsRefill).map((p) => ({
        prescriptionId: p.id,
        medications: p.items.map((i) => ({
          name: i.medication.name,
          genericName: i.medication.genericName,
          dosage: i.dosage,
          duration: i.duration,
        })),
        doctorName: p.doctor.user.name,
        validUntil: p.validUntil,
        refillsRemaining: p.refillsRemaining,
        daysUntilExpiry: p.validUntil
          ? Math.ceil((new Date(p.validUntil).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : null,
        urgency: 'suggested' as const,
      })),
      totalReminders:
        filterPending(expiringSoon).length +
        filterPending(expiringThisMonth).length +
        filterPending(needsRefill).length,
    };

    return apiSuccess(reminders);
  } catch (error) {
    console.error('Error getting refill reminders:', error);
    return apiError('Error al obtener recordatorios de recarga', 500);
  }
}
