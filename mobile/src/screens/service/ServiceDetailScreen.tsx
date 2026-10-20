import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  Image, Alert, Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { appointmentsApi } from '../../api/appointments.api';

const COLORS = {
  primary: '#2D5016', primaryLight: '#4A7C2A',
  heroBg: '#1A3009', bg: '#F8F7F4', white: '#FFFFFF',
  text: '#1A1A1A', textMuted: '#8A8A8A', border: '#EBEBEB',
  pillBg: '#EEF4E8', placeholder: '#C0BFB9',
  tagGreen: '#EEF4E8', tagGreenText: '#2D5016',
  tagBlue: '#DBEAFE', tagBlueText: '#1D4ED8',
  checkDone: '#2D5016', checkPending: '#E5E7EB',
};

export default function ServiceDetailScreen({ route, navigation }: any) {
  const task = route?.params?.service;
  const client = task?.user;
  const serviceDef = task?.service;

  const [beforePhotos, setBeforePhotos] = useState<string[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<string[]>([]);
  const handleCall = () => {
    if (!client?.phone) {
      Alert.alert('Erreur', 'Pas de numéro de téléphone pour ce client.');
      return;
    }
    Linking.openURL(`tel:${client.phone}`);
  };

  const handleOpenMaps = () => {
    if (!task?.address) {
      Alert.alert('Erreur', 'Pas d\'adresse pour ce client.');
      return;
    }
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.address)}`;
    Linking.openURL(url);
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      await appointmentsApi.updateStatus(task.id, newStatus);
      Alert.alert('Succès', 'Statut mis à jour');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut.');
    }
  };

  if (!task) return null;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Hero Header ── */}
        <View style={styles.hero}>
          <SafeAreaView>
            {/* Top bar */}
            <View style={styles.topBar}>
              <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={20} color="white" />
              </TouchableOpacity>
              <Text style={styles.logo}>ZARAY</Text>
              <TouchableOpacity style={styles.avatarBtn}>
                <Ionicons name="person-outline" size={18} color="white" />
              </TouchableOpacity>
            </View>

            {/* Status Tabs (Mise à jour) */}
            <View style={[styles.statusTabs, { flexWrap: 'wrap' }]}>
              {['REQUESTED', 'ACCEPTED', 'EN_COURS', 'DONE', 'CANCELLED'].map(s => {
                const active = task.status === s;
                const label = s === 'REQUESTED' ? 'Demande' : s === 'ACCEPTED' ? 'Assigné' : s === 'EN_COURS' ? 'En cours' : s === 'DONE' ? 'Terminé' : 'Annulé';
                return (
                  <TouchableOpacity
                    key={s}
                    style={[styles.statusTab, active && styles.statusTabActive]}
                    onPress={() => !active && handleUpdateStatus(s)}
                  >
                    <Text style={[styles.statusTabText, active && styles.statusTabTextActive]}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Title */}
            <Text style={styles.heroTitle}>{serviceDef?.name}</Text>

            {/* Address */}
            <View style={styles.addressRow}>
              <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.6)" />
              <Text style={styles.addressText}>{task.address}</Text>
            </View>
          </SafeAreaView>
        </View>

        {/* ── Panel ── */}
        <View style={styles.panel}>

          {/* Intervention Scope */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Description du service</Text>
            </View>
            <View style={styles.scopeCard}>
              <Ionicons name="document-text-outline" size={16} color={COLORS.primaryLight} style={{ marginTop: 2 }} />
              <Text style={styles.scopeText}>{serviceDef?.description || 'Aucune description fournie.'}</Text>
            </View>
          </View>

          {/* Notes */}
          {task.notes ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes du client</Text>
              <View style={styles.noteCard}>
                <Ionicons name="information-circle-outline" size={16} color={COLORS.textMuted} />
                <Text style={styles.noteText}>{task.notes}</Text>
              </View>
            </View>
          ) : null}

          {/* Photos (Commenté pour plus tard si Option A revient) */}
          {/*
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Documentation Visuelle (Optionnel)</Text>
            <Text style={styles.photoLabel}>Photos d'intervention</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={styles.photosRow}>
                {beforePhotos.map((uri, i) => (
                  <Image key={i} source={{ uri }} style={styles.photoThumb} resizeMode="cover" />
                ))}
                <TouchableOpacity style={styles.photoUploadBtn} onPress={() => pickImage('before')}>
                  <Ionicons name="camera-outline" size={22} color={COLORS.primaryLight} />
                  <Text style={styles.photoUploadText}>Ajouter</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
          */}

          {/* Maps */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="map-outline" size={16} color={COLORS.primary} />
              <Text style={[styles.sectionTitle, { marginLeft: 6 }]}>Ouvrir dans Maps</Text>
            </View>
            <View style={styles.mapPlaceholder}>
              <Ionicons name="location" size={28} color={COLORS.primaryLight} />
              <Text style={styles.mapAddress}>{task.address}</Text>
              <TouchableOpacity style={styles.mapBtn} onPress={handleOpenMaps}>
                <Ionicons name="navigate-outline" size={14} color="white" />
                <Text style={styles.mapBtnText}>Ouvrir l'itinéraire</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Contact CTA */}
          <TouchableOpacity style={styles.contactBtn} onPress={handleCall} activeOpacity={0.85}>
            <Ionicons name="call-outline" size={18} color="white" />
            <Text style={styles.contactBtnText}>Appeler {client?.name || 'le client'}</Text>
          </TouchableOpacity>

          <View style={{ height: 80 }} />
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
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  logo: { fontSize: 16, fontWeight: '800', letterSpacing: 4, color: 'white' },
  avatarBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center',
  },

  // Status tabs
  statusTabs: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statusTab: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  statusTabActive: { backgroundColor: '#4ADE80', borderColor: '#4ADE80' },
  statusTabText: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },
  statusTabTextActive: { color: COLORS.heroBg, fontWeight: '800' },

  heroTitle: {
    fontSize: 28, fontWeight: '900', color: 'white', lineHeight: 34, marginBottom: 10,
  },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  addressText: { fontSize: 12, color: 'rgba(255,255,255,0.55)', flex: 1 },

  // Panel
  panel: {
    backgroundColor: COLORS.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 20, paddingTop: 24, marginTop: -12,
  },

  // Section
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text, flex: 1 },

  // Tags
  tagGreen: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
    backgroundColor: COLORS.tagGreen,
  },
  tagGreenText: { fontSize: 10, fontWeight: '700', color: COLORS.tagGreenText },
  tagBlue: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
    backgroundColor: COLORS.tagBlue,
  },
  tagBlueText: { fontSize: 10, fontWeight: '700', color: COLORS.tagBlueText },

  // Scope
  scopeCard: {
    flexDirection: 'row', gap: 10, backgroundColor: COLORS.white,
    borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, padding: 14,
  },
  scopeText: { flex: 1, fontSize: 13, color: COLORS.textMuted, lineHeight: 20 },

  // Time
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeText: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted },

  // Materials
  materialsCard: {
    backgroundColor: COLORS.white, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.border, padding: 14, gap: 10,
  },
  materialRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  materialDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primaryLight, flexShrink: 0,
  },
  materialText: { fontSize: 13, color: COLORS.text, fontWeight: '500' },

  // Photos
  photoLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted, marginBottom: 8 },
  photosRow: { flexDirection: 'row', gap: 10, paddingRight: 4 },
  photoThumb: {
    width: 80, height: 80, borderRadius: 12, backgroundColor: COLORS.pillBg,
  },
  photoUploadBtn: {
    width: 80, height: 80, borderRadius: 12,
    backgroundColor: COLORS.pillBg, borderWidth: 1.5, borderColor: COLORS.border,
    borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  photoUploadText: { fontSize: 10, fontWeight: '600', color: COLORS.primaryLight },

  // Checklist
  checklistProgress: { fontSize: 13, fontWeight: '800', color: COLORS.primary },
  progressBar: {
    height: 4, backgroundColor: COLORS.border, borderRadius: 2, marginBottom: 12, overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 2 },
  checklistCard: {
    backgroundColor: COLORS.white, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden',
  },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  checkRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  checkbox: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  checkboxDone: { backgroundColor: COLORS.checkDone, borderColor: COLORS.checkDone },
  checkText: { fontSize: 13, color: COLORS.text, fontWeight: '500', flex: 1 },
  checkTextDone: { color: COLORS.textMuted, textDecorationLine: 'line-through' },

  // Map
  mapPlaceholder: {
    backgroundColor: COLORS.white, borderRadius: 14,
    borderWidth: 1, borderColor: COLORS.border,
    padding: 20, alignItems: 'center', gap: 8,
  },
  mapAddress: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center' },
  mapBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 100, marginTop: 4,
  },
  mapBtnText: { fontSize: 12, fontWeight: '700', color: 'white' },

  // Note
  noteCard: {
    flexDirection: 'row', gap: 10, backgroundColor: COLORS.white,
    borderRadius: 14, borderWidth: 1, borderColor: COLORS.border,
    padding: 14, marginBottom: 16,
  },
  noteText: { flex: 1, fontSize: 12, color: COLORS.textMuted, lineHeight: 18 },

  // Contact
  contactBtn: {
    height: 52, backgroundColor: COLORS.primary, borderRadius: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  contactBtnText: { fontSize: 14, fontWeight: '700', color: 'white' },
});