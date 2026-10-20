import { create } from 'zustand';
import { categoriesApi } from '../api/categories.api';
import { Category } from '../types/category.types';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  isLoading: false,
  error: null,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await categoriesApi.getAll();
      // Ensure we extract the data correctly if it's wrapped
      const data = (response.data as any).data || response.data;
      if (data && Array.isArray(data)) {
        set({ categories: data, isLoading: false });
      } else {
        throw new Error('Format de données invalide');
      }
    } catch (error: any) {
      console.log('Erreur fetch categories', error?.message);
      set({ error: error?.message || 'Erreur lors du chargement des catégories', isLoading: false });
    }
  },
}));
