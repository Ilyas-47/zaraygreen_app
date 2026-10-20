import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const COLORS = {
  primary: '#2D5016', primaryLight: '#4A7C2A',
  bg: '#F8F7F4', white: '#FFFFFF', text: '#1A1A1A',
  textMuted: '#8A8A8A', border: '#EBEBEB', pillBg: '#EEF4E8',
  placeholder: '#C0BFB9', red: '#EF4444',
};

import { useUserStore } from '../../store/userStore';
import { User } from '../../api/users.api';

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  CLIENT:     { bg: '#EEF4E8', text: '#2D5016' },
  ADMIN:      { bg: '#FEF3C7', text: '#92400E' },
  LIVREUR:    { bg: '#DBEAFE', text: '#1D4ED8' },
  TECHNICIEN: { bg: '#F3E8FF', text: '#7C3AED' },
};

// Tabs avec count dynamique
const buildTabs = (clients: User[]) => [
  { id: 'all',        label: 'All',         count: clients.length },
  { id: 'CLIENT',     label: 'Clients',     count: clients.filter(c => c.role === 'CLIENT').length },
  { id: 'LIVREUR',    label: 'Livreurs',    count: clients.filter(c => c.role === 'LIVREUR').length },
  { id: 'TECHNICIEN', label: 'Techniciens', count: clients.filter(c => c.role === 'TECHNICIEN').length },
  { id: 'ADMIN',      label: 'Admins',      count: clients.filter(c => c.role === 'ADMIN').length },
];

export default function ManageClientsScreen({ navigation }: any) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const { users: clients, fetchUsers, deleteUser } = useUserStore();

  useEffect(() => {
    fetchUsers();
  }, []);

  const TABS = buildTabs(clients.map(c => ({ ...c, role: c.role.toUpperCase() })));

  const filtered = clients.filter(c => {
    const roleUpper = c.role ? c.role.toUpperCase() : 'USER';
    const matchTab = activeTab === 'all' || roleUpper === activeTab;
    const matchSearch =
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const formatDate = (isoStr: string) => {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return "N/A";
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Supprimer le client',
      `Voulez-vous supprimer le compte de "${name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await deleteUser(id);
            } catch (err) {
              Alert.alert('Erreur', 'Impossible de supprimer l\'utilisateur.');
            }
          } 
        },
      ]
    );
  };

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const getAvatarColor = (role: string) => {
    const map: Record<string, string> = {
      CLIENT: '#2D5016', ADMIN: '#92400E', LIVREUR: '#1D4ED8', TECHNICIEN: '#7C3AED',
    };
    return map[role] || '#2D5016';
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 1 }}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gestion clients</Text>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{clients.length}</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { label: 'Clients',     count: clients.filter(c => (c.role || '').toUpperCase() === 'CLIENT').length,     color: COLORS.primary },
            { label: 'Livreurs',    count: clients.filter(c => (c.role || '').toUpperCase() === 'LIVREUR').length,    color: '#1D4ED8' },
            { label: 'Techniciens', count: clients.filter(c => (c.role || '').toUpperCase() === 'TECHNICIEN').length, color: '#7C3AED' },
            { label: 'Admins',      count: clients.filter(c => (c.role || '').toUpperCase() === 'ADMIN').length,      color: '#92400E' },
          ].map(s => (
            <View key={s.label} style={styles.statCard}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.count}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={16} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher par nom ou email..."
            placeholderTextColor={COLORS.placeholder}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Tabs underline style (du nouveau code) ── */}
        <View style={styles.tabsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScroll}
          >
            {TABS.map(tab => {
              const active = activeTab === tab.id;
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
                    ({tab.count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Count */}
        <Text style={styles.countText}>
          {filtered.length} utilisateur{filtered.length !== 1 ? 's' : ''}
        </Text>

        {/* List */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={44} color={COLORS.border} />
              <Text style={styles.emptyText}>Aucun utilisateur trouvé</Text>
            </View>
          ) : (
            filtered.map(client => {
              const roleUpper = client.role ? client.role.toUpperCase() : 'USER';
              const roleColor = ROLE_COLORS[roleUpper] || ROLE_COLORS.CLIENT;
              return (
                <View key={client.id} style={styles.card}>
                  <View style={[styles.avatar, { backgroundColor: getAvatarColor(roleUpper) }]}>
                    <Text style={styles.avatarText}>{getInitials(client.name || '?')}</Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <View style={styles.cardTopRow}>
                      <Text style={styles.cardName} numberOfLines={1}>{client.name}</Text>
                      <View style={[styles.roleBadge, { backgroundColor: roleColor.bg }]}>
                        <Text style={[styles.roleBadgeText, { color: roleColor.text }]}>
                          {roleUpper}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.cardEmail} numberOfLines={1}>{client.email}</Text>
                    <View style={styles.cardMeta}>
                      <Text style={styles.cardMetaText}>
                        {client.orders} commande{client.orders !== 1 ? 's' : ''}
                      </Text>
                      <Text style={styles.cardMetaDot}>·</Text>
                      <Text style={styles.cardMetaText}>
                        Depuis {formatDate(client.createdAt)}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(client.id, client.name)}
                  >
                    <Ionicons name="trash-outline" size={16} color={COLORS.red} />
                  </TouchableOpacity>
                </View>
              );
            })
          )}
          <View style={{ height: 40 }} />
        </ScrollView>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.white,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: COLORS.primary },
  headerBadge: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.pillBg,
    alignItems: 'center', justifyContent: 'center',
  },
  headerBadgeText: { fontSize: 13, fontWeight: '800', color: COLORS.primary },

  statsRow: {
    flexDirection: 'row', marginHorizontal: 20, marginBottom: 14,
    backgroundColor: COLORS.white, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border,
    paddingVertical: 14,
  },
  statCard: { flex: 1, alignItems: 'center', gap: 3 },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600' },

  searchRow: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 0,
    backgroundColor: COLORS.white, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 14, paddingVertical: 11, gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text },

  // ── Tabs underline ──
  tabsWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 12,
  },
  tabsScroll: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingBottom: 12, paddingRight: 20,
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
  tabTextActive: { color: COLORS.primary, fontWeight: '700' },
  tabCount: { fontSize: 11, color: COLORS.textMuted },
  tabCountActive: { color: COLORS.primary },

  countText: {
    fontSize: 12, fontWeight: '600', color: COLORS.textMuted,
    paddingHorizontal: 20, marginBottom: 10,
  },

  list: { paddingHorizontal: 20, gap: 10 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    borderRadius: 16, borderWidth: 1, borderColor: COLORS.border,
    padding: 14, gap: 12,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarText: { fontSize: 15, fontWeight: '800', color: COLORS.white },
  cardInfo: { flex: 1, gap: 3 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  cardName: { fontSize: 14, fontWeight: '700', color: COLORS.text, flex: 1 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  roleBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  cardEmail: { fontSize: 11, color: COLORS.textMuted },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardMetaText: { fontSize: 10, color: COLORS.textMuted },
  cardMetaDot: { fontSize: 10, color: COLORS.border },
  deleteBtn: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: '#FEF2F2',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },

  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14, color: COLORS.textMuted, fontWeight: '500' },
});