import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  Dimensions,
  FlatList,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useProductStore, Product } from '../../store/productStore';
import { useCategoryStore } from '../../store/categoryStore';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

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
  star: '#F59E0B',
  overlay: 'rgba(0,0,0,0.03)',
};

type SortOption = 'default' | 'price_asc' | 'price_desc' | 'name_asc' | 'rating';

const SORT_OPTIONS: { key: SortOption; label: string; icon: string }[] = [
  { key: 'default',    label: 'Par défaut',       icon: 'apps-outline' },
  { key: 'price_asc',  label: 'Prix croissant',   icon: 'arrow-up-outline' },
  { key: 'price_desc', label: 'Prix décroissant',  icon: 'arrow-down-outline' },
  { key: 'name_asc',   label: 'A → Z',            icon: 'text-outline' },
  { key: 'rating',     label: 'Meilleures notes',  icon: 'star-outline' },
];

// Static categories removed, using dynamic store instead

export default function AllProductsScreen({ navigation, route }: any) {
  const initialCategory = route?.params?.categoryId ?? 'all';
  const { products, fetchProducts } = useProductStore();
  const { categories, fetchCategories } = useCategoryStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [showSortModal, setShowSortModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const displayCategories = useMemo(() => {
    return [{ id: 'all', name: 'Tout', icon: 'grid-outline' }, ...categories];
  }, [categories]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // ─── Filtering & Sorting ─────────────────────────────────
  const filteredAndSorted = useMemo(() => {
    let result = [...products].filter(p => p.stock > 0);

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.categoryId === selectedCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Sort
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => toNum(a.price) - toNum(b.price));
        break;
      case 'price_desc':
        result.sort((a, b) => toNum(b.price) - toNum(a.price));
        break;
      case 'name_asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
        result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      default:
        break;
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  const toNum = (v: number | string) =>
    typeof v === 'string' ? parseFloat(v) || 0 : v;

  const formatPrice = (price: number | string) => {
    const n = toNum(price);
    return isNaN(n) ? price : `${n.toFixed(2)} MAD`;
  };

  const currentSortLabel =
    SORT_OPTIONS.find(o => o.key === sortBy)?.label ?? 'Par défaut';

  // ─── Product Card (Grid) ──────────────────────────────────
  const renderGridCard = useCallback(
    ({ item }: { item: Product }) => (
      <TouchableOpacity
        style={styles.gridCard}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('ProductDetails', { product: item })}
      >
        <View style={styles.gridImageWrap}>
          <Image
            source={{
              uri:
                item.images?.[0] ??
                'https://images.unsplash.com/photo-1487530811015-780c3d9fd5a3?auto=format&fit=crop&w=400&q=80',
            }}
            style={styles.gridImage}
            resizeMode="cover"
          />
          <TouchableOpacity style={styles.heartBtn}>
            <Ionicons name="heart-outline" size={15} color={COLORS.primaryLight} />
          </TouchableOpacity>
          {item.rating >= 4.8 && (
            <View style={styles.topBadge}>
              <Text style={styles.topBadgeText}>Top</Text>
            </View>
          )}
        </View>
        <View style={styles.gridInfo}>
          <Text style={styles.gridName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.gridBottom}>
            <Text style={styles.gridPrice}>{formatPrice(item.price)}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={11} color={COLORS.star} />
              <Text style={styles.ratingVal}>{item.rating?.toFixed(1) ?? '5.0'}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [navigation]
  );

  // ─── Product Card (List) ──────────────────────────────────
  const renderListCard = useCallback(
    ({ item }: { item: Product }) => (
      <TouchableOpacity
        style={styles.listCard}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('ProductDetails', { product: item })}
      >
        <Image
          source={{
            uri:
              item.images?.[0] ??
              'https://images.unsplash.com/photo-1487530811015-780c3d9fd5a3?auto=format&fit=crop&w=400&q=80',
          }}
          style={styles.listImage}
          resizeMode="cover"
        />
        <View style={styles.listInfo}>
          <Text style={styles.listName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.listDesc} numberOfLines={2}>{item.description}</Text>
          <View style={styles.listBottom}>
            <Text style={styles.listPrice}>{formatPrice(item.price)}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={11} color={COLORS.star} />
              <Text style={styles.ratingVal}>{item.rating?.toFixed(1) ?? '5.0'}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.listHeart}>
          <Ionicons name="heart-outline" size={18} color={COLORS.primaryLight} />
        </TouchableOpacity>
      </TouchableOpacity>
    ),
    [navigation]
  );

  // ─── Render ───────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tous les produits</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.viewToggle}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            <Ionicons
              name={viewMode === 'grid' ? 'list-outline' : 'grid-outline'}
              size={20}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Search ── */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un produit..."
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.sortBtn}
          onPress={() => setShowSortModal(!showSortModal)}
        >
          <Ionicons name="swap-vertical-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* ── Sort Dropdown ── */}
      {showSortModal && (
        <View style={styles.sortDropdown}>
          {SORT_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.sortOption,
                sortBy === opt.key && styles.sortOptionActive,
              ]}
              onPress={() => {
                setSortBy(opt.key);
                setShowSortModal(false);
              }}
            >
              <Ionicons
                name={opt.icon as any}
                size={16}
                color={sortBy === opt.key ? COLORS.white : COLORS.primary}
              />
              <Text
                style={[
                  styles.sortOptionText,
                  sortBy === opt.key && styles.sortOptionTextActive,
                ]}
              >
                {opt.label}
              </Text>
              {sortBy === opt.key && (
                <Ionicons name="checkmark" size={16} color={COLORS.white} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ── Category Pills ── */}
      <View style={{ marginBottom: 12 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catScroll}
        >
          {displayCategories.map((cat) => {
            const sel = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.pill, sel && styles.pillActive]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Text style={[styles.pillText, sel && styles.pillTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Results Count + Active Sort ── */}
      <View style={styles.resultsBar}>
        <Text style={styles.resultsCount}>
          {filteredAndSorted.length} produit{filteredAndSorted.length !== 1 ? 's' : ''}
        </Text>
        <TouchableOpacity
          style={styles.activeSortChip}
          onPress={() => setShowSortModal(!showSortModal)}
        >
          <Text style={styles.activeSortText}>{currentSortLabel}</Text>
          <Ionicons name="chevron-down" size={12} color={COLORS.primaryLight} />
        </TouchableOpacity>
      </View>

      {/* ── Product Grid/List ── */}
      {viewMode === 'grid' ? (
        <FlatList
          data={filteredAndSorted}
          keyExtractor={item => item.id}
          renderItem={renderGridCard}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="leaf-outline" size={48} color={COLORS.textLight} />
              <Text style={styles.emptyTitle}>Aucun produit trouvé</Text>
              <Text style={styles.emptySubtitle}>
                Essayez d'autres filtres ou mots clés.
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={filteredAndSorted}
          keyExtractor={item => item.id}
          renderItem={renderListCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="leaf-outline" size={48} color={COLORS.textLight} />
              <Text style={styles.emptyTitle}>Aucun produit trouvé</Text>
              <Text style={styles.emptySubtitle}>
                Essayez d'autres filtres ou mots clés.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 14,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewToggle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Search */
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
  sortBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  /* Sort Dropdown */
  sortDropdown: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 160 : 140,
    right: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 6,
    zIndex: 999,
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 200,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 10,
  },
  sortOptionActive: {
    backgroundColor: COLORS.primary,
  },
  sortOptionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  sortOptionTextActive: {
    color: COLORS.white,
  },

  /* Categories */
  catScroll: {
    paddingHorizontal: 16,
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

  /* Results Bar */
  resultsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  activeSortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.pill,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 100,
  },
  activeSortText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryLight,
  },

  /* Grid */
  gridContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  gridCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gridImageWrap: {
    width: '100%',
    aspectRatio: 0.95,
    backgroundColor: COLORS.tag,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  heartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  topBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  topBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  gridInfo: {
    padding: 12,
  },
  gridName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  gridBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingVal: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
  },

  /* List */
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  listCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  listImage: {
    width: 110,
    height: 120,
    backgroundColor: COLORS.tag,
  },
  listInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  listName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  listDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 16,
    marginBottom: 8,
  },
  listBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  listHeart: {
    position: 'absolute',
    top: 10,
    right: 10,
  },

  /* Empty */
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
