const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Respect foreign key constraints by deleting children first
  await prisma.orderItem.deleteMany({});
  console.log('All OrderItems deleted.');

  await prisma.review.deleteMany({});
  console.log('All Reviews deleted.');

  // Now delete products and categories
  await prisma.product.deleteMany({});
  console.log('All Products deleted.');
  
  await prisma.category.deleteMany({});
  console.log('All Categories deleted.');
}

main()
  .catch(e => {
    console.error('Error during deletion:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
