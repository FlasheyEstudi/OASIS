// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - POST /api/v1/auth/login
// Standard login with email and password
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return apiError('Email y contraseña son requeridos', 400);
    }

    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      return apiError('Credenciales inválidas o cuenta desactivada', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return apiError('Credenciales inválidas', 401);
    }

    // Generar tokens
    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Guardar refresh token
    await db.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    const { password: _, refreshToken: __, ...userWithoutPassword } = user;

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
      roleProfile.vehicleType = profile?.vehicleType;
    }

    return apiSuccess({
      accessToken,
      refreshToken,
      user: userWithoutPassword,
      roleProfile,
    }, { message: 'Sesión iniciada correctamente' });

  } catch (error) {
    console.error('Login error:', error);
    return apiError('Error interno en el servidor', 500);
  }
}
