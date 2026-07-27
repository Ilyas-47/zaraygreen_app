import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { prisma } from '../utils/prisma';
import { ok, fail } from '../utils';

const router = Router();

// ==========================================
// ADDRESSES
// ==========================================

// Get user addresses
router.get('/addresses', authenticate, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    return ok(res, addresses);
  } catch (e: any) { return fail(res, e.message); }
});

// Add user address
router.post('/addresses', authenticate, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { rue, ville, codePostal, pays, latitude, longitude, name } = req.body;
    
    // We can use 'name' if we want to store it, but 'Address' model doesn't have a 'name' field in schema!
    // It has: rue, ville, codePostal, pays, latitude, longitude
    // Let's store 'name' in 'rue' for now, or combine them if needed.
    // Wait, the UI has 'addressName' and 'addressDetails'.
    // We'll store addressName in 'ville' or combine it in 'rue': "[Name] - Details"
    const finalRue = name ? `${name} - ${rue}` : rue;

    const address = await prisma.address.create({
      data: {
        userId,
        rue: finalRue || '',
        ville: ville || 'Inconnue',
        codePostal,
        pays: pays || 'Maroc',
        latitude,
        longitude
      }
    });
    return ok(res, address, 201);
  } catch (e: any) { return fail(res, e.message); }
});

// Delete user address
router.delete('/addresses/:id', authenticate, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    // Verify ownership
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return fail(res, 'Adresse introuvable', 404);
    }

    await prisma.address.delete({ where: { id } });
    return ok(res, { message: 'Adresse supprimée' });
  } catch (e: any) { return fail(res, e.message); }
});

// ==========================================
// PAYMENT METHODS
// ==========================================

// Get user payment methods
router.get('/payment-methods', authenticate, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const cards = await prisma.paymentMethod.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    return ok(res, cards);
  } catch (e: any) { return fail(res, e.message); }
});

// Add user payment method
router.post('/payment-methods', authenticate, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { brand, last4, expMonth, expYear } = req.body;
    
    const pm = await prisma.paymentMethod.create({
      data: {
        userId,
        brand,
        last4,
        expMonth,
        expYear
      }
    });
    return ok(res, pm, 201);
  } catch (e: any) { return fail(res, e.message); }
});

// Delete user payment method
router.delete('/payment-methods/:id', authenticate, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const existing = await prisma.paymentMethod.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return fail(res, 'Carte introuvable', 404);
    }

    await prisma.paymentMethod.delete({ where: { id } });
    return ok(res, { message: 'Carte supprimée' });
  } catch (e: any) { return fail(res, e.message); }
});

export default router;
