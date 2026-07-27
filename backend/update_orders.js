const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.order.updateMany({
    where: { status: 'ACCEPTED' },
    data: { status: 'EN_COURS' }
  });
  console.log(`Updated ${result.count} orders from ACCEPTED to EN_COURS.`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
