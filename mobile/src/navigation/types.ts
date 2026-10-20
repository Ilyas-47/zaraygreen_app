import { Product } from '../store/productStore';
import { Order } from '../store/orderStore';

export interface Service {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  image?: string;
  tag?: string;
  address?: string;
  estimatedHours?: number;
  status?: string;
  statusColor?: string;
}

export type RootStackParamList = {
  Splash:          undefined;
  Login:           undefined;
  Register:        undefined;
  Home:            undefined;
  ProductDetails:  { product: Product };
  ServiceDetail:   { service: Service };
  
  // --- Admin ---
  AdminDashboard: undefined;
  ManageUsers:    { role: 'CLIENT' | 'LIVREUR' | 'TECHNICIEN' | 'ADMIN' };
  ManageOrders:   undefined;
  Support:        undefined;
  OrderTracking:  { order: Order };

  // --- Shop ---
  Cart:           undefined;
  Checkout:       undefined;
  Payment:        { orderId: string };
  Profile:        undefined;
  Settings:       undefined;
};

// Usage dans les screens :
import { NativeStackScreenProps } from '@react-navigation/native-stack';
type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetails'>;
export default function ProductDetailsScreen({ route, navigation }: Props) {}
