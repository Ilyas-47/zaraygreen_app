import { Router } from 'express'
import { supportController } from '../controllers/support'
import { authenticate, isAdmin } from '../middlewares/auth'

const router = Router()

// Client route to create a support ticket
router.post('/', authenticate, supportController.create)

// Admin routes to view and update tickets
router.get('/', authenticate, isAdmin, supportController.getAll)
router.patch('/:id/status', authenticate, isAdmin, supportController.updateStatus)

export default router
