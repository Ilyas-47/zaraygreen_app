import { create } from 'zustand';

// ─── Types ──────────────────────────────────────────────
export type OrderStatus =
  | 'EN_ATTENTE'
  | 'ASSIGNEE'
  | 'ACCEPTEE'
  | 'EN_LIVRAISON'
  | 'LIVREE'
  | 'ANNULEE';

export type AppointmentStatus =
  | 'EN_ATTENTE'
  | 'ASSIGNEE'
  | 'ACCEPTEE'
  | 'EN_COURS'
  | 'TERMINEE'
  | 'ANNULEE';

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  clientName: string;
  clientPhone: string;
  address: string;
  date: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  livreurId?: string;
  livreurName?: string;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  address: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  serviceTitle: string;
  serviceDesc: string;
  technicienId?: string;
  technicienName?: string;
  photosBefore: string[];
  photosAfter: string[];
  notes?: string;
}

// ─── Mock Data ──────────────────────────────────────────
const MOCK_ORDERS: Order[] = [
  {
    id: 'CMD-2401',
    clientName: 'Fatima El Amrani',
    clientPhone: '+212 6 12 34 56 78',
    address: '14 Rue des Palmiers, Casablanca',
    date: '2026-05-30',
    status: 'EN_ATTENTE',
    total: 750,
    items: [
      { name: 'Premium Artificial Grass 40mm', quantity: 2, price: 250, image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80' },
      { name: 'Monstera Deliciosa', quantity: 1, price: 180, image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80' },
    ],
  },
  {
    id: 'CMD-2402',
    clientName: 'Youssef Bennani',
    clientPhone: '+212 6 98 76 54 32',
    address: '8 Boulevard Zerktouni, Rabat',
    date: '2026-05-30',
    status: 'EN_ATTENTE',
    total: 1200,
    items: [
      { name: 'Olivier d\'Ornement', quantity: 1, price: 1200, image: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&q=80' },
    ],
  },
  {
    id: 'CMD-2403',
    clientName: 'Sara Idrissi',
    clientPhone: '+212 6 55 44 33 22',
    address: '23 Av. Mohammed V, Marrakech',
    date: '2026-05-29',
    status: 'ASSIGNEE',
    total: 430,
    livreurId: 'livreur-1',
    livreurName: 'Livreur Pro',
    items: [
      { name: 'Ficus Lyrata', quantity: 1, price: 450, image: 'https://images.unsplash.com/photo-1416879598555-220023ee0b2b?auto=format&fit=crop&q=80' },
    ],
  },
  {
    id: 'CMD-2404',
    clientName: 'Ahmed Tazi',
    clientPhone: '+212 6 11 22 33 44',
    address: '5 Rue Ibn Sina, Fès',
    date: '2026-05-28',
    status: 'EN_LIVRAISON',
    total: 290,
    livreurId: 'livreur-1',
    livreurName: 'Livreur Pro',
    items: [
      { name: 'Kit d\'Outils Jardinage Inox', quantity: 1, price: 290, image: 'https://images.unsplash.com/photo-1416879598555-220023ee0b2b?auto=format&fit=crop&q=80' },
    ],
  },
];

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'RDV-5001',
    clientName: 'Karim Ouazzani',
    clientPhone: '+212 6 77 88 99 00',
    address: '12 Rue des Roses, Casablanca',
    date: '2026-05-31',
    time: '09:00',
    status: 'EN_ATTENTE',
    serviceTitle: 'Maintenance mensuelle',
    serviceDesc: 'Entretien régulier du jardin — taille, arrosage, fertilisation.',
    photosBefore: [],
    photosAfter: [],
  },
  {
    id: 'RDV-5002',
    clientName: 'Nadia Berrada',
    clientPhone: '+212 6 33 44 55 66',
    address: '7 Av. Hassan II, Rabat',
    date: '2026-05-31',
    time: '14:00',
    status: 'ASSIGNEE',
    serviceTitle: 'Consultation botaniste',
    serviceDesc: 'Diagnostic complet des plantes et recommandations.',
    technicienId: 'tech-1',
    technicienName: 'Technicien Vert',
    photosBefore: [],
    photosAfter: [],
  },
  {
    id: 'RDV-5003',
    clientName: 'Hassan Alaoui',
    clientPhone: '+212 6 22 11 44 55',
    address: '3 Bd Moulay Ismail, Meknès',
    date: '2026-06-01',
    time: '10:30',
    status: 'EN_ATTENTE',
    serviceTitle: 'Pack soin complet',
    serviceDesc: 'Soins exclusifs, fertilisation, rempotage et traitement phytosanitaire.',
    photosBefore: [],
    photosAfter: [],
  },
];

const LIVREURS = [
  { id: 'livreur-1', name: 'Livreur Pro' },
  { id: 'livreur-2', name: 'Hassan Livraison' },
  { id: 'livreur-3', name: 'Express Vert' },
];

const TECHNICIENS = [
  { id: 'tech-1', name: 'Technicien Vert' },
  { id: 'tech-2', name: 'Botaniste Expert' },
  { id: 'tech-3', name: 'Jardinier Pro' },
];

// ─── Store ──────────────────────────────────────────────
interface OrderStoreState {
  orders: Order[];
  appointments: Appointment[];
  livreurs: { id: string; name: string }[];
  techniciens: { id: string; name: string }[];

  // Admin actions
  assignLivreur: (orderId: string, livreurId: string, livreurName: string) => void;
  assignTechnicien: (appointmentId: string, techId: string, techName: string) => void;

  // Livreur actions
  acceptDelivery: (orderId: string) => void;
  markDelivered: (orderId: string) => void;

  // Technicien actions
  acceptAppointment: (appointmentId: string) => void;
  startAppointment: (appointmentId: string) => void;
  completeAppointment: (appointmentId: string, photosAfter: string[]) => void;
  addPhotosBefore: (appointmentId: string, photos: string[]) => void;
}

export const useOrderStore = create<OrderStoreState>((set, get) => ({
  orders: MOCK_ORDERS,
  appointments: MOCK_APPOINTMENTS,
  livreurs: LIVREURS,
  techniciens: TECHNICIENS,

  // ── Admin ──
  assignLivreur: (orderId, livreurId, livreurName) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId
          ? { ...o, status: 'ASSIGNEE' as OrderStatus, livreurId, livreurName }
          : o
      ),
    })),

  assignTechnicien: (appointmentId, techId, techName) =>
    set((state) => ({
      appointments: state.appointments.map((a) =>
        a.id === appointmentId
          ? { ...a, status: 'ASSIGNEE' as AppointmentStatus, technicienId: techId, technicienName: techName }
          : a
      ),
    })),

  // ── Livreur ──
  acceptDelivery: (orderId) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status: 'EN_LIVRAISON' as OrderStatus } : o
      ),
    })),

  markDelivered: (orderId) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status: 'LIVREE' as OrderStatus } : o
      ),
    })),

  // ── Technicien ──
  acceptAppointment: (appointmentId) =>
    set((state) => ({
      appointments: state.appointments.map((a) =>
        a.id === appointmentId ? { ...a, status: 'ACCEPTEE' as AppointmentStatus } : a
      ),
    })),

  startAppointment: (appointmentId) =>
    set((state) => ({
      appointments: state.appointments.map((a) =>
        a.id === appointmentId ? { ...a, status: 'EN_COURS' as AppointmentStatus } : a
      ),
    })),

  completeAppointment: (appointmentId, photosAfter) =>
    set((state) => ({
      appointments: state.appointments.map((a) =>
        a.id === appointmentId
          ? { ...a, status: 'TERMINEE' as AppointmentStatus, photosAfter }
          : a
      ),
    })),

  addPhotosBefore: (appointmentId, photos) =>
    set((state) => ({
      appointments: state.appointments.map((a) =>
        a.id === appointmentId
          ? { ...a, photosBefore: [...a.photosBefore, ...photos] }
          : a
      ),
    })),
}));
