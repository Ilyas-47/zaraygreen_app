import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';

interface HeroBannerProps {
  onPress: () => void;
}

const COLORS = {
  white: '#FFFFFF',
  primary: '#2D5016',
};

export default function HeroBanner({ onPress }: HeroBannerProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.heroContainer}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1490750967868-88df5691cc4a?auto=format&fit=crop&w=800&q=80' }}
        style={styles.heroImage}
        resizeMode="cover"
      />
      {/* Dark overlay */}
      <View style={styles.heroOverlay} />
      <View style={styles.heroContent}>
        <Text style={styles.heroTitle}>{t('services.quoteTitle')}</Text>
        <Text style={styles.heroSubtitle}>{t('services.quoteDesc')}</Text>
        <TouchableOpacity
          style={styles.heroBtn}
          onPress={onPress}
          activeOpacity={0.9}
        >
          <Text style={styles.heroBtnText}>{t('services.quoteBtn')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroContainer: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    height: 200,
    marginBottom: 20,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30, 50, 10, 0.45)',
  },
  heroContent: {
    flex: 1,
    padding: 22,
    justifyContent: 'flex-end',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.white,
    lineHeight: 32,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 17,
    marginBottom: 14,
  },
  heroBtn: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.white,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 100,
  },
  heroBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
