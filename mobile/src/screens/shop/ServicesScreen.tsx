import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { servicesApi } from '../../api/services.api';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#2D5016',
  primaryLight: '#4A7C2A',
  accent: '#8CB369',
  heroBg: '#1A3009',
  bg: '#F8F7F4',
  white: '#FFFFFF',
  text: '#1A1A1A',
  textMuted: '#8A8A8A',
  border: '#EBEBEB',
  pillBg: '#EEF4E8',
  filterBg: 'rgba(255,255,255,0.12)',
};

export default function ServicesScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [activeFilter, setActiveFilter] = useState('all');
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  React.useEffect(() => {
    // Fetch Services
    servicesApi.getAll().then((res: any) => {
      const data = (res.data as any).data || res.data;
      if (Array.isArray(data)) {
        setServices(data);
      }
    }).catch((err: any) => console.log('Erreur fetch services', err));

    // Fetch Categories
    servicesApi.getCategories()
      .then((res: any) => {
        const data = (res.data as any).data || res.data;
        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch((err: any) => console.log('Erreur fetch service categories', err));
  }, []);

  const filtered = activeFilter === 'all'
    ? services
    : services.filter(s => s.categoryId === activeFilter);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} stickyHeaderIndices={[0]}>

        {/* ── Hero Header (sticky) ── */}
        <View style={styles.hero}>
          <SafeAreaView>
            {/* Top bar */}
            <View style={styles.topBar}>
              <Text style={styles.logo}>ZARAY</Text>
              <View style={styles.topBarRight}>
                <TouchableOpacity 
                  style={styles.topIconBtn}
                  onPress={() => navigation.navigate('Notifications')}
                >
                  <Ionicons name="notifications-outline" size={20} color={COLORS.white} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.topIconBtn}
                  onPress={() => user ? navigation.navigate('Profile') : navigation.navigate('Login')}
                >
                  <Ionicons name="person-outline" size={20} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Hero text */}
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Entretien{'\n'}Botanique</Text>
              <Text style={styles.heroSubtitle}>
                Confiez vos plantes à nos experts.{'\n'}Des soins adaptés à chaque espace.
              </Text>
            </View>

            {/* Filters */}
            <View style={styles.filtersRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
                <TouchableOpacity
                  style={[styles.filterPill, activeFilter === 'all' && styles.filterPillActive]}
                  onPress={() => setActiveFilter('all')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterPillText, activeFilter === 'all' && styles.filterPillTextActive]}>Tous</Text>
                </TouchableOpacity>

                {categories.map((c) => {
                  const active = activeFilter === c.id;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.filterPill, active && styles.filterPillActive]}
                      onPress={() => setActiveFilter(c.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.filterPillText, active && styles.filterPillTextActive]}>{c.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </SafeAreaView>
        </View>

        {/* ── Services List ── */}
        <View style={styles.listContainer}>
          {filtered.map((service, index) => (
            <TouchableOpacity
              key={service.id}
              style={styles.serviceCard}
              onPress={() => navigation.navigate('ServiceBooking', { service })}
              activeOpacity={0.92}
            >
              {/* Image */}
              <View style={styles.serviceImageWrapper}>
                <Image
                  source={{ uri: service.image || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80' }}
                  style={styles.serviceImage}
                  resizeMode="cover"
                />
                <View style={styles.serviceImageOverlay} />
              </View>

              {/* Content */}
              <View style={styles.serviceContent}>
                <View style={styles.serviceIconRow}>
                  <View style={styles.serviceIconWrapper}>
                    <Ionicons name={(service.icon || 'leaf-outline') as any} size={18} color={COLORS.primaryLight} />
                  </View>
                  {service.category && (
                    <View style={styles.serviceTag}>
                      <Text style={styles.serviceTagText}>{service.category.name}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.serviceTitle}>{service.name || service.title}</Text>
                <Text style={styles.serviceDesc}>{service.description}</Text>
                {service.basePrice !== undefined && (
                  <Text style={[styles.serviceTitle, { color: COLORS.primary, marginTop: 8 }]}>
                    {service.basePrice ? `${service.basePrice.toFixed(2)} MAD` : 'Sur devis'}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}

          <View style={{ height: 100 }} />
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // Hero
  hero: {
    backgroundColor: COLORS.heroBg,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    paddingBottom: 20,
  },
  logo: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 4,
    color: COLORS.white,
  },
  topBarRight: {
    flexDirection: 'row',
    gap: 8,
  },
  topIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: {
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: COLORS.white,
    lineHeight: 40,
    marginBottom: 10,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 20,
    fontWeight: '400',
  },

  // Filters
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  filtersScroll: {
    gap: 8,
    paddingRight: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
    backgroundColor: COLORS.filterBg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  filterPillActive: {
    backgroundColor: COLORS.white,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
  },
  filterPillTextActive: {
    color: COLORS.primary,
  },
  filterIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 100,
    backgroundColor: COLORS.filterBg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    flexShrink: 0,
  },
  filterIconText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },

  // List
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 20,
  },

  // Service Card
  serviceCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  serviceImageWrapper: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  serviceImage: {
    width: '100%',
    height: '100%',
  },
  serviceImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20,40,10,0.15)',
  },
  serviceContent: {
    padding: 18,
  },
  serviceIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  serviceIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.pillBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: COLORS.pillBg,
    borderRadius: 100,
  },
  serviceTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primaryLight,
    letterSpacing: 0.5,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  serviceDesc: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 20,
    fontWeight: '400',
  },
});