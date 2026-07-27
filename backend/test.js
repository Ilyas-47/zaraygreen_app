const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const doc = await prisma.document.create({
    data: {
      type: 'FACTURE',
      numeroDocument: 'TEST-123',
      statut: 'BROUILLON',
      montantHT: 0,
      montantTTC: 0,
      tva: 0
    }
  });
  console.log('Created:', doc);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
