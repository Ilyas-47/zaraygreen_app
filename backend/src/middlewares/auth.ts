// src/middlewares/auth.ts
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../utils/prisma'

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string }
}

// ── Vérifie le token JWT ────────────────────────────────
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token manquant' })
  }

  const token = header.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string; email: string; role: string
    }

    const user = await prisma.user.findUnique({
      where:  { id: decoded.id },
      select: { id: true, email: true, role: true},
    })

    if (!user ) {
      return res.status(401).json({ success: false, message: 'Compte inactif' })
    }

    req.user = { id: user.id, email: user.email, role: user.role }
    next()
  } catch {
    return res.status(401).json({ success: false, message: 'Token invalide' })
  }
}

// ── Guard par rôle ──────────────────────────────────────
export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Non authentifié' })
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: `Accès refusé` })
    }
    next()
  }
}

export const isAdmin      = requireRole('ADMIN')
export const isLivreur    = requireRole('LIVREUR', 'ADMIN')
export const isTechnicien = requireRole('TECHNICIEN', 'ADMIN')