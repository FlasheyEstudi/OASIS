// ═══════════════════════════════════════════════════════════════
// OASIS - Respuestas API estandarizadas con logging en espanol
// ═══════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

interface ApiResponseOptions {
  status?: number;
  meta?: Record<string, unknown>;
}

// Logging en espanol para la terminal
function logApi(status: number, message: string, details?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  const level = status >= 500 ? 'ERROR' : status >= 400 ? 'AVISO' : 'INFO';
  const prefix = status >= 500 ? '[ERROR]' : status >= 400 ? '[AVISO]' : '[OK]';
  if (status >= 400) {
    console.log(`${prefix} ${timestamp} | ${status} | ${message}${details ? ' | ' + JSON.stringify(details) : ''}`);
  }
}

export function apiSuccess<T>(data: T, options?: ApiResponseOptions & { message?: string }): NextResponse {
  const response = NextResponse.json(
    {
      success: true,
      data,
      message: options?.message || 'Operación exitosa',
      ...(options?.meta && { meta: options.meta }),
    },
    { status: options?.status || 200 }
  );

  // Inyectar CORS manualmente como respaldo
  response.headers.set('Access-Control-Allow-Origin', FRONTEND_URL);
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return response;
}

export function apiError(message: string, status: number = 400, details?: Record<string, unknown>): NextResponse {
  logApi(status, message, details);
  const response = NextResponse.json(
    {
      success: false,
      message: message,
      error: message, // Backward compatibility
      ...(details && { details }),
    },
    { status }
  );

  response.headers.set('Access-Control-Allow-Origin', FRONTEND_URL);
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  
  return response;
}

export function apiUnauthorized(message: string = 'No autenticado'): NextResponse {
  logApi(401, message);
  return apiError(message, 401);
}

export function apiForbidden(message: string = 'No autorizado para esta accion'): NextResponse {
  logApi(403, message);
  return apiError(message, 403);
}

export function apiNotFound(message: string = 'Recurso no encontrado'): NextResponse {
  logApi(404, message);
  return apiError(message, 404);
}

export function apiValidation(message: string, fields?: Record<string, string>): NextResponse {
  logApi(422, message, fields as Record<string, unknown>);
  return apiError(message, 422, { fields });
}

export function apiPaginated<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  });
}
