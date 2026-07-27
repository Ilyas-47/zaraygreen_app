import { Router } from 'express';
import { authenticate, isAdmin } from '../middlewares/auth';
import { prisma } from '../utils/prisma';
import { ok, fail } from '../utils';

const router = Router();

// ==========================================
// SERVICE CATEGORIES
// ==========================================

// Get all service categories
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.serviceCategory.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return ok(res, categories);
  } catch (e: any) { return fail(res, e.message); }
});

// Create service category
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, description, image } = req.body;
    
    if (!name) return fail(res, 'Le nom est requis', 400);

    const category = await prisma.serviceCategory.create({
      data: {
        name,
        description,
        image
      }
    });
    return ok(res, category, 201);
  } catch (e: any) { return fail(res, e.message); }
});

// Update service category
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image } = req.body;
    
    const category = await prisma.serviceCategory.update({
      where: { id: req.params.id as string },
      data: { name, description, image }
    });
    return ok(res, category);
  } catch (e: any) { return fail(res, e.message); }
});

// Delete service category
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if services depend on it
    const existingServices = await prisma.service.findMany({ where: { categoryId: req.params.id as string } });
    if (existingServices.length > 0) {
      return fail(res, 'Impossible de supprimer: des services sont associés à cette catégorie.', 400);
    }

    await prisma.serviceCategory.delete({ where: { id: req.params.id as string } });
    return ok(res, { message: 'Catégorie supprimée' });
  } catch (e: any) { return fail(res, e.message); }
});

export default router;
