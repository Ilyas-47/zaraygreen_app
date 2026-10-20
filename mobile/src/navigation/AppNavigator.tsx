// src/navigation/AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer }        from '@react-navigation/native';
import { RootStackParamList }         from '../types/navigation.types';
import { navigationRef } from './RootNavigation';

// Shared
import SplashScreen          from '../screens/shared/SplashScreen';

// Auth
import LoginScreen           from '../screens/auth/LoginScreen';
import RegisterScreen        from '../screens/auth/RegisterScreen';

// Main
import BottomTabNavigator    from './BottomTabNavigator';

// Shop
import AllProductsScreen     from '../screens/shop/AllProductsScreen';
import ProductDetailsScreen  from '../screens/shop/ProductDetailsScreen';
import CheckoutScreen        from '../screens/shop/CheckoutScreen';
import QuoteRequestScreen    from '../screens/shop/QuoteRequestScreen';
import ServiceBookingScreen  from '../screens/shop/ServiceBookingScreen';
import ZarayAiScreen         from '../screens/shop/ZarayAiScreen';
import NotificationsScreen   from '../screens/shared/NotificationsScreen';

// Profile
import OrdersScreen          from '../screens/profile/OrdersScreen';
import AppointmentsScreen    from '../screens/profile/AppointmentsScreen';
import ProfileScreen         from '../screens/profile/ProfileScreen';
import AddressesScreen       from '../screens/profile/AddressesScreen';
import PaymentScreen         from '../screens/profile/PaymentScreen';
import SettingsScreen        from '../screens/profile/SettingsScreen';
import SupportScreen         from '../screens/profile/SupportScreen';

// Admin
import AdminDashboardScreen  from '../screens/admin/AdminDashboardScreen';
import AddProductScreen      from '../screens/admin/AddProductScreen';
import ManageProductsScreen  from '../screens/admin/ManageProductsScreen';
import ManageQuotesScreen    from '../screens/admin/ManageQuotesScreen';
import ManageClientsScreen   from '../screens/admin/ManageClientsScreen';

// Technician
import TechnicianTasksScreen from '../screens/service/TechnicianTasksScreen';
import ServiceDetailScreen   from '../screens/service/ServiceDetailScreen';

// Delivery
import DeliveryScreen        from '../screens/delivery/DeliveryScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false, animation: 'fade' }}
      >
        {/* ── Shared ── */}
        <Stack.Screen name="Splash"  component={SplashScreen} />

        {/* ── Auth ── */}
        <Stack.Screen name="Login"    component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />

        {/* ── Main App ── */}
        <Stack.Screen name="Home" component={BottomTabNavigator} />

        {/* ── Shop ── */}
        <Stack.Screen name="AllProducts"    component={AllProductsScreen} />
        <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
        <Stack.Screen name="Checkout"       component={CheckoutScreen} />
        <Stack.Screen name="QuoteRequest"   component={QuoteRequestScreen} />
        <Stack.Screen name="ServiceBooking" component={ServiceBookingScreen} />
        <Stack.Screen name="ZarayAi"        component={ZarayAiScreen} />
        <Stack.Screen name="Notifications"  component={NotificationsScreen} />

        {/* ── Profile ── */}
        <Stack.Screen name="Orders"       component={OrdersScreen} />
        <Stack.Screen name="Appointments" component={AppointmentsScreen} />
        <Stack.Screen name="Profile"      component={ProfileScreen} />
        <Stack.Screen name="Addresses" component={AddressesScreen} />
        <Stack.Screen name="Payment"   component={PaymentScreen} />
        <Stack.Screen name="Settings"  component={SettingsScreen} />
        <Stack.Screen name="Support"   component={SupportScreen} />

        {/* ── Admin ── */}
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
        <Stack.Screen name="AddProduct"     component={AddProductScreen} />
        <Stack.Screen name="EditProduct"    component={AddProductScreen} />
        <Stack.Screen name="ManageProducts" component={ManageProductsScreen} />
        <Stack.Screen name="ManageQuotes"   component={ManageQuotesScreen} />
        <Stack.Screen name="ManageClients"  component={ManageClientsScreen} />

        {/* ── Technician ── */}
        <Stack.Screen name="TechnicianTasks" component={TechnicianTasksScreen} />
        <Stack.Screen name="ServiceDetail"   component={ServiceDetailScreen} />

        {/* ── Delivery ── */}
        <Stack.Screen name="DeliveryTasks" component={DeliveryScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}