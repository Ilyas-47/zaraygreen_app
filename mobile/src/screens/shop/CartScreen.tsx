import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { promoApi } from '../../api/promo.api';
import { useTranslation } from 'react-i18next';

const COLORS = {
  primary: '#2D5016',
  primaryLight: '#4A7C2A',
  bg: '#F8F7F4',
  white: '#FFFFFF',
  text: '#1A1A1A',
  textMuted: '#8A8A8A',
  border: '#EBEBEB',
  pillBg: '#EEF4E8',
  red: '#EF4444',
  gratuit: '#4A7C2A',
};

export default function CartScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { items, updateQuantity, removeItem, getTotal, getSubTotal, promoCode: storePromoCode, discountPercentage, setPromoCode } = useCartStore();
  const { t } = useTranslation();
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');

  const shipping = 0; // Livraison supprimée
  const subTotal = getSubTotal();
  const total = getTotal() + shipping;

  // ── Header ──────────────────────────────────────────────
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={{ width: 26 }} />
      <Text style={styles.headerTitle}>Mon Panier</Text>
      <View style={styles.headerRight}>
        <TouchableOpacity 
          style={styles.iconBtn}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => user ? navigation.navigate('Profile') : navigation.navigate('Login')}
        >
          <Ionicons name="person-outline" size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // ── Empty State ──────────────────────────────────────────
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrapper}>
        <Ionicons name="bag-outline" size={44} color={COLORS.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>{t('cart.empty')}</Text>
      <Text style={styles.emptySub}>{t('cart.emptySub')}</Text>
      <TouchableOpacity
        style={styles.emptyBtn}
        onPress={() => navigation.navigate('HomeTab')}
        activeOpacity={0.85}
      >
        <Text style={styles.emptyBtnText}>{t('cart.startShopping')}</Text>
      </TouchableOpacity>
    </View>
  );

  // ── Cart Item ────────────────────────────────────────────
  const renderItem = (item: any) => (
    <View key={item.id} style={styles.itemCard}>
      <Image
        source={{ uri: item.image || item.images?.[0] || 'https://images.unsplash.com/photo-1487530811015-780c3d9fd5a3?auto=format&fit=crop&w=400&q=80' }}
        style={styles.itemImage}
        resizeMode="cover"
      />
      <View style={styles.itemInfo}>
        <View style={styles.itemTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.itemTag}>
              {item.categoryId === '1' || item.categoryId === '2' ? 'Gazon / Naturel' : 'Plante d\'intérieur'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => removeItem(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.itemBottomRow}>
          <Text style={styles.itemPrice}>
            {typeof item.price === 'number' ? item.price.toFixed(2) : parseFloat(item.price).toFixed(2)} MAD
          </Text>
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepBtn}
              onPress={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
            >
              <Ionicons name="remove" size={16} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.stepValue}>{item.quantity}</Text>
            <TouchableOpacity
              style={[styles.stepBtn, styles.stepBtnActive]}
              onPress={() => updateQuantity(item.id, item.quantity + 1)}
            >
              <Ionicons name="add" size={16} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  // ── Promo Code ───────────────────────────────────────────
  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) return;
    setPromoLoading(true);
    setPromoError('');
    try {
      const res = await promoApi.validate(promoCodeInput.trim());
      // L'API renvoie les données directement (grace à l'interceptor)
      const data: any = res.data || res; // Selon config d'axios
      const promoData = data.data || data; 
      
      if (promoData && promoData.discountPercentage) {
        setPromoCode(promoData.code || promoCodeInput.trim(), promoData.discountPercentage);
        setPromoCodeInput('');
      }
    } catch (e: any) {
      setPromoError(e?.response?.data?.message || 'Code promo invalide');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode(null, 0);
  };

  const renderPromo = () => (
    <View>
      {storePromoCode ? (
        <View style={styles.activePromoContainer}>
          <Text style={styles.activePromoText}>
            Code {storePromoCode} appliqué (-{discountPercentage}%)
          </Text>
          <TouchableOpacity onPress={handleRemovePromo}>
            <Ionicons name="close-circle" size={20} color={COLORS.red} />
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.promoRow}>
            <TextInput
              style={styles.promoInput}
              placeholder="Entrez votre code"
              placeholderTextColor={COLORS.textMuted}
              value={promoCodeInput}
              onChangeText={(t) => { setPromoCodeInput(t); setPromoError(''); }}
              editable={!promoLoading}
            />
            <TouchableOpacity style={styles.promoBtn} activeOpacity={0.85} onPress={handleApplyPromo} disabled={promoLoading}>
              <Text style={styles.promoBtnText}>{promoLoading ? '...' : 'Appliquer'}</Text>
            </TouchableOpacity>
          </View>
          {promoError ? <Text style={styles.promoErrorText}>{promoError}</Text> : null}
        </>
      )}
    </View>
  );

  // ── Summary ──────────────────────────────────────────────
  const renderSummary = () => (
    <View style={styles.summary}>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Sous-total</Text>
        <Text style={styles.summaryValue}>{subTotal.toFixed(2)} MAD</Text>
      </View>
      {discountPercentage > 0 && (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Réduction ({discountPercentage}%)</Text>
          <Text style={[styles.summaryValue, { color: COLORS.red }]}>
            -{(subTotal * (discountPercentage / 100)).toFixed(2)} MAD
          </Text>
        </View>
      )}
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Livraison</Text>
        <Text style={[styles.summaryValue, { color: COLORS.gratuit, fontWeight: '700' }]}>Gratuit</Text>
      </View>
      <View style={[styles.summaryRow, styles.summaryTotalRow]}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{total.toFixed(2)} MAD</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {renderHeader()}

      {items.length === 0 ? (
        renderEmpty()
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Items */}
            <View style={styles.itemsList}>
              {items.map(renderItem)}
            </View>

            {/* Promo */}
            <Text style={styles.promoLabel}>Code Promo</Text>
            {renderPromo()}

            {/* Summary */}
            {renderSummary()}
          </ScrollView>

          {/* Checkout Button */}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() => navigation.navigate('Checkout')}
              activeOpacity={0.85}
            >
              <Text style={styles.checkoutBtnText}>Procéder au paiement</Text>
              <Ionicons name="arrow-forward" size={18} color={COLORS.white} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.bg,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },

  // Items
  itemsList: {
    gap: 12,
    marginBottom: 24,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemImage: {
    width: 90,
    height: 90,
    backgroundColor: '#D6E8CC',
  },
  itemInfo: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  itemTag: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '400',
  },
  itemBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },

  // Stepper
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.pillBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnActive: {
    backgroundColor: COLORS.primary,
  },
  stepValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    minWidth: 18,
    textAlign: 'center',
  },

  // Promo
  promoLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
  },
  promoRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  promoInput: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    fontSize: 13,
    color: COLORS.text,
  },
  promoBtn: {
    height: 48,
    paddingHorizontal: 18,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },
  activePromoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.pillBg,
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  activePromoText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  promoErrorText: {
    color: COLORS.red,
    fontSize: 12,
    marginTop: -16,
    marginBottom: 24,
    marginLeft: 4,
  },

  // Summary
  summary: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '400',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  summaryTotalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
    marginTop: 2,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },

  // Bottom
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
  checkoutBtn: {
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.3,
  },

  // Empty
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIconWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.pillBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  emptyBtn: {
    height: 52,
    paddingHorizontal: 32,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
});