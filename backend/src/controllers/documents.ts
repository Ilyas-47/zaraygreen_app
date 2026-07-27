// src/controllers/documents.ts
import { Response } from 'express'
import { documentsService } from '../services/documents.service'
import { ok, fail } from '../utils'
import { AuthRequest } from '../middlewares/auth'

export const documentsController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const list = await documentsService.getAll()
      return ok(res, list)
    } catch (e: any) {
      return fail(res, e.message || 'Erreur lors de la récupération des documents')
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const { 
        type, 
        numeroDocument, 
        dateEcheance, 
        montantHT, 
        montantTTC, 
        tva, 
        statut, 
        fichierUrl, 
        notes, 
        userId 
      } = req.body

      if (!type || !numeroDocument) {
        return fail(res, 'Le type de document et le numéro de document sont requis', 400)
      }

      const created = await documentsService.create({
        type,
        numeroDocument,
        dateEcheance: dateEcheance ? new Date(dateEcheance) : undefined,
        montantHT: Number(montantHT || 0),
        montantTTC: Number(montantTTC || 0),
        tva: Number(tva || 0),
        statut: statut || 'BROUILLON',
        fichierUrl,
        notes,
        userId
      })

      return ok(res, created, 201)
    } catch (e: any) {
      return fail(res, e.message || 'Erreur lors de la création du document')
    }
  },

  async delete(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string
      await documentsService.delete(id)
      return ok(res, { message: 'Document supprimé avec succès' })
    } catch (e: any) {
      return fail(res, e.message || 'Erreur lors de la suppression')
    }
  }
}
