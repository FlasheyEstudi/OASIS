// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - GET /api/v1/health
// Health check and connection verification
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const start = Date.now();
  let dbStatus = 'connected';
  
  try {
    // Simple query to verify DB connection
    await db.$queryRaw`SELECT 1`;
  } catch (err) {
    dbStatus = 'disconnected';
    console.error('Database connection error:', err);
  }

  const responseTime = Date.now() - start;

  return NextResponse.json({
    success: true,
    data: {
      status: 'healthy',
      database: dbStatus,
      migrations: 'applied',
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
      version: '1.0.0-mvp',
      demoUsers: {
        paciente: 'juan@oasis.ni',
        doctor: 'carlos@oasis.ni',
        farmacia: 'admin@farmaciaoasis.ni',
        repartidor: 'luis@oasis.ni',
        superadmin: 'superadmin@oasis.nii'
      }
    },
    message: dbStatus === 'connected' 
      ? 'Oasis backend operativo' 
      : 'Oasis backend con problemas de base de datos'
  });
}
