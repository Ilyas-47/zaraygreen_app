// src/routes/categories.ts
import { Router } from 'express'
import { categoryController } from '../controllers/categories'
import { authenticate, isAdmin } from '../middlewares/auth'

const router = Router()

router.get('/', categoryController.getAll)
router.post('/', authenticate, isAdmin, categoryController.create)
router.put('/:id', authenticate, isAdmin, categoryController.update)
router.delete('/:id', authenticate, isAdmin, categoryController.delete)

export default router
