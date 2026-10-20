// src/types/order.types.ts

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'DELIVERING'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod = 'card' | 'paypal' | 'cash';

export interface OrderItem {
  id:        string;
  productId: string;
  name:      string;
  image:     string;
  price:     number;
  quantity:  number;
}

export interface Order {
  id:             string;
  userId:         string;
  items:          OrderItem[];
  total:          number;
  status:         OrderStatus;
  address:        string;
  phone:          string;
  paymentMethod:  PaymentMethod;
  promoCode?:     string;
  createdAt:      string;
  updatedAt:      string;
}

export interface CreateOrderDto {
  items:          { productId: string; quantity: number }[];
  addressId?:     string;
  newAddress?:    { rue: string; ville: string; codePostal?: string; pays?: string; };
  phone?:         string;
  paymentMode:    PaymentMethod;
  promoCode?:     string;
}