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
    include: {
      doctor: { include: { user: { select: { name: true } } } },
      patient: { include: { user: { select: { name: true, phone: true } } } },
      items: { include: { medication: { select: { name: true } } } },
    }
  });

  if (!prescription) return apiNotFound('Receta no encontrada');

  // Verify access
  if (auth.user.role === ROLES.PATIENT) {
    const patient = await db.patient.findUnique({ where: { userId: auth.user.id } });
    if (!patient || patient.id !== prescription.patientId) {
      return apiForbidden('No tienes acceso a esta receta');
    }
  }

  // Content for the QR: Detailed JSON as requested
  const qrData = {
    code: prescription.verificationCode,
    doctor: prescription.doctor.user.name,
    patient: prescription.patient.user.name,
    medications: prescription.items.map(i => i.medication.name),
    date: prescription.createdAt.toISOString().split('T')[0]
  };
  
  const qrContent = JSON.stringify(qrData);
  
  // Generate real QR code as Base64
  const QRCode = require('qrcode');
  const qrBase64 = await QRCode.toDataURL(qrContent);
  
  return apiSuccess({
    id: prescription.id,
    verificationCode: prescription.verificationCode,
    qrData,
    qrBase64,
  });
}
