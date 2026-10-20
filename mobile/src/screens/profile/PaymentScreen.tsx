import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { profileApi } from '../../api/profile.api';
import { useFocusEffect } from '@react-navigation/native';

const COLORS = {
  primary: '#2D5016',
  primaryLight: '#4A7C2A',
  bg: '#F8F7F4',
  white: '#FFFFFF',
  text: '#1A1A1A',
  textMuted: '#8A8A8A',
  border: '#EBEBEB',
};

export default function PaymentScreen({ navigation }: any) {
  const [cards, setCards] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [brand, setBrand] = useState('Visa');
  const [last4, setLast4] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      fetchPaymentMethods();
    }, [])
  );

  const fetchPaymentMethods = async () => {
    try {
      const res = await profileApi.getPaymentMethods();
      if ((res.data as any).success) {
        setCards((res.data as any).data);
      }
    } catch (e) {
      console.log('fetch payment methods error', e);
    }
  };

  const handleAddCard = async () => {
    if (!last4 || !expMonth || !expYear) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    try {
      await profileApi.addPaymentMethod({ brand, last4, expMonth, expYear });
      setIsAdding(false);
      setLast4('');
      setExpMonth('');
      setExpYear('');
      fetchPaymentMethods();
    } catch (e) {
      Alert.alert('Erreur', 'Impossible d\'ajouter la carte');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await profileApi.deletePaymentMethod(id);
      fetchPaymentMethods();
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de supprimer');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Modes de paiement</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {!isAdding ? (
          <TouchableOpacity style={styles.addBtn} onPress={() => setIsAdding(true)}>
            <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
            <Text style={styles.addBtnText}>Ajouter une carte de crédit</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Nouvelle carte</Text>
            <TextInput style={styles.input} placeholder="Marque (Visa, MasterCard...)" value={brand} onChangeText={setBrand} />
            <TextInput style={styles.input} placeholder="4 derniers chiffres" keyboardType="numeric" maxLength={4} value={last4} onChangeText={setLast4} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Mois (MM)" keyboardType="numeric" maxLength={2} value={expMonth} onChangeText={setExpMonth} />
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Année (YY)" keyboardType="numeric" maxLength={2} value={expYear} onChangeText={setExpYear} />
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsAdding(false)}>
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddCard}>
                <Text style={styles.saveBtnText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Cartes enregistrées</Text>
        {cards.length === 0 ? (
          <Text style={styles.emptyText}>Aucun mode de paiement enregistré.</Text>
        ) : (
          cards.map(c => (
            <View key={c.id} style={styles.card}>
              <View style={styles.cardIcon}>
                <Ionicons name="card" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{c.brand} se terminant par {c.last4}</Text>
                <Text style={styles.cardDesc}>Expire le {c.expMonth}/{c.expYear}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(c.id)}>
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))
        )}
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
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed', justifyContent: 'center', marginBottom: 24, gap: 10 },
  addBtnText: { color: COLORS.primary, fontWeight: '600', fontSize: 15 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  emptyText: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', marginTop: 20 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  cardIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  cardDesc: { fontSize: 13, color: COLORS.textMuted },
  formContainer: { backgroundColor: COLORS.white, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 24 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: COLORS.border, height: 44, borderRadius: 8, paddingHorizontal: 12, marginBottom: 10 },
  cancelBtn: { flex: 1, height: 44, borderRadius: 8, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { color: COLORS.text, fontWeight: '600' },
  saveBtn: { flex: 1, height: 44, borderRadius: 8, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { color: COLORS.white, fontWeight: '600' },
});
