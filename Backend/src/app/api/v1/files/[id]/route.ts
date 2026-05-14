// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - GET /api/v1/files/[id] - Serve binary files from DB
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { getFile } from '@/lib/storage-service';
import { apiNotFound } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const file = await getFile(id);

  if (!file) {
    return apiNotFound('Archivo no encontrado');
  }

  return new NextResponse(file.data, {
    headers: {
      'Content-Type': file.type,
      'Content-Disposition': `inline; filename="${file.name}"`,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
