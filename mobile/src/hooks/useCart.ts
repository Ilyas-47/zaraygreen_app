// src/hooks/useCart.ts
import { useCartStore } from '../store/cartStore';

export const useCart = () => {
  const { items, addItem, removeItem, updateQuantity, clearCart, getTotal } = useCartStore();

  const itemCount   = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal    = getTotal();
  const shipping    = subtotal > 0 ? 0 : 0; // Gratuit
  const total       = subtotal + shipping;

  const formatPrice = (price: number) => `${price.toFixed(2)} MAD`;

  return {
    items,
    itemCount,
    subtotal,
    shipping,
    total,
    isEmpty:      items.length === 0,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    formatPrice,
  };
};