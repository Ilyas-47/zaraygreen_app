import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { ordersApi } from '../../api/orders.api';
import { TextInput } from 'react-native';

const COLORS = {
  primary: '#2D5016',
  primaryLight: '#4A7C2A',
  bg: '#F8F7F4',
  white: '#FFFFFF',
  text: '#1A1A1A',
  textMuted: '#8A8A8A',
  border: '#EBEBEB',
  pillBg: '#EEF4E8',
  activeBorder: '#2D5016',
  stepDone: '#2D5016',
  stepActive: '#2D5016',
  stepInactive: '#D1D5DB',
};

type PaymentMode = 'card' | 'paypal';

const STEPS = ['Livraison', 'Paiement', 'Confirmation'];

const MOROCCAN_CITIES = [
  'Agadir', 'Béni Mellal', 'Casablanca', 'El Jadida', 'Fès',
  'Kenitra', 'Marrakech', 'Meknès', 'Mohammedia', 'Nador',
  'Oujda', 'Rabat', 'Safi', 'Tanger', 'Tétouan'
];

export default function CheckoutScreen({ navigation }: any) {
  const { items, getTotal, clearCart, promoCode } = useCartStore();
  const [currentStep, setCurrentStep] = useState(1); // 0=Livraison, 1=Paiement, 2=Confirmation
  const [payment, setPayment] = useState<PaymentMode>('card');
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Formulaire nouvelle adresse
  const { user } = useAuthStore();
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ rue: '', ville: '', codePostal: '' });
  const [phone, setPhone] = useState(user?.phone || '');
  const [cityModalVisible, setCityModalVisible] = useState(false);

  const total = getTotal(); // Le getTotal inclut déjà la réduction
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleConfirm = async () => {
    if (items.length === 0) {
      Alert.alert('Erreur', 'Votre panier est vide.');
      return;
    }
    if (useNewAddress && (!newAddress.rue || !newAddress.ville)) {
      Alert.alert('Erreur', 'Veuillez remplir l\'adresse complète.');
      return;
    }
    if (!phone) {
      Alert.alert('Erreur', 'Veuillez renseigner votre numéro de téléphone.');
      return;
    }

    setIsProcessing(true);
    try {
      const orderData = {
        items: items.map(i => ({ productId: i.id, quantity: i.quantity })),
        promoCode: promoCode || undefined,
        paymentMode: payment,
        phone: phone,
        ...(useNewAddress ? { newAddress: { ...newAddress, pays: 'Maroc' } } : { addressId: undefined }) // undefined simulera l'adresse par défaut si géré par backend
      };

      await ordersApi.create(orderData);
      
      clearCart();
      setCurrentStep(2); // Go to Confirmation step
    } catch (e: any) {
      console.log('Checkout error', e);
      Alert.alert('Erreur', e?.response?.data?.message || 'Une erreur est survenue lors de la commande.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Stepper ──────────────────────────────────────────────
  const renderStepper = () => (
    <View style={styles.stepper}>
      {STEPS.map((step, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        return (
          <React.Fragment key={step}>
            <View style={styles.stepItem}>
              <View style={[
                styles.stepCircle,
                done && styles.stepCircleDone,
                active && styles.stepCircleActive,
              ]}>
                {done ? (
                  <Ionicons name="checkmark" size={14} color={COLORS.white} />
                ) : (
                  <View style={[
                    styles.stepDot,
                    active && styles.stepDotActive,
                  ]} />
                )}
              </View>
              <Text style={[
                styles.stepLabel,
                (done || active) && styles.stepLabelActive,
              ]}>{step}</Text>
            </View>
            {i < STEPS.length - 1 && (
              <View style={[styles.stepLine, done && styles.stepLineDone]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );

  // ── Address Section ──────────────────────────────────────
  const renderAddress = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Adresse de livraison</Text>
        <TouchableOpacity onPress={() => setUseNewAddress(!useNewAddress)}>
          <Text style={styles.modifyLink}>{useNewAddress ? 'Utiliser existante' : 'Nouvelle adresse'}</Text>
        </TouchableOpacity>
      </View>
      
      {useNewAddress ? (
        <View style={styles.newAddressForm}>
          <TextInput
            style={styles.input}
            placeholder="Rue"
            value={newAddress.rue}
            onChangeText={(t) => setNewAddress({...newAddress, rue: t})}
          />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity 
              style={[styles.input, { flex: 2, justifyContent: 'center' }]}
              onPress={() => setCityModalVisible(true)}
            >
              <Text style={{ color: newAddress.ville ? COLORS.text : COLORS.textMuted }}>
                {newAddress.ville || 'Sélectionner une ville'}
              </Text>
            </TouchableOpacity>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Code Postal"
              value={newAddress.codePostal}
              onChangeText={(t) => setNewAddress({...newAddress, codePostal: t})}
            />
          </View>
        </View>
      ) : (
        <View style={styles.addressCard}>
          <Ionicons name="location-outline" size={18} color={COLORS.primaryLight} style={{ marginTop: 2 }} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.addressName}>Adresse Principale</Text>
            <Text style={styles.addressLine}>Sera remplie via votre profil</Text>
          </View>
        </View>
      )}

      <Text style={[styles.sectionTitle, { marginTop: 20, marginBottom: 12 }]}>Contact de livraison</Text>
      <TextInput
        style={styles.input}
        placeholder="Numéro de téléphone (ex: 0612345678)"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
    </View>
  );

  // ── Payment Mode ─────────────────────────────────────────
  const renderPayment = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Moyen de paiement</Text>
      <View style={{ gap: 10, marginTop: 12 }}>
        {[
          {
            id: 'card' as PaymentMode,
            icon: 'card-outline',
            label: 'Carte de crédit',
            sub: 'Visa, Mastercard, Apple Pay',
          },
          {
            id: 'paypal' as PaymentMode,
            icon: 'logo-paypal',
            label: 'PayPal',
            sub: 'Connectez-vous à votre compte',
          },
        ].map((opt) => {
          const active = payment === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              style={[styles.optionCard, active && styles.optionCardActive]}
              onPress={() => setPayment(opt.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.payIcon, active && styles.payIconActive]}>
                <Ionicons name={opt.icon as any} size={18} color={active ? COLORS.white : COLORS.primaryLight} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>
                  {opt.label}
                </Text>
                <Text style={styles.optionSub}>{opt.sub}</Text>
              </View>
              <View style={[styles.radioOuter, active && styles.radioOuterActive]}>
                {active && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  // ── Summary Accordion ────────────────────────────────────
  const renderSummary = () => (
    <View style={styles.summaryAccordion}>
      <TouchableOpacity
        style={styles.summaryHeader}
        onPress={() => setSummaryOpen(!summaryOpen)}
        activeOpacity={0.8}
      >
        <Text style={styles.summaryHeaderText}>RÉSUMÉ DE LA COMMANDE</Text>
        <View style={styles.summaryBadge}>
          <Text style={styles.summaryBadgeText}>{itemCount} items</Text>
        </View>
        <Ionicons
          name={summaryOpen ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={COLORS.textMuted}
          style={{ marginLeft: 'auto' }}
        />
      </TouchableOpacity>

      {summaryOpen && (
        <View style={styles.summaryBody}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Produits</Text>
            <Text style={styles.summaryValue}>{total.toFixed(2)} MAD</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Livraison</Text>
            <Text style={[styles.summaryValue, { color: COLORS.primaryLight, fontWeight: '700' }]}>
              Gratuit
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  // ── Success View ─────────────────────────────────────────
  const renderSuccess = () => (
    <View style={styles.successContainer}>
      <Ionicons name="checkmark-circle" size={80} color={COLORS.primary} style={{ marginBottom: 20 }} />
      <Text style={styles.successTitle}>Commande réussie !</Text>
      <Text style={styles.successSub}>
        Merci pour votre achat. Vous recevrez un email de confirmation très bientôt.
      </Text>
      
      <TouchableOpacity
        style={styles.homeBtn}
        onPress={() => navigation.navigate('Home', { screen: 'HomeTab' })}
      >
        <Text style={styles.homeBtnText}>Retour à l'accueil</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paiement</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Stepper */}
        {renderStepper()}

        {currentStep === 2 ? (
          renderSuccess()
        ) : (
          <>
            {/* Address */}
            {renderAddress()}

            {/* Payment */}
            {renderPayment()}

            {/* Summary */}
            {renderSummary()}

            {/* Total */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total TTC</Text>
              <Text style={styles.totalValue}>{total.toFixed(2)} MAD</Text>
            </View>
          </>
        )}

      </ScrollView>

      {/* CTA */}
      {currentStep !== 2 && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={handleConfirm}
            activeOpacity={0.85}
            disabled={isProcessing}
          >
            <Text style={styles.confirmBtnText}>
              {isProcessing ? 'Traitement...' : `Confirmer et payer ${total.toFixed(2)} MAD`}
            </Text>
            {!isProcessing && (
              <Ionicons name="arrow-forward" size={18} color={COLORS.white} style={{ marginLeft: 8 }} />
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* City Modal */}
      <Modal visible={cityModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choisir une ville</Text>
              <TouchableOpacity onPress={() => setCityModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={MOROCCAN_CITIES}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.cityItem}
                  onPress={() => {
                    setNewAddress({...newAddress, ville: item});
                    setCityModalVisible(false);
                  }}
                >
                  <Text style={styles.cityText}>{item}</Text>
                  {newAddress.ville === item && <Ionicons name="checkmark" size={20} color={COLORS.primary} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },

  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },

  // Stepper
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
    paddingHorizontal: 10,
  },
  stepItem: {
    alignItems: 'center',
    gap: 6,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.stepInactive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleDone: {
    backgroundColor: COLORS.stepDone,
  },
  stepCircleActive: {
    backgroundColor: COLORS.stepActive,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
    opacity: 0.4,
  },
  stepDotActive: {
    opacity: 1,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  stepLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  stepLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: COLORS.stepInactive,
    marginBottom: 18,
    marginHorizontal: 4,
  },
  stepLineDone: {
    backgroundColor: COLORS.stepDone,
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  modifyLink: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primaryLight,
  },

  // Address card
  addressCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    flexDirection: 'row',
  },
  addressName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  addressLine: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 20,
  },
  newAddressForm: {
    gap: 10,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    color: COLORS.text,
  },

  // Option cards (delivery & payment)
  optionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionCardActive: {
    borderColor: COLORS.activeBorder,
    backgroundColor: '#FAFDF8',
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  optionLabelActive: {
    color: COLORS.primary,
  },
  optionSub: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioOuterActive: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  payIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.pillBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  payIconActive: {
    backgroundColor: COLORS.primary,
  },

  // Summary accordion
  summaryAccordion: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  summaryHeaderText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1.5,
  },
  summaryBadge: {
    backgroundColor: COLORS.pillBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
  },
  summaryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
  summaryBody: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },

  // Total
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  totalValue: {
    fontSize: 22,
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
  confirmBtn: {
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.3,
  },

  // Success
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 10,
    textAlign: 'center',
  },
  successSub: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  homeBtn: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 30,
  },
  homeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '60%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  cityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cityText: {
    fontSize: 16,
    color: COLORS.text,
  },
});