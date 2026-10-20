import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  Dimensions,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useProductStore } from '../../store/productStore';
import { useTranslation } from 'react-i18next';
import { categoriesApi } from '../../api/categories.api';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#2D5016',
  primaryLight: '#4A7C2A',
  accent: '#8CB369',
  bg: '#F8F7F4',
  white: '#FFFFFF',
  text: '#1A1A1A',
  textMuted: '#8A8A8A',
  textLight: '#B5B5B5',
  border: '#EBEBEB',
  pill: '#EEF4E8',
  pillActive: '#2D5016',
  card: '#FFFFFF',
  tag: '#F0F5EB',
};

const SUGGESTIONS = [
  'Monstera',
  'Gazon synthétique',
  'Ficus',
  'Pot céramique',
  'Olivier',
];

export default function SearchScreen({ navigation }: any) {
  const { products, fetchProducts } = useProductStore();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [categories, setCategories] = useState<any[]>([
    { id: 'all', name: t('home.categories.seeAll', 'Tout') }
  ]);

  useEffect(() => {
    fetchProducts();
    categoriesApi.getAll().then(res => {
      const data = (res.data as any).data || res.data;
      if (Array.isArray(data)) {
        setCategories([
          { id: 'all', name: t('home.categories.seeAll', 'Tout') },
          ...data
        ]);
      }
    }).catch(err => console.log('Erreur fetch categories', err));
  }, []);

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return price;
    return `${numPrice.toFixed(2)} MAD`;
  };

  const filteredProducts = products.filter((product) => {
    const hasStock = product.stock > 0;
    const matchesCategory =
      selectedCategory === 'all' || product.categoryId === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return hasStock && matchesCategory && matchesSearch;
  });

  const handleSuggestionPress = (suggestion: string) => {
    setSearchQuery(suggestion);
  };

  const renderProductCard = ({ item, index }: { item: any; index: number }) => {
    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetails', { product: item })}
        activeOpacity={0.85}
      >
        <View style={styles.productImageWrapper}>
          <Image
            source={{
              uri:
                item.images && item.images.length > 0
                  ? item.images[0]
                  : 'https://images.unsplash.com/photo-1487530811015-780c3d9fd5a3?auto=format&fit=crop&w=400&q=80',
            }}
            style={styles.productImage}
            resizeMode="cover"
          />
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={10} color="#F59E0B" />
            <Text style={styles.ratingText}>{item.rating || '5.0'}</Text>
          </View>
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      {/* Header Title */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('tabs.search', 'Recherche')}</Text>
      </View>

      {/* AI Assistant Banner */}
      <TouchableOpacity 
        style={styles.aiBanner}
        onPress={() => navigation.navigate('ZarayAi')}
        activeOpacity={0.85}
      >
        <View style={styles.aiIconWrapper}>
          <Ionicons name="sparkles" size={20} color={COLORS.primary} />
        </View>
        <View style={styles.aiBannerTextContainer}>
          <Text style={styles.aiBannerTitle}>Zaray AI Expert</Text>
          <Text style={styles.aiBannerSub}>Trouvez la plante parfaite</Text>
        </View>
        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('home.search', 'Rechercher des plantes, gazons...')}
          placeholderTextColor={COLORS.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories Filter */}
      <View style={styles.categoriesWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                style={[styles.pill, isSelected && styles.pillActive]}
              >
                <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                  {cat.name || cat.labelKey && t(cat.labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Suggestions or Results */}
      {searchQuery.length === 0 ? (
        <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.suggestionsSection}>
            <Text style={styles.sectionTitle}>{t('search.suggestions', 'Suggestions de recherche')}</Text>
            <View style={styles.suggestionsContainer}>
              {SUGGESTIONS.map((suggestion, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.suggestionChip}
                  onPress={() => handleSuggestionPress(suggestion)}
                >
                  <Ionicons name="trending-up-outline" size={14} color={COLORS.primaryLight} />
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quick Browse Categories */}
          <View style={styles.browseSection}>
            <Text style={styles.sectionTitle}>{t('search.browse', 'Parcourir les catégories')}</Text>
            <View style={styles.browseGrid}>
              {categories.filter(cat => cat.id !== 'all').map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.browseCard}
                  onPress={() => setSelectedCategory(cat.id)}
                >
                  <Ionicons
                    name={(cat.icon || 'leaf-outline') as any}
                    size={24}
                    color={COLORS.primary}
                  />
                  <Text style={styles.browseCardText}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={renderProductCard}
          numColumns={2}
          contentContainerStyle={styles.resultsGrid}
          columnWrapperStyle={styles.gridRow}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color={COLORS.textLight} />
              <Text style={styles.emptyText}>{t('search.noResults', 'Aucun résultat trouvé')}</Text>
              <Text style={styles.emptySubtext}>
                {t('search.tryDifferent', 'Essayez d\'autres mots clés ou parcourez les catégories.')}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const CARD_WIDTH = (width - 48) / 2;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
  },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  aiIconWrapper: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center',
  },
  aiBannerTextContainer: {
    flex: 1,
  },
  aiBannerTitle: {
    color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 2,
  },
  aiBannerSub: {
    color: 'rgba(255,255,255,0.8)', fontSize: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  categoriesWrapper: {
    marginBottom: 16,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: COLORS.pill,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pillActive: {
    backgroundColor: COLORS.pillActive,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primaryLight,
  },
  pillTextActive: {
    color: COLORS.white,
  },
  contentScroll: {
    flex: 1,
  },
  suggestionsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  suggestionText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
  browseSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  browseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  browseCard: {
    width: (width - 52) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  browseCardText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  resultsGrid: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  productImageWrapper: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: COLORS.tag,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.text,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
