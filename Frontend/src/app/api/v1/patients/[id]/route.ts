// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - GET/PUT /api/patients/[id]
// GET - Get patient profile
// PUT - Update patient profile (own profile or doctor/clinic_admin)
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
    const auth = await getAuthUserFromHeader(request);
    if (!auth) return apiUnauthorized();

    const { id } = await params;
    const { user } = auth;

    // Find patient
    const patient = await db.patient.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, avatarUrl: true, isActive: true },
        },
        familyMembers: true,
        doctorPatients: {
          include: {
            doctor: {
              include: {
                user: { select: { id: true, name: true } },
              },
            },
          },
        },
        insurances: { where: { isActive: true } },
      },
    });

    if (!patient) return apiNotFound('Paciente no encontrado');

    // Authorization check
    if (user.role === ROLES.PATIENT) {
      if (patient.userId !== user.id) return apiForbidden();
    } else if (user.role === ROLES.DOCTOR) {
      const isAssigned = patient.doctorPatients.some(
        (dp) => dp.doctor.user.id === user.id
      );
      if (!isAssigned) return apiForbidden();
    } else if (user.role === ROLES.CLINIC_ADMIN || user.role === ROLES.RECEPTIONIST) {
      // Can view patients from their clinic - check via appointments
      const clinicAdmin = user.role === ROLES.CLINIC_ADMIN
        ? await db.clinicAdmin.findUnique({ where: { userId: user.id } })
        : await db.receptionist.findUnique({ where: { userId: user.id } });

      if (!clinicAdmin) return apiForbidden();

      const hasAppointment = await db.appointment.findFirst({
        where: { patientId: id, clinicId: clinicAdmin.clinicId },
      });
      if (!hasAppointment) return apiForbidden();
    }
    // superadmin can view any patient

    return apiSuccess(patient);
  } catch (error) {
    console.error('Error getting patient:', error);
    return apiError('Error al obtener perfil del paciente', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthUserFromHeader(request);
    if (!auth) return apiUnauthorized();

    const { id } = await params;
    const { user } = auth;

    // Find patient
    const patient = await db.patient.findUnique({
      where: { id },
    });

    if (!patient) return apiNotFound('Paciente no encontrado');

    // Authorization: patient (own), doctor (assigned), clinic_admin, superadmin
    const isOwnPatient = patient.userId === user.id;
    const isDoctor = user.role === ROLES.DOCTOR;
    const isClinicAdmin = user.role === ROLES.CLINIC_ADMIN;
    const isSuperadmin = user.role === ROLES.SUPERADMIN;

    if (!isOwnPatient && !isSuperadmin) {
      if (isDoctor) {
        const assignment = await db.doctorPatient.findFirst({
          where: { patientId: id, doctor: { userId: user.id } },
        });
        if (!assignment) return apiForbidden();
      } else if (isClinicAdmin) {
        const clinicAdmin = await db.clinicAdmin.findUnique({ where: { userId: user.id } });
        if (!clinicAdmin) return apiForbidden();
        const hasAppointment = await db.appointment.findFirst({
          where: { patientId: id, clinicId: clinicAdmin.clinicId },
        });
        if (!hasAppointment) return apiForbidden();
      } else {
        return apiForbidden();
      }
    }

    const body = await request.json();
    const {
      dateOfBirth,
      gender,
      bloodType,
      allergies,
      chronicConditions,
      emergencyContact,
      address,
      city,
      department,
      latitude,
      longitude,
      insuranceProvider,
      insurancePolicyNumber,
    } = body;

    // Build update data - only include fields that are provided
    const updateData: Record<string, unknown> = {};
    if (dateOfBirth !== undefined) updateData.dateOfBirth = new Date(dateOfBirth);
    if (gender !== undefined) updateData.gender = gender;
    if (bloodType !== undefined) updateData.bloodType = bloodType;
    if (allergies !== undefined) updateData.allergies = typeof allergies === 'string' ? allergies : JSON.stringify(allergies);
    if (chronicConditions !== undefined) updateData.chronicConditions = typeof chronicConditions === 'string' ? chronicConditions : JSON.stringify(chronicConditions);
    if (emergencyContact !== undefined) updateData.emergencyContact = typeof emergencyContact === 'string' ? emergencyContact : JSON.stringify(emergencyContact);
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (department !== undefined) updateData.department = department;
    if (latitude !== undefined) updateData.latitude = parseFloat(latitude);
    if (longitude !== undefined) updateData.longitude = parseFloat(longitude);
    if (insuranceProvider !== undefined) updateData.insuranceProvider = insuranceProvider;
    if (insurancePolicyNumber !== undefined) updateData.insurancePolicyNumber = insurancePolicyNumber;

    const updatedPatient = await db.patient.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, avatarUrl: true },
        },
      },
    });

    // Audit log
    await createAuditLog({
      userId: user.id,
      action: 'update',
      entity: 'Patient',
      entityId: id,
      oldValues: patient as unknown as Record<string, unknown>,
      newValues: updateData,
    });

    return apiSuccess(updatedPatient);
  } catch (error) {
    console.error('Error updating patient:', error);
    return apiError('Error al actualizar perfil del paciente', 500);
  }
}
