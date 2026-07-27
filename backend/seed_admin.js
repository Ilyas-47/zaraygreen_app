const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('admin123', 10);
  const user = await prisma.user.create({
    data: {
      name: 'Admin Zaray',
      email: 'admin@zaraygreen.com',
      password: hash,
      role: 'ADMIN',
      active: true
    }
  });
  console.log('Created admin:', user.email);
}

main().catch(console.error).finally(() => prisma.$disconnect());
