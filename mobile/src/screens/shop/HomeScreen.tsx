import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useProductStore } from '../../store/productStore';
import { useTranslation } from 'react-i18next';
import { categoriesApi } from '../../api/categories.api';

// Shared Components
import ProductCard from '../../components/shared/ProductCard';
import HeroBanner from '../../components/shared/HeroBanner';
import RoleBanner from '../../components/shared/RoleBanner';

// External Styles & Colors
import { styles, COLORS } from '../styles/HomeScreen.styles';

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { products, fetchProducts } = useProductStore();
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<{id: string, name: string}[]>([{ id: 'all', name: 'Tous' }]);

  React.useEffect(() => {
    fetchProducts();
    categoriesApi.getAll().then(res => {
      
      const data = (res.data as any).data || res.data;
      if (Array.isArray(data)) {
        setCategories([{ id: 'all', name: 'Tous' }, ...data]);
      }
    }).catch(err => console.log('Erreur fetch categories', err));
  }, []);

  const filteredProducts = products.filter(product => {
    const hasStock = product.stock > 0;
    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return hasStock && matchesCategory && matchesSearch;
  });

  // ─── Header ───────────────────────────────────────────────
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={{ width: 26 }} />

      <Text style={styles.logo}>ZARAY</Text>

      <View style={styles.headerRight}>
        <TouchableOpacity 
          style={styles.iconBtn}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => user ? navigation.navigate('Profile') : navigation.navigate('Login')}
        >
          <Ionicons name="person-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // ─── Search ───────────────────────────────────────────────
  const renderSearch = () => (
    <View style={styles.searchContainer}>
      <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher une plante, un bouquet..."
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
  );

  // ─── Categories ───────────────────────────────────────────
  const renderCategories = () => (
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
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  // ─── Section Title ────────────────────────────────────────
  const renderSectionTitle = (title: string, onSeeAll?: () => void) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAll}>Voir tout</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // ─── Products Grid ────────────────────────────────────────
  const renderProductsGrid = () => {
    const sortedProducts = [...filteredProducts].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
    const toShow = sortedProducts.slice(0, 6);
    const rows: any[][] = [];
    for (let i = 0; i < toShow.length; i += 2) {
      rows.push(toShow.slice(i, i + 2));
    }

    return (
      <View style={styles.section}>
        {renderSectionTitle('Nouveautés', () => navigation.navigate('AllProducts'))}
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="leaf-outline" size={36} color={COLORS.textLight} />
            <Text style={styles.emptyText}>Aucun produit trouvé</Text>
          </View>
        ) : (
          rows.map((row, rIdx) => (
            <View key={rIdx} style={styles.productRow}>
              {row.map((product, idx) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isRight={idx % 2 !== 0}
                  onPress={() => navigation.navigate('ProductDetails', { product })}
                />
              ))}
              {row.length === 1 && <View style={styles.productCardPlaceholder} />}
            </View>
          ))
        )}
      </View>
    );
  };

  // ─── Inspiration Blog Card ────────────────────────────────
  const renderInspiration = () => (
    <View style={[styles.section, { marginBottom: 100 }]}>
      {renderSectionTitle('Inspirations Déco')}
      <TouchableOpacity style={styles.blogCard} activeOpacity={0.85}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80' }}
          style={styles.blogImage}
          resizeMode="cover"
        />
        <View style={styles.blogOverlay} />
        <View style={styles.blogContent}>
          <View style={styles.blogTag}>
            <Text style={styles.blogTagText}>En savoir requis</Text>
          </View>
          <Text style={styles.blogTitle}>Comment intégrer les vert dans votre intérieur scandinave</Text>
          <TouchableOpacity>
            <Text style={styles.blogLink}>Lire l'article →</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      {renderHeader()}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <RoleBanner user={user} onPress={(route) => navigation.navigate(route)} />
        {renderSearch()}
        <HeroBanner onPress={() => navigation.navigate('QuoteRequest')} />
        {renderCategories()}
        {renderProductsGrid()}
        {renderInspiration()}
      </ScrollView>
    </SafeAreaView>
  );
}