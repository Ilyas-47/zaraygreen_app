// src/routes/users.ts
import { Router }     from 'express'
import { authenticate, isAdmin } from '../middlewares/auth'
import { prisma }     from '../utils/prisma'
import { ok, fail }   from '../utils'
import bcrypt from 'bcryptjs'

const router = Router()

// Admin — liste tous les users
router.get('/', authenticate, isAdmin, async (_, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { 
        id: true, name: true, email: true, role: true, 
        phone: true, active: true, createdAt: true,
        _count: { select: { orders: true } }
      },
      orderBy: { createdAt: 'desc' },
    })
    const formatted = users.map(u => {
      const { _count, ...rest } = u;
      return { ...rest, orders: _count.orders };
    });
    return ok(res, formatted)
  } catch (e: any) { return fail(res, e.message) }
})

// Admin — créer un user
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body
    if (!name || !email || !password || !role) return fail(res, 'Tous les champs sont requis', 400)
    
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return fail(res, 'Email déjà utilisé', 400)

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role },
      select: { id: true, name: true, email: true, role: true, phone: true, active: true, createdAt: true },
    })
    return ok(res, user, 201)
  } catch (e: any) { return fail(res, e.message) }
})

// Admin — modifier un user complet
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, email, role } = req.body
    if (!name || !email || !role) return fail(res, 'Nom, email et rôle sont requis', 400)
    
    const user = await prisma.user.update({
      where: { id: req.params.id as string },
      data: { name, email, role },
      select: { id: true, name: true, email: true, role: true, phone: true, active: true, createdAt: true },
    })
    return ok(res, user)
  } catch (e: any) { return fail(res, e.message) }
})

// Admin — activer / désactiver
router.patch('/:id/toggle', authenticate, isAdmin, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id as string } })
    if (!user) return fail(res, 'Utilisateur introuvable', 404)
    const updated = await prisma.user.update({
      where: { id: req.params.id as string },
      data:  { active: !user.active },
      select: { id: true, active: true },
    })
    return ok(res, updated)
  } catch (e: any) { return fail(res, e.message) }
})

// Admin — changer rôle
router.patch('/:id/role', authenticate, isAdmin, async (req, res) => {
  try {
    const { role } = req.body
    const user = await prisma.user.update({
      where:  { id: req.params.id as string },
      data:   { role },
      select: { id: true, name: true, role: true },
    })
    return ok(res, user)
  } catch (e: any) { return fail(res, e.message) }
})

// Admin — supprimer
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id as string } })
    return ok(res, { message: 'Utilisateur supprimé' })
  } catch (e: any) { return fail(res, e.message) }
})

export default router