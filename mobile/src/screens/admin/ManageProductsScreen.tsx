import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  Image, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useProductStore } from '../../store/productStore';
import { useCategoryStore } from '../../store/categoryStore';
const COLORS = {
  primary: '#2D5016', primaryLight: '#4A7C2A',
  bg: '#F8F7F4', white: '#FFFFFF', text: '#1A1A1A',
  textMuted: '#8A8A8A', border: '#EBEBEB', pillBg: '#EEF4E8',
  placeholder: '#C0BFB9', red: '#EF4444', redLight: '#FEF2F2',
};

// Categories fetched dynamically

export default function ManageProductsScreen({ navigation }: any) {
  const { products, fetchProducts, deleteProduct } = useProductStore();
  const { categories, fetchCategories } = useCategoryStore();
  const [search, setSearch] = useState('');

  useEffect(() => { 
    fetchProducts(); 
    fetchCategories();
  }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Supprimer le produit',
      `Voulez-vous supprimer "${name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => deleteProduct?.(id) },
      ]
    );
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
          <Text style={styles.headerTitle}>Gestion produits</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('AddProduct')}
          >
            <Ionicons name="add" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={16} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un produit..."
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

        {/* Count */}
        <Text style={styles.countText}>{filtered.length} produit{filtered.length !== 1 ? 's' : ''}</Text>

        {/* List */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="leaf-outline" size={44} color={COLORS.border} />
              <Text style={styles.emptyText}>Aucun produit trouvé</Text>
            </View>
          ) : (
            filtered.map(product => (
              <View key={product.id} style={styles.card}>
                <Image
                  source={{ uri: product.images?.[0] || 'https://images.unsplash.com/photo-1487530811015-780c3d9fd5a3?auto=format&fit=crop&w=200&q=80' }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName} numberOfLines={1}>{product.name}</Text>
                  <Text style={styles.cardCat}>
                    {categories.find(c => c.id === product.categoryId)?.name || 'Autre'}
                  </Text>
                  <Text style={styles.cardPrice}>
                    {typeof product.price === 'number'
                      ? `${product.price.toFixed(2)} MAD`
                      : product.price}
                  </Text>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => navigation.navigate('EditProduct', { product })}
                  >
                    <Ionicons name="pencil-outline" size={16} color={COLORS.primaryLight} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(product.id, product.name)}
                  >
                    <Ionicons name="trash-outline" size={16} color={COLORS.red} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
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
  addBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 12,
    backgroundColor: COLORS.white, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 14, paddingVertical: 11, gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text },
  countText: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted, paddingHorizontal: 20, marginBottom: 12 },
  list: { paddingHorizontal: 20, gap: 12 },
  card: {
    flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 16,
    borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden', alignItems: 'center',
  },
  cardImage: { width: 80, height: 80, backgroundColor: COLORS.pillBg },
  cardInfo: { flex: 1, paddingHorizontal: 12, gap: 3 },
  cardName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  cardCat: { fontSize: 11, color: COLORS.textMuted },
  cardPrice: { fontSize: 13, fontWeight: '800', color: COLORS.primary },
  cardActions: { flexDirection: 'column', gap: 8, paddingRight: 14 },
  editBtn: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.pillBg,
    alignItems: 'center', justifyContent: 'center',
  },
  deleteBtn: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: '#FEF2F2',
    alignItems: 'center', justifyContent: 'center',
  },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14, color: COLORS.textMuted, fontWeight: '500' },
});