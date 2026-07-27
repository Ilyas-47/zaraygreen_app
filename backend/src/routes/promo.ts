import { Router }          from 'express'
import { promoController } from '../controllers/promo'
import { authenticate, isAdmin } from '../middlewares/auth'

const router = Router()

// Admin
router.post('/',           authenticate, isAdmin, promoController.create)
router.get('/',            authenticate, isAdmin, promoController.getAll)
router.patch('/:id/active',authenticate, isAdmin, promoController.toggleActive)

// Client
router.get('/validate/:code', authenticate, promoController.validate)

export default router
