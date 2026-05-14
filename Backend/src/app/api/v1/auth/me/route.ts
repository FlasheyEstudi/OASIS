// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - GET /api/auth/me
// Get current authenticated user profile with role-specific data
// ═══════════════════════════════════════════════════════════════

import { db } from '@/lib/db';
import { apiSuccess, apiUnauthorized } from '@/lib/api-response';
import { getAuthUserFromHeader } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // ── Authenticate user ──
    const auth = await getAuthUserFromHeader(request);
    if (!auth) {
      return apiUnauthorized('No autenticado');
    }

    // ── Fetch full user profile with role-specific data ──
    const user = await db.user.findUnique({
      where: { id: auth.user.id },
      include: {
        doctor: {
          include: {
            clinic: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                city: true,
                department: true,
              },
            },
          },
        },
        patient: true,
        clinicAdmin: {
          include: {
            clinic: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                city: true,
                department: true,
              },
            },
          },
        },
        receptionist: {
          include: {
            clinic: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                city: true,
                department: true,
              },
            },
          },
        },
        pharmacyAdmin: {
          include: {
            pharmacy: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                city: true,
                department: true,
              },
            },
          },
        },
        pharmacyStaff: {
          include: {
            pharmacy: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                city: true,
                department: true,
              },
            },
          },
        },
        deliveryPerson: true,
      },
    });

    if (!user) {
      return apiUnauthorized('Usuario no encontrado');
    }

    // ── Build clean response without sensitive fields ──
    const { password, refreshToken, resetPasswordToken, resetPasswordExpires, ...safeUser } = user;

    // ── Extract roleProfile to match login structure ──
    let roleProfile: any = null;
    switch (user.role) {
      case 'doctor': roleProfile = user.doctor; break;
      case 'patient': roleProfile = user.patient; break;
      case 'clinic_admin': roleProfile = user.clinicAdmin; break;
      case 'receptionist': roleProfile = user.receptionist; break;
      case 'pharmacy_admin': roleProfile = user.pharmacyAdmin; break;
      case 'pharmacy_staff': roleProfile = user.pharmacyStaff; break;
      case 'delivery_person': roleProfile = user.deliveryPerson; break;
    }

    return apiSuccess({
      user: safeUser,
      roleProfile
    });
  } catch (error) {
    console.error('[AUTH] Me error:', error);
    return apiUnauthorized('Error al obtener perfil');
  }
}
