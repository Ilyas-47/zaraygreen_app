// src/api/client.ts
import axios, { AxiosError } from 'axios';
import { API_URL } from '../constants/config';
import { useAuthStore } from '../store/authStore';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor — ajoute le token JWT ──
apiClient.interceptors.request.use(
  config => {
    const token = useAuthStore.getState().user?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// ── Response interceptor — gère les erreurs globales ──
apiClient.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expiré → déconnexion automatique
      useAuthStore.getState().logout();
      const { reset } = require('../navigation/RootNavigation');
      reset('Login');
    }
    return Promise.reject(error);
  }
);