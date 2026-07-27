import { prisma } from '../utils/prisma'

export const servicesService = {
  async getAll(where: any = {}) {
    return prisma.service.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { category: true }
    })
  },

  async getById(id: string) {
    const service = await prisma.service.findUnique({ 
      where: { id },
      include: { category: true }
    })
    if (!service) throw new Error("Service introuvable")
    return service
  },

  async create(data: { name: string, description: string, basePrice?: number, image?: string, isActive?: boolean, categoryId?: string | null }) {
    return prisma.service.create({
      data: {
        name: data.name,
        description: data.description,
        basePrice: data.basePrice,
        image: data.image,
        isActive: data.isActive !== undefined ? data.isActive : true,
        categoryId: data.categoryId || null
      },
      include: { category: true }
    })
  },

  async update(id: string, data: Partial<{ name: string, description: string, basePrice: number, image: string, isActive: boolean, categoryId: string | null }>) {
    const updateData: any = { ...data };
    if (data.categoryId === '') updateData.categoryId = null;
    
    return prisma.service.update({
      where: { id },
      data: updateData,
      include: { category: true }
    })
  },

  async delete(id: string) {
    return prisma.service.delete({ where: { id } })
  }
}
