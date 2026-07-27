// src/controllers/auth.ts
import { Request, Response } from 'express'
import { authService }       from '../services/auth.service'
import { ok, fail }          from '../utils'
import { AuthRequest }       from '../middlewares/auth'

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body
      if (!name || !email || !password) return fail(res, 'Tous les champs sont requis')
      const result = await authService.register(name, email, password)
      return ok(res, result, 201)
    } catch (e: any) { return fail(res, e.message) }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body
      if (!email || !password) return fail(res, 'Email et mot de passe requis')
      const result = await authService.login(email, password)
      return ok(res, result)
    } catch (e: any) { return fail(res, e.message, 401) }
  },

  async me(req: AuthRequest, res: Response) {
    try {
      const user = await authService.me(req.user!.id)
      return ok(res, user)
    } catch (e: any) { return fail(res, e.message) }
  },
}