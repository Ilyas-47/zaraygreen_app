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
  },

  async updateStatus(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string;
      const { statut } = req.body;
      if (!statut) {
        return fail(res, 'Le statut est requis', 400);
      }
      const updated = await documentsService.updateStatus(id, statut);
      return ok(res, updated);
    } catch (e: any) {
      return fail(res, e.message || 'Erreur lors de la mise à jour du statut');
    }
  },

  async requestQuote(req: AuthRequest, res: Response) {
    try {
      const { items } = req.body;
      const userId = req.user?.id;
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        return fail(res, 'Veuillez ajouter au moins un élément à votre demande.', 400);
      }

      // Format items to string
      const notes = items.map((item: any, index: number) => {
        const type = item.type === 'product' ? 'Produit' : 'Service';
        const source = item.isCustom ? 'Personnalisé' : 'Catalogue';
        const quantity = item.quantity ? ` (Qté: ${item.quantity})` : '';
        return `${index + 1}. [${type} - ${source}] ${item.name}${quantity}`;
      }).join('\n');

      const numeroDocument = `DEV-${Date.now()}`;

      const created = await documentsService.create({
        type: 'DEVIS',
        numeroDocument,
        montantHT: 0,
        montantTTC: 0,
        tva: 0,
        statut: 'DEMANDE',
        notes: `Demande de devis depuis l'application mobile :\n\n${notes}`,
        userId
      });

      return ok(res, created, 201);
    } catch (e: any) {
      return fail(res, e.message || 'Erreur lors de la création de la demande de devis');
    }
  }
}
