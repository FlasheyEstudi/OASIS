const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOrders() {
  const juan = await prisma.user.findUnique({ where: { email: 'juan@oasis.ni' } });
  if (!juan) {
    console.log('❌ Usuario Juan no encontrado');
    return;
  }
  
  const patient = await prisma.patient.findUnique({ where: { userId: juan.id } });
  if (!patient) {
    console.log('❌ Perfil de paciente de Juan no encontrado');
    return;
  }

  const orders = await prisma.order.findMany({
    where: { patientId: patient.id },
    include: { pharmacy: true }
  });

  console.log(`📦 Juan tiene ${orders.length} pedidos.`);
  orders.forEach(o => console.log(`- Orden ID: ${o.id}, Status: ${o.status}`));
}

checkOrders().finally(() => prisma.$disconnect());
