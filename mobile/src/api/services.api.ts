import { apiClient } from './client';

export const servicesApi = {
  getAll: () => apiClient.get('/services'),
  getById: (id: string) => apiClient.get(`/services/${id}`),
  getCategories: () => apiClient.get('/service-categories'),
};
