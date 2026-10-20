// src/routes/documents.ts
import { Router } from 'express'
import { documentsController } from '../controllers/documents'
import { authenticate, isAdmin } from '../middlewares/auth'

const router = Router()

// Admin routes for documents
router.get('/', authenticate, isAdmin, documentsController.getAll)
router.post('/', authenticate, isAdmin, documentsController.create)
router.delete('/:id', authenticate, isAdmin, documentsController.delete)
router.put('/:id/status', authenticate, isAdmin, documentsController.updateStatus)

// Client routes
router.post('/request-quote', authenticate, documentsController.requestQuote)

export default router
