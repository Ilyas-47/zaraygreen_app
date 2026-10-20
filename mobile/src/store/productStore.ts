import { create } from 'zustand';
import { productsApi } from '../api/products.api';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number | string;
  stock: number;
  images: string[];
  categoryId: string;
  rating: number;
  createdAt?: string;
}

interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'rating' | 'createdAt'>) => Promise<void>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

// Initial mock data to ensure the app works even if backend is not running
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Premium Artificial Grass 40mm',
    description: 'Gazon synthétique de 40mm de hauteur avec un réalisme bluffant. Résistant aux UV, doux au toucher et parfait pour les balcons, terrasses et jardins familiaux.',
    price: 250.00,
    stock: 150,
    images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80'],
    categoryId: '1',
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Luxury Grass Royal 45mm',
    description: 'Le summum du réalisme et du confort. 45mm d\'épaisseur avec un mélange de fibres quadricolores pour reproduire à la perfection un gazon de printemps fraîchement tondu.',
    price: 320.00,
    stock: 80,
    images: ['https://images.unsplash.com/photo-1533460004989-cef01064af7e?auto=format&fit=crop&q=80'],
    categoryId: '1',
    rating: 4.9,
  },
  {
    id: '3',
    name: 'Rouleau Gazon Bermuda',
    description: 'Gazon Bermuda naturel de qualité supérieure cultivé localement. Idéal pour un ensoleillement fort, haute résistance au piétinement et faible consommation d\'eau après enracinement.',
    price: 85.00,
    stock: 500,
    images: ['https://images.unsplash.com/photo-1533460004989-cef01064af7e?auto=format&fit=crop&q=80'],
    categoryId: '2',
    rating: 4.7,
  },
  {
    id: '4',
    name: 'Ficus Lyrata (Figuier Lyre)',
    description: 'Plante verde d\'intérieur ultra-tendance avec de grandes feuilles sculpturales en forme de violon. Purifie l\'air et apporte une touche d\'élégance immédiate à votre salon.',
    price: 450.00,
    stock: 60,
    images: ['https://images.unsplash.com/photo-1416879598555-220023ee0b2b?auto=format&fit=crop&q=80'],
    categoryId: '3',
    rating: 4.9,
  },
  {
    id: '5',
    name: 'Monstera Deliciosa',
    description: 'Aussi appelée faux-philodendron, cette magnifique plante exotique possède de larges feuilles découpées graphiques. Facile d\'entretien et croissance rapide.',
    price: 180.00,
    stock: 120,
    images: ['https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80'],
    categoryId: '3',
    rating: 4.8,
  },
  {
    id: '6',
    name: 'Olivier d\'Ornement (Olea Europaea)',
    description: 'Véritable symbole de la Méditerranée, cet olivier d\'ornement sur tige apportera noblesse et sérénité à vos terrasses, balcons ou entrées.',
    price: 1200.00,
    stock: 15,
    images: ['https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&q=80'],
    categoryId: '3',
    rating: 5.0,
  },
  {
    id: '7',
    name: 'Pot en Céramique Minimaliste',
    description: 'Pot artisanal en céramique émaillée blanche mate avec soucoupe intégrée. Idéal pour sublimer vos Monsteras ou Ficus sur un meuble ou au sol.',
    price: 150.00,
    stock: 90,
    images: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80'],
    categoryId: '4',
    rating: 4.6,
  },
  {
    id: '8',
    name: 'Kit d\'Outils Jardinage Inox',
    description: 'Set de 5 outils ergonomiques haut de gamme en acier inoxydable avec manches en bois de frêne véritable : transplantoir, griffe, sarcloir, sécateur et gants en cuir renforcés.',
    price: 290.00,
    stock: 100,
    images: ['https://images.unsplash.com/photo-1416879598555-220023ee0b2b?auto=format&fit=crop&q=80'],
    categoryId: '5',
    rating: 4.8,
  },
];

export const useProductStore = create<ProductState>((set, get) => ({
  products: MOCK_PRODUCTS,
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      // Fetch from backend using the configured apiClient
      const response = await productsApi.getAll();
      const data = (response.data as any).data || response.data;
      if (data && Array.isArray(data) && data.length > 0) {
        set({ products: data, isLoading: false });
        return;
      }
      // If array is empty, we can still set it (or fallback to mock if you strictly want data on screen)
      if (Array.isArray(data)) {
         set({ products: data, isLoading: false });
         return;
      }
      throw new Error('No valid data received');
    } catch (error: any) {
      console.log('Using mock products due to error:', error?.message);
      set({ products: MOCK_PRODUCTS, isLoading: false });
    }
  },

  addProduct: async (newProduct) => {
    set({ isLoading: true, error: null });
    try {
      // API call to create product
      // price needs to be converted if it's passed as string with MAD, let's parse it
      let priceVal = typeof newProduct.price === 'string' ? parseFloat(newProduct.price) : newProduct.price;
      if (isNaN(priceVal)) priceVal = 0;

      const payload = {
        name: newProduct.name,
        description: newProduct.description,
        price: priceVal,
        stock: newProduct.stock,
        images: newProduct.images,
        categoryId: newProduct.categoryId,
      };

      const res = await productsApi.create(payload as any);
      const addedProduct = (res.data as any).data || res.data;

      set((state) => ({
        products: [addedProduct, ...state.products],
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to add product', isLoading: false });
      throw error;
    }
  },

  updateProduct: async (id: string, data: Partial<Product>) => {
    set({ isLoading: true, error: null });
    try {
      let priceVal = data.price;
      if (typeof priceVal === 'string') priceVal = parseFloat(priceVal) || 0;

      const payload: any = { ...data };
      if (priceVal !== undefined) payload.price = priceVal;
      if (data.images && Array.isArray(data.images)) payload.images = data.images;

      const res = await productsApi.update(id, payload);
      const updatedProduct = (res.data as any).data || res.data;

      set((state) => ({
        products: state.products.map(p => p.id === id ? { ...p, ...updatedProduct } : p),
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to update product', isLoading: false });
      throw error;
    }
  },

  deleteProduct: async (id: string) => {
    try {
      await productsApi.delete(id);
      set(state => ({ products: state.products.filter(p => p.id !== id) }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete product' });
      throw error;
    }
  },
}));
