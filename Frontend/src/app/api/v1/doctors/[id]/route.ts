// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - GET/PUT /api/doctors/[id] - Doctor profile
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const doctor = await db.doctor.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        clinic: {
          select: {
            id: true,
            name: true,
            city: true,
            department: true,
            address: true,
            phone: true,
          },
        },
      },
    });

    if (!doctor || !doctor.isActive) {
      return apiNotFound('Doctor no encontrado');
    }

    // Get doctor's reviews for rating details
    const reviews = await db.review.findMany({
      where: {
        targetType: 'doctor',
        targetId: id,
        isActive: true,
      },
      select: {
        rating: true,
        comment: true,
        createdAt: true,
        patient: {
          select: {
            id: true,
            user: {
              select: { name: true, avatarUrl: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Parse schedule JSON
    let schedule = null;
    if (doctor.schedule) {
      try {
        schedule = JSON.parse(doctor.schedule);
      } catch {
        schedule = doctor.schedule;
      }
    }

    return apiSuccess({
      ...doctor,
      schedule,
      reviews,
    });
  } catch (error) {
    console.error('Error getting doctor:', error);
    return apiError('Error al obtener doctor', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await getAuthUserFromHeader(request);

    if (!auth) {
      return apiUnauthorized();
    }

    const doctor = await db.doctor.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!doctor) {
      return apiNotFound('Doctor no encontrado');
    }

    // Only the doctor themselves or superadmin can update
    const isOwnProfile = doctor.userId === auth.user.id;
    const isSuperadmin = auth.user.role === ROLES.SUPERADMIN;

    if (!isOwnProfile && !isSuperadmin) {
      return apiForbidden('Solo el doctor o un superadmin puede actualizar este perfil');
    }

    const body = await request.json();
    const { specialty, biography, consultationFee, schedule, licenseNumber, isActive } = body;

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (specialty !== undefined) updateData.specialty = specialty;
    if (biography !== undefined) updateData.biography = biography;
    if (consultationFee !== undefined) updateData.consultationFee = consultationFee;
    if (licenseNumber !== undefined) updateData.licenseNumber = licenseNumber;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (schedule !== undefined) {
      updateData.schedule = typeof schedule === 'string' ? schedule : JSON.stringify(schedule);
    }

    const oldDoctor = { ...doctor };

    const updatedDoctor = await db.doctor.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        clinic: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    await createAuditLog({
      userId: auth.user.id,
      clinicId: doctor.clinicId,
      action: 'update',
      entity: 'Doctor',
      entityId: id,
      oldValues: oldDoctor,
      newValues: updateData,
    });

    return apiSuccess(updatedDoctor);
  } catch (error) {
    console.error('Error updating doctor:', error);
    return apiError('Error al actualizar doctor', 500);
  }
}
