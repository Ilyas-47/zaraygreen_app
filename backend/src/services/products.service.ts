// src/services/products.service.ts
import { prisma } from '../utils/prisma'

export const productService = {

  async getAll(categoryId?: string, search?: string, page = 1, limit = 10) {
    const where: any = {}
    if (categoryId) where.categoryId = categoryId
    if (search) {
      where.OR = [
        { name:        { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include:  { category: true },
        orderBy:  { createdAt: 'desc' },
        skip:     (page - 1) * limit,
        take:     limit,
      }),
      prisma.product.count({ where }),
    ])

    // Parse images JSON
    return {
      products: products.map(p => ({ ...p, images: JSON.parse(p.images || '[]') })),
      total,
    }
  },

  async getById(id: string) {
    const product = await prisma.product.findUnique({
      where:   { id },
      include: {
        category: true,
        reviews:  { include: { user: { select: { name: true, avatar: true } } }, orderBy: { createdAt: 'desc' } },
      },
    })
    if (!product) return null
    return { ...product, images: JSON.parse(product.images || '[]') }
  },

  async create(data: {
    name: string; description: string; price: number;
    stock: number; images: string[]; categoryId: string;
  }) {
    const product = await prisma.product.create({
      data: { ...data, images: JSON.stringify(data.images) },
      include: { category: true },
    })
    return { ...product, images: JSON.parse(product.images) }
  },

  async update(id: string, data: any) {
    if (data.images) data.images = JSON.stringify(data.images)
    const product = await prisma.product.update({ where: { id }, data, include: { category: true } })
    return { ...product, images: JSON.parse(product.images) }
  },

  async delete(id: string) {
    return prisma.product.delete({ where: { id } })
  },

  async updateRating(productId: string) {
    const reviews = await prisma.review.findMany({ where: { productId } })
    if (reviews.length === 0) return
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    await prisma.product.update({ where: { id: productId }, data: { rating: Math.round(avg * 10) / 10 } })
  },
}