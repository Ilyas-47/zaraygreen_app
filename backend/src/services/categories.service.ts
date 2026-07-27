// src/services/categories.service.ts
import { prisma } from '../utils/prisma'

export const categoryService = {
  async getAll() {
    return prisma.category.findMany({
      orderBy: { createdAt: 'desc' }
    })
  },

  async create(data: { name: string; description?: string; image?: string }) {
    return prisma.category.create({
      data
    })
  },

  async update(id: string, data: { name?: string; description?: string; image?: string }) {
    return prisma.category.update({
      where: { id },
      data
    })
  },

  async delete(id: string) {
    return prisma.category.delete({
      where: { id }
    })
  }
}
