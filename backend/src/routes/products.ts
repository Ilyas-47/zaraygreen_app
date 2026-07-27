// src/routes/products.ts
import { Router }              from 'express'
import { productController }   from '../controllers/products'
import { authenticate }        from '../middlewares/auth'
import { isAdmin }             from '../middlewares/auth'

const router = Router()

// Public
router.get('/',    productController.getAll)
router.get('/:id', productController.getById)

// Client — ajouter avis
router.post('/:id/reviews', authenticate, productController.addReview)

// Admin
router.post('/',      authenticate, isAdmin, productController.create)
router.put('/:id',    authenticate, isAdmin, productController.update)
router.delete('/:id', authenticate, isAdmin, productController.delete)

export default router