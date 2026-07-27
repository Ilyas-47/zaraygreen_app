const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/users',
  method: 'GET',
};

// Wait, without a valid JWT token, we will get 401 Unauthorized!
// Let's just run prisma query directly instead.

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const users = await prisma.user.findMany({
      select: { 
        id: true, name: true, email: true, role: true, 
        phone: true, active: true, createdAt: true,
        _count: { select: { orders: true } }
      },
      orderBy: { createdAt: 'desc' },
    });
    
    const formatted = users.map(u => {
      const { _count, ...rest } = u;
      return { ...rest, orders: _count.orders };
    });
    
    console.log(JSON.stringify(formatted, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    prisma.$disconnect();
  }
}

test();
