import { prisma } from '../utils/prisma'

export const promoService = {
  async create(data: { code: string; discountPercentage: number; validUntil?: string }) {
    return prisma.promoCode.create({
      data: {
        code: data.code.toUpperCase(),
        discountPercentage: data.discountPercentage,
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
      },
    })
  },

  async getAll() {
    return prisma.promoCode.findMany({
      orderBy: { createdAt: 'desc' },
    })
  },

  async toggleActive(id: string, isActive: boolean) {
    return prisma.promoCode.update({
      where: { id },
      data: { isActive },
    })
  },

  async validate(code: string, userId: string) {
    const promo = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!promo) {
      throw new Error("Code promo introuvable")
    }
    if (!promo.isActive) {
      throw new Error("Ce code promo est désactivé")
    }
    if (promo.validUntil && promo.validUntil < new Date()) {
      throw new Error("Ce code promo a expiré")
    }

    // Vérifier si l'utilisateur a déjà utilisé ce code promo
    const previousOrder = await prisma.order.findFirst({
      where: {
        userId: userId,
        promoCodeId: promo.id,
      },
    })

    if (previousOrder) {
      throw new Error("Vous avez déjà utilisé ce code promo")
    }

    return promo
  },
}
