import { apiClient } from './client';

export const aiApi = {
  chat: (message: string, history?: any[]) => 
    apiClient.post('/ai/chat', { message, history }),
};
