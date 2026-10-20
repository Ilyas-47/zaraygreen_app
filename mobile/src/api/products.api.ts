// src/api/products.api.ts
import { apiClient } from './client';
import { Product, CreateProductDto, UpdateProductDto } from '../types/product.types';

export const productsApi = {
  getAll: () =>
    apiClient.get<Product[]>('/products'),

  getById: (id: string) =>
    apiClient.get<Product>(`/products/${id}`),

  getByCategory: (categoryId: string) =>
    apiClient.get<Product[]>(`/products?categoryId=${categoryId}`),

  create: (data: CreateProductDto) =>
    apiClient.post<Product>('/products', data),

  update: (id: string, data: UpdateProductDto) =>
    apiClient.put<Product>(`/products/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/products/${id}`),
};