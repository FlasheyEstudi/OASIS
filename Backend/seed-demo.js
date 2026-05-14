const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const demoUsers = [
    { email: 'paciente@oasis.ni', name: 'Paciente Demo', role: 'patient' },
    { email: 'doctor@oasis.ni', name: 'Dr. Demo', role: 'doctor' },
    { email: 'farmacia@oasis.ni', name: 'Farmacia Demo', role: 'pharmacy_admin' },
    { email: 'repartidor@oasis.ni', name: 'Repartidor Demo', role: 'delivery_person' },
  ];

  for (const u of demoUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { isDemoUser: true, role: u.role },
      create: {
        email: u.email,
        name: u.name,
        password: 'password123',
        role: u.role,
        isDemoUser: true,
      }
    });
  }
  console.log('Demo users created/updated');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
