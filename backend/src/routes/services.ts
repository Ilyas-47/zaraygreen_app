// src/routes/services.ts
import { Router }   from 'express'
import { authenticate, isAdmin } from '../middlewares/auth'
import { servicesService } from '../services/services.service'
import { ok, fail } from '../utils'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const activeOnly = req.query.active === 'true'
    const where = activeOnly ? { isActive: true } : {}
    const services = await servicesService.getAll(where)
    return ok(res, services)
  } catch (e: any) { return fail(res, e.message) }
})

router.get('/:id', async (req, res) => {
  try {
    const service = await servicesService.getById(req.params.id as string)
    return ok(res, service)
  } catch (e: any) { return fail(res, e.message) }
})

router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const service = await servicesService.create(req.body)
    return ok(res, service, 201)
  } catch (e: any) { return fail(res, e.message) }
})

router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const service = await servicesService.update(req.params.id as string, req.body)
    return ok(res, service)
  } catch (e: any) { return fail(res, e.message) }
})

router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    await servicesService.delete(req.params.id as string)
    return ok(res, { message: 'Service supprimé' })
  } catch (e: any) { return fail(res, e.message) }
})

export default router