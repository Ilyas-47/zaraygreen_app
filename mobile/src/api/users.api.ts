import { apiClient } from './client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  active: boolean;
  createdAt: string;
  orders: number;
}

export const usersApi = {
  getAll: () => apiClient.get<User[]>('/users'),
  delete: (id: string) => apiClient.delete(`/users/${id}`),
  toggleStatus: (id: string) => apiClient.patch(`/users/${id}/toggle`),
  changeRole: (id: string, role: string) => apiClient.patch(`/users/${id}/role`, { role }),
};
