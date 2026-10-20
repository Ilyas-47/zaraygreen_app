// src/services/documents.service.ts
import { prisma } from '../utils/prisma'

export const documentsService = {
  async getAll() {
    return prisma.document.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  },

  async create(data: {
    type: string
    numeroDocument: string
    dateEcheance?: Date
    montantHT: number
    montantTTC: number
    tva: number
    statut: string
    fichierUrl?: string
    notes?: string
    userId?: string
  }) {
    return prisma.document.create({
      data: {
        type: data.type,
        numeroDocument: data.numeroDocument,
        dateEcheance: data.dateEcheance,
        montantHT: data.montantHT,
        montantTTC: data.montantTTC,
        tva: data.tva,
        statut: data.statut,
        fichierUrl: data.fichierUrl,
        notes: data.notes,
        userId: data.userId
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })
  },

  async delete(id: string) {
    return prisma.document.delete({
      where: { id }
    })
  },

  async updateStatus(id: string, statut: string) {
    return prisma.document.update({
      where: { id },
      data: { statut }
    })
  }
}
