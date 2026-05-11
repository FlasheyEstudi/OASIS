import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ where: { isDemoUser: true } });
  
  for (const user of users) {
    await prisma.notification.createMany({
      data: [
        {
          userId: user.id,
          title: 'Bienvenido a Oasis',
          message: 'Tu plataforma de salud está lista. Explora los módulos.',
          type: 'system',
        },
        {
          userId: user.id,
          title: 'Nuevo pedido pendiente',
          message: 'Tienes un pedido esperando procesamiento en farmacia.',
          type: 'order',
        }
      ]
    });
  }
  console.log('✅ Notificaciones de demo creadas');
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
