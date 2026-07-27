// src/controllers/dashboard.ts
import { Response } from 'express'
import { dashboardService } from '../services/dashboard.service'
import { ok, fail } from '../utils'
import { AuthRequest } from '../middlewares/auth'

export const dashboardController = {
  async getStats(req: AuthRequest, res: Response) {
    try {
      const stats = await dashboardService.getStats()
      return ok(res, stats)
    } catch (e: any) {
      return fail(res, e.message || 'Erreur de chargement des statistiques')
    }
  }
}
