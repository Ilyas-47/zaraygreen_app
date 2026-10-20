// src/types/navigation.types.ts
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Product }  from './product.types';
import { Service }  from './service.types';

export type RootStackParamList = {
  // Shared
  Splash:          undefined;

  // Auth
  Login:           undefined;
  Register:        undefined;

  // Main
  Home:            undefined;

  // Shop
  AllProducts:     { categoryId?: string } | undefined;
  ProductDetails:  { product: Product };
  Checkout:        undefined;
  QuoteRequest:    undefined;
  ServiceBooking: { service: Service };
  ZarayAi:        undefined;
  Notifications:  undefined;

  // Profile
  Orders:          undefined;
  Profile:         undefined;
  Addresses:       undefined;
  Payment:         undefined;
  Settings:        undefined;
  Support:         undefined;

  // Admin
  AdminDashboard:  undefined;
  AddProduct:      undefined;
  ManageProducts:  undefined;
  ManageQuotes:    undefined;
  ManageClients:   undefined;

  // Technician
  TechnicianTasks: undefined;
  ServiceDetail:   { service: Service };

  // Delivery
  DeliveryTasks:   undefined;
};

// Helper type pour typer props de chaque screen
export type ScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;