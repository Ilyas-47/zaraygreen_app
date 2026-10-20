import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../../store/productStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const COLORS = {
  primary: '#2D5016',
  primaryLight: '#4A7C2A',
  bg: '#F8F7F4',
  white: '#FFFFFF',
  text: '#1A1A1A',
  border: '#EBEBEB',
  tag: '#F0F5EB',
};

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  isRight?: boolean;
}

export default function ProductCard({ product, onPress, isRight }: ProductCardProps) {
  const [isFav, setIsFav] = React.useState(false);

  React.useEffect(() => {
    AsyncStorage.getItem('favorites').then(str => {
      if (str) {
        const favs = JSON.parse(str);
        setIsFav(favs.includes(product.id));
      }
    });
  }, [product.id]);

  const toggleFav = async () => {
    try {
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

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return price;
    return `${numPrice.toFixed(2)} MAD`;
  };

  return (
    <TouchableOpacity
      style={[styles.productCard, isRight && styles.productCardRight]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.productImageWrapper}>
        <Image
          source={{
            uri:
              product.images && product.images.length > 0
                ? product.images[0]
                : 'https://images.unsplash.com/photo-1487530811015-780c3d9fd5a3?auto=format&fit=crop&w=400&q=80',
          }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <TouchableOpacity style={styles.heartBtn} activeOpacity={0.7} onPress={toggleFav}>
          <Ionicons name={isFav ? "heart" : "heart-outline"} size={16} color={isFav ? "#EF4444" : COLORS.primaryLight} />
        </TouchableOpacity>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
        <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  productCardRight: {
    // marginTop: 20, // Stagger effect removed for better alignment
  },
  productImageWrapper: {
    width: '100%',
    aspectRatio: 0.9,
    backgroundColor: COLORS.tag,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  heartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
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
});
