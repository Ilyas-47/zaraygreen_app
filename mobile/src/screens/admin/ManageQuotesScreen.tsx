import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { documentsApi } from '../../api/documents.api';

const COLORS = {
  bg: '#F8F7F4',
  white: '#FFFFFF',
  text: '#1A1A1A',
  textMuted: '#8A8A8A',
  border: '#EBEBEB',
  primary: '#2D5016',
  tagNew: '#E0F2FE',
  tagNewText: '#0284C7',
  tagProcess: '#FEF9C3',
  tagProcessText: '#CA8A04',
  tagDone: '#DCFCE7',
  tagDoneText: '#16A34A',
  tagReject: '#FEE2E2',
  tagRejectText: '#DC2626',
};

const STATUTS = ['DEMANDE', 'EN_COURS', 'TRAITÉ', 'REJETÉ'];

export default function ManageQuotesScreen({ navigation }: any) {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);

  const fetchQuotes = async () => {
    try {
      const res = await documentsApi.getAll();
      const data = (res.data as any).data || res.data;
      if (Array.isArray(data)) {
        setQuotes(data.filter(d => d.type === 'DEVIS'));
      }
    } catch (err) {
      console.log('Erreur fetch quotes:', err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchQuotes();
    }, [])
  );

  const getTag = (status: string) => {
    switch (status) {
      case 'DEMANDE': return { bg: COLORS.tagNew, text: COLORS.tagNewText, label: 'Nouveau' };
      case 'EN_COURS': return { bg: COLORS.tagProcess, text: COLORS.tagProcessText, label: 'En Cours' };
      case 'TRAITÉ': return { bg: COLORS.tagDone, text: COLORS.tagDoneText, label: 'Traité' };
      case 'REJETÉ': return { bg: COLORS.tagReject, text: COLORS.tagRejectText, label: 'Rejeté' };
      default: return { bg: COLORS.border, text: COLORS.textMuted, label: status };
    }
  };

  const updateStatus = async (status: string) => {
    if (!selectedQuote) return;
    try {
      await documentsApi.updateStatus(selectedQuote.id, status);
      setStatusModalVisible(false);
      setSelectedQuote({ ...selectedQuote, statut: status });
      fetchQuotes();
    } catch (err) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestion des Devis</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {quotes.length === 0 ? (
          <Text style={{ textAlign: 'center', color: COLORS.textMuted, marginTop: 40 }}>Aucune demande de devis.</Text>
        ) : (
          quotes.map(quote => {
            const tag = getTag(quote.statut);
            return (
              <TouchableOpacity key={quote.id} style={styles.card} onPress={() => setSelectedQuote(quote)}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardId}>{quote.numeroDocument}</Text>
                  <View style={[styles.tag, { backgroundColor: tag.bg }]}>
                    <Text style={[styles.tagText, { color: tag.text }]}>{tag.label}</Text>
                  </View>
                </View>
                <Text style={styles.clientName}>Client: {quote.user?.name || 'Inconnu'}</Text>
                <Text style={styles.dateText}>Date: {new Date(quote.createdAt).toLocaleDateString()}</Text>
              </TouchableOpacity>
            )
          })
        )}
      </ScrollView>

      {/* Detail Modal */}
      <Modal visible={!!selectedQuote && !statusModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Détail du Devis</Text>
              <TouchableOpacity onPress={() => setSelectedQuote(null)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            {selectedQuote && (
              <ScrollView showsVerticalScrollIndicator={false} style={{ padding: 20 }}>
                <Text style={styles.label}>NUMÉRO</Text>
                <Text style={styles.value}>{selectedQuote.numeroDocument}</Text>
                
                <Text style={styles.label}>CLIENT</Text>
                <Text style={styles.value}>{selectedQuote.user?.name || 'Inconnu'} ({selectedQuote.user?.email || 'N/A'})</Text>
                
                <Text style={styles.label}>STATUT</Text>
                <View style={[styles.tag, { backgroundColor: getTag(selectedQuote.statut).bg, alignSelf: 'flex-start', marginBottom: 16 }]}>
                  <Text style={[styles.tagText, { color: getTag(selectedQuote.statut).text }]}>{getTag(selectedQuote.statut).label}</Text>
                </View>

                <TouchableOpacity style={styles.updateBtn} onPress={() => setStatusModalVisible(true)}>
                  <Text style={styles.updateBtnText}>Mettre à jour le statut</Text>
                </TouchableOpacity>
                
                <Text style={[styles.label, { marginTop: 24 }]}>DÉTAIL DE LA DEMANDE</Text>
                <View style={styles.notesBox}>
                  <Text style={styles.notesText}>{selectedQuote.notes}</Text>
                </View>

                <View style={{ height: 40 }} />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Status Update Modal */}
      <Modal visible={statusModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '50%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Modifier le Statut</Text>
              <TouchableOpacity onPress={() => setStatusModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <View style={{ padding: 20 }}>
              {STATUTS.map(st => (
                <TouchableOpacity 
                  key={st} 
                  style={[styles.statusOption, selectedQuote?.statut === st && styles.statusOptionActive]}
                  onPress={() => updateStatus(st)}
                >
                  <Text style={[styles.statusOptionText, selectedQuote?.statut === st && styles.statusOptionTextActive]}>{st}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: COLORS.white, borderBottomWidth: 1, borderColor: COLORS.border },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  content: { padding: 20, gap: 12 },
  card: { backgroundColor: COLORS.white, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardId: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tagText: { fontSize: 10, fontWeight: '700' },
  clientName: { fontSize: 14, color: COLORS.textMuted, marginBottom: 4 },
  dateText: { fontSize: 12, color: COLORS.textMuted },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderColor: COLORS.border },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  
  label: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 1, marginBottom: 6 },
  value: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 16 },
  notesBox: { backgroundColor: COLORS.bg, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  notesText: { fontSize: 14, color: COLORS.text, lineHeight: 22 },
  
  updateBtn: { backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  updateBtnText: { color: COLORS.white, fontWeight: '600' },

  statusOption: { paddingVertical: 14, borderBottomWidth: 1, borderColor: COLORS.border },
  statusOptionActive: { backgroundColor: COLORS.bg },
  statusOptionText: { fontSize: 15, color: COLORS.text },
  statusOptionTextActive: { fontWeight: '700', color: COLORS.primary },
});
