import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#2D5016',
  bg: '#F8F7F4',
  white: '#FFFFFF',
  text: '#1A1A1A',
  textMuted: '#8A8A8A',
  border: '#EBEBEB',
};

import { supportApi } from '../../api/support.api';

export default function SupportScreen({ navigation }: any) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un sujet et un message.');
      return;
    }
    
    try {
      setLoading(true);
      await supportApi.createTicket(subject, message);
      Alert.alert('Message envoyé', 'Notre équipe vous répondra dans les plus brefs délais.');
      setSubject('');
      setMessage('');
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Erreur', err?.response?.data?.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Aide & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        
        <View style={styles.contactCard}>
          <Ionicons name="chatbubbles-outline" size={32} color={COLORS.primary} style={{ marginBottom: 12 }} />
          <Text style={styles.contactTitle}>Nous contacter</Text>
          <Text style={styles.contactDesc}>
            Une question sur une plante ou une commande ? Envoyez-nous un message et nous vous répondrons sous 24h.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Sujet</Text>
        <TextInput
          style={[styles.input, { minHeight: 50, marginBottom: 16 }]}
          placeholder="Ex: Problème avec ma commande"
          placeholderTextColor={COLORS.textMuted}
          value={subject}
          onChangeText={setSubject}
        />

        <Text style={styles.sectionTitle}>Votre message</Text>
        <TextInput
          style={styles.input}
          placeholder="Décrivez votre problème ici..."
          placeholderTextColor={COLORS.textMuted}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          value={message}
          onChangeText={setMessage}
        />

        <TouchableOpacity 
          style={[styles.sendBtn, loading && { opacity: 0.7 }]} 
          onPress={handleSend}
          disabled={loading}
        >
          <Text style={styles.sendBtnText}>{loading ? 'Envoi...' : 'Envoyer le message'}</Text>
          {!loading && <Ionicons name="send" size={16} color={COLORS.white} />}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { padding: 4 },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  scroll: { padding: 20 },
  contactCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: COLORS.border },
  contactTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  contactDesc: { fontSize: 13, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  input: { backgroundColor: COLORS.white, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, padding: 16, fontSize: 14, color: COLORS.text, minHeight: 120, marginBottom: 24 },
  sendBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, gap: 10 },
  sendBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
});
