// src/routes/auth.ts
import { Router }           from 'express'
import { authController }   from '../controllers/auth'
import { authenticate }     from '../middlewares/auth'

const router = Router()

router.post('/register', authController.register)
router.post('/login',    authController.login)
router.get('/me',        authenticate, authController.me)
router.post('/logout',   authenticate, (_, res) => res.json({ success: true }))

export default router