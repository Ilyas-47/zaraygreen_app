const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Delete appointments first to respect foreign keys (onDelete: Restrict)
  await prisma.appointment.deleteMany({});
  console.log('All Appointments deleted.');

  // Now delete services and their categories
  await prisma.service.deleteMany({});
  console.log('All Services deleted.');
  
  await prisma.serviceCategory.deleteMany({});
  console.log('All Service Categories deleted.');
}

main()
  .catch(e => {
    console.error('Error during deletion:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
