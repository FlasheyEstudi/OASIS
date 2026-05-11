// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - POST /api/v1/auth/register
// User registration
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { apiSuccess, apiError } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role } = body;

    if (!email || !password || !name || !role) {
      return apiError('Todos los campos son obligatorios (email, password, name, role)', 400);
    }

    // Verificar si el usuario ya existe
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return apiError('El correo electrónico ya está registrado', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        isActive: true,
        isDemoUser: false
      },
    });

    // Crear perfil según el rol
    if (role === 'patient') {
      await db.patient.create({ data: { userId: user.id } });
    } else if (role === 'doctor') {
      // Nota: Requiere clinicId en producción, aquí usamos uno por defecto o nulo si el esquema lo permite
      // Para este MVP, asumimos que el doctor se asocia luego o se pide clinicId
    }

    const { password: _, ...userWithoutPassword } = user;

    return apiSuccess(userWithoutPassword, { 
      status: 201, 
      message: 'Usuario registrado exitosamente' 
    });

  } catch (error) {
    console.error('Registration error:', error);
    return apiError('Error al registrar usuario', 500);
  }
}
