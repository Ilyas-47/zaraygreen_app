const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixImages() {
  const products = await prisma.product.findMany();
  let fixedCount = 0;
  for (const p of products) {
    if (p.images) {
      try {
        // Try parsing once
        let parsed = JSON.parse(p.images);
        // If it's STILL a string (which means it was double stringified)
        if (typeof parsed === 'string') {
          console.log(`Product ${p.id} (${p.name}) has double-stringified images. Fixing...`);
          // We don't parse it again to an array, we just save the single-stringified version 
          // back to the database. `parsed` is exactly the JSON string we want!
          await prisma.product.update({
            where: { id: p.id },
            data: { images: parsed }
          });
          fixedCount++;
        }
      } catch (e) {
        console.error(`Error parsing product ${p.id}:`, e);
      }
    }
  }
  console.log(`Fixed ${fixedCount} products.`);
}

fixImages().catch(console.error).finally(() => prisma.$disconnect());
