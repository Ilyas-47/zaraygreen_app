// src/hooks/useProducts.ts
import { useEffect } from 'react';
import { useProductStore } from '../store/productStore';

export const useProducts = (categoryId?: string) => {
  const { products, fetchProducts, isLoading } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, []);

  const filtered = categoryId && categoryId !== 'all'
    ? products.filter(p => p.categoryId === categoryId)
    : products;

  const featured = products.filter(p => p.rating >= 4.8);

  return {
    products: filtered,
    featured,
    isLoading,
    total: filtered.length,
  };
};