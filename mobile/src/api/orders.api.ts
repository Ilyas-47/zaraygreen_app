// src/api/orders.api.ts
import { apiClient } from './client';
import { Order, CreateOrderDto } from '../types/order.types';

export const ordersApi = {
  getAll: () =>
    apiClient.get<Order[]>('/orders'),

  getMyOrders: () =>
    apiClient.get<Order[]>('/orders/my'),

  getById: (id: string) =>
    apiClient.get<Order>(`/orders/${id}`),

  create: (data: CreateOrderDto) =>
    apiClient.post<Order>('/orders', data),

  updateStatus: (id: string, status: string, livreurId?: string) =>
    apiClient.patch(`/orders/${id}/status`, { status, livreurId }),

  // Pour le livreur
  getDeliveries: () =>
    apiClient.get<Order[]>('/orders/deliveries'),

  markDelivered: (id: string) =>
    apiClient.patch(`/orders/${id}/deliver`),
};