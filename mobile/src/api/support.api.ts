import { apiClient } from './client';

export const supportApi = {
  createTicket: (subject: string, message: string) =>
    apiClient.post('/support', { subject, message }),
};
