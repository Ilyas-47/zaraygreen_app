// src/constants/routes.ts

export const ROUTES = {
  // Shared
  SPLASH:           'Splash',

  // Auth
  LOGIN:            'Login',
  REGISTER:         'Register',

  // Main
  HOME:             'Home',

  // Shop
  ALL_PRODUCTS:     'AllProducts',
  PRODUCT_DETAILS:  'ProductDetails',
  CHECKOUT:         'Checkout',

  // Profile
  ORDERS:           'Orders',
  PROFILE:          'Profile',

  // Admin
  ADMIN_DASHBOARD:  'AdminDashboard',
  ADD_PRODUCT:      'AddProduct',
  MANAGE_PRODUCTS:  'ManageProducts',
  MANAGE_CLIENTS:   'ManageClients',

  // Technician
  TECHNICIAN_TASKS: 'TechnicianTasks',
  SERVICE_DETAIL:   'ServiceDetail',

  // Delivery
  DELIVERY_TASKS:   'DeliveryTasks',
} as const;

// Type utile pour navigate()
export type RouteName = typeof ROUTES[keyof typeof ROUTES];