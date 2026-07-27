// src/controllers/categories.ts
import { Request, Response } from 'express'
import { categoryService } from '../services/categories.service'
import { ok, fail } from '../utils'
import { AuthRequest } from '../middlewares/auth'

export const categoryController = {
  async getAll(req: Request, res: Response) {
    try {
      const categories = await categoryService.getAll()
      return ok(res, categories)
    } catch (e: any) {
      return fail(res, e.message)
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const { name, description, image } = req.body
      if (!name) return fail(res, 'Le nom de la catégorie est requis', 400)
      const category = await categoryService.create({ name, description, image })
      return ok(res, category, 201)
    } catch (e: any) {
      return fail(res, e.message)
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const category = await categoryService.update(req.params.id as string, req.body)
      return ok(res, category)
    } catch (e: any) {
      return fail(res, e.message)
    }
  },

  async delete(req: AuthRequest, res: Response) {
    try {
      await categoryService.delete(req.params.id as string)
      return ok(res, { message: 'Catégorie supprimée' })
    } catch (e: any) {
      return fail(res, e.message)
    }
  }
}
