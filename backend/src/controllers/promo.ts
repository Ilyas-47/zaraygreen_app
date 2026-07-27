import { Response }           from 'express'
import { promoService }       from '../services/promo.service'
import { ok, fail }           from '../utils'
import { AuthRequest }        from '../middlewares/auth'

export const promoController = {
  async create(req: AuthRequest, res: Response) {
    try {
      const { code, discountPercentage, validUntil } = req.body
      const promo = await promoService.create({ code, discountPercentage, validUntil })
      return ok(res, promo, 201)
    } catch (e: any) { 
      return fail(res, e.message) 
    }
  },

  async getAll(req: AuthRequest, res: Response) {
    try {
      const promos = await promoService.getAll()
      return ok(res, promos)
    } catch (e: any) { 
      return fail(res, e.message) 
    }
  },

  async toggleActive(req: AuthRequest, res: Response) {
    try {
      const promo = await promoService.toggleActive(req.params.id as string, req.body.isActive)
      return ok(res, promo)
    } catch (e: any) { 
      return fail(res, e.message) 
    }
  },

  async validate(req: AuthRequest, res: Response) {
    try {
      const code = req.params.code as string
      const userId = req.user!.id
      const promo = await promoService.validate(code, userId)
      return ok(res, promo)
    } catch (e: any) { 
      return fail(res, e.message, 400) 
    }
  },
}
