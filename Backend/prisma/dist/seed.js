"use strict";
// ═══════════════════════════════════════════════════════════════
// 🌿 OASIS - Seed de Datos de Prueba (Maestro)
// Ejecutar con: npx prisma db seed
// ═══════════════════════════════════════════════════════════════
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Sembrando datos de prueba MAESTROS para Oasis...\n');
    // Limpiar datos existentes en orden de dependencia
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
    const hashPassword = async (pw) => bcryptjs_1.default.hash(pw, 12);
    const demoPassword = await hashPassword('Oasis2025!');
    // ── SUPERADMIN ─────────────────────────────────────────────
    const superadminUser = await prisma.user.create({
        data: {
            email: 'superadmin@oasis.ni',
            password: demoPassword,
            name: 'Admin Oasis',
            role: 'superadmin',
            isActive: true,
            isDemoUser: true,
        },
    });
    // ── CLÍNICA ────────────────────────────────────────────────
    const clinic = await prisma.clinic.create({
        data: {
            name: 'Clínica Oasis Central',
            description: 'Hospital Metropolitano Demo',
            phone: '+50522223333',
            email: 'info@clinicacentral.ni',
            address: 'Pista Jean Paul Genie',
            city: 'Managua',
            department: 'Managua',
            latitude: 12.1054,
            longitude: -86.2514,
        },
    });
    // ── FARMACIA ───────────────────────────────────────────────
    const pharmacy = await prisma.pharmacy.create({
        data: {
            name: 'Farmacia Oasis Los Robles',
            address: 'Los Robles, de Plaza El Sol 2c al sur',
            city: 'Managua',
            department: 'Managua',
            latitude: 12.1264,
            longitude: -86.2654,
        },
    });
    // ── DOCTOR ─────────────────────────────────────────────────
    const doctorUser = await prisma.user.create({
        data: {
            email: 'carlos@oasis.ni',
            password: demoPassword,
            name: 'Dr. Carlos Mendoza',
            role: 'doctor',
            isActive: true,
            isDemoUser: true,
        },
    });
    const doctor = await prisma.doctor.create({
        data: {
            userId: doctorUser.id,
            clinicId: clinic.id,
            specialty: 'Medicina Interna',
            licenseNumber: 'MINSA-12345',
            consultationFee: 1200,
        },
    });
    // ── CLINICA STAFF ──────────────────────────────────────────
    const clinicAdminUser = await prisma.user.create({
        data: {
            email: 'admin.clinica@oasis.ni',
            password: demoPassword,
            name: 'Admin Clínica Santa María',
            role: 'clinic_admin',
            isActive: true,
            isDemoUser: true,
        },
    });
    await prisma.clinicAdmin.create({
        data: {
            userId: clinicAdminUser.id,
            clinicId: clinic.id,
        },
    });
    const receptionistUser = await prisma.user.create({
        data: {
            email: 'recepcion@oasis.ni',
            password: demoPassword,
            name: 'Recepcionista Oasis',
            role: 'receptionist',
            isActive: true,
            isDemoUser: true,
        },
    });
    await prisma.receptionist.create({
        data: {
            userId: receptionistUser.id,
            clinicId: clinic.id,
        },
    });
    // ── PACIENTE ───────────────────────────────────────────────
    const patientUser = await prisma.user.create({
        data: {
            email: 'juan@oasis.ni',
            password: demoPassword,
            name: 'Juan Pérez (Paciente)',
            phone: '+50588887777',
            role: 'patient',
            isActive: true,
            isDemoUser: true,
        },
    });
    const patient = await prisma.patient.create({
        data: {
            userId: patientUser.id,
            address: 'Residencial Las Colinas, Calle 4',
            city: 'Managua',
            latitude: 12.0912,
            longitude: -86.2345,
        },
    });
    // ── REPARTIDOR (LUIS ROJAS) ────────────────────────────────
    const deliveryUser = await prisma.user.create({
        data: {
            email: 'luis@oasis.ni',
            password: demoPassword,
            name: 'Luis Rojas',
            phone: '+50584443333',
            role: 'delivery_person',
            isActive: true,
            isDemoUser: true,
        },
    });
    const deliveryPerson = await prisma.deliveryPerson.create({
        data: {
            userId: deliveryUser.id,
            vehicleType: 'Moto',
            plateNumber: 'M-12345',
            isAvailable: true,
            isVerified: true,
            zones: JSON.stringify(['Los Robles', 'Altamira', 'Las Colinas']),
        },
    });
    // ── FARMACIA STAFF ─────────────────────────────────────────
    const pharmacyAdminUser = await prisma.user.create({
        data: {
            email: 'admin.farmacia@oasis.ni',
            password: demoPassword,
            name: 'Admin Farmacia Los Robles',
            role: 'pharmacy_admin',
            isActive: true,
            isDemoUser: true,
        },
    });
    await prisma.pharmacyAdmin.create({
        data: {
            userId: pharmacyAdminUser.id,
            pharmacyId: pharmacy.id,
        },
    });
    const pharmacyStaffUser = await prisma.user.create({
        data: {
            email: 'staff.farmacia@oasis.ni',
            password: demoPassword,
            name: 'Staff Farmacia Los Robles',
            role: 'pharmacy_staff',
            isActive: true,
            isDemoUser: true,
        },
    });
    await prisma.pharmacyStaff.create({
        data: {
            userId: pharmacyStaffUser.id,
            pharmacyId: pharmacy.id,
            role: 'staff',
        },
    });
    // ── MEDICAMENTOS ───────────────────────────────────────────
    const medications = await Promise.all([
        prisma.medication.create({ data: { name: 'Amoxicilina 500mg', category: 'Antibiótico', requiresPrescription: true } }),
        prisma.medication.create({ data: { name: 'Paracetamol 500mg', category: 'Analgésico', requiresPrescription: false } }),
        prisma.medication.create({ data: { name: 'Metformina 850mg', category: 'Diabetes', requiresPrescription: true } }),
    ]);
    // Inventario
    for (const med of medications) {
        await prisma.inventoryBatch.create({
            data: {
                pharmacyId: pharmacy.id,
                medicationId: med.id,
                batchNumber: `BAT-${med.name.substring(0, 3).toUpperCase()}`,
                quantity: 100,
                expiryDate: new Date('2026-01-01'),
                sellingPrice: 150,
            }
        });
    }
    // ── RECETA DIGITAL (CON QR) ────────────────────────────────
    const prescription = await prisma.prescription.create({
        data: {
            doctorId: doctor.id,
            patientId: patient.id,
            diagnosis: 'Infección bacteriana leve',
            verificationCode: 'OASIS-QR-' + Math.random().toString(36).substring(7).toUpperCase(),
            status: 'active',
            validUntil: new Date('2026-12-31'),
        }
    });
    await prisma.prescriptionItem.create({
        data: {
            prescriptionId: prescription.id,
            medicationId: medications[0].id,
            quantity: 2,
            dosage: '1 tableta cada 8 horas por 7 días',
        }
    });
    // ── PEDIDO 1: DISPONIBLE (LISTO PARA RECOGER) ─────────────
    const orderAvailable = await prisma.order.create({
        data: {
            patientId: patient.id,
            pharmacyId: pharmacy.id,
            status: 'ready_for_pickup',
            deliveryType: 'delivery',
            subtotal: 300,
            deliveryFee: 50,
            totalAmount: 350,
            deliveryAddress: 'Altamira, de la Vicky 1c abajo',
            deliveryLatitude: 12.1190,
            deliveryLongitude: -86.2550,
        }
    });
    // ── PEDIDO 2: ASIGNADO A LUIS (ENTREGA ACTIVA) ────────────
    const orderActive = await prisma.order.create({
        data: {
            patientId: patient.id,
            pharmacyId: pharmacy.id,
            prescriptionId: prescription.id,
            status: 'shipped',
            deliveryType: 'delivery',
            subtotal: 500,
            deliveryFee: 60,
            totalAmount: 560,
            deliveryAddress: 'Residencial Las Colinas, Calle 4',
            deliveryLatitude: 12.0912,
            deliveryLongitude: -86.2345,
        }
    });
    // ── INVOICE FOR ORDER 1 ─────────────────────────────────────
    await prisma.invoice.create({
        data: {
            orderId: orderAvailable.id,
            patientId: patient.id,
            pharmacyId: pharmacy.id,
            invoiceNumber: 'INV-2025-001',
            type: 'medication',
            subtotal: 300,
            tax: 45,
            total: 345,
            paymentStatus: 'paid',
            issuedAt: new Date(),
        }
    });
    // ── INVOICE FOR ORDER 2 ─────────────────────────────────────
    await prisma.invoice.create({
        data: {
            orderId: orderActive.id,
            patientId: patient.id,
            pharmacyId: pharmacy.id,
            invoiceNumber: 'INV-2025-002',
            type: 'medication',
            subtotal: 500,
            tax: 75,
            total: 575,
            paymentStatus: 'paid',
            issuedAt: new Date(),
        }
    });
    await prisma.delivery.create({
        data: {
            orderId: orderActive.id,
            deliveryPersonId: deliveryPerson.id,
            status: 'on_route',
            estimatedArrival: new Date(Date.now() + 30 * 60000),
        }
    });
    console.log('✅ ¡Seed Maestro completado exitosamente!');
    console.log('\n--- CUENTAS DE PRUEBA ---');
    console.log('Repartidor: luis@oasis.ni / Oasis2025!');
    console.log('Doctor: carlos@oasis.ni / Oasis2025!');
    console.log('Paciente: juan@oasis.ni / Oasis2025!');
    console.log('-------------------------\n');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
