// src/index.ts
import express    from 'express'
import cors       from 'cors'
import dotenv     from 'dotenv'
import helmet     from 'helmet'

import authRoutes         from './routes/auth'
import productRoutes      from './routes/products'
import orderRoutes        from './routes/orders'
import appointmentRoutes  from './routes/appointments'
import userRoutes         from './routes/users'
import serviceRoutes      from './routes/services'
import dashboardRoutes    from './routes/dashboard'
import documentRoutes     from './routes/documents'
import categoryRoutes     from './routes/categories'
import serviceCategoryRoutes from './routes/service-categories'
import promoRoutes        from './routes/promo'
import profileRoutes      from './routes/profile'
import aiRoutes           from './routes/ai'

dotenv.config()

const app  = express()
const PORT = process.env.PORT || 5001

// ── Middlewares ────────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin:      process.env.FRONTEND_URL || '*',
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ── Routes ─────────────────────────────────────────────────
app.use('/api/auth',         authRoutes)
app.use('/api/products',     productRoutes)
app.use('/api/orders',       orderRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/users',        userRoutes)
app.use('/api/services',     serviceRoutes)
app.use('/api/dashboard',    dashboardRoutes)
app.use('/api/documents',    documentRoutes)
app.use('/api/categories',   categoryRoutes)
app.use('/api/service-categories', serviceCategoryRoutes)
app.use('/api/promo',        promoRoutes)
app.use('/api/profile',      profileRoutes)
app.use('/api/ai',           aiRoutes)

// ── Health check ───────────────────────────────────────────
app.get('/',            (_, res) => res.json({ message: '🌿 Zaray Green API is running' }))
app.get('/api/health',  (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

// ── 404 ────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.url} introuvable` })
})

// ── Start ──────────────────────────────────────────────────
const server = app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🌿 Zaray Green API running on http://0.0.0.0:${PORT}`)
})

server.on('error', (e) => {
  console.error("SERVER ERROR:", e)
})

process.on('uncaughtException', (err) => {
  console.error("UNCAUGHT EXCEPTION:", err)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error("UNHANDLED REJECTION:", reason)
})