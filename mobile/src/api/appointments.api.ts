import { apiClient } from './client';

export const appointmentsApi = {
  getAll: () => apiClient.get('/appointments'),
  
  create: (data: { serviceId: string; address?: string; scheduledAt?: string; notes?: string; locationLat?: number; locationLng?: number; }) => 
    apiClient.post('/appointments', data),
  
  getMy: () => apiClient.get('/appointments/my'),
  getTasks: () => apiClient.get('/appointments/tasks'),
  updateStatus: (id: string, status: string, notes?: string) => 
    apiClient.patch(`/appointments/${id}/status`, { status, notes }),
};
