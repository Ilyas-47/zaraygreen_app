import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  Alert, Dimensions, Linking, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../../store/authStore';
import { ordersApi } from '../../api/orders.api';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#2D5016', primaryLight: '#4A7C2A',
  heroBg: '#0F1A0A', bg: '#F8F7F4', white: '#FFFFFF',
  text: '#1A1A1A', textMuted: '#8A8A8A', border: '#EBEBEB',
  pillBg: '#EEF4E8', accent: '#4ADE80',
  cardDark: '#1A2E10', mapBg: '#2A3F1A',
  red: '#EF4444', redLight: '#FEE2E2',
};

export default function DeliveryScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [deliveries, setDeliveries] = useState<any[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      fetchDeliveries();
    }, [])
  );

  const fetchDeliveries = () => {
    ordersApi.getDeliveries().then(res => {
      const data = (res.data as any).data || res.data;
      if (Array.isArray(data)) setDeliveries(data);
    }).catch(err => console.log('Erreur fetch deliveries', err));
  };

  const activeCount = deliveries.filter(d => d.status === 'EN_COURS').length;
  const deliveredCount = deliveries.filter(d => d.status === 'DELIVERED').length;
  const totalEarnings = deliveries.reduce((s, d) => s + (d.totalAmount || 0), 0);

  const handleCall = (phone?: string) => {
    if (!phone) {
      Alert.alert('Erreur', 'Pas de numéro de téléphone pour ce client.');
      return;
    }
    Linking.openURL(`tel:${phone}`);
  };

  const handleOpenMaps = (addressStr?: string) => {
    if (!addressStr || addressStr === 'Adresse non spécifiée') {
      Alert.alert('Erreur', 'Pas d\'adresse pour ce client.');
      return;
    }
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressStr)}`;
    Linking.openURL(url);
  };

  const handleDeliver = (id: string, client: string) => {
    Alert.alert(
      'Confirmer la livraison',
      `Confirmer la livraison pour ${client} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer', onPress: async () => {
            try {
              await ordersApi.markDelivered(id);
              setDeliveries(p => p.map(d => d.id === id ? { ...d, status: 'DELIVERED' } : d));
            } catch (err) {
              Alert.alert('Erreur', 'Impossible de marquer comme livré.');
            }
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Hero ── */}
        <View style={styles.hero}>
          <SafeAreaView>
            {/* Top bar */}
            <View style={styles.topBar}>
              <View style={{ width: 26 }} />
              <Text style={styles.logo}>ZARAY</Text>
              <TouchableOpacity 
                style={styles.avatarBtn}
                onPress={() => navigation.navigate('Profile')}
              >
                <View style={styles.avatar}>
                  <Ionicons name="person" size={16} color="white" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Greeting */}
            <Text style={styles.greeting}>Bonjour, {user?.name || 'Livreur'}</Text>
            <Text style={styles.greetingSub}>
              Vous avez <Text style={styles.greetingAccent}>{activeCount} commandes actives</Text> pour aujourd'hui.
            </Text>
          </SafeAreaView>
        </View>

        {/* ── Panel ── */}
        <View style={styles.panel}>

          {/* Deliveries List */}
          <View style={styles.list}>
            {deliveries.length === 0 ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Ionicons name="bag-check-outline" size={48} color={COLORS.textLight} />
                <Text style={{ marginTop: 12, fontSize: 16, color: COLORS.textMuted, textAlign: 'center' }}>Aucune livraison assignée pour le moment.</Text>
              </View>
            ) : (
              deliveries.map((delivery) => {
                const isDone = delivery.status === 'DELIVERED';
                const clientName = delivery.user?.name || 'Client inconnu';
                const addressStr = delivery.address ? `${delivery.address.rue}, ${delivery.address.ville}` : 'Adresse non spécifiée';
                const itemsStr = delivery.items?.map((i: any) => `${i.quantity}x ${i.product?.name}`).join(', ') || 'Articles...';
                
                return (
                  <View key={delivery.id} style={styles.deliveryCard}>

                    {/* Content */}
                    <View style={styles.deliveryContent}>
                      {/* Client + Actions */}
                      <View style={styles.deliveryTopRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.clientName}>{clientName}</Text>
                          <Text style={styles.clientAddress}>{addressStr}</Text>
                        </View>
                        <View style={styles.contactBtns}>
                          <TouchableOpacity style={styles.contactBtn} onPress={() => handleCall(delivery.user?.phone)}>
                            <Ionicons name="call-outline" size={16} color={COLORS.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.contactBtn} onPress={() => handleOpenMaps(addressStr)}>
                            <Ionicons name="map-outline" size={16} color={COLORS.primary} />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Items Details */}
                      <View style={{ marginTop: 12, gap: 10, marginBottom: 16 }}>
                        {delivery.items?.map((item: any) => {
                          const product = item.product;
                          let imageUrl = 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80';
                          if (Array.isArray(product?.images) && product.images.length > 0) {
                            imageUrl = product.images[0];
                          } else if (typeof product?.images === 'string') {
                            try {
                              const parsed = JSON.parse(product.images);
                              if (Array.isArray(parsed) && parsed.length > 0) imageUrl = parsed[0];
                            } catch (e) {
                              imageUrl = product.images;
                            }
                          }

                          return (
                            <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                              <Image source={{ uri: imageUrl }} style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: COLORS.pillBg }} />
                              <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.text }}>{product?.name || 'Produit inconnu'}</Text>
                                <Text style={{ fontSize: 12, color: COLORS.textMuted }}>Quantité: {item.quantity}</Text>
                              </View>
                            </View>
                          );
                        })}
                      </View>

                      {/* Mark Delivered */}
                      <TouchableOpacity
                        style={[styles.deliverBtn, isDone && styles.deliverBtnDone]}
                        onPress={() => !isDone && handleDeliver(delivery.id, clientName)}
                        activeOpacity={isDone ? 1 : 0.85}
                      >
                        {isDone
                          ? <Ionicons name="checkmark-circle" size={18} color="white" />
                          : <Ionicons name="bag-check-outline" size={18} color="white" />
                        }
                        <Text style={styles.deliverBtnText}>
                          {isDone ? 'Livrée ✓' : 'Marquer Livrée'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>

          {/* ── Stats Bar ── */}
          <View style={styles.statsBar}>
            {[
              { label: 'LIVRAISONS', value: `${deliveredCount}/${deliveries.length}` },
              { label: 'VALEUR',     value: `${totalEarnings.toFixed(2)} MAD` },
            ].map((s, i) => (
              <View key={i} style={[styles.statItem, i === 0 && styles.statItemBorder]}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.heroBg },

  // Hero
  hero: { backgroundColor: COLORS.heroBg, paddingHorizontal: 20, paddingBottom: 28 },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 14, paddingBottom: 20,
  },
  logo: { fontSize: 16, fontWeight: '800', letterSpacing: 4, color: 'white' },
  avatarBtn: {},
  avatar: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  greeting: { fontSize: 24, fontWeight: '800', color: 'white', marginBottom: 6 },
  greetingSub: { fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 20 },
  greetingAccent: { color: COLORS.accent, fontWeight: '700' },

  // Incoming card
  incomingCard: {
    backgroundColor: COLORS.cardDark, borderRadius: 18,
    padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  incomingHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  incomingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.accent },
  incomingLabel: { fontSize: 10, fontWeight: '700', color: COLORS.accent, letterSpacing: 1.5 },
  incomingTitle: { fontSize: 22, fontWeight: '900', color: 'white', lineHeight: 28, marginBottom: 8 },
  incomingMeta: { flexDirection: 'row', marginBottom: 2 },
  incomingMetaText: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  incomingEarnings: { fontSize: 18, fontWeight: '800', color: 'white', marginBottom: 16 },
  incomingActions: { flexDirection: 'row', gap: 10 },
  refuseBtn: {
    flex: 1, height: 42, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  refuseBtnText: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
  acceptBtn: {
    flex: 1, height: 42, borderRadius: 10,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
  },
  acceptBtnText: { fontSize: 13, fontWeight: '700', color: 'white' },

  // Panel
  panel: {
    backgroundColor: COLORS.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingTop: 24, marginTop: -12,
  },

  list: { paddingHorizontal: 20, gap: 16 },

  // Delivery card
  deliveryCard: {
    backgroundColor: COLORS.white, borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden',
  },

  // Map
  mapBox: { width: '100%', height: 130, position: 'relative' },
  mapBg: { flex: 1, backgroundColor: COLORS.mapBg, position: 'relative', overflow: 'hidden' },
  mapLine: {
    position: 'absolute', left: 0, right: 0, height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  mapLineV: {
    position: 'absolute', top: 0, bottom: 0, width: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  mapRoute: {
    position: 'absolute', left: '20%', right: '20%', top: '40%',
    height: 3, backgroundColor: COLORS.accent,
    borderRadius: 2, opacity: 0.8,
  },
  mapPin: {
    position: 'absolute', right: '25%', top: '25%',
  },
  mapDistanceBadge: {
    position: 'absolute', bottom: 10, left: 12,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8,
    paddingVertical: 4, borderRadius: 100,
  },
  mapDistanceText: { fontSize: 10, fontWeight: '700', color: 'white' },

  // Delivery content
  deliveryContent: { padding: 16, gap: 10 },
  deliveryTopRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  clientName: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  clientAddress: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  contactBtns: { flexDirection: 'row', gap: 8 },
  contactBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: COLORS.pillBg, alignItems: 'center', justifyContent: 'center',
  },
  itemsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  itemsText: { fontSize: 12, color: COLORS.textMuted, flex: 1 },

  deliverBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, height: 44, backgroundColor: COLORS.primary, borderRadius: 12,
  },
  deliverBtnDone: { backgroundColor: COLORS.primaryLight },
  deliverBtnText: { fontSize: 13, fontWeight: '700', color: 'white' },

  // Stats bar
  statsBar: {
    flexDirection: 'row', marginHorizontal: 20, marginTop: 24,
    backgroundColor: COLORS.white, borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.border,
    paddingVertical: 16,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statItemBorder: { borderRightWidth: 1, borderRightColor: COLORS.border },
  statValue: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: 9, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 1 },
});