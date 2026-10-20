import { apiClient } from './client';
import { Category } from '../types/category.types';

export const categoriesApi = {
  getAll: () => apiClient.get<Category[]>('/categories'),
};
