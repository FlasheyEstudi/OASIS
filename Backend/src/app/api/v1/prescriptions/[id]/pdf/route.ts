// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - GET /api/prescriptions/[id]/pdf - Download Prescription
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { apiNotFound, apiError } from '@/lib/api-response';
import { generatePrescriptionPDF } from '@/lib/pdf-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const prescription = await db.prescription.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            medication: true,
          },
        },
        patient: {
          include: {
            user: true,
          },
        },
        doctor: {
          include: {
            user: true,
            clinic: true,
          },
        },
      },
    });

    if (!prescription) {
      return apiNotFound('Receta no encontrada');
    }

    // Preparar datos para el generador de PDF
    const pdfData = {
      id: prescription.id,
      date: prescription.createdAt,
      diagnosis: prescription.diagnosis || 'Consulta General',
      notes: prescription.notes || '',
      doctor: {
        name: prescription.doctor.user.name,
        specialty: prescription.doctor.specialty,
        license: prescription.doctor.licenseNumber,
        clinic: {
          name: prescription.doctor.clinic.name,
          address: prescription.doctor.clinic.address || '',
          phone: prescription.doctor.clinic.phone || '',
        }
      },
      patient: {
        name: prescription.patient.user.name,
        age: 30, // En un sistema real esto se calcula de la fecha de nacimiento
        id: prescription.patient.id,
      },
      items: prescription.items.map((item) => ({
        medication: item.medication.name,
        dosage: item.dosage,
        duration: item.duration || '',
        instructions: item.instructions || '',
        quantity: item.quantity,
      })),
    };

    const pdfBuffer = await generatePrescriptionPDF(pdfData);

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="receta-${id.substring(0, 8)}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Error generating Prescription PDF:', error);
    return apiError('Error al generar el documento PDF', 500);
  }
}
