// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Prescription QR API
// GET /api/prescriptions/[id]/qr - Get QR code for a prescription
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { apiSuccess, apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { id } = await params;

  const prescription = await db.prescription.findUnique({
    where: { id },
  });

  if (!prescription) return apiNotFound('Receta no encontrada');

  // Verify access (patient only or doctor/admin)
  if (auth.user.role === ROLES.PATIENT) {
    const patient = await db.patient.findUnique({ where: { userId: auth.user.id } });
    if (!patient || patient.id !== prescription.patientId) {
      return apiForbidden('No tienes acceso a esta receta');
    }
  }

  // Content for the QR: Verification code or deep link
  const qrContent = `oasis://verify/${prescription.verificationCode}`;
  
  // For MVP, return the content and a base64 simulation
  // In production, would use 'qrcode' library to generate PNG
  return apiSuccess({
    id: prescription.id,
    verificationCode: prescription.verificationCode,
    qrContent,
    qrBase64: `data:image/png;base64,SIMULATED_QR_FOR_${prescription.verificationCode}`,
    note: 'En producción, qrBase64 contendría la imagen real generada por la librería qrcode.'
  });
}
