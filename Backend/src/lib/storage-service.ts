// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Storage Service (MVP: BYTEA in DB)
// ═══════════════════════════════════════════════════════════════

import { db } from './db';

export async function uploadFile(name: string, type: string, buffer: Buffer): Promise<string> {
  const file = await db.file.create({
    data: {
      name,
      type,
      data: buffer as any,
    },
  });

  // En el MVP, la URL apunta a nuestro propio endpoint de archivos
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  return `${baseUrl}/files/${file.id}`;
}

export async function getFile(id: string) {
  return await db.file.findUnique({
    where: { id },
  });
}

export async function deleteFile(id: string) {
  return await db.file.delete({
    where: { id },
  });
}
