// 🌿 OASIS - Chat Messages API
// GET /api/v1/chat/messages?chatId=xxx
// POST /api/v1/chat/messages
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUserFromHeader } from '@/lib/auth';
import { apiSuccess, apiUnauthorized } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');

  if (!chatId) {
    // Return conversation list
    const conversations = [
       { id: '1', name: 'Dr. Carlos Ruiz', lastMsg: 'Tratamiento finalizado.', time: '10:30 AM', initials: 'CR' },
       { id: '2', name: 'Dra. María Martínez', lastMsg: 'Resultados listos.', time: 'Ayer', initials: 'MM' },
    ];
    return apiSuccess(conversations);
  }

  // In a real schema, we'd query a Message model. 
  // We'll return the initial messages + any stored in a temporary mock storage or just the defaults.
  const messages = [
    { from: 'doctor', text: 'Hola, ¿cómo has seguido con el tratamiento?', time: '09:00' },
    { from: 'patient', text: 'Mejor doctor, gracias.', time: '09:05' },
  ];

  return apiSuccess(messages);
}

export async function POST(request: NextRequest) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const body = await request.json();
  const { chatId, text, from } = body;

  // Store message in DB (if model exists)
  console.log(`[CHAT] Message in ${chatId} from ${from}: ${text}`);

  return apiSuccess({ success: true, timestamp: new Date() });
}
