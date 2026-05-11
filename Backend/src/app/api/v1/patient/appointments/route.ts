// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - GET/POST /api/patient/appointments
// GET - List patient's appointments
// POST - Book appointment
// Body: { clinicId, doctorId, serviceId?, date, startTime, endTime, type, familyMemberId? }
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiPaginated } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthUserFromHeader(request);
    if (!auth) return apiUnauthorized();

    const { user } = auth;

    if (user.role !== ROLES.PATIENT && user.role !== ROLES.SUPERADMIN && user.role !== ROLES.DOCTOR) {
      return apiError('No autorizado', 403);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    let patientId: string | undefined;

    if (user.role === ROLES.PATIENT) {
      const patient = await db.patient.findUnique({ where: { userId: user.id } });
      if (!patient) return apiError('Perfil de paciente no encontrado', 404);
      patientId = patient.id;
    } else if (user.role === ROLES.DOCTOR) {
      const queryPatientId = searchParams.get('patientId');
      if (!queryPatientId) return apiError('patientId es requerido para doctores', 422);
      const assignment = await db.doctorPatient.findFirst({
        where: { patientId: queryPatientId, doctor: { userId: user.id } },
      });
      if (!assignment) return apiError('No autorizado', 403);
      patientId = queryPatientId;
    } else {
      patientId = searchParams.get('patientId') || undefined;
    }

    const where: Record<string, unknown> = {};
    if (patientId) where.patientId = patientId;
    if (status) where.status = status;

    const [appointments, total] = await Promise.all([
      db.appointment.findMany({
        where,
        skip,
        take: limit,
        include: {
          doctor: {
            include: {
              user: { select: { id: true, name: true } },
            },
          },
          clinic: { select: { id: true, name: true, address: true, city: true } },
          service: { select: { id: true, name: true, price: true, duration: true } },
          invoice: { select: { id: true, total: true, paymentStatus: true } },
        },
        orderBy: { date: 'desc' },
      }),
      db.appointment.count({ where }),
    ]);

    return apiPaginated(appointments, page, limit, total);
  } catch (error) {
    console.error('Error listing appointments:', error);
    return apiError('Error al listar citas', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthUserFromHeader(request);
    if (!auth) return apiUnauthorized();

    const { user } = auth;

    if (user.role !== ROLES.PATIENT && user.role !== ROLES.SUPERADMIN) {
      return apiError('Solo los pacientes pueden agendar citas', 403);
    }

    const patient = await db.patient.findUnique({
      where: { userId: user.id },
    });

    if (!patient) return apiError('Perfil de paciente no encontrado', 404);

    const body = await request.json();
    const {
      clinicId,
      doctorId,
      serviceId,
      date,
      startTime,
      endTime,
      type,
      familyMemberId,
      notes,
    } = body;

    // Validate required fields
    if (!clinicId || !doctorId || !date || !startTime || !endTime) {
      return apiError('clinicId, doctorId, date, startTime y endTime son requeridos', 422);
    }

    // Verify clinic exists and is active
    const clinic = await db.clinic.findUnique({ where: { id: clinicId } });
    if (!clinic || !clinic.isActive) {
      return apiError('Clínica no encontrada o inactiva', 404);
    }

    // Verify doctor exists, is active, and belongs to the clinic
    const doctor = await db.doctor.findUnique({
      where: { id: doctorId },
    });
    if (!doctor || !doctor.isActive) {
      return apiError('Doctor no encontrado o inactivo', 404);
    }
    if (doctor.clinicId !== clinicId) {
      return apiError('El doctor no pertenece a esta clínica', 400);
    }

    // Verify service if provided
    if (serviceId) {
      const service = await db.service.findUnique({ where: { id: serviceId } });
      if (!service || service.clinicId !== clinicId) {
        return apiError('Servicio no encontrado o no pertenece a esta clínica', 404);
      }
    }

    // Verify family member if provided
    if (familyMemberId) {
      const familyMember = await db.familyMember.findUnique({
        where: { id: familyMemberId },
      });
      if (!familyMember || familyMember.patientId !== patient.id) {
        return apiError('Familiar no encontrado', 404);
      }
    }

    // Check for scheduling conflicts
    const appointmentDate = new Date(date);
    const conflict = await db.appointment.findFirst({
      where: {
        doctorId,
        date: appointmentDate,
        startTime,
        status: { in: ['scheduled', 'confirmed'] },
      },
    });

    if (conflict) {
      return apiError('El doctor ya tiene una cita en ese horario', 409);
    }

    // Create appointment
    const appointment = await db.appointment.create({
      data: {
        clinicId,
        doctorId,
        patientId: patient.id,
        serviceId: serviceId || null,
        familyMemberId: familyMemberId || null,
        date: appointmentDate,
        startTime,
        endTime,
        type: type || 'presencial',
        status: 'scheduled',
        notes: notes || null,
      },
      include: {
        doctor: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
        clinic: { select: { id: true, name: true, address: true, city: true } },
        service: { select: { id: true, name: true, price: true, duration: true } },
      },
    });

    // Ensure doctor-patient relationship exists
    await db.doctorPatient.upsert({
      where: {
        doctorId_patientId: {
          doctorId,
          patientId: patient.id,
        },
      },
      create: {
        doctorId,
        patientId: patient.id,
      },
      update: {},
    });

    // Notify doctor
    await db.notification.create({
      data: {
        userId: doctor.userId,
        title: 'Nueva cita agendada',
        message: `Nueva cita el ${appointmentDate.toLocaleDateString('es-NI')} de ${startTime} a ${endTime}`,
        type: 'appointment',
        data: JSON.stringify({
          appointmentId: appointment.id,
          patientId: patient.id,
          patientName: (await db.user.findUnique({ where: { id: user.id } }))?.name,
        }),
        sentVia: 'in_app',
      },
    });

    // Audit log
    await createAuditLog({
      userId: user.id,
      clinicId,
      action: 'create',
      entity: 'Appointment',
      entityId: appointment.id,
      newValues: {
        clinicId,
        doctorId,
        patientId: patient.id,
        date: appointmentDate,
        startTime,
        endTime,
        type: type || 'presencial',
      },
    });

    return apiSuccess(appointment, { status: 201 });
  } catch (error) {
    console.error('Error booking appointment:', error);
    return apiError('Error al agendar cita', 500);
  }
}
