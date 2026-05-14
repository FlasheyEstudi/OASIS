import { jsPDF } from "jspdf";
import "jspdf-autotable";

export const generatePrescriptionPDF = (rx: any) => {
  const doc = new jsPDF();
  
  // Colores Oasis Natural
  const accentColor = [92, 184, 122]; // #5CB87A
  const textColor = [26, 43, 32];    // #1A2B20

  // Header
  doc.setFillColor( accentColor[0], accentColor[1], accentColor[2] );
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("OASIS AURA", 20, 25);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Ecosistema de Salud Digital", 20, 32);

  // Prescription Info
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(18);
  doc.text(`Receta Médica #${rx.verificationCode}`, 20, 55);
  
  doc.setFontSize(10);
  doc.text(`Fecha: ${new Date(rx.date).toLocaleDateString()}`, 20, 65);
  doc.text(`Expira: ${new Date(rx.expirationDate).toLocaleDateString()}`, 20, 70);

  // Doctor Info
  doc.setFont("helvetica", "bold");
  doc.text("Información del Médico", 20, 85);
  doc.setFont("helvetica", "normal");
  doc.text(`Dr. ${rx.doctor.user.name}`, 20, 92);
  doc.text(`Especialidad: ${rx.doctor.specialty}`, 20, 97);
  doc.text(`ID Colegiado: ${rx.doctor.licenseNumber || 'N/A'}`, 20, 102);

  // Patient Info
  doc.setFont("helvetica", "bold");
  doc.text("Información del Paciente", 120, 85);
  doc.setFont("helvetica", "normal");
  doc.text(rx.patient.user.name, 120, 92);
  doc.text(`ID: ${rx.patient.id.slice(0, 8)}`, 120, 97);

  // Items Table
  (doc as any).autoTable({
    startY: 115,
    head: [['Medicamento', 'Dosis', 'Frecuencia', 'Duración']],
    body: rx.items.map((item: any) => [
      item.medication.name,
      item.dosage,
      item.frequency,
      item.duration
    ]),
    headStyles: { fillColor: accentColor },
    alternateRowStyles: { fillColor: [245, 250, 245] },
    margin: { left: 20, right: 20 }
  });

  // Instructions
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFont("helvetica", "bold");
  doc.text("Instrucciones Adicionales:", 20, finalY);
  doc.setFont("helvetica", "normal");
  doc.text(rx.instructions || "Seguir las indicaciones según la dosis especificada.", 20, finalY + 8);

  // QR Placeholder / Verification
  doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.rect(150, finalY, 40, 40);
  doc.setFontSize(8);
  doc.text("ESCÁNEE PARA VERIFICAR", 150, finalY + 45);

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text("Esta receta ha sido generada digitalmente y está firmada electrónicamente.", 20, 280);
  doc.text("Validado por Oasis Aura Network.", 20, 285);

  doc.save(`Receta_${rx.verificationCode}.pdf`);
};
