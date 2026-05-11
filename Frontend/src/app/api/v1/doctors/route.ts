// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - GET /api/doctors - List doctors (public for patient search)
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiPaginated, apiError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinicId');
    const specialty = searchParams.get('specialty');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: Record<string, unknown> = {
      isActive: true,
    };

    if (clinicId) {
      where.clinicId = clinicId;
    }

    if (specialty) {
      where.specialty = { contains: specialty, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { user: { name: { contains: search } } },
        { specialty: { contains: search } },
        { biography: { contains: search } },
        { licenseNumber: { contains: search } },
      ];
    }

    const [doctors, total] = await Promise.all([
      db.doctor.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              avatarUrl: true,
            },
          },
          clinic: {
            select: {
              id: true,
              name: true,
              city: true,
              department: true,
              address: true,
            },
          },
        },
        orderBy: { rating: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.doctor.count({ where }),
    ]);

    return apiPaginated(doctors, page, limit, total);
  } catch (error) {
    console.error('Error listing doctors:', error);
    return apiError('Error al listar doctores', 500);
  }
}
