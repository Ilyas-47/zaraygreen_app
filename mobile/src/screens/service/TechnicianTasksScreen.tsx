import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../../store/authStore';
import { appointmentsApi } from '../../api/appointments.api';
import { useFocusEffect } from '@react-navigation/native';

const COLORS = {
  primary: '#2D5016', primaryLight: '#4A7C2A',
  heroBg: '#1A3009', bg: '#F8F7F4', white: '#FFFFFF',
  text: '#1A1A1A', textMuted: '#8A8A8A', border: '#EBEBEB',
  pillBg: '#EEF4E8',
};

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  REQUESTED: { bg: '#FEF3C7', text: '#92400E', label: 'Demandé' },
  ACCEPTED:  { bg: '#DBEAFE', text: '#1D4ED8', label: 'Assigné' },
  EN_COURS:  { bg: '#FEE2E2', text: '#DC2626', label: 'En cours' },
  DONE:      { bg: '#EEF4E8', text: '#2D5016', label: 'Terminé' },
  CANCELLED: { bg: '#F3F4F6', text: '#374151', label: 'Annulé' },
};

const FILTER_TABS = [
  { id: 'all',        label: 'Tous' },
  { id: 'ACCEPTED',   label: 'Assignés' },
  { id: 'EN_COURS',   label: 'En cours' },
  { id: 'DONE',       label: 'Terminés' },
];

