// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - GET /api/invoices/[id]/pdf - Download Invoice
// ═══════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { apiNotFound, apiError } from '@/lib/api-response';
import { generateInvoicePDF } from '@/lib/pdf-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const invoice = await db.invoice.findUnique({
      where: { id },
      include: {
        patient: { include: { user: true } },
        order: { include: { pharmacy: true, items: { include: { medication: true } } } },
        appointment: { include: { clinic: true, service: true } },
      } as any, // Cast to any to avoid temporary sync issues with generated types
    });

    if (!invoice) {
      return apiNotFound('Factura no encontrada');
    }

    // Cast as any to access the relations we included
    const inv = invoice as any;

    // Preparar datos para el generador de PDF
    const pdfData: any = {
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      date: inv.issuedAt,
      type: inv.type,
      subtotal: inv.subtotal,
      tax: inv.tax,
      discount: inv.discount,
      total: inv.total,
      paymentMethod: inv.paymentMethod,
      patient: {
        name: inv.patient?.user?.name || 'Paciente',
        id: inv.patientId,
      },
      items: [],
    };

    if (inv.order) {
      pdfData.pharmacy = {
        name: inv.order.pharmacy.name,
        address: inv.order.pharmacy.address,
        phone: inv.order.pharmacy.phone,
      };
      pdfData.items = inv.order.items.map((item: any) => ({
        description: item.medication.name,
        quantity: item.quantity,
        price: item.priceAtSale || 0,
        total: (item.priceAtSale || 0) * item.quantity,
      }));
    } else if (inv.appointment) {
      pdfData.clinic = {
        name: inv.appointment.clinic.name,
        address: inv.appointment.clinic.address,
        phone: inv.appointment.clinic.phone,
      };
      pdfData.items = [{
        description: inv.appointment.service?.name || 'Consulta Médica',
        quantity: 1,
        price: inv.total,
        total: inv.total,
      }];
    }

    const pdfBuffer = await generateInvoicePDF(pdfData);

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="factura-${inv.invoiceNumber}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Error generating Invoice PDF:', error);
    return apiError('Error al generar el documento PDF', 500);
  }
}
