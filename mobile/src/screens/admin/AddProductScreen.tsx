import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useProductStore } from '../../store/productStore';
import { useCategoryStore } from '../../store/categoryStore';
const COLORS = {
  primary: '#2D5016',
  primaryLight: '#4A7C2A',
  bg: '#F8F7F4',
  white: '#FFFFFF',
  text: '#1A1A1A',
  textMuted: '#8A8A8A',
  border: '#DEDDD9',
  pillBg: '#EEF4E8',
  inputBg: '#FFFFFF',
  placeholder: '#C0BFB9',
  red: '#EF4444',
};

// Categories fetched dynamically

const Field = ({ label, placeholder, value, onChangeText, keyboardType, multiline }: any) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.inputMultiline]}
      placeholder={placeholder}
      placeholderTextColor={COLORS.placeholder}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType || 'default'}
      multiline={multiline}
      numberOfLines={multiline ? 4 : 1}
      textAlignVertical={multiline ? 'top' : 'center'}
    />
  </View>
);

export default function AddProductScreen({ route, navigation }: any) {
  const { addProduct, updateProduct, isLoading } = useProductStore();
  const { categories, fetchCategories } = useCategoryStore();
  const editingProduct = route.params?.product;

  useEffect(() => {
    fetchCategories();
  }, []);

  const [name, setName] = useState(editingProduct?.name || '');
  const [description, setDescription] = useState(editingProduct?.description || '');
  const [price, setPrice] = useState(editingProduct?.price ? String(editingProduct.price) : '');
  const [stock, setStock] = useState(editingProduct?.stock !== undefined ? String(editingProduct.stock) : '10');
  
  let initialImage = '';
  if (editingProduct?.images) {
    if (typeof editingProduct.images === 'string') {
       try { initialImage = JSON.parse(editingProduct.images)[0]; } catch(e) {}
    } else if (Array.isArray(editingProduct.images)) {
       initialImage = editingProduct.images[0];
    }
  }
  const [imageUri, setImageUri] = useState(initialImage);
  const [category, setCategory] = useState(editingProduct?.categoryId || '1');

  // ── Pick image from gallery ──────────────────────────────
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Autorisez l\'accès à votre galerie pour ajouter une image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      if (asset.base64) {
        setImageUri(`data:image/jpeg;base64,${asset.base64}`);
      } else {
        setImageUri(asset.uri);
      }
    }
  };

  // ── Save product ─────────────────────────────────────────
  const handleSave = async () => {
    if (!name || !description || !price || !imageUri) {
      Alert.alert('Champs requis', 'Veuillez remplir tous les champs et ajouter une image.');
      return;
    }
    try {
      const productData = {
        name,
        description,
        price: parseFloat(price) || 0,
        stock: parseInt(stock, 10) || 0,
        images: [imageUri],
        categoryId: category,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        Alert.alert('Succès', 'Produit modifié avec succès !', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await addProduct(productData);
        Alert.alert('Succès', 'Produit ajouté avec succès !', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err: any) {
      Alert.alert('Erreur', err?.message || 'Une erreur est survenue.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Image Picker ── */}
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage} activeOpacity={0.8}>
          {imageUri ? (
            <>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} resizeMode="cover" />
              <View style={styles.imageEditOverlay}>
                <Ionicons name="camera" size={22} color={COLORS.white} />
                <Text style={styles.imageEditText}>Changer</Text>
              </View>
            </>
          ) : (
            <View style={styles.imagePlaceholder}>
              <View style={styles.imagePlaceholderIcon}>
                <Ionicons name="image-outline" size={32} color={COLORS.primaryLight} />
              </View>
              <Text style={styles.imagePlaceholderTitle}>Ajouter une photo</Text>
              <Text style={styles.imagePlaceholderSub}>Appuyez pour choisir depuis la galerie</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* ── Form Fields ── */}
        <Field
          label="Nom du produit"
          placeholder="Ex: Monstera Deliciosa"
          value={name}
          onChangeText={setName}
        />

        <Field
          label="Description"
          placeholder="Décrivez le produit..."
          value={description}
          onChangeText={setDescription}
          multiline
        />

        {/* Prix + Stock inline */}
        <View style={styles.row}>
          <View style={[styles.fieldGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.fieldLabel}>Prix (MAD)</Text>
            <TextInput
              style={styles.input}
              placeholder="450.00"
              placeholderTextColor={COLORS.placeholder}
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.fieldLabel}>Stock</Text>
            <TextInput
              style={styles.input}
              placeholder="10"
              placeholderTextColor={COLORS.placeholder}
              value={stock}
              onChangeText={setStock}
              keyboardType="number-pad"
            />
          </View>
        </View>

        {/* ── Catégorie ── */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Catégorie</Text>
          <View style={styles.categoriesWrap}>
            {categories.map(cat => {
              const active = category === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.catPill, active && styles.catPillActive]}
                  onPress={() => setCategory(cat.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.catPillText, active && styles.catPillTextActive]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Save Button ── */}
        <TouchableOpacity
          style={[styles.saveBtn, isLoading && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
          <Text style={styles.saveBtnText}>
            {isLoading ? 'Enregistrement...' : (editingProduct ? 'Enregistrer les modifications' : 'Enregistrer le produit')}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: COLORS.bg,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: COLORS.primary },

  // Scroll
  scroll: { paddingHorizontal: 20, paddingBottom: 60 },

  // Image Picker
  imagePicker: {
    width: '100%', height: 200, borderRadius: 18,
    overflow: 'hidden', backgroundColor: COLORS.pillBg,
    borderWidth: 1.5, borderColor: COLORS.border,
    borderStyle: 'dashed', marginBottom: 20,
    position: 'relative',
  },
  imagePreview: { width: '100%', height: '100%' },
  imageEditOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.45)', paddingVertical: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  imageEditText: { fontSize: 13, fontWeight: '700', color: COLORS.white },
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  imagePlaceholderIcon: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  imagePlaceholderTitle: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  imagePlaceholderSub: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center' },

  // Fields
  fieldGroup: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.inputBg, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: COLORS.text,
  },
  inputMultiline: { height: 100, paddingTop: 12 },
  row: { flexDirection: 'row' },

  // Categories
  categoriesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catPill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100,
    backgroundColor: COLORS.pillBg, borderWidth: 1, borderColor: 'transparent',
  },
  catPillActive: { backgroundColor: COLORS.primary },
  catPillText: { fontSize: 12, fontWeight: '600', color: COLORS.primaryLight },
  catPillTextActive: { color: COLORS.white },

  // Save
  saveBtn: {
    height: 52, backgroundColor: COLORS.primary, borderRadius: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 8,
  },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.white, letterSpacing: 0.3 },
});