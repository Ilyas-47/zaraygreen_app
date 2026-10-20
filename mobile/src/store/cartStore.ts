import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  categoryId?: string;
}

interface CartState {
  items: CartItem[];
  promoCode: string | null;
  discountPercentage: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  setPromoCode: (code: string | null, discount: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getSubTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      promoCode: null,
      discountPercentage: 0,
      addItem: (item) => set((state) => {
        const existing = state.items.find(i => i.id === item.id);
        if (existing) {
          return { items: state.items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i) };
        }
        return { items: [...state.items, item] };
      }),
      removeItem: (id) => set((state) => ({ items: state.items.filter(i => i.id !== id) })),
      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map(i => i.id === id ? { ...i, quantity } : i)
      })),
      setPromoCode: (code, discount) => set({ promoCode: code, discountPercentage: discount }),
      clearCart: () => set({ items: [], promoCode: null, discountPercentage: 0 }),
      getSubTotal: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0),
      getTotal: () => {
        const subTotal = get().getSubTotal();
        return subTotal * (1 - get().discountPercentage / 100);
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
