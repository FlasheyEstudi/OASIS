// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - GET /api/patient/loyalty
// Get loyalty points and level
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiUnauthorized } from '@/lib/api-response';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { getLoyaltyLevel } from '@/lib/oasis-utils';

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

    // Calculate current loyalty level from points
    const currentLevel = getLoyaltyLevel(patient.loyaltyPoints);

    // Define level thresholds
    const levels = [
      { name: 'bronce', minPoints: 0, maxPoints: 1999, multiplier: 1 },
      { name: 'plata', minPoints: 2000, maxPoints: 4999, multiplier: 1.5 },
      { name: 'oro', minPoints: 5000, maxPoints: 9999, multiplier: 2 },
      { name: 'diamante', minPoints: 10000, maxPoints: Infinity, multiplier: 3 },
    ];

    const currentLevelInfo = levels.find((l) => l.name === currentLevel) || levels[0];
    const nextLevel = levels.find((l) => l.minPoints > patient.loyaltyPoints);
    const pointsToNextLevel = nextLevel ? nextLevel.minPoints - patient.loyaltyPoints : 0;

    // Get order history for loyalty points context
    const orderStats = await db.order.aggregate({
      where: {
        patientId: patient.id,
        paymentStatus: 'paid',
      },
      _count: true,
      _sum: {
        totalAmount: true,
        loyaltyPointsEarned: true,
      },
    });

    // Update loyalty level if it changed
    if (currentLevel !== patient.loyaltyLevel) {
      await db.patient.update({
        where: { id: patient.id },
        data: { loyaltyLevel: currentLevel },
      });
    }

    const loyaltyData = {
      points: patient.loyaltyPoints,
      level: currentLevel,
      levelInfo: {
        name: currentLevelInfo.name,
        multiplier: currentLevelInfo.multiplier,
        pointsRange: `${currentLevelInfo.minPoints} - ${currentLevelInfo.maxPoints === Infinity ? '∞' : currentLevelInfo.maxPoints}`,
      },
      nextLevel: nextLevel
        ? {
            name: nextLevel.name,
            pointsNeeded: pointsToNextLevel,
            multiplier: nextLevel.multiplier,
          }
        : null,
      stats: {
        totalOrders: orderStats._count,
        totalSpent: orderStats._sum.totalAmount || 0,
        totalPointsEarned: orderStats._sum.loyaltyPointsEarned || 0,
      },
      benefits: getLevelBenefits(currentLevel),
    };

    return apiSuccess(loyaltyData);
  } catch (error) {
    console.error('Error getting loyalty info:', error);
    return apiError('Error al obtener información de lealtad', 500);
  }
}

function getLevelBenefits(level: string): string[] {
  const benefits: Record<string, string[]> = {
    bronce: [
      '1 punto por cada córdoba gastado',
      'Acceso a promociones exclusivas',
    ],
    plata: [
      '1.5 puntos por cada córdoba gastado',
      'Descuento del 5% en medicamentos seleccionados',
      'Envío gratis en pedidos mayores a C$500',
    ],
    oro: [
      '2 puntos por cada córdoba gastado',
      'Descuento del 10% en medicamentos seleccionados',
      'Envío gratis en todos los pedidos',
      'Prioridad en citas médicas',
    ],
    diamante: [
      '3 puntos por cada córdoba gastado',
      'Descuento del 15% en medicamentos seleccionados',
      'Envío gratis en todos los pedidos',
      'Prioridad en citas médicas',
      'Consultas de telemedicina gratuitas',
      'Asesor de salud personalizado',
    ],
  };

  return benefits[level] || benefits.bronce;
}
