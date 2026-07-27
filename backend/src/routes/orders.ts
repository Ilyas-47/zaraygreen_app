// src/routes/orders.ts
import { Router }          from 'express'
import { orderController } from '../controllers/orders'
import { authenticate, isAdmin } from '../middlewares/auth'

const router = Router()

// Client
router.post('/',      authenticate, orderController.create)
router.get('/my',     authenticate, orderController.getMyOrders)

// Livreur
router.get('/deliveries',      authenticate, orderController.getDeliveries)
router.patch('/:id/deliver',   authenticate, orderController.markDelivered)

// Admin
router.get('/',                authenticate, isAdmin,   orderController.getAll)
router.patch('/:id/status',    authenticate, isAdmin,   orderController.updateStatus)

export default router