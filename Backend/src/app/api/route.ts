import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import logger from '@/lib/logger';
import pkg from '../../../package.json';

export async function GET() {
  const start = Date.now();
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  
  const checks: any = {
    database: { status: 'down' },
    redis: { status: 'not_configured' },
    firebase: { status: 'not_configured' },
  };

  // ── Database Check ──
  try {
    const dbStart = Date.now();
    await db.$queryRaw`SELECT 1`;
    checks.database = {
      status: 'up',
      latency: `${Date.now() - dbStart}ms`,
    };
  } catch (error) {
    status = 'unhealthy';
    logger.error({ error }, 'Health check: Database down');
  }

  // ── Redis Check (Upstash) ──
  const isRedisConfigured = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
  if (isRedisConfigured) {
    // Note: We don't do a real call here to keep health check ultra-fast, 
    // but in a real prod env we might want to check connectivity.
    checks.redis = { status: 'up' };
  }

  // ── Firebase Check ──
  const isFirebaseConfigured = !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  checks.firebase = {
    status: isFirebaseConfigured ? 'configured' : 'mock',
  };

  return NextResponse.json({
    status,
    version: (pkg as any).version || '1.0.0',
    uptime: process.uptime(),
    checks,
    timestamp: new Date().toISOString(),
    total_latency: `${Date.now() - start}ms`,
  }, {
    status: status === 'unhealthy' ? 503 : 200,
  });
}