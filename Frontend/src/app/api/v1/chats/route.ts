// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Chat API Routes
// POST /api/chats - Create/start a chat
// GET /api/chats - List user's chats
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiPaginated } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

// POST /api/chats - Create/start a chat
export async function POST(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();
  if (auth.user.role !== ROLES.PATIENT) return apiForbidden('Solo los pacientes pueden iniciar chats');

  const body = await request.json();
  const { doctorId, pharmacyId, clinicId, type } = body;

  if (!type || !['patient_doctor', 'patient_pharmacy', 'patient_clinic'].includes(type)) {
    return apiError('Tipo de chat inválido. Debe ser: patient_doctor, patient_pharmacy o patient_clinic');
  }

  // Validate that at least one target is specified based on type
  if (type === 'patient_doctor' && !doctorId) {
    return apiError('Se requiere doctorId para chats patient_doctor');
  }
  if (type === 'patient_pharmacy' && !pharmacyId) {
    return apiError('Se requiere pharmacyId para chats patient_pharmacy');
  }
  if (type === 'patient_clinic' && !clinicId) {
    return apiError('Se requiere clinicId para chats patient_clinic');
  }

  // Get patient profile
  const patient = await db.patient.findUnique({ where: { userId: auth.user.id } });
  if (!patient) return apiError('Perfil de paciente no encontrado', 404);

  // Verify target exists
  if (doctorId) {
    const doctor = await db.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) return apiError('Doctor no encontrado', 404);
    if (!doctor.isActive) return apiError('Doctor no está activo');
  }
  if (pharmacyId) {
    const pharmacy = await db.pharmacy.findUnique({ where: { id: pharmacyId } });
    if (!pharmacy) return apiError('Farmacia no encontrada', 404);
    if (!pharmacy.isActive) return apiError('Farmacia no está activa');
  }
  if (clinicId) {
    const clinic = await db.clinic.findUnique({ where: { id: clinicId } });
    if (!clinic) return apiError('Clínica no encontrada', 404);
    if (!clinic.isActive) return apiError('Clínica no está activa');
  }

  // Check for existing active chat with same target
  const existingChat = await db.chat.findFirst({
    where: {
      patientId: patient.id,
      doctorId: doctorId || undefined,
      pharmacyId: pharmacyId || undefined,
      clinicId: clinicId || undefined,
      type,
      status: 'active',
    },
  });

  if (existingChat) {
    // Return existing chat instead of creating duplicate
    const chatWithDetails = await db.chat.findUnique({
      where: { id: existingChat.id },
      include: {
        patient: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
        doctor: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
        pharmacy: { select: { id: true, name: true, logoUrl: true } },
        clinic: { select: { id: true, name: true, logoUrl: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    return apiSuccess(chatWithDetails);
  }

  // Create new chat
  const chat = await db.chat.create({
    data: {
      patientId: patient.id,
      doctorId: doctorId || undefined,
      pharmacyId: pharmacyId || undefined,
      clinicId: clinicId || undefined,
      type,
      status: 'active',
    },
    include: {
      patient: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
      doctor: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
      pharmacy: { select: { id: true, name: true, logoUrl: true } },
      clinic: { select: { id: true, name: true, logoUrl: true } },
      messages: true,
    },
  });

  await createAuditLog({
    userId: auth.user.id,
    action: 'create',
    entity: 'Chat',
    entityId: chat.id,
    newValues: { patientId: patient.id, doctorId, pharmacyId, clinicId, type },
  });

  return apiSuccess(chat, { status: 201 });
}

// GET /api/chats - List user's chats
export async function GET(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const status = searchParams.get('status') || undefined;
  const type = searchParams.get('type') || undefined;

  const skip = (page - 1) * limit;

  let where: Record<string, unknown> = {};

  if (status) where.status = status;
  if (type) where.type = type;

  // Different roles see different chats
  if (auth.user.role === ROLES.PATIENT) {
    const patient = await db.patient.findUnique({ where: { userId: auth.user.id } });
    if (!patient) return apiError('Perfil de paciente no encontrado', 404);
    where.patientId = patient.id;
  } else if (auth.user.role === ROLES.DOCTOR) {
    const doctor = await db.doctor.findUnique({ where: { userId: auth.user.id } });
    if (!doctor) return apiError('Perfil de doctor no encontrado', 404);
    where.doctorId = doctor.id;
  } else if (auth.user.role === ROLES.PHARMACY_ADMIN || auth.user.role === ROLES.PHARMACY_STAFF) {
    // Find pharmacies this user manages/works at
    const pharmacyAdmin = await db.pharmacyAdmin.findUnique({ where: { userId: auth.user.id } });
    const pharmacyStaff = await db.pharmacyStaff.findUnique({ where: { userId: auth.user.id } });
    const pharmacyId = pharmacyAdmin?.pharmacyId || pharmacyStaff?.pharmacyId;
    if (!pharmacyId) return apiError('No tiene farmacia asignada', 404);
    where.pharmacyId = pharmacyId;
  } else if (auth.user.role === ROLES.CLINIC_ADMIN) {
    const clinicAdmin = await db.clinicAdmin.findUnique({ where: { userId: auth.user.id } });
    if (!clinicAdmin) return apiError('No tiene clínica asignada', 404);
    where.clinicId = clinicAdmin.clinicId;
  } else if (auth.user.role === ROLES.SUPERADMIN) {
    // Superadmin can see all chats - no filter
  } else {
    return apiForbidden('No tiene permisos para ver chats');
  }

  const [chats, total] = await Promise.all([
    db.chat.findMany({
      where,
      include: {
        patient: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
        doctor: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
        pharmacy: { select: { id: true, name: true, logoUrl: true } },
        clinic: { select: { id: true, name: true, logoUrl: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
      skip,
      take: limit,
    }),
    db.chat.count({ where }),
  ]);

  // Add unread count for each chat
  const chatsWithUnread = await Promise.all(
    chats.map(async (chat) => {
      let unreadCount = 0;
      if (auth.user.role === ROLES.PATIENT) {
        const patient = await db.patient.findUnique({ where: { userId: auth.user.id } });
        if (patient) {
          unreadCount = await db.message.count({
            where: { chatId: chat.id, senderId: { not: auth.user.id }, isRead: false },
          });
        }
      } else {
        unreadCount = await db.message.count({
          where: { chatId: chat.id, senderId: { not: auth.user.id }, isRead: false },
        });
      }
      return { ...chat, unreadCount };
    })
  );

  return apiPaginated(chatsWithUnread, page, limit, total);
}
