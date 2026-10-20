import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  Image, TextInput, Alert, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { appointmentsApi } from '../../api/appointments.api';

const COLORS = {
  primary: '#2D5016', primaryLight: '#4A7C2A',
  heroBg: '#1A3009', bg: '#F8F7F4', white: '#FFFFFF',
  text: '#1A1A1A', textMuted: '#8A8A8A', border: '#EBEBEB',
};

export default function ServiceBookingScreen({ route, navigation }: any) {
  const service = route?.params?.service;
  
  const [address, setAddress] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBook = async () => {
    if (!address) {
      Alert.alert('Erreur', 'Veuillez saisir votre adresse.');
      return;
    }
    
    setLoading(true);
    try {
      await appointmentsApi.create({
        serviceId: service.id,
        address,
        notes,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined
      });
      Alert.alert('Succès', 'Votre réservation a été confirmée !', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err: any) {
      Alert.alert('Erreur', 'Impossible de réserver. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (!service) return null;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* ── Hero Header ── */}
        <View style={styles.hero}>
          <SafeAreaView>
            <View style={styles.topBar}>
              <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={20} color="white" />
              </TouchableOpacity>
              <Text style={styles.logo}>ZARAY</Text>
              <View style={{ width: 36 }} />
            </View>

            <Text style={styles.heroTitle}>{service.name}</Text>
            <Text style={styles.heroPrice}>
              {service.basePrice ? `${service.basePrice.toFixed(2)} MAD` : 'Sur devis'}
            </Text>
          </SafeAreaView>
        </View>

        {/* ── Content ── */}
        <View style={styles.panel}>
          
          <Text style={styles.description}>{service.description || 'Aucune description disponible.'}</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Adresse d'intervention</Text>
            <TextInput
              style={styles.input}
              placeholder="Votre adresse complète..."
              value={address}
              onChangeText={setAddress}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Date souhaitée (ex: 2026-08-15)</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={scheduledAt}
              onChangeText={setScheduledAt}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Notes supplémentaires (Optionnel)</Text>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              placeholder="Détails, instructions..."
              multiline
              value={notes}
              onChangeText={setNotes}
            />
          </View>

          <TouchableOpacity style={styles.bookBtn} onPress={handleBook} disabled={loading}>
            {loading ? <ActivityIndicator color="white" /> : (
              <Text style={styles.bookBtnText}>Confirmer la réservation</Text>
            )}
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.heroBg },
  hero: { paddingHorizontal: 20, paddingBottom: 28 },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 14, paddingBottom: 20,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center',
  },
  logo: { fontSize: 16, fontWeight: '800', letterSpacing: 4, color: 'white' },
  heroTitle: { fontSize: 28, fontWeight: '900', color: 'white', lineHeight: 34, marginBottom: 10 },
  heroPrice: { fontSize: 18, color: '#4ADE80', fontWeight: 'bold' },
  panel: {
    backgroundColor: COLORS.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 20, paddingTop: 24, marginTop: -12, minHeight: 600
  },
  description: { fontSize: 14, color: COLORS.textMuted, lineHeight: 22, marginBottom: 24 },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  input: {
    backgroundColor: COLORS.white, borderRadius: 12, paddingHorizontal: 16,
    paddingVertical: 12, fontSize: 14, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border
  },
  bookBtn: {
    backgroundColor: COLORS.primary, height: 54, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginTop: 10
  },
  bookBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' }
});
