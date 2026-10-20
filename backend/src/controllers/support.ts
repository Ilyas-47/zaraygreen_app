import { Response } from 'express'
import { AuthRequest } from '../middlewares/auth'
import { supportService } from '../services/support.service'
import { ok, fail } from '../utils'

export const supportController = {
  async create(req: AuthRequest, res: Response) {
    try {
      const { subject, message } = req.body
      if (!subject || !message) {
        return fail(res, 'Le sujet et le message sont requis', 400)
      }
      const ticket = await supportService.createTicket(req.user!.id, subject, message)
      return ok(res, ticket, 201)
    } catch (e: any) {
      return fail(res, e.message || 'Erreur lors de la création du ticket')
    }
  },

  async getAll(req: AuthRequest, res: Response) {
    try {
      const tickets = await supportService.getAllTickets()
      return ok(res, tickets)
    } catch (e: any) {
      return fail(res, e.message || 'Erreur lors de la récupération des tickets')
    }
  },

  async updateStatus(req: AuthRequest, res: Response) {
    try {
      const id = req.params.id as string
      const { status } = req.body
      if (!status) {
        return fail(res, 'Le statut est requis', 400)
      }
      const ticket = await supportService.updateStatus(id, status)
      return ok(res, ticket)
    } catch (e: any) {
      return fail(res, e.message || 'Erreur lors de la mise à jour du statut')
    }
  }
}
