import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useProductStore } from '../../store/productStore';
import { ordersApi } from '../../api/orders.api';
import { appointmentsApi } from '../../api/appointments.api';
import { useFocusEffect } from '@react-navigation/native';
import { useUserStore } from '../../store/userStore';

const COLORS = {
  bg: '#0F1A0A',
  cardDark: '#1A2E10',
  cardGreen: '#1E3B12',
  cardGray: '#151F0F',
  white: '#FFFFFF',
  text: '#FFFFFF',
  textMuted: 'rgba(255,255,255,0.55)',
  textSub: 'rgba(255,255,255,0.35)',
  accent: '#4ADE80',
  accentDark: '#2D5016',
  primary: '#2D5016',
  primaryLight: '#4A7C2A',
  border: 'rgba(255,255,255,0.08)',
  inputBg: 'rgba(255,255,255,0.06)',
  tagPending: '#1E4A20',
  tagPendingText: '#4ADE80',
  tagHigh: '#4A1A1A',
  tagHighText: '#F87171',
  tagAssigned: '#1A2A4A',
  tagAssignedText: '#60A5FA',
  panelBg: '#F8F7F4',
  panelText: '#1A1A1A',
  panelMuted: '#8A8A8A',
  panelBorder: '#EBEBEB',
  tabActive: '#2D5016',
  tabInactive: 'rgba(255,255,255,0.4)',
};

// Dynamic Tabs will be calculated
const TABS = [
  { id: 'all',       label: 'Toutes' },
  { id: 'PENDING',   label: 'Nouvelles' },
  { id: 'CONFIRMED', label: 'Confirmées' },
  { id: 'EN_COURS',  label: 'En cours' },
  { id: 'DELIVERED', label: 'Livrées' },
];

