import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../utils/prisma';
import { ok, fail } from '../utils';

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const aiController = {
  async chat(req: Request, res: Response) {
    try {
      const { message, history } = req.body;
      console.log('AI Chat Request Received:', message);

      if (!message) {
        return fail(res, "Le message est requis", 400);
      }

      // 1. Fetch catalog context (products & services)
      const products = await prisma.product.findMany({
        where: { stock: { gt: 0 } },
        select: { id: true, name: true, description: true, price: true, images: true, category: { select: { name: true } } }
      });

      const services = await prisma.service.findMany({
        where: { isActive: true },
        select: { id: true, name: true, description: true, basePrice: true, image: true }
      });

      // 2. Build system instruction
      const catalogInfo = `PRODUITS DISPONIBLES:\n${products.map(p => `- ID: ${p.id} | Nom: ${p.name} | Prix: ${p.price} MAD | Description: ${p.description}`).join('\n')}\n\nSERVICES DISPONIBLES:\n${services.map(s => `- ID: ${s.id} | Nom: ${s.name} | Prix: ${s.basePrice || 'Devis'} | Description: ${s.description}`).join('\n')}`;

      const systemInstruction = `Tu es Zaray AI, l'assistant expert virtuel de l'entreprise "Zaray Green" spécialisée dans la vente de plantes, gazons, et services paysagers.
RÈGLES STRICTES :
1. Tu ne dois JAMAIS prendre une commande manuellement (ne demande jamais le nom, numéro ou adresse de livraison).
2. Ton seul but est d'aider le client à choisir des produits ou services de notre catalogue.
3. Quand tu recommandes un produit de notre catalogue, tu DOIS insérer son ID exactement sous la forme [PRODUIT:id] dans ton texte (exemple: "Je vous conseille ce magnifique ficus [PRODUIT:xxx]").
4. Pareil pour les services, utilise [SERVICE:id].
5. Dis toujours au client de cliquer sur les produits affichés sous ton message pour les ajouter au panier.
6. Sois amical, utilise des emojis 🌿🪴. Ne propose rien en dehors du catalogue.

Voici le catalogue :
\n${catalogInfo}\n`;

      // 3. Format history for Gemini
      const rawHistory = history || [];
      const sanitizedHistory: any[] = [];
      
      for (const h of rawHistory) {
        const role = h.role === 'model' ? 'model' : 'user';
        const text = h.text || '[Produit proposé]';
        
        if (sanitizedHistory.length === 0 && role === 'model') continue; // First message should be user
        
        if (sanitizedHistory.length > 0) {
          const lastRole = sanitizedHistory[sanitizedHistory.length - 1].role;
          if (role === lastRole) {
            // Overwrite if it's the same role
            sanitizedHistory[sanitizedHistory.length - 1].text = text;
            continue;
          }
        }
        sanitizedHistory.push({ role, text });
      }

      // Before calling sendMessage (which is a 'user' action), the history MUST end with 'model' or be empty
      if (sanitizedHistory.length > 0 && sanitizedHistory[sanitizedHistory.length - 1].role === 'user') {
        sanitizedHistory.pop();
      }

      const formattedHistory = sanitizedHistory.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }));

      // 4. Call Gemini
      const model = ai.getGenerativeModel({ 
        model: 'gemini-3.5-flash-lite',
        systemInstruction: systemInstruction
      });

      const chat = model.startChat({
        history: formattedHistory,
        generationConfig: {
          temperature: 0.7,
        }
      });

      const response = await chat.sendMessage(message);
      const replyText = response.response.text() || "Désolé, je n'ai pas pu générer une réponse.";

      return ok(res, { reply: replyText, catalog: { products, services } });

    } catch (error: any) {
      console.error('AI Chat Error:', error);
      return fail(res, "Erreur lors de la communication avec l'IA", 500);
    }
  }
};
