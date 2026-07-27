// src/controllers/products.ts
import { Request, Response } from 'express'
import { productService }    from '../services/products.service'
import { ok, fail, paginate } from '../utils'
import { AuthRequest }       from '../middlewares/auth'

export const productController = {
  async getAll(req: Request, res: Response) {
    try {
      const { categoryId, search, page = '1', limit = '10' } = req.query as any
      const result = await productService.getAll(categoryId, search, +page, +limit)
      return paginate(res, result.products, result.total, +page, +limit)
    } catch (e: any) { return fail(res, e.message) }
  },

  async getById(req: Request, res: Response) {
    try {
      const product = await productService.getById(req.params.id as string)
      if (!product) return fail(res, 'Produit introuvable', 404)
      return ok(res, product)
    } catch (e: any) { return fail(res, e.message) }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const product = await productService.create(req.body)
      return ok(res, product, 201)
    } catch (e: any) { return fail(res, e.message) }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const product = await productService.update(req.params.id as string, req.body)
      return ok(res, product)
    } catch (e: any) { return fail(res, e.message) }
  },

  async delete(req: AuthRequest, res: Response) {
    try {
      await productService.delete(req.params.id as string)
      return ok(res, { message: 'Produit supprimé' })
    } catch (e: any) { return fail(res, e.message) }
  },

  async addReview(req: AuthRequest, res: Response) {
    try {
      const { rating, comment } = req.body
      const review = await prisma.review.create({
        data: { rating: Number(rating), comment, userId: req.user!.id, productId: req.params.id as string },
      })
      await productService.updateRating(req.params.id as string)
      return ok(res, review, 201)
    } catch (e: any) { return fail(res, e.message) }
  },
}

import { prisma } from '../utils/prisma'