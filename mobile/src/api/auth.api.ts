// src/api/auth.api.ts
import { apiClient } from './client';
import { LoginDto, RegisterDto, AuthResponse } from '../types/user.types';

export const authApi = {
  login: (data: LoginDto) =>
    apiClient.post<AuthResponse>('/auth/login', data),

  register: (data: RegisterDto) =>
    apiClient.post<AuthResponse>('/auth/register', data),

  logout: () =>
    apiClient.post('/auth/logout'),

  me: () =>
    apiClient.get<AuthResponse['user']>('/auth/me'),
};