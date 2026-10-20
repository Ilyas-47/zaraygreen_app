import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../../api/auth.api';
import { ordersApi } from '../../api/orders.api';
import { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

const COLORS = {
  primary: '#2D5016',
  primaryLight: '#4A7C2A',
  bg: '#F8F7F4',
  white: '#FFFFFF',
  text: '#1A1A1A',
  textMuted: '#8A8A8A',
  border: '#EBEBEB',
  red: '#EF4444',
  redLight: '#FEF2F2',
  redBorder: '#FECACA',
};

const MENU_ITEMS = [
  { icon: 'time-outline',        label: 'Historique des commandes', route: 'Orders' },
  { icon: 'calendar-outline',    label: 'Mes Réservations',         route: 'Appointments' },
  { icon: 'location-outline',    label: 'Adresses enregistrées',    route: 'Addresses' },
  { icon: 'card-outline',        label: 'Modes de paiement',        route: 'Payment' },
  { icon: 'settings-outline',    label: 'Paramètres',               route: 'Settings', badge: 'FR' },
  { icon: 'help-circle-outline', label: 'Aide & Support',           route: 'Support' },
];

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuthStore();
  const { i18n } = useTranslation();
  const [ordersCount, setOrdersCount] = useState(0);
  const [favCount, setFavCount] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        ordersApi.getMyOrders().then(res => {
          const data: any = res.data;
          if (data && data.success) {
            setOrdersCount(data.data.length);
          } else if (Array.isArray(data)) {
            setOrdersCount(data.length);
          }
        }).catch(() => setOrdersCount(0));

        AsyncStorage.getItem('favorites').then(str => {
          if (str) {
            const favs = JSON.parse(str);
            setFavCount(favs.length || 0);
          }
        }).catch(() => setFavCount(0));
      }
    }, [user])
  );

  const toggleLanguage = async () => {
    const newLang = i18n.language === 'en' ? 'fr' : 'en';
    await i18n.changeLanguage(newLang);
    await AsyncStorage.setItem('settings.lang', newLang);
  };

  return (
    <SafeAreaView style={styles.safe}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.iconBtn}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.logo}>ZARAY</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="person-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Title ── */}
        <Text style={styles.pageTitle}>Mon Profil</Text>

        {/* ── Avatar + Nom ── */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            {user?.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, { backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons name="person" size={50} color="#9CA3AF" />
              </View>
            )}
            {user && (
              <TouchableOpacity style={styles.editBadge}>
                <Ionicons name="pencil" size={12} color={COLORS.white} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.userName}>{user ? user.name : 'Visiteur'}</Text>
          <Text style={styles.userSince}>{user ? user.email : 'Connectez-vous pour voir vos informations'}</Text>
        </View>

        {/* ── Stats ── */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="cube-outline" size={22} color={COLORS.primary} />
            <Text style={styles.statValue}>{ordersCount}</Text>
            <Text style={styles.statLabel}>Commandes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="heart-outline" size={22} color={COLORS.primary} />
            <Text style={styles.statValue}>{favCount}</Text>
            <Text style={styles.statLabel}>Favoris</Text>
          </View>
        </View>

        {/* ── Menu Items ── */}
        <View style={styles.menuCard}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index < MENU_ITEMS.length - 1 && styles.menuItemBorder,
              ]}
              onPress={() => {
                if (item.route === 'Settings') toggleLanguage();
                else navigation.navigate(item.route);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name={item.icon as any} size={20} color={COLORS.text} style={styles.menuIcon} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              {item.badge ? (
                <Text style={styles.menuBadge}>{item.badge}</Text>
              ) : null}
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Admin Banner ── */}
        {user?.role?.toUpperCase() === 'ADMIN' && (
          <TouchableOpacity
            style={styles.adminBanner}
            onPress={() => navigation.navigate('AdminDashboard')}
          >
            <Ionicons name="shield-checkmark" size={18} color={COLORS.white} />
            <Text style={styles.adminText}>Admin Dashboard</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.white} />
          </TouchableOpacity>
        )}

        {/* ── Technician Banner ── */}
        {user?.role?.toUpperCase() === 'TECHNICIEN' && (
          <TouchableOpacity
            style={[styles.adminBanner, { backgroundColor: '#059669' }]}
            onPress={() => navigation.navigate('TechnicianTasks')}
          >
            <Ionicons name="construct-outline" size={18} color={COLORS.white} />
            <Text style={styles.adminText}>Espace Technicien</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.white} />
          </TouchableOpacity>
        )}

        {/* ── Delivery Banner ── */}
        {user?.role?.toUpperCase() === 'LIVREUR' && (
          <TouchableOpacity
            style={[styles.adminBanner, { backgroundColor: '#3B82F6' }]}
            onPress={() => navigation.navigate('DeliveryTasks')}
          >
            <Ionicons name="bicycle-outline" size={18} color={COLORS.white} />
            <Text style={styles.adminText}>Espace Livreur</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.white} />
          </TouchableOpacity>
        )}

        {/* ── Logout / Login ── */}
        <View style={styles.logoutWrapper}>
          {user ? (
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={async () => {
                try {
                  await authApi.logout();
                } catch (e) {} // ignore fail
                logout();
                navigation.replace('Login');
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="exit-outline" size={18} color={COLORS.red} style={{ marginRight: 8 }} />
              <Text style={styles.logoutText}>Déconnexion</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <Ionicons name="log-in-outline" size={18} color={COLORS.white} style={{ marginRight: 8 }} />
              <Text style={styles.loginText}>Se connecter</Text>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.bg,
  },
  logo: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 4,
    color: COLORS.primary,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  // Title
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  // Avatar
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  editBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  userSince: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '400',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 16,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },

  // Menu
  menuCard: {
    marginHorizontal: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuIcon: {
    marginRight: 14,
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  menuBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryLight,
    marginRight: 8,
  },

  // Admin
  adminBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    padding: 16,
    gap: 10,
    marginBottom: 20,
  },
  adminText: {
    flex: 1,
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },

  // Logout
  logoutWrapper: {
    marginHorizontal: 20,
    marginBottom: 100,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.red,
    paddingVertical: 14,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.red,
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
  },
  loginText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
});