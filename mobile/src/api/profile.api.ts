import { apiClient } from './client';

export const profileApi = {
  getAddresses: () => apiClient.get('/profile/addresses'),
  addAddress: (data: any) => apiClient.post('/profile/addresses', data),
  deleteAddress: (id: string) => apiClient.delete(`/profile/addresses/${id}`),

  getPaymentMethods: () => apiClient.get('/profile/payment-methods'),
  addPaymentMethod: (data: any) => apiClient.post('/profile/payment-methods', data),
  deletePaymentMethod: (id: string) => apiClient.delete(`/profile/payment-methods/${id}`),
};
