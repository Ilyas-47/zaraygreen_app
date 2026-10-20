import { apiClient } from './client';

export const documentsApi = {
  getAll: () => apiClient.get('/documents'),
  updateStatus: (id: string, statut: string) => apiClient.put(`/documents/${id}/status`, { statut })
};
