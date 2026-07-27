// src/services/orders.service.ts
import { prisma } from '../utils/prisma'
import { promoService } from './promo.service'

export const orderService = {

  async create(userId: string, data: {
    items: { productId: string; quantity: number }[];
    promoCode?: string;
    paymentMode?: string;
    addressId?: string;
    newAddress?: { rue: string; ville: string; codePostal?: string; pays?: string; };
    phone?: string;
  }) {
    // Calcul total + vérification stock
    let total = 0
    const enriched = await Promise.all(
      data.items.map(async item => {
        const product = await prisma.product.findUnique({ where: { id: item.productId } })
        if (!product || !product.stock) throw new Error(`Produit ${item.productId} indisponible`)
        if (product.stock < item.quantity) throw new Error(`Stock insuffisant pour ${product.name}`)
        total += product.price * item.quantity
        return { productId: item.productId, quantity: item.quantity, price: product.price }
      })
    )

    let promoCodeId: string | undefined = undefined;
    if (data.promoCode) {
      // Validate again to make sure it's valid right now
      const promo = await promoService.validate(data.promoCode, userId);
      total = total * (1 - promo.discountPercentage / 100);
      promoCodeId = promo.id;
    }

    return prisma.$transaction(async tx => {
      let finalAddressId = data.addressId;

      if (data.phone) {
        await tx.user.update({
          where: { id: userId },
          data: { phone: data.phone }
        });
      }
      
      // Créer une nouvelle adresse si demandée
      if (!finalAddressId && data.newAddress) {
        const createdAddr = await tx.address.create({
          data: {
            userId,
            rue: data.newAddress.rue,
            ville: data.newAddress.ville,
            codePostal: data.newAddress.codePostal,
            pays: data.newAddress.pays || 'Maroc',
          }
        });
        finalAddressId = createdAddr.id;
      }

      const order = await tx.order.create({
        data: {
          userId,
          totalAmount: total,
          promoCodeId: promoCodeId,
          addressId: finalAddressId,
          items: { create: enriched },
          payments: data.paymentMode ? {
            create: {
              montant: total,
              methode: data.paymentMode,
              statut: "SUCCESS", // Simulé réussi pour l'instant
              datePaiement: new Date()
            }
          } : undefined
        },
        include: { 
          items: { include: { product: true } },
          payments: true,
          address: true
        },
      })

      // Décrémente stock
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data:  { stock: { decrement: item.quantity } },
        })
      }

      return order
    })
  },

  async getMyOrders(userId: string) {
    return prisma.order.findMany({
      where:   { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    })
  },

  async getAll(page = 1, limit = 20, status?: string) {
    const where: any = {}
    if (status) where.status = status

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user:    { select: { id: true, name: true, email: true, phone: true } },
          items:   { include: { product: { select: { id: true, name: true, images: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip:    (page - 1) * limit,
        take:    limit,
      }),
      prisma.order.count({ where }),
    ])
    return { orders, total }
  },

  async getById(orderId: string) {
    return prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user:    { select: { id: true, name: true, email: true, phone: true } },
        items:   { include: { product: true } },
      },
    })
  },

  async updateStatus(orderId: string, status?: string, livreurId?: string) {
    const data: any = {}
    if (status) data.status = status
    if (livreurId !== undefined) data.livreurId = livreurId === '' ? null : livreurId

    return prisma.order.update({
      where: { id: orderId },
      data,
      include: {
        user:    { select: { id: true, name: true, phone: true } },
        items:   { include: { product: true } },
      },
    })
  },

  async getDeliveries(livreurId: string) {
    return prisma.order.findMany({
      where: { livreurId, status: { in: ['EN_COURS', 'DELIVERED'] } },
      include: {
        user: { select: { name: true, phone: true } },
        address: true,
        items: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  },

  async markDelivered(orderId: string, livreurId: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error('Commande introuvable');
    if (order.livreurId !== livreurId) throw new Error('Non autorisé');
    
    return prisma.order.update({
      where: { id: orderId },
      data: { status: 'DELIVERED' }
    });
  }
};