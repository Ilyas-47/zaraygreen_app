import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  TextInput, Alert, KeyboardAvoidingView, Platform, Modal, FlatList, TouchableWithoutFeedback
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { apiClient } from '../../api/client';
import { useProductStore } from '../../store/productStore';
import { servicesApi } from '../../api/services.api';

const COLORS = {
  primary: '#2D5016',
  white: '#FFFFFF',
  bg: '#F8F7F4',
  text: '#1A1A1A',
  textMuted: '#8A8A8A',
  border: '#EBEBEB',
  red: '#EF4444',
  pillBg: '#EEF4E8'
};

type ItemType = 'product' | 'service';

interface QuoteItem {
  id: string;
  type: ItemType;
  isCustom: boolean;
  name: string;
  quantity: string;
}

export default function QuoteRequestScreen({ navigation }: any) {
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState<ItemType>('product');
  const [isCustom, setIsCustom] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);

  const { products, fetchProducts } = useProductStore();
  const [services, setServices] = useState<any[]>([]);

  React.useEffect(() => {
    fetchProducts();
    servicesApi.getAll().then((res: any) => {
      const data = (res.data as any).data || res.data;
      if (Array.isArray(data)) setServices(data);
    }).catch(err => console.log('Erreur fetch services', err));
  }, []);

  const openSelectionModal = () => setModalVisible(true);
  const selectCatalogItem = (item: any) => {
    setNewItemName(item.name || item.title);
    setModalVisible(false);
  };

  const addItem = () => {
    if (!newItemName.trim()) return;
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        type: newItemType,
        isCustom,
        name: newItemName.trim(),
        quantity: '1',
      }
    ]);
    setNewItemName('');
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, qty: string) => {
    setItems(items.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      Alert.alert('Erreur', 'Veuillez ajouter au moins un élément.');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/documents/request-quote', { items });
      Alert.alert(
        'Demande envoyée !',
        'Votre demande de devis a été envoyée avec succès.',
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
    } catch (err: any) {
      Alert.alert('Erreur', err.response?.data?.message || 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Demander un Devis</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.subtitle}>
            Composez votre devis en ajoutant des produits ou des services. Vous pouvez demander des articles sur mesure !
          </Text>

          {/* Form to add item */}
          <View style={styles.formCard}>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[styles.typeBtn, newItemType === 'product' && styles.typeBtnActive]}
                onPress={() => setNewItemType('product')}
              >
                <Text style={[styles.typeText, newItemType === 'product' && styles.typeTextActive]}>Produit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, newItemType === 'service' && styles.typeBtnActive]}
                onPress={() => setNewItemType('service')}
              >
                <Text style={[styles.typeText, newItemType === 'service' && styles.typeTextActive]}>Service</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.customToggle}>
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                onPress={() => setIsCustom(!isCustom)}
              >
                <Ionicons name={isCustom ? "checkbox" : "square-outline"} size={20} color={COLORS.primary} />
                <Text style={{ fontSize: 13, color: COLORS.text }}>Demande sur mesure (hors catalogue)</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputRow}>
              {isCustom ? (
                <TextInput
                  style={styles.input}
                  placeholder="Décrivez ce que vous souhaitez..."
                  value={newItemName}
                  onChangeText={setNewItemName}
                />
              ) : (
                <TouchableOpacity style={[styles.input, { justifyContent: 'center' }]} onPress={openSelectionModal}>
                  <Text style={{ color: newItemName ? COLORS.text : COLORS.textMuted }}>
                    {newItemName || (newItemType === 'product' ? 'Sélectionner un produit...' : 'Sélectionner un service...')}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.addBtn} onPress={addItem}>
                <Ionicons name="add" size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* List of items */}
          <View style={styles.itemsContainer}>
            <Text style={styles.sectionTitle}>Éléments de votre devis ({items.length})</Text>
            
            {items.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={40} color={COLORS.border} />
                <Text style={styles.emptyText}>Aucun élément ajouté pour le moment</Text>
              </View>
            ) : (
              items.map((item, index) => (
                <View key={item.id} style={styles.itemCard}>
                  <View style={styles.itemBadge}>
                    <Text style={styles.itemBadgeText}>
                      {item.type === 'product' ? 'Produit' : 'Service'}
                    </Text>
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemSource}>{item.isCustom ? 'Sur mesure' : 'Catalogue'}</Text>
                  </View>
                  
                  <View style={styles.qtyContainer}>
                    <Text style={{fontSize: 10, color: COLORS.textMuted}}>Qté:</Text>
                    <TextInput 
                      style={styles.qtyInput}
                      value={item.quantity}
                      onChangeText={(val) => updateQuantity(item.id, val)}
                      keyboardType="numeric"
                    />
                  </View>

                  <TouchableOpacity onPress={() => removeItem(item.id)}>
                    <Ionicons name="trash-outline" size={20} color={COLORS.red} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.submitBtn, (items.length === 0 || isLoading) && { opacity: 0.5 }]} 
          onPress={handleSubmit}
          disabled={items.length === 0 || isLoading}
        >
          <Text style={styles.submitBtnText}>{isLoading ? 'Envoi...' : 'Envoyer la demande'}</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    Sélectionner un {newItemType === 'product' ? 'Produit' : 'Service'}
                  </Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color={COLORS.text} />
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={newItemType === 'product' ? products : services}
                  keyExtractor={item => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.modalItem} onPress={() => selectCatalogItem(item)}>
                      <Text style={styles.modalItemText}>{item.name || item.title}</Text>
                      {item.price !== undefined && (
                        <Text style={styles.modalItemPrice}>{item.price} MAD</Text>
                      )}
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <Text style={{ textAlign: 'center', marginTop: 20, color: COLORS.textMuted }}>Aucun élément trouvé.</Text>
                  }
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14, backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.border
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.bg,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: COLORS.primary },
  content: { padding: 20 },
  subtitle: { fontSize: 13, color: COLORS.textMuted, lineHeight: 20, marginBottom: 20 },
  formCard: {
    backgroundColor: COLORS.white, padding: 16, borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.border, marginBottom: 24,
  },
  typeSelector: {
    flexDirection: 'row', backgroundColor: COLORS.bg, borderRadius: 8, padding: 4, marginBottom: 16
  },
  typeBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  typeBtnActive: { backgroundColor: COLORS.white, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  typeText: { fontSize: 13, fontWeight: '500', color: COLORS.textMuted },
  typeTextActive: { color: COLORS.primary, fontWeight: '700' },
  customToggle: { marginBottom: 16 },
  inputRow: { flexDirection: 'row', gap: 10 },
  input: {
    flex: 1, backgroundColor: COLORS.bg, borderRadius: 8, paddingHorizontal: 14,
    borderWidth: 1, borderColor: COLORS.border, fontSize: 14, height: 44, color: COLORS.text
  },
  addBtn: {
    width: 44, height: 44, backgroundColor: COLORS.primary, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center'
  },
  itemsContainer: { gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  itemCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white,
    padding: 12, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, gap: 12
  },
  itemBadge: {
    backgroundColor: COLORS.pillBg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4
  },
  itemBadgeText: { fontSize: 10, fontWeight: '700', color: COLORS.primary },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  itemSource: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  qtyContainer: { alignItems: 'center', gap: 2 },
  qtyInput: {
    backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: 4, width: 40, height: 26, textAlign: 'center', fontSize: 12
  },
  emptyState: { alignItems: 'center', paddingVertical: 30, gap: 10 },
  emptyText: { fontSize: 13, color: COLORS.textMuted },
  footer: {
    padding: 20, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border
  },
  submitBtn: {
    backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center'
  },
  submitBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  modalItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalItemText: { fontSize: 14, color: COLORS.text, flex: 1 },
  modalItemPrice: { fontSize: 12, fontWeight: '600', color: COLORS.primary }
});
