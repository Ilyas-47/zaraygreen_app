const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.findMany({
    select: { id: true, status: true, livreurId: true }
  });
  console.log("=== TOUTES LES COMMANDES ===");
  console.table(orders);
}
main().catch(console.error).finally(() => prisma.$disconnect());
