import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';
import { useCartStore } from '../../store/cartStore';

const COLORS = {
  primary: '#2D5016',
  primaryLight: '#4A7C2A',
  accent: '#8CB369',
  bg: '#F8F7F4',
  white: '#FFFFFF',
  text: '#1A1A1A',
  textMuted: '#8A8A8A',
  border: '#EBEBEB',
  pillBg: '#EEF4E8',
  expertBg: '#EEF4E8',
  star: '#F59E0B',
};

const FEATURES = [
  { icon: 'sunny-outline',     label: 'Lumière indirecte' },
  { icon: 'water-outline',     label: 'Arrosage 1x/sem' },
  { icon: 'leaf-outline',      label: 'Purifie l\'air' },
];

const SIZES = [
  { id: 'sm',  label: 'Petit (20-\n30cm)' },
  { id: 'md',  label: 'Moyen (40-\n60cm)' },
  { id: 'lg',  label: 'Grand\n(80cm+)' },
];

export default function ProductDetailsScreen({ route, navigation }: any) {
  const { product } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('md');
  const [isFav, setIsFav] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80',
      quantity: quantity,
      categoryId: product.categoryId,
    });
    // Optionnel : feedback visuel ou navigation
    navigation.navigate('Home', { screen: 'CartTab' });
  };

  React.useEffect(() => {
    import('@react-native-async-storage/async-storage').then(({ default: AsyncStorage }) => {
      AsyncStorage.getItem('favorites').then(str => {
        if (str) {
          const favs = JSON.parse(str);
          setIsFav(favs.includes(product.id));
        }
      });
    });
  }, [product.id]);

  const toggleFav = async () => {
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      const str = await AsyncStorage.getItem('favorites');
      let favs = str ? JSON.parse(str) : [];
      if (favs.includes(product.id)) {
        favs = favs.filter((id: string) => id !== product.id);
        setIsFav(false);
      } else {
        favs.push(product.id);
        setIsFav(true);
      }
      await AsyncStorage.setItem('favorites', JSON.stringify(favs));
    } catch (e) {
      console.log('Error toggling fav', e);
    }
  };

  const formatPrice = (price: number | string): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return price.toString();
    return `${numPrice.toFixed(2)} MAD`;
  };

  const rating = product.rating || 4.8;
  const reviewCount = 124;

  const renderStars = (r: number) => {
    return [1, 2, 3, 4, 5].map((i) => (
      <Ionicons
        key={i}
        name={i <= Math.floor(r) ? 'star' : i - r < 1 ? 'star-half' : 'star-outline'}
        size={14}
        color={COLORS.star}
      />
    ));
  };

  return (
    <View style={styles.container}>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Image Hero ── */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: product.images?.[0] ||
                'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80',
            }}
            style={styles.image}
            resizeMode="cover"
          />

          {/* Boutons flottants */}
          <SafeAreaView style={styles.headerActions}>
            <TouchableOpacity style={styles.floatBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={20} color={COLORS.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.floatBtn} onPress={toggleFav}>
              <Ionicons
                name={isFav ? 'heart' : 'heart-outline'}
                size={20}
                color={isFav ? '#EF4444' : COLORS.text}
              />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        {/* ── Fiche Produit ── */}
        <View style={styles.sheet}>

          {/* Nom + Prix */}
          <View style={styles.titleRow}>
            <Text style={styles.productName} numberOfLines={2}>
              {product.name || 'Monstera Deliciosa'}
            </Text>
            <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
          </View>

          {/* Étoiles */}
          <View style={styles.ratingRow}>
            <View style={styles.stars}>{renderStars(rating)}</View>
            <Text style={styles.ratingValue}>{rating}</Text>
            <Text style={styles.ratingCount}>({reviewCount} avis)</Text>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>DESCRIPTION</Text>
            <Text style={styles.description}>
              {product.description ||
                "Plante tropicale majestueuse, facile d'entretien, parfaite pour apporter une touche de jungle à votre intérieur. Ses grandes feuilles découpées en font une pièce maîtresse de décoration."}
            </Text>
          </View>

          {/* Caractéristiques */}
          <View style={styles.featuresRow}>
            {FEATURES.map((f, i) => (
              <View key={i} style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name={f.icon as any} size={20} color={COLORS.primaryLight} />
                </View>
                <Text style={styles.featureLabel}>{f.label}</Text>
              </View>
            ))}
          </View>

          {/* Taille */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>CHOISIR LA TAILLE</Text>
            <View style={styles.sizesRow}>
              {SIZES.map((s) => {
                const active = selectedSize === s.id;
                return (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.sizeBtn, active && styles.sizeBtnActive]}
                    onPress={() => setSelectedSize(s.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.sizeBtnText, active && styles.sizeBtnTextActive]}>
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Conseil expert */}
          <View style={styles.expertCard}>
            <View style={styles.expertIconWrapper}>
              <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.primaryLight} />
            </View>
            <View style={styles.expertTextWrapper}>
              <Text style={styles.expertTitle}>Conseil de l'expert</Text>
              <Text style={styles.expertBody}>
                La Monstera adore l'humidité. N'hésitez pas à vaporiser ses feuilles régulièrement pour recréer son habitat naturel tropical.
              </Text>
            </View>
          </View>

        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        {product.stock <= 0 ? (
          <View style={[styles.cartBtn, { backgroundColor: COLORS.textMuted }]}>
            <Ionicons name="close-circle-outline" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
            <Text style={styles.cartBtnText}>Rupture de stock</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.cartBtn} 
            activeOpacity={0.85}
            onPress={handleAddToCart}
          >
            <Ionicons name="bag-outline" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
            <Text style={styles.cartBtnText}>Ajouter au panier</Text>
          </TouchableOpacity>
        )}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    paddingBottom: 110,
  },

  // Image
  imageContainer: {
    width: '100%',
    height: 360,
    backgroundColor: '#D6E8CC',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  headerActions: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  floatBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  // Sheet
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingHorizontal: 20,
    paddingTop: 28,
  },

  // Titre + Prix
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
  },
  productName: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 26,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },

  // Étoiles
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  ratingCount: {
    fontSize: 12,
    color: COLORS.textMuted,
  },

  // Section
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 2,
    marginBottom: 10,
  },
  description: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 20,
    fontWeight: '400',
  },

  // Features
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  featureItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.pillBg,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 6,
  },
  featureIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
    lineHeight: 14,
  },

  // Tailles
  sizesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sizeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  sizeBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.pillBg,
  },
  sizeBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
  sizeBtnTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  // Expert
  expertCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.expertBg,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 10,
  },
  expertIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  expertTextWrapper: {
    flex: 1,
  },
  expertTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  expertBody: {
    fontSize: 12,
    color: COLORS.primaryLight,
    lineHeight: 18,
    fontWeight: '400',
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 30,
  },
  cartBtn: {
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
});