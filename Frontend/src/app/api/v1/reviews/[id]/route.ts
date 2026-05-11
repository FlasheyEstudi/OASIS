// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Review Detail API Routes
// GET /api/reviews/[id] - Get review detail
// PUT /api/reviews/[id] - Update review (own review only)
// DELETE /api/reviews/[id] - Delete review (own review or superadmin)
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { createAuditLog } from '@/lib/oasis-utils';

// Helper: update entity rating after review change
async function updateEntityRating(targetType: string, targetId: string): Promise<void> {
  const reviews = await db.review.findMany({
    where: { targetType, targetId, isActive: true },
    select: { rating: true },
  });

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;

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
  }
}

// GET /api/reviews/[id] - Get review detail
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const review = await db.review.findUnique({
    where: { id },
    include: {
      patient: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
    },
  });

  if (!review) return apiNotFound('Reseña no encontrada');
  if (!review.isActive) return apiNotFound('Reseña no encontrada');

  return apiSuccess(review);
}

// PUT /api/reviews/[id] - Update review (own review only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { id } = await params;

  const review = await db.review.findUnique({ where: { id } });
  if (!review) return apiNotFound('Reseña no encontrada');
  if (!review.isActive) return apiNotFound('Reseña no encontrada');

  // Verify ownership
  const patient = await db.patient.findUnique({ where: { userId: auth.user.id } });
  if (!patient || patient.id !== review.patientId) {
    return apiForbidden('Solo puede actualizar sus propias reseñas');
  }

  const body = await request.json();
  const { rating, comment } = body;

  if (rating !== undefined) {
    if (typeof rating !== 'number' || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return apiError('El rating debe ser un número entero entre 1 y 5');
    }
  }

  if (comment !== undefined && comment !== null && comment.length > 1000) {
    return apiError('El comentario no puede exceder 1000 caracteres');
  }

  const oldValues = { rating: review.rating, comment: review.comment };

  const updated = await db.review.update({
    where: { id },
    data: {
      ...(rating !== undefined && { rating }),
      ...(comment !== undefined && { comment }),
    },
    include: {
      patient: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
    },
  });

  // Recalculate entity rating
  await updateEntityRating(review.targetType, review.targetId);

  await createAuditLog({
    userId: auth.user.id,
    action: 'update',
    entity: 'Review',
    entityId: id,
    oldValues,
    newValues: { rating: rating ?? review.rating, comment: comment ?? review.comment },
  });

  return apiSuccess(updated);
}

// DELETE /api/reviews/[id] - Delete review (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { id } = await params;

  const review = await db.review.findUnique({ where: { id } });
  if (!review) return apiNotFound('Reseña no encontrada');

  // Verify ownership or superadmin
  const isOwner = await (async () => {
    if (auth.user.role === ROLES.SUPERADMIN) return true;
    const patient = await db.patient.findUnique({ where: { userId: auth.user.id } });
    return patient?.id === review.patientId;
  })();

  if (!isOwner) return apiForbidden('Solo puede eliminar sus propias reseñas');

  // Soft delete
  const deleted = await db.review.update({
    where: { id },
    data: { isActive: false },
  });

  // Recalculate entity rating
  await updateEntityRating(review.targetType, review.targetId);

  await createAuditLog({
    userId: auth.user.id,
    action: 'delete',
    entity: 'Review',
    entityId: id,
    oldValues: { rating: review.rating, targetType: review.targetType, targetId: review.targetId },
  });

  return apiSuccess({ message: 'Reseña eliminada exitosamente' });
}
