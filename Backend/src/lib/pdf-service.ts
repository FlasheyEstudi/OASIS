import PDFDocument from 'pdfkit';
import { generateSignatureHash } from './oasis-utils';

export interface PrescriptionData {
  id: string;
  date: Date | string;
  diagnosis: string;
  notes?: string;
  doctor: {
    name: string;
    specialty: string;
    license: string;
    clinic: {
      name: string;
      address: string;
      phone: string;
    }
  };
  patient: {
    name: string;
    age: number;
    id: string;
  };
  items: Array<{
    medication: string;
    dosage: string;
    duration: string;
    instructions: string;
    quantity: number;
  }>;
}

export async function generatePrescriptionPDF(data: PrescriptionData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err) => reject(err));

    // Header - Oasis Branding
    doc.fillColor('#0E8C5E').fontSize(24).text('OASIS', { align: 'right' });
    doc.fillColor('#8A8A8A').fontSize(10).text('Tu base de salud', { align: 'right' });
    doc.moveDown();

    // Doctor & Clinic Info
    doc.fillColor('#4A4A4A').fontSize(14).text(data.doctor.name, { underline: true });
    doc.fontSize(10).text(`${data.doctor.specialty} | Lic. ${data.doctor.license}`);
    doc.text(`${data.doctor.clinic.name}`);
    doc.text(`${data.doctor.clinic.address} | Tel: ${data.doctor.clinic.phone}`);
    doc.moveDown();

    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#E0E0E0').stroke();
    doc.moveDown();

    // Patient Info
    doc.fillColor('#0E8C5E').fontSize(12).text('DATOS DEL PACIENTE');
    doc.fillColor('#4A4A4A').fontSize(10);
    doc.text(`Nombre: ${data.patient.name}`);
    doc.text(`Edad: ${data.patient.age} años`);
    doc.text(`Fecha: ${new Date(data.date).toLocaleDateString()}`);
    doc.moveDown();

    // Diagnosis
    doc.fillColor('#0E8C5E').fontSize(12).text('DIAGNÓSTICO');
    doc.fillColor('#4A4A4A').fontSize(10).text(data.diagnosis);
    if (data.notes) {
      doc.fontSize(8).fillColor('#8A8A8A').text(`Notas: ${data.notes}`);
    }
    doc.moveDown();

    // Medications Table
    doc.fillColor('#0E8C5E').fontSize(12).text('INDICACIONES MÉDICAS');
    doc.moveDown(0.5);

    data.items.forEach((item, index) => {
      const y = doc.y;
      doc.fillColor('#4A4A4A').fontSize(11).text(`${index + 1}. ${item.medication}`, 60, y, { bold: true } as any);
      doc.fontSize(10).text(`Dosis: ${item.dosage} | Duración: ${item.duration} | Cant: ${item.quantity}`, 70);
      doc.fontSize(9).fillColor('#8A8A8A').text(`Instrucciones: ${item.instructions}`, 70);
      doc.moveDown();
    });

    // Digital Signature & QR Placeholder (Integration logic)
    const signature = generateSignatureHash(`${data.id}-${data.doctor.license}`);
    
    doc.moveDown(4);
    const bottomY = doc.y;
    
    doc.moveTo(350, bottomY).lineTo(500, bottomY).strokeColor('#4A4A4A').stroke();
    doc.fontSize(8).fillColor('#4A4A4A').text('Firma Digital del Profesional', 350, bottomY + 5, { align: 'center', width: 150 });
    doc.fontSize(7).fillColor('#0E8C5E').text(signature, 350, bottomY + 15, { align: 'center', width: 150 });

    // Footer
    doc.fontSize(8).fillColor('#B0B0B0').text(
      `Documento generado electrónicamente por Oasis Health Platform. ID de Verificación: ${data.id}`,
      50, 750, { align: 'center' }
    );

    doc.info['Producer'] = 'PDFKit';
    doc.info['Creator'] = 'Oasis Platform';

    doc.end();
  });
}

export interface InvoiceData {
  id: string;
  invoiceNumber: string;
  date: Date | string;
  type: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  clinic?: {
    name: string;
    address: string;
    phone: string;
  };
  pharmacy?: {
    name: string;
    address: string;
    phone: string;
  };
  patient: {
    name: string;
    id: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    price: number;
    total: number;
  }>;
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err) => reject(err));

    const provider = data.clinic || data.pharmacy;

    // Header
    doc.fillColor('#0E8C5E').fontSize(24).text('OASIS', { align: 'right' });
    doc.fillColor('#8A8A8A').fontSize(10).text('Factura Electrónica', { align: 'right' });
    doc.moveDown();

    // Provider Info
    if (provider) {
      doc.fillColor('#4A4A4A').fontSize(12).text(provider.name);
      doc.fontSize(9).text(provider.address);
      doc.text(`Tel: ${provider.phone}`);
    }
    doc.moveDown();

    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#E0E0E0').stroke();
    doc.moveDown();

    // Invoice Meta
    doc.fillColor('#0E8C5E').fontSize(12).text(`FACTURA: ${data.invoiceNumber}`);
    doc.fillColor('#4A4A4A').fontSize(10);
    doc.text(`Fecha: ${new Date(data.date).toLocaleString()}`);
    doc.text(`Paciente: ${data.patient.name}`);
    doc.text(`Método de Pago: ${data.paymentMethod.toUpperCase()}`);
    doc.moveDown();

    // Items Header
    const tableTop = doc.y;
    doc.fillColor('#0E8C5E').fontSize(10);
    doc.text('Descripción', 50, tableTop);
    doc.text('Cant', 300, tableTop);
    doc.text('Precio', 380, tableTop);
    doc.text('Total', 480, tableTop);
    
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).strokeColor('#F0F0F0').stroke();
    doc.moveDown();

    // Items
    doc.fillColor('#4A4A4A').fontSize(9);
    data.items.forEach((item) => {
      const y = doc.y;
      doc.text(item.description, 50, y);
      doc.text(item.quantity.toString(), 300, y);
      doc.text(`C$${item.price.toFixed(2)}`, 380, y);
      doc.text(`C$${item.total.toFixed(2)}`, 480, y);
      doc.moveDown(0.5);
    });

    doc.moveDown();
    doc.moveTo(350, doc.y).lineTo(550, doc.y).strokeColor('#E0E0E0').stroke();
    doc.moveDown(0.5);

    // Totals
    const totalsY = doc.y;
    doc.text('Subtotal:', 380, totalsY);
    doc.text(`C$${data.subtotal.toFixed(2)}`, 480, totalsY);
    
    doc.text('Descuento:', 380, totalsY + 15);
    doc.text(`-C$${data.discount.toFixed(2)}`, 480, totalsY + 15);
    
    doc.fontSize(12).fillColor('#0E8C5E').text('TOTAL:', 380, totalsY + 35);
    doc.text(`C$${data.total.toFixed(2)}`, 480, totalsY + 35);

    // Footer
    doc.fontSize(8).fillColor('#B0B0B0').text(
      'Gracias por confiar en Oasis. Esta factura tiene validez legal electrónica.',
      50, 750, { align: 'center' }
    );

    doc.info['Producer'] = 'PDFKit';
    doc.end();
  });
}
