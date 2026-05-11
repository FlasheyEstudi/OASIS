// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Seed de Datos de Prueba
// Ejecutar con: bun run prisma/seed.ts
// ═══════════════════════════════════════════════════════════════

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Sembrando datos de prueba para Oasis...\n');

  // Limpiar datos existentes
  await prisma.paymentTransaction.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.review.deleteMany();
  await prisma.returnRequest.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.prescriptionItem.deleteMany();
  await prisma.refillRequest.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.service.deleteMany();
  await prisma.promotionItem.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.inventoryBatch.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.insurance.deleteMany();
  await prisma.familyMember.deleteMany();
  await prisma.doctorPatient.deleteMany();
  await prisma.pharmacyStaff.deleteMany();
  await prisma.pharmacyAdmin.deleteMany();
  await prisma.receptionist.deleteMany();
  await prisma.clinicAdmin.deleteMany();
  await prisma.deliveryPerson.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.medication.deleteMany();
  await prisma.pharmacy.deleteMany();
  await prisma.clinic.deleteMany();
  await prisma.user.deleteMany();

  const hashPassword = async (pw: string) => bcrypt.hash(pw, 12);
  const demoPassword = await hashPassword('Demo2025!');

  // ── SUPERADMIN ─────────────────────────────────────────────
  console.log('👤 Creando Superadmin...');
  const superadminUser = await prisma.user.create({
    data: {
      email: 'superadmin@oasis.nii',
      password: await hashPassword('Oasis2025!'),
      name: 'Admin Oasis',
      phone: '+50588880000',
      role: 'superadmin',
      isActive: true,
      isDemoUser: true,
    },
  });

  // ── CLÍNICA ────────────────────────────────────────────────
  console.log('🏥 Creando Clínica...');
  const clinic = await prisma.clinic.create({
    data: {
      name: 'Clínica Oasis Demo',
      description: 'Clínica general con múltiples especialidades en Managua',
      phone: '+50522223333',
      email: 'info@clinicademo.nii',
      address: 'Rotonda Rubén Darío, 200m al sur',
      city: 'Managua',
      department: 'Managua',
      latitude: 12.1149,
      longitude: -86.2714,
      settings: JSON.stringify({ telemedicine_enabled: true, currency: 'NIO' }),
    },
  });

  // Clinic Admin
  const clinicAdminUser = await prisma.user.create({
    data: {
      email: 'admin@clinicademo.nii',
      password: demoPassword,
      name: 'Admin Clínica Demo',
      phone: '+50587771111',
      role: 'clinic_admin',
      isActive: true,
      isDemoUser: true,
    },
  });
  await prisma.clinicAdmin.create({
    data: { userId: clinicAdminUser.id, clinicId: clinic.id },
  });

  // Recepcionista
  const receptionistUser = await prisma.user.create({
    data: {
      email: 'recepcion@clinicademo.nii',
      password: demoPassword,
      name: 'Ana Reyes (Demo)',
      phone: '+50587772222',
      role: 'receptionist',
      isActive: true,
      isDemoUser: true,
    },
  });
  await prisma.receptionist.create({
    data: { userId: receptionistUser.id, clinicId: clinic.id },
  });

  // Servicios
  const consultaGeneral = await prisma.service.create({
    data: { clinicId: clinic.id, name: 'Consulta General', duration: 30, price: 800 },
  });
  const pediatria = await prisma.service.create({
    data: { clinicId: clinic.id, name: 'Pediatría', duration: 30, price: 1000 },
  });

  // Doctores
  console.log('🩺 Creando Doctores...');
  const doctor1User = await prisma.user.create({
    data: {
      email: 'carlos@oasis.ni',
      password: demoPassword,
      name: 'Dr. Carlos López',
      phone: '+50587773333',
      role: 'doctor',
      isActive: true,
      isDemoUser: true,
    },
  });
  const doctor1 = await prisma.doctor.create({
    data: {
      userId: doctor1User.id,
      clinicId: clinic.id,
      specialty: 'Medicina General',
      licenseNumber: 'DEMO-001',
      consultationFee: 800,
      schedule: JSON.stringify({ lunes: { start: '08:00', end: '17:00' } }),
      rating: 4.8,
    },
  });

  const doctor2User = await prisma.user.create({
    data: {
      email: 'maria@oasis.ni',
      password: demoPassword,
      name: 'Dra. María González',
      phone: '+50587774444',
      role: 'doctor',
      isActive: true,
      isDemoUser: true,
    },
  });
  const doctor2 = await prisma.doctor.create({
    data: {
      userId: doctor2User.id,
      clinicId: clinic.id,
      specialty: 'Pediatría',
      licenseNumber: 'DEMO-002',
      consultationFee: 1000,
      schedule: JSON.stringify({ martes: { start: '09:00', end: '17:00' } }),
      rating: 4.9,
    },
  });

  // ── FARMACIA ───────────────────────────────────────────────
  console.log('💊 Creando Farmacia...');
  const pharmacy = await prisma.pharmacy.create({
    data: {
      name: 'Farmacia Oasis Demo',
      address: 'Centro Comercial Managua, Local 12',
      city: 'Managua',
      department: 'Managua',
      latitude: 12.1364,
      longitude: -86.2514,
    },
  });

  const pharmAdminUser = await prisma.user.create({
    data: {
      email: 'admin@farmaciaoasis.ni',
      password: demoPassword,
      name: 'Admin Farmacia Demo',
      role: 'pharmacy_admin',
      isActive: true,
      isDemoUser: true,
    },
  });
  await prisma.pharmacyAdmin.create({
    data: { userId: pharmAdminUser.id, pharmacyId: pharmacy.id },
  });

  // ── PACIENTES ──────────────────────────────────────────────
  console.log('🧍 Creando Pacientes...');
  const patient1User = await prisma.user.create({
    data: {
      email: 'juan@oasis.ni',
      password: demoPassword,
      name: 'Juan Pérez',
      role: 'patient',
      isActive: true,
      isDemoUser: true,
    },
  });
  const patient1 = await prisma.patient.create({
    data: {
      userId: patient1User.id,
      bloodType: 'O+',
      allergies: JSON.stringify(['penicilina']),
      chronicConditions: JSON.stringify(['hipertensión arterial']),
    },
  });

  const patient2User = await prisma.user.create({
    data: {
      email: 'ana@oasis.ni',
      password: demoPassword,
      name: 'Ana Martínez',
      role: 'patient',
      isActive: true,
      isDemoUser: true,
    },
  });
  const patient2 = await prisma.patient.create({
    data: {
      userId: patient2User.id,
    },
  });
  await prisma.familyMember.create({
    data: {
      patientId: patient2.id,
      name: 'Hijo de Ana',
      relationship: 'hijo',
    },
  });

  // ── REPARTIDOR ─────────────────────────────────────────────
  const deliveryUser = await prisma.user.create({
    data: {
      email: 'luis@oasis.ni',
      password: demoPassword,
      name: 'Luis Rojas',
      role: 'delivery_person',
      isActive: true,
      isDemoUser: true,
    },
  });
  await prisma.deliveryPerson.create({
    data: {
      userId: deliveryUser.id,
      vehicleType: 'moto',
      isAvailable: true,
      isVerified: true,
    },
  });

  // ── MEDICAMENTOS ───────────────────────────────────────────
  const medNames = ['Paracetamol', 'Ibuprofeno', 'Amoxicilina', 'Loratadina', 'Metformina'];
  for (const name of medNames) {
    const med = await prisma.medication.create({
      data: { name, category: 'General', requiresPrescription: name === 'Amoxicilina' },
    });
    await prisma.inventoryBatch.create({
      data: {
        pharmacyId: pharmacy.id,
        medicationId: med.id,
        batchNumber: `DEMO-${name.toUpperCase()}`,
        quantity: 50,
        expiryDate: new Date('2026-12-31'),
        costPrice: 20,
        sellingPrice: 35,
      },
    });
  }

  console.log('\n✅ ¡Seed DEMO completado exitosamente!\n');
  console.log('══════════════════════════════════════════════════════════════');
  console.log('🔑 CUENTAS DE PRUEBA:');
  console.log('══════════════════════════════════════════════════════════════');
  console.log('Superadmin:      superadmin@oasis.nii       / Oasis2025!');
  console.log('Clínica Admin:   admin@santamaria.nii        / Clinic2025!');
  console.log('Recepcionista:   recepcion@santamaria.nii    / Recep2025!');
  console.log('Doctor 1:        dr.garcia@santamaria.nii    / Doctor2025!');
  console.log('Doctor 2:        dra.martinez@santamaria.nii / Doctor2025!');
  console.log('Paciente 1:      carlos@email.com            / Patient2025!');
  console.log('Paciente 2:      lucia@email.com             / Patient2025!');
  console.log('Farmacia Admin:  admin@farmaciacentral.nii   / Pharmacy2025!');
  console.log('Farmacia Staff:  vendedor@farmaciacentral.nii / Staff2025!');
  console.log('Repartidor 1:    repartidor1@oasis.nii       / Delivery2025!');
  console.log('Repartidor 2:    repartidor2@oasis.nii       / Delivery2025!');
  console.log('══════════════════════════════════════════════════════════════');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
