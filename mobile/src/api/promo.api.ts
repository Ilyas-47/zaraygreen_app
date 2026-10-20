import { apiClient } from './client';

export const promoApi = {
  validate: (code: string) => apiClient.get<{ id: string; discountPercentage: number }>(`/promo/validate/${code}`),
};
