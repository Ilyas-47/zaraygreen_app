// src/controllers/orders.ts
import { Response }           from 'express'
import { orderService }       from '../services/orders.service'
import { ok, fail, paginate } from '../utils'
import { AuthRequest }        from '../middlewares/auth'

export const orderController = {
  async create(req: AuthRequest, res: Response) {
    try {
      const order = await orderService.create(req.user!.id, req.body)
      return ok(res, order, 201)
    } catch (e: any) { return fail(res, e.message) }
  },

  async getMyOrders(req: AuthRequest, res: Response) {
    try {
      const orders = await orderService.getMyOrders(req.user!.id)
      return ok(res, orders)
    } catch (e: any) { return fail(res, e.message) }
  },

  async getAll(req: AuthRequest, res: Response) {
    try {
      const { page = '1', limit = '20', status } = req.query as any
      const result = await orderService.getAll(+page, +limit, status)
      return paginate(res, result.orders, result.total, +page, +limit)
    } catch (e: any) { return fail(res, e.message) }
  },

  async updateStatus(req: AuthRequest, res: Response) {
    try {
      const order = await orderService.updateStatus(req.params.id as string, req.body.status, req.body.livreurId)
      return ok(res, order)
    } catch (e: any) { return fail(res, e.message) }
  },

  async getDeliveries(req: AuthRequest, res: Response) {
    try {
      const orders = await orderService.getDeliveries(req.user!.id)
      return ok(res, orders)
    } catch (e: any) { return fail(res, e.message) }
  },

  async markDelivered(req: AuthRequest, res: Response) {
    try {
      const order = await orderService.markDelivered(req.params.id as string, req.user!.id)
      return ok(res, order)
    } catch (e: any) { return fail(res, e.message) }
  }
}