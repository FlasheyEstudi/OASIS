// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - GET /api/v1/auth/me
// Get current authenticated user
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { getAuthUserFromHeader } from '@/lib/auth';
import { db } from '@/lib/db';
import { apiSuccess, apiUnauthorized } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const user = auth.dbUser!;
  if (!user) return apiUnauthorized();

  // Obtener perfil de rol si aplica
  let roleProfile: any = {};
  if (user.role === 'clinic_admin') {
    const profile = await db.clinicAdmin.findFirst({ where: { userId: user.id } });
    roleProfile.clinicId = profile?.clinicId;
  } else if (user.role === 'doctor') {
    const profile = await db.doctor.findFirst({ where: { userId: user.id } });
    roleProfile.clinicId = profile?.clinicId;
    roleProfile.specialty = profile?.specialty;
  } else if (user.role === 'receptionist') {
    const profile = await db.receptionist.findFirst({ where: { userId: user.id } });
    roleProfile.clinicId = profile?.clinicId;
  } else if (user.role === 'patient') {
    const profile = await db.patient.findFirst({ where: { userId: user.id } });
    roleProfile.loyaltyPoints = profile?.loyaltyPoints;
  } else if (user.role === 'pharmacy_admin' || user.role === 'pharmacy_staff') {
    const profile = await db.pharmacyAdmin.findFirst({ where: { userId: user.id } }) ||
                    await db.pharmacyStaff.findFirst({ where: { userId: user.id } });
    roleProfile.pharmacyId = (profile as any)?.pharmacyId;
  } else if (user.role === 'delivery_person') {
    const profile = await db.deliveryPerson.findFirst({ where: { userId: user.id } });
    if (profile) {
      roleProfile = {
        ...roleProfile,
        id: profile.id,
        vehicleType: profile.vehicleType,
        plateNumber: profile.plateNumber,
        zones: profile.zones,
        rating: profile.rating,
        totalDeliveries: profile.totalReviews, // Mapping for frontend
        isAvailable: profile.isAvailable,
        isVerified: profile.isVerified,
      };
    }
  }

  return apiSuccess({ user, roleProfile }, { message: 'Perfil recuperado correctamente' });
}
