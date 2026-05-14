// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - GET /api/prescriptions/[id]/qr - Generate QR Code
// ═══════════════════════════════════════════════════════════════

import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { apiSuccess, apiError, apiNotFound } from '@/lib/api-response';
import QRCode from 'qrcode';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const prescription = await db.prescription.findUnique({
      where: { id },
      select: {
        id: true,
        verificationCode: true,
        status: true,
      },
    });

    if (!prescription) {
      return apiNotFound('Receta no encontrada');
    }

    // El contenido del QR es la URL de validación o el código estructurado
    // En Oasis, usamos el verificationCode para la validación en farmacia
    const qrContent = JSON.stringify({
      type: 'OASIS_RX',
      id: prescription.id,
      code: prescription.verificationCode,
      v: '1.0'
    });

    // Generar QR en Base64
    const qrBase64 = await QRCode.toDataURL(qrContent, {
      errorCorrectionLevel: 'H',
      margin: 1,
      color: {
        dark: '#0E8C5E', // Oasis Green
        light: '#FFFFFF',
      },
      width: 400
    });

    return apiSuccess({
      qrBase64,
      prescriptionId: prescription.id
    });

  } catch (error) {
    console.error('Error generating QR:', error);
    return apiError('Error al generar código QR', 500);
  }
}
