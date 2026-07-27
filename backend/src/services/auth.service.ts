// src/services/auth.service.ts
import bcrypt  from 'bcryptjs'
import jwt     from 'jsonwebtoken'
import { prisma } from '../utils/prisma'

export const authService = {

  async register(name: string, email: string, password: string) {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) throw new Error('Email déjà utilisé')

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: 'CLIENT' },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )
    return { user, token }
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.active) throw new Error('Identifiants invalides')

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) throw new Error('Identifiants invalides')

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    const { password: _, ...safeUser } = user
    return { user: safeUser, token }
  },

  async me(userId: string) {
    return prisma.user.findUnique({
      where:  { id: userId },
      select: { id: true, name: true, email: true, role: true, phone: true, avatar: true, active: true, createdAt: true },
    })
  },
}