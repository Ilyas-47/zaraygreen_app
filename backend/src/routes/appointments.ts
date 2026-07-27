// src/routes/appointments.ts
import { Router }                  from 'express'
import { appointmentController }   from '../controllers/appointments'
import { authenticate, isAdmin } from '../middlewares/auth'

const router = Router()

// Client
router.post('/',   authenticate, appointmentController.create)
router.get('/my',  authenticate, appointmentController.getMy)

// Technicien
router.get('/tasks', authenticate, appointmentController.getTasks)

// Admin
router.get('/',              authenticate, isAdmin, appointmentController.getAll)
router.get('/:id',           authenticate, appointmentController.getById)
router.patch('/:id/status',  authenticate, appointmentController.updateStatus)

export default router