export default function AdminDashboardScreen({ navigation }: any) {
  const { products } = useProductStore();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  const [orders, setOrders] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  const [isLivreurModalVisible, setLivreurModalVisible] = useState(false);
  const [orderToAssign, setOrderToAssign] = useState<any>(null);

  const { users, fetchUsers } = useUserStore();
  const livreurs = users.filter(u => (u.role || '').toUpperCase() === 'LIVREUR');

  useFocusEffect(
    React.useCallback(() => {
      fetchUsers();
      ordersApi.getAll().then(res => {
        const data = (res.data as any).data || res.data;
        if (Array.isArray(data)) setOrders(data);
      }).catch(err => console.log('Erreur fetch orders:', err));

      appointmentsApi.getAll().then(res => {
        const data = (res.data as any).data || res.data;
        if (Array.isArray(data)) setAppointments(data);
      }).catch(err => console.log('Erreur fetch appointments:', err));
    }, [])
  );

  const getTag = (status: string) => {
    if (status === 'PENDING')   return { bg: COLORS.tagPending,  text: COLORS.tagPendingText, label: 'Nouvelle' };
    if (status === 'CONFIRMED') return { bg: COLORS.tagAssigned, text: COLORS.tagAssignedText, label: 'Confirmée' };
    if (status === 'EN_COURS')  return { bg: '#1A2A4A',          text: '#60A5FA',             label: 'En cours' };
    if (status === 'DELIVERED') return { bg: COLORS.tagHigh,     text: COLORS.tagHighText, label: 'Livrée' };
    return { bg: COLORS.tagHigh, text: COLORS.tagHighText, label: status };
  };

  const getFilteredOrders = () => {
    return orders.filter(o => {
      if (activeTab !== 'all' && o.status !== activeTab) return false;
      
      const searchStr = search.toLowerCase();
      const matchName = o.items?.[0]?.product?.name?.toLowerCase().includes(searchStr);
      const matchId = o.id.toLowerCase().includes(searchStr);
      const matchUser = o.user?.name?.toLowerCase().includes(searchStr);
      return !search || matchName || matchId || matchUser;
    });
  };

  const filtered = getFilteredOrders();

  const totalActiveOrders = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'ANNULE').length;
  const pendingAppointments = appointments.filter(a => a.status === 'REQUESTED' || a.status === 'PENDING').length;
  const outOfStockProducts = products.filter(p => p.stock <= 0).length;

  const handleAssign = async (livreurId: string) => {
    if (!orderToAssign) return;
    try {
      await ordersApi.updateStatus(orderToAssign.id, 'EN_COURS', livreurId);
      setOrders(prev => prev.map(o => o.id === orderToAssign.id ? { ...o, status: 'EN_COURS', livreurId } : o));
      setLivreurModalVisible(false);
      setOrderToAssign(null);
    } catch (err) {
      alert("Erreur lors de l'assignation");
    }
  };

  const handleConfirmOrder = async (orderId: string) => {
    try {
      await ordersApi.updateStatus(orderId, 'CONFIRMED');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'CONFIRMED' } : o));
    } catch (err) {
      alert("Erreur lors de la confirmation");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Dark Hero Section ── */}
        <View style={styles.hero}>
          <SafeAreaView>
            {/* Header */}
            <View style={styles.topBar}>
              <Text style={styles.logo}>ZARAY</Text>
              <TouchableOpacity 
                style={styles.avatarBtn}
                onPress={() => navigation.navigate('Profile')}
              >
                <View style={styles.avatar}>
                  <Ionicons name="person" size={18} color={COLORS.white} />
                </View>
              </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={styles.statsSection}>
              {/* Total Active Orders */}
              <View style={styles.statMain}>
                <Text style={styles.statLabel}>COMMANDES ACTIVES</Text>
                <Text style={styles.statValue}>{totalActiveOrders}</Text>
                <View style={styles.statTrend}>
                  <Ionicons name="trending-up" size={13} color={COLORS.accent} />
                  <Text style={styles.statTrendText}>En temps réel</Text>
                </View>
              </View>

              {/* Two smaller stats */}
              <View style={styles.statRow}>
                <View style={[styles.statCard, { backgroundColor: COLORS.cardGreen }]}>
                  <Text style={styles.statCardLabel}>INTERVENTIONS EN ATTENTE</Text>
                  <Text style={styles.statCardValue}>{pendingAppointments}</Text>
                  <View style={styles.statCardIcon}>
                    <Ionicons name="alert-circle-outline" size={22} color="rgba(255,255,255,0.3)" />
                  </View>
                </View>
                <View style={[styles.statCard, { backgroundColor: COLORS.cardGray }]}>
                  <Text style={styles.statCardLabel}>PRODUITS EN RUPTURE</Text>
                  <Text style={styles.statCardValue}>{outOfStockProducts}</Text>
                  <View style={styles.statCardIcon}>
                    <Ionicons name="cube-outline" size={22} color="rgba(255,255,255,0.3)" />
                  </View>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </View>

        {/* ── Light Panel ── */}
        <View style={styles.panel}>

          {/* Title + Search */}
          <Text style={styles.panelTitle}>Pending Management</Text>

          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={16} color={COLORS.panelMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search order ID or client..."
                placeholderTextColor={COLORS.panelMuted}
                value={search}
                onChangeText={setSearch}
              />
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            {TABS.map(tab => {
              const active = activeTab === tab.id;
              let count = orders.length;
              if (tab.id !== 'all') count = orders.filter(o => o.status === tab.id).length;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.tab, active && styles.tabActive]}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>
                    {tab.label}
                  </Text>
                  <Text style={[styles.tabCount, active && styles.tabCountActive]}>
                    ({count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Order Cards */}
          <View style={styles.ordersList}>
            {filtered.length === 0 ? (
              <Text style={{ textAlign: 'center', color: COLORS.panelMuted, padding: 20 }}>Aucune commande trouvée</Text>
            ) : null}
            {filtered.map(order => {
              const tagStyle = getTag(order.status);
              const firstItem = order.items?.[0];
              const productName = firstItem?.product?.name || 'Commande multi-articles';
              const images = firstItem?.product?.images ? JSON.parse(firstItem.product.images) : [];
              const imageUrl = images[0] || 'https://via.placeholder.com/200';
              const clientName = order.user?.name || 'Client inconnu';
              
              return (
                <TouchableOpacity 
                  key={order.id} 
                  style={styles.orderCard}
                  activeOpacity={0.7}
                  onPress={() => setSelectedOrder(order)}
                >
                  <Text style={styles.orderId}>CMD-{order.id.slice(0, 8).toUpperCase()}</Text>
                  <View style={styles.orderMain}>
                    <Image source={{ uri: imageUrl }} style={styles.orderImage} resizeMode="cover" />
                    <View style={styles.orderInfo}>
                      <Text style={styles.orderName} numberOfLines={2}>{productName}</Text>
                      <Text style={styles.orderClient} numberOfLines={1}>Client : {clientName}</Text>
                    </View>
                  </View>
                  <View style={styles.orderActions}>
                    <View style={[styles.orderTag, { backgroundColor: tagStyle.bg }]}>
                      <Text style={[styles.orderTagText, { color: tagStyle.text }]}>
                        {tagStyle.label}
                      </Text>
                    </View>
                    
                    {order.status === 'PENDING' && (
                      <TouchableOpacity 
                        style={styles.assignBtn} 
                        onPress={() => handleConfirmOrder(order.id)}
                      >
                        <Text style={styles.assignBtnText}>Confirmer</Text>
                      </TouchableOpacity>
                    )}

                    {order.status === 'CONFIRMED' && (
                      <TouchableOpacity 
                        style={styles.assignBtn} 
                        onPress={() => {
                          setOrderToAssign(order);
                          setLivreurModalVisible(true);
                        }}
                      >
                        <Text style={styles.assignBtnText}>Assigner</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Quick Actions */}
          <Text style={[styles.panelTitle, { marginTop: 24 }]}>Actions rapides</Text>
          <View style={styles.quickActions}>
            {[
              { icon: 'add-circle-outline', title: 'Ajouter un produit',  sub: 'Créer un nouvel article',       route: 'AddProduct' },
              { icon: 'list-outline',       title: 'Gérer les produits',  sub: 'Modifier ou supprimer articles', route: 'ManageProducts' },
              { icon: 'document-text-outline',title: 'Gérer les devis',   sub: 'Consulter les demandes',         route: 'ManageQuotes' },
              { icon: 'people-outline',     title: 'Gérer les clients',   sub: 'Voir et gérer les comptes',      route: 'ManageClients' },
            ].map((action, i, arr) => (
              <TouchableOpacity
                key={action.route}
                style={[styles.actionBtn, i === arr.length - 1 && { borderBottomWidth: 0 }]}
                onPress={() => navigation.navigate(action.route)}
              >
                <View style={styles.actionIcon}>
                  <Ionicons name={action.icon as any} size={22} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSub}>{action.sub}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={COLORS.panelMuted} />
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: 100 }} />
        </View>

      </ScrollView>

      {/* Order Details Modal */}
      <Modal
        visible={!!selectedOrder}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedOrder(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Détails de la Commande</Text>
              <TouchableOpacity onPress={() => setSelectedOrder(null)}>
                <Ionicons name="close" size={24} color={COLORS.panelText} />
              </TouchableOpacity>
            </View>
            
            {selectedOrder && (
              <ScrollView showsVerticalScrollIndicator={false} style={{ padding: 20 }}>
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>ID Commande</Text>
                  <Text style={styles.modalValue}>CMD-{selectedOrder.id.slice(0, 8).toUpperCase()}</Text>
                </View>
                
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Client</Text>
                  <Text style={styles.modalValue}>{selectedOrder.user?.name || 'Client inconnu'}</Text>
                  {selectedOrder.user?.email && (
                    <Text style={{ color: COLORS.panelMuted, fontSize: 13, marginTop: 2 }}>{selectedOrder.user.email}</Text>
                  )}
                  {selectedOrder.user?.phone && (
                    <Text style={{ color: COLORS.panelMuted, fontSize: 13, marginTop: 2 }}>{selectedOrder.user.phone}</Text>
                  )}
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Statut</Text>
                  <View style={[styles.orderTag, { backgroundColor: getTag(selectedOrder.status).bg, alignSelf: 'flex-start' }]}>
                    <Text style={[styles.orderTagText, { color: getTag(selectedOrder.status).text }]}>
                      {getTag(selectedOrder.status).label}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.modalTitle, { fontSize: 16, marginTop: 10, marginBottom: 12 }]}>Articles ({selectedOrder.items?.length || 0})</Text>
                
                {selectedOrder.items?.map((item: any, idx: number) => {
                  const images = item.product?.images ? JSON.parse(item.product.images) : [];
                  const imageUrl = images[0] || 'https://via.placeholder.com/200';
                  return (
                    <View key={idx} style={styles.modalItemRow}>
                      <Image source={{ uri: imageUrl }} style={styles.modalItemImage} resizeMode="cover" />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.modalItemName}>{item.product?.name || 'Produit inconnu'}</Text>
                        <Text style={styles.modalItemQty}>Qté : {item.quantity}</Text>
                      </View>
                      <Text style={styles.modalItemPrice}>{item.price} DH</Text>
                    </View>
                  );
                })}

                <View style={styles.modalTotalRow}>
                  <Text style={styles.modalTotalLabel}>Total</Text>
                  <Text style={styles.modalTotalValue}>{selectedOrder.totalAmount || 0} DH</Text>
                </View>

                <View style={{ height: 40 }} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Livreur Selection Modal */}
      <Modal
        visible={isLivreurModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setLivreurModalVisible(false);
          setOrderToAssign(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '60%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionner un Livreur</Text>
              <TouchableOpacity onPress={() => {
                setLivreurModalVisible(false);
                setOrderToAssign(null);
              }}>
                <Ionicons name="close" size={24} color={COLORS.panelText} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false} style={{ padding: 20 }}>
              {livreurs.length === 0 ? (
                <Text style={{ color: COLORS.panelMuted, textAlign: 'center', marginTop: 20 }}>Aucun livreur disponible</Text>
              ) : (
                livreurs.map(livreur => (
                  <TouchableOpacity 
                    key={livreur.id} 
                    style={styles.livreurCard}
                    onPress={() => handleAssign(livreur.id)}
                  >
                    <View style={styles.livreurAvatar}>
                      <Ionicons name="bicycle" size={20} color={COLORS.white} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.livreurName}>{livreur.name}</Text>
                      <Text style={styles.livreurEmail}>{livreur.email}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={COLORS.panelMuted} />
                  </TouchableOpacity>
                ))
              )}
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  // Hero dark
  hero: {
    backgroundColor: COLORS.bg,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    paddingBottom: 24,
  },
  logo: { fontSize: 16, fontWeight: '700', color: COLORS.white, letterSpacing: 2 },
  avatarBtn: {},
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.cardGreen,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },

  // Stats
  statsSection: { gap: 14 },
  statMain: { gap: 4 },
  statLabel: { fontSize: 10, fontWeight: '600', color: COLORS.textMuted, letterSpacing: 1.5 },
  statValue: { fontSize: 52, fontWeight: '800', color: COLORS.white, lineHeight: 60 },
  statTrend: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statTrendText: { fontSize: 12, color: COLORS.accent, fontWeight: '500' },

  statRow: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1, borderRadius: 16, padding: 16,
    position: 'relative', overflow: 'hidden', minHeight: 100,
  },
  statCardLabel: { fontSize: 9, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 1.2, marginBottom: 8 },
  statCardValue: { fontSize: 36, fontWeight: '800', color: COLORS.white },
  statCardIcon: { position: 'absolute', bottom: 12, right: 12 },

  // Panel
  panel: {
    backgroundColor: COLORS.panelBg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 28,
    marginTop: -8,
  },
  panelTitle: { fontSize: 18, fontWeight: '800', color: COLORS.panelText, marginBottom: 16 },

  // Search
  searchRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.panelBorder,
    paddingHorizontal: 12, paddingVertical: 10, gap: 8,
  },
  searchInput: { flex: 1, fontSize: 13, color: COLORS.panelText },
  filterBtn: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.panelBorder,
    alignItems: 'center', justifyContent: 'center',
  },

  // Tabs
  tabs: { flexDirection: 'row', gap: 0, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: COLORS.panelBorder },
  tab: { paddingBottom: 10, paddingRight: 20, flexDirection: 'row', gap: 4, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: COLORS.tabActive },
  tabText: { fontSize: 13, fontWeight: '600', color: COLORS.panelMuted },
  tabTextActive: { color: COLORS.tabActive },
  tabCount: { fontSize: 11, color: COLORS.panelMuted },
  tabCountActive: { color: COLORS.tabActive },

  // Orders
  ordersList: { gap: 12 },
  orderCard: {
    backgroundColor: COLORS.white, borderRadius: 16,
    padding: 14, borderWidth: 1, borderColor: COLORS.panelBorder,
    gap: 10,
  },
  orderId: { fontSize: 10, fontWeight: '600', color: COLORS.panelMuted, letterSpacing: 0.5 },
  orderMain: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  orderImage: { width: 56, height: 56, borderRadius: 12, backgroundColor: '#EEF4E8' },
  orderInfo: { flex: 1, gap: 3 },
  orderName: { fontSize: 14, fontWeight: '700', color: COLORS.panelText },
  orderClient: { fontSize: 11, color: COLORS.panelMuted },
  orderActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  orderTag: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
  },
  orderTagText: { fontSize: 11, fontWeight: '700' },
  assignBtn: {
    paddingHorizontal: 16, paddingVertical: 7,
    backgroundColor: '#1A1A1A', borderRadius: 8,
  },
  assignBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.white },

  // Quick actions
  quickActions: {
    backgroundColor: COLORS.white, borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.panelBorder, overflow: 'hidden',
  },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.panelBorder,
  },
  actionIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#EEF4E8', alignItems: 'center', justifyContent: 'center',
  },
  actionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.panelText },
  actionSub: { fontSize: 11, color: COLORS.panelMuted, marginTop: 1 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.panelBg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.panelBorder,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.panelText,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.panelMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  modalValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.panelText,
  },
  modalItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
  },
  modalItemImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#EEF4E8',
  },
  modalItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.panelText,
    marginBottom: 2,
  },
  modalItemQty: {
    fontSize: 12,
    color: COLORS.panelMuted,
  },
  modalItemPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  modalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.panelBorder,
  },
  modalTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.panelText,
  },
  modalTotalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  livreurCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
    marginBottom: 10,
  },
  livreurAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  livreurName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.panelText,
  },
  livreurEmail: {
    fontSize: 12,
    color: COLORS.panelMuted,
  },
});