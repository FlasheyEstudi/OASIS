// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Reviews API Routes
// POST /api/reviews - Create review
// GET /api/reviews - Get reviews for an entity
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiPaginated } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

// Helper: verify patient has interacted with target
async function verifyPatientInteraction(
  patientId: string,
  targetType: string,
  targetId: string
): Promise<boolean> {
  switch (targetType) {
    case 'doctor': {
      // Check if patient has had an appointment with this doctor
      const appointment = await db.appointment.findFirst({
        where: { patientId, doctorId: targetId },
      });
      // Or check if patient is in doctor's patient list
      const doctorPatient = await db.doctorPatient.findFirst({
        where: { patientId, doctorId: targetId },
      });
      return !!(appointment || doctorPatient);
    }
    case 'clinic': {
      // Check if patient has had an appointment at this clinic
      const clinicAppointment = await db.appointment.findFirst({
        where: { patientId, clinicId: targetId },
      });
      return !!clinicAppointment;
    }
    case 'pharmacy': {
      // Check if patient has placed an order with this pharmacy
      const order = await db.order.findFirst({
        where: { patientId, pharmacyId: targetId },
      });
      return !!order;
    }
    case 'delivery_person': {
      // Check if patient has had a delivery from this person
      const delivery = await db.delivery.findFirst({
        where: {
          deliveryPersonId: targetId,
          order: { patientId },
        },
      });
      return !!delivery;
    }
    case 'order': {
      // Check if patient owns this order
      const patientOrder = await db.order.findFirst({
        where: { id: targetId, patientId },
      });
      return !!patientOrder;
    }
    default:
      return false;
  }
}

// Helper: update entity rating after new review
async function updateEntityRating(targetType: string, targetId: string): Promise<void> {
  const reviews = await db.review.findMany({
    where: { targetType, targetId, isActive: true },
    select: { rating: true },
  });

  if (reviews.length === 0) return;

  const totalReviews = reviews.length;
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

  switch (targetType) {
    case 'doctor':
      await db.doctor.update({
        where: { id: targetId },
        data: { rating: Math.round(avgRating * 10) / 10, totalReviews },
      });
      break;
    case 'delivery_person':
      await db.deliveryPerson.update({
        where: { id: targetId },
        data: { rating: Math.round(avgRating * 10) / 10, totalReviews },
      });
      break;
    // clinic, pharmacy, order don't have rating fields in schema
  }
}

// POST /api/reviews - Create review
export async function POST(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();
  if (auth.user.role !== ROLES.PATIENT) return apiForbidden('Solo los pacientes pueden dejar reseñas');

  const body = await request.json();
  const { targetType, targetId, rating, comment } = body;

  // Validate required fields
  if (!targetType || !targetId || !rating) {
    return apiError('targetType, targetId y rating son requeridos');
  }

  const validTargetTypes = ['doctor', 'clinic', 'pharmacy', 'delivery_person', 'order'];
  if (!validTargetTypes.includes(targetType)) {
    return apiError(`targetType inválido. Debe ser: ${validTargetTypes.join(', ')}`);
  }

  if (typeof rating !== 'number' || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return apiError('El rating debe ser un número entero entre 1 y 5');
  }

  if (comment && comment.length > 1000) {
    return apiError('El comentario no puede exceder 1000 caracteres');
  }

  // Get patient profile
  const patient = await db.patient.findUnique({ where: { userId: auth.user.id } });
  if (!patient) return apiError('Perfil de paciente no encontrado', 404);

  // Check for existing review
  const existingReview = await db.review.findFirst({
    where: { patientId: patient.id, targetType, targetId, isActive: true },
  });
  if (existingReview) {
    return apiError('Ya ha dejado una reseña para esta entidad. Puede actualizar la existente.');
  }

  // Verify patient has interacted with target
  const hasInteraction = await verifyPatientInteraction(patient.id, targetType, targetId);
  if (!hasInteraction) {
    return apiError('Debe haber interactuado con esta entidad para dejar una reseña');
  }

  // Create review
  const review = await db.review.create({
    data: {
      patientId: patient.id,
      targetType,
      targetId,
      rating,
      comment: comment || null,
      isActive: true,
    },
    include: {
      patient: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
    },
  });

  // Update entity rating
  await updateEntityRating(targetType, targetId);

  await createAuditLog({
    userId: auth.user.id,
    action: 'create',
    entity: 'Review',
    entityId: review.id,
    newValues: { targetType, targetId, rating },
  });

  return apiSuccess(review, { status: 201 });
}

// GET /api/reviews - Get reviews for an entity
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetType = searchParams.get('targetType') || undefined;
  const targetId = searchParams.get('targetId') || undefined;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  if (!targetType || !targetId) {
    return apiError('targetType y targetId son requeridos');
  }

  const validTargetTypes = ['doctor', 'clinic', 'pharmacy', 'delivery_person', 'order'];
  if (!validTargetTypes.includes(targetType)) {
    return apiError(`targetType inválido. Debe ser: ${validTargetTypes.join(', ')}`);
  }

  const skip = (page - 1) * limit;

  const where = { targetType, targetId, isActive: true };

  const [reviews, total] = await Promise.all([
    db.review.findMany({
      where,
      include: {
        patient: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    db.review.count({ where }),
  ]);

  // Get average rating
  const ratingStats = await db.review.aggregate({
    where,
    _avg: { rating: true },
    _count: { rating: true },
  });

  return apiPaginated(reviews, page, limit, total);
}
