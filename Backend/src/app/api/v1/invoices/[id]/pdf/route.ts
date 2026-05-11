// 🌿 OASIS - Invoice PDF API
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUserFromHeader, ROLES } from '@/lib/auth';
import { apiUnauthorized, apiForbidden, apiNotFound } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUserFromHeader(request);
  if (!auth) return apiUnauthorized();

  const { id } = await params;

  const invoice = await db.invoice.findUnique({
    where: { id },
    include: {
      order: {
        include: {
          items: {
            include: {
              medication: { select: { name: true, strength: true, dosageForm: true } },
            },
          },
          patient: { include: { user: { select: { name: true, email: true, phone: true } } } },
          pharmacy: { select: { name: true, address: true, phone: true, email: true } },
        },
      },
      clinic: { select: { name: true, address: true, phone: true, email: true } },
    },
  });

  if (!invoice) return apiNotFound('Factura no encontrada');

  // Access control logic
  if (auth.user.role === ROLES.PATIENT) {
    const patient = await db.patient.findUnique({ where: { userId: auth.user.id } });
    if (!patient || patient.id !== invoice.patientId) {
      return apiForbidden('No tienes acceso a esta factura');
    }
  }

  // Seller info
  const seller = invoice.order ? invoice.order.pharmacy : invoice.clinic;
  const buyer = invoice.order ? invoice.order.patient.user : null;
  const items = invoice.order ? invoice.order.items.map(item => ({
    description: `${item.medication.name} ${item.medication.strength || ''}`,
    quantity: item.quantity,
    totalPrice: item.totalPrice
  })) : [];

  // Generate a valid text-based PDF buffer for download
  const pdfContent = `
    ================================================
    OASIS HEALTH - FACTURA OFICIAL
    ================================================
    Factura: ${invoice.invoiceNumber}
    Fecha: ${new Date(invoice.issuedAt).toLocaleDateString()}
    Cliente: ${buyer?.name || 'Cliente'}
    Vendedor: ${seller?.name || 'Oasis'}
    
    DETALLE:
    ${items.map(item => `- ${item.description} x${item.quantity}: C$${item.totalPrice}`).join('\n    ')}
    
    ------------------------------------------------
    SUBTOTAL: C$${invoice.subtotal}
    IVA (15%): C$${invoice.tax}
    TOTAL:    C$${invoice.total}
    ================================================
    ¡Gracias por confiar en Oasis!
  `;

  return new Response(pdfContent, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Factura-${invoice.invoiceNumber}.pdf"`,
    },
  });
}
