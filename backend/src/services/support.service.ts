import { prisma } from '../utils/prisma'

export const supportService = {
  async createTicket(userId: string, subject: string, message: string) {
    return prisma.supportTicket.create({
      data: {
        userId,
        subject,
        message,
      }
    })
  },

  async getAllTickets() {
    return prisma.supportTicket.findMany({
      include: {
        user: {
          select: { name: true, email: true, phone: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  },

  async updateStatus(id: string, status: string) {
    return prisma.supportTicket.update({
      where: { id },
      data: { status }
    })
  }
}
