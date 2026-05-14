import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3001', // Local dev backend port if accessed directly
  // 'https://oasis-aura.com', // Producción
];

export function middleware(request: NextRequest) {
  // ── Request ID ──
  const requestId = crypto.randomUUID();
  const origin = request.headers.get('origin');
  const isAllowedOrigin = origin && ALLOWED_ORIGINS.includes(origin);

  // 1. Manejo de Preflight (OPTIONS)
  if (request.method === 'OPTIONS') {
    const preflightHeaders: Record<string, string> = {
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-Family-Member-ID, X-Request-Id',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    };

    if (isAllowedOrigin) {
      preflightHeaders['Access-Control-Allow-Origin'] = origin;
    }

    return new NextResponse(null, {
      status: 204,
      headers: preflightHeaders,
    });
  }

  // 2. Respuesta normal
  const response = NextResponse.next();

  // ── Request ID Header ──
  response.headers.set('X-Request-Id', requestId);

  // ── Headers CORS ──
  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Family-Member-ID, X-Request-Id');
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  // ── Headers de Seguridad ──
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  return response;
}

// Aplicar el middleware a todas las rutas de la API
export const config = {
  matcher: '/api/:path*',
};
