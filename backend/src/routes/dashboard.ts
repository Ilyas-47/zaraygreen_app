// src/routes/dashboard.ts
import { Router } from 'express'
import { dashboardController } from '../controllers/dashboard'
import { authenticate, isAdmin } from '../middlewares/auth'

const router = Router()

router.get('/stats', authenticate, isAdmin, dashboardController.getStats)

export default router
