// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt           from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ── Users ──────────────────────────────────────────────
  const adminPass    = await bcrypt.hash('admin123', 10)
  const clientPass   = await bcrypt.hash('client123', 10)
  const livreurPass  = await bcrypt.hash('livreur123', 10)
  const techPass     = await bcrypt.hash('tech123', 10)

  const admin = await prisma.user.upsert({
    where:  { email: 'admin@zaraygreen.com' },
    update: {},
    create: { name: 'Zaray Admin', email: 'admin@zaraygreen.com', password: adminPass, role: 'ADMIN' },
  })

  const client = await prisma.user.upsert({
    where:  { email: 'client@zaraygreen.com' },
    update: {},
    create: { name: 'Marie Dubois', email: 'client@zaraygreen.com', password: clientPass, role: 'CLIENT', phone: '+33 6 12 34 56 78' },
  })

  const livreur = await prisma.user.upsert({
    where:  { email: 'livreur@zaraygreen.com' },
    update: {},
    create: { name: 'Felix Courier', email: 'livreur@zaraygreen.com', password: livreurPass, role: 'LIVREUR', phone: '+33 6 98 76 54 32' },
  })

  const tech = await prisma.user.upsert({
    where:  { email: 'tech@zaraygreen.com' },
    update: {},
    create: { name: 'Elena Rousseau', email: 'tech@zaraygreen.com', password: techPass, role: 'TECHNICIEN', phone: '+33 6 55 44 33 22' },
  })

  // ── Categories ─────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({ where: { name: 'Gazon Artificiel' } as any, update: {}, create: { name: 'Gazon Artificiel', description: 'Gazon synthétique haute qualité' } }),
    prisma.category.upsert({ where: { name: 'Gazon Naturel' }    as any, update: {}, create: { name: 'Gazon Naturel',    description: 'Gazon naturel premium'          } }),
    prisma.category.upsert({ where: { name: 'Plantes' }          as any, update: {}, create: { name: 'Plantes',          description: 'Plantes intérieures et extérieures' } }),
    prisma.category.upsert({ where: { name: 'Vases & Pots' }     as any, update: {}, create: { name: 'Vases & Pots',     description: 'Contenant de qualité'           } }),
    prisma.category.upsert({ where: { name: 'Décoration' }       as any, update: {}, create: { name: 'Décoration',       description: 'Accessoires déco végétale'      } }),
  ])

  const [catGA, catGN, catPlantes] = categories

  // ── Products ───────────────────────────────────────────
  const products = [
    {
      name:        'Monstera Deliciosa',
      description: 'Plante tropicale majestueuse, parfaite pour les intérieurs lumineux.',
      price:       85,
      stock:       12,
      images:      JSON.stringify(['https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400']),
      categoryId:  catPlantes.id,
      rating:      4.8,
    },
    {
      name:        'Fiddle Leaf Fig (Large)',
      description: 'Ficus lyrata imposant, ideal comme plante phare dans votre salon.',
      price:       120,
      stock:       8,
      images:      JSON.stringify(['https://images.unsplash.com/photo-1487530811015-780c3d9fd5a3?w=400']),
      categoryId:  catPlantes.id,
      rating:      4.9,
    },
    {
      name:        'Zanzibar Gem',
      description: 'Plante ultra résistante, parfaite pour les environnements peu lumineux.',
      price:       45,
      stock:       25,
      images:      JSON.stringify(['https://images.unsplash.com/photo-1599598425947-5202edd56bdb?w=400']),
      categoryId:  catPlantes.id,
      rating:      4.7,
    },
    {
      name:        'Bouquet Rose Premium',
      description: 'Bouquet de roses fraîches, livraison sous 24h.',
      price:       65,
      stock:       30,
      images:      JSON.stringify(['https://images.unsplash.com/photo-1490750967868-88df5691cc4a?w=400']),
      categoryId:  catGA.id,
      rating:      4.9,
    },
  ]

  for (const p of products) {
    await prisma.product.upsert({
      where:  { name: p.name } as any,
      update: {},
      create: p,
    })
  }

  // ── Services ───────────────────────────────────────────
  const services = [
    { name: 'Maintenance mensuelle',  description: 'Entretien régulier de vos espaces verts.',        basePrice: 150 },
    { name: 'Consultation botaniste', description: 'Diagnostic complet par notre expert botaniste.',   basePrice: 80  },
    { name: 'Livraison express',      description: 'Livraison à domicile en moins de 24h.',            basePrice: 25  },
    { name: 'Pack soin complet',      description: 'Fertilisation, rempotage et traitement complet.',  basePrice: 200 },
    { name: 'Remplacement garanti',   description: 'Remplacement de plantes sans frais si dépérissement.', basePrice: 0 },
  ]

  for (const s of services) {
    await prisma.service.upsert({
      where:  { name: s.name } as any,
      update: {},
      create: s,
    })
  }

  // ── Address ────────────────────────────────────────────
  const address = await prisma.address.create({
    data: {
      rue: '15 Rue de la Paix', ville: 'Paris',
      codePostal: '75002', pays: 'France',
      userId: client.id,
    },
  })

  // ── Sample Order ───────────────────────────────────────
  const product = await prisma.product.findFirst()
  if (product) {
    await prisma.order.create({
      data: {
        clientId:    client.id,
        totalAmount: product.price * 2,
        status:      'PENDING',
        items: {
          create: [{ productId: product.id, quantity: 2, price: product.price }],
        },
      },
    })
  }

  console.log('✅ Seed completed!')
  console.log('📧 Admin:    admin@zaraygreen.com / admin123')
  console.log('📧 Client:   client@zaraygreen.com / client123')
  console.log('📧 Livreur:  livreur@zaraygreen.com / livreur123')
  console.log('📧 Technicien: tech@zaraygreen.com / tech123')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())