export default function TechnicianTasksScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [activeFilter, setActiveFilter] = useState('all');
  const [tasks, setTasks] = useState<any[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      appointmentsApi.getTasks()
        .then(res => {
          const data = (res.data as any).data || res.data;
          setTasks(data);
        })
        .catch(err => console.log('Err fetch tasks:', err));
    }, [])
  );

  const filtered = tasks.filter(t =>
    activeFilter === 'all' || t.status === activeFilter
  );

  // Stats
  const today = new Date().toDateString();
  const todayCount = tasks.filter(t =>
    t.scheduledAt && new Date(t.scheduledAt).toDateString() === today && t.status !== 'DONE'
  ).length;

  const doneCount = tasks.filter(t => t.status === 'DONE').length;
  const enCoursCount = tasks.filter(t => t.status === 'EN_COURS').length;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Hero ── */}
        <View style={styles.hero}>
          <SafeAreaView>
            <View style={styles.topBar}>
              <TouchableOpacity style={styles.topBtn} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={20} color="white" />
              </TouchableOpacity>
              <Text style={styles.logo}>ZARAY</Text>
              <TouchableOpacity 
                style={styles.topBtn}
                onPress={() => navigation.navigate('Notifications')}
              >
                <Ionicons name="notifications-outline" size={20} color="white" />
              </TouchableOpacity>
            </View>

            <Text style={styles.heroTitle}>Mes{'\n'}Interventions</Text>
            <Text style={styles.heroSub}>Planning du technicien</Text>

            {/* Stats */}
            <View style={styles.heroStats}>
              {[
                { label: "Aujourd'hui", value: todayCount, icon: 'calendar-outline' },
                { label: 'En cours',    value: enCoursCount, icon: 'time-outline' },
                { label: 'Terminés',    value: doneCount,  icon: 'checkmark-circle-outline' },
                { label: 'Total',       value: tasks.length, icon: 'list-outline' },
              ].map((s, i) => (
                <View key={i} style={[styles.heroStat, i < 3 && styles.heroStatBorder]}>
                  <Ionicons name={s.icon as any} size={14} color="rgba(255,255,255,0.5)" />
                  <Text style={styles.heroStatValue}>{s.value}</Text>
                  <Text style={styles.heroStatLabel}>{s.label}</Text>
                </View>
              ))}
            </View>
          </SafeAreaView>
        </View>

        {/* ── Panel ── */}
        <View style={styles.panel}>

          {/* Filter tabs */}
          <View style={styles.tabsWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
              {FILTER_TABS.map(tab => {
                const active = activeFilter === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    style={[styles.tab, active && styles.tabActive]}
                    onPress={() => setActiveFilter(tab.id)}
                  >
                    <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <Text style={styles.countText}>
            {filtered.length} intervention{filtered.length !== 1 ? 's' : ''}
          </Text>

          {/* Task Cards */}
          <View style={styles.list}>
            {filtered.length === 0 ? (
              <Text style={{ textAlign: 'center', marginTop: 20, color: COLORS.textMuted }}>Aucune intervention trouvée.</Text>
            ) : (
              filtered.map(task => {
                const statusCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.REQUESTED;
                const service = task.service;
                const client = task.user;
                const dateStr = task.scheduledAt ? new Date(task.scheduledAt).toLocaleString('fr-FR') : 'Non planifié';

                return (
                  <TouchableOpacity
                    key={task.id}
                    style={styles.card}
                    onPress={() => navigation.navigate('ServiceDetail', { service: task })}
                    activeOpacity={0.85}
                  >
                    {/* Image + Status */}
                    <View style={styles.cardImageWrapper}>
                      <Image source={{ uri: service?.image || 'https://via.placeholder.com/400' }} style={styles.cardImage} resizeMode="cover" />
                      <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                        <Text style={[styles.statusBadgeText, { color: statusCfg.text }]}>
                          {statusCfg.label}
                        </Text>
                      </View>
                    </View>

                    {/* Content */}
                    <View style={styles.cardContent}>
                      <Text style={styles.cardTitle} numberOfLines={1}>{service?.name || 'Service inconnu'}</Text>

                      {/* Client + Address */}
                      <View style={styles.cardMetaRow}>
                        <Ionicons name="person-outline" size={12} color={COLORS.textMuted} />
                        <Text style={styles.cardMetaText} numberOfLines={1}>{client?.name || 'Client inconnu'}</Text>
                      </View>
                      <View style={styles.cardMetaRow}>
                        <Ionicons name="location-outline" size={12} color={COLORS.textMuted} />
                        <Text style={styles.cardMetaText} numberOfLines={1}>{task.address || 'Adresse non spécifiée'}</Text>
                      </View>
                      <View style={styles.cardMetaRow}>
                        <Ionicons name="calendar-outline" size={12} color={COLORS.textMuted} />
                        <Text style={styles.cardMetaText}>{dateStr}</Text>
                      </View>

                      {/* CTA */}
                    <TouchableOpacity
                      style={styles.cardBtn}
                      onPress={() => navigation.navigate('ServiceDetail', { service: task })}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.cardBtnText}>Voir les détails</Text>
                      <Ionicons name="arrow-forward" size={14} color="white" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            }))}
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.heroBg },

  hero: { backgroundColor: COLORS.heroBg, paddingHorizontal: 20, paddingBottom: 28 },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 14, paddingBottom: 20,
  },
  topBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  logo: { fontSize: 16, fontWeight: '800', letterSpacing: 4, color: 'white' },
  heroTitle: { fontSize: 36, fontWeight: '900', color: 'white', lineHeight: 42, marginBottom: 6 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 24 },
  heroStats: { flexDirection: 'row' },
  heroStat: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 4 },
  heroStatBorder: { borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.1)' },
  heroStatValue: { fontSize: 20, fontWeight: '800', color: 'white' },
  heroStatLabel: { fontSize: 9, fontWeight: '600', color: 'rgba(255,255,255,0.45)', letterSpacing: 0.5 },

  panel: {
    backgroundColor: COLORS.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingTop: 24, marginTop: -12,
  },

  tabsWrapper: { borderBottomWidth: 1, borderBottomColor: COLORS.border, marginBottom: 14 },
  tabsScroll: { paddingHorizontal: 20, gap: 0 },
  tab: {
    paddingBottom: 12, paddingRight: 20,
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: COLORS.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
  tabTextActive: { color: COLORS.primary, fontWeight: '700' },

  countText: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted, paddingHorizontal: 20, marginBottom: 14 },

  list: { paddingHorizontal: 20, gap: 16 },

  card: {
    backgroundColor: COLORS.white, borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden',
  },
  cardImageWrapper: { width: '100%', height: 160, position: 'relative' },
  cardImage: { width: '100%', height: '100%' },
  statusBadge: {
    position: 'absolute', top: 12, right: 12,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
  },
  statusBadgeText: { fontSize: 11, fontWeight: '800' },

  cardContent: { padding: 16, gap: 8 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tagPill: {
    paddingHorizontal: 10, paddingVertical: 4,
    backgroundColor: COLORS.pillBg, borderRadius: 100,
  },
  tagPillText: { fontSize: 10, fontWeight: '700', color: COLORS.primaryLight },
  durationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  durationText: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted },

  cardTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardMetaText: { fontSize: 12, color: COLORS.textMuted, flex: 1 },

  progressWrapper: { gap: 6 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 11, fontWeight: '600', color: COLORS.textMuted },
  progressCount: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  progressBar: { height: 4, backgroundColor: COLORS.border, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 2 },

  cardBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, height: 42, backgroundColor: COLORS.primary, borderRadius: 12, marginTop: 4,
  },
  cardBtnText: { fontSize: 13, fontWeight: '700', color: 'white' },
});