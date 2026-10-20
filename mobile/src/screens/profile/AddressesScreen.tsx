import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Region } from 'react-native-maps';
import { profileApi } from '../../api/profile.api';
import { useFocusEffect } from '@react-navigation/native';

const COLORS = {
  primary: '#2D5016',
  primaryLight: '#4A7C2A',
  bg: '#F8F7F4',
  white: '#FFFFFF',
  text: '#1A1A1A',
  textMuted: '#8A8A8A',
  border: '#EBEBEB',
};

export default function AddressesScreen({ navigation }: any) {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States for Map Modal
  const [showMap, setShowMap] = useState(false);
  const [region, setRegion] = useState<Region>({
    latitude: 33.5731, // Default to Casablanca
    longitude: -7.5898,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [selectedCoord, setSelectedCoord] = useState<{latitude: number, longitude: number} | null>(null);

  // States for Address Form
  const [addressName, setAddressName] = useState('');
  const [addressDetails, setAddressDetails] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      fetchAddresses();
    }, [])
  );

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await profileApi.getAddresses();
      if ((res.data as any).success) {
        setAddresses((res.data as any).data);
      }
    } catch (e) {
      console.log('fetch addresses error', e);
    } finally {
      setLoading(false);
    }
  };

  const handleMapPress = (e: any) => {
    setSelectedCoord(e.nativeEvent.coordinate);
  };

  const confirmLocation = () => {
    if (!selectedCoord) {
      // Si aucun clic, prendre le centre actuel
      setSelectedCoord({ latitude: region.latitude, longitude: region.longitude });
    }
    setShowMap(false);
  };

  const handleSaveAddress = async () => {
    if (!selectedCoord) {
      Alert.alert('Erreur', 'Veuillez choisir une position sur la carte.');
      return;
    }
    if (!addressName.trim()) {
      Alert.alert('Erreur', 'Veuillez donner un nom à cette adresse (Maison, Travail...).');
      return;
    }

    try {
      await profileApi.addAddress({
        name: addressName,
        rue: addressDetails || `Lat: ${selectedCoord.latitude.toFixed(4)}, Lng: ${selectedCoord.longitude.toFixed(4)}`,
        ville: 'Inconnue',
        pays: 'Maroc',
        latitude: selectedCoord.latitude,
        longitude: selectedCoord.longitude,
      });

      // Reset
      setAddressName('');
      setAddressDetails('');
      setSelectedCoord(null);
      
      fetchAddresses();
    } catch (e: any) {
      Alert.alert('Erreur', 'Impossible de sauvegarder l\'adresse.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await profileApi.deleteAddress(id);
      fetchAddresses();
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de supprimer.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Mes Adresses</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Ajouter une adresse : Section Carte */}
        <Text style={styles.sectionTitle}>Ajouter une adresse</Text>
        <View style={styles.addCard}>
          {!selectedCoord ? (
            <TouchableOpacity style={styles.mapTriggerBtn} onPress={() => setShowMap(true)}>
              <Ionicons name="map-outline" size={24} color={COLORS.primary} />
              <Text style={styles.mapTriggerText}>Choisir sur la carte</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.formSection}>
              <View style={styles.coordBox}>
                <Ionicons name="location" size={20} color={COLORS.primary} />
                <Text style={styles.coordText}>Position sélectionnée avec succès !</Text>
                <TouchableOpacity onPress={() => setShowMap(true)}>
                  <Text style={styles.changeLink}>Modifier</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Nom de l'adresse (ex: Maison, Bureau)"
                placeholderTextColor={COLORS.textMuted}
                value={addressName}
                onChangeText={setAddressName}
              />
              <TextInput
                style={[styles.input, { height: 80 }]}
                placeholder="Détails (ex: Bâtiment B, Code 1234)"
                placeholderTextColor={COLORS.textMuted}
                multiline
                textAlignVertical="top"
                value={addressDetails}
                onChangeText={setAddressDetails}
              />

              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAddress}>
                <Text style={styles.saveBtnText}>Enregistrer l'adresse</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Adresses enregistrées</Text>
        {addresses.length === 0 ? (
          <Text style={styles.emptyText}>Aucune adresse enregistrée.</Text>
        ) : (
          addresses.map(a => (
            <View key={a.id} style={styles.card}>
              <View style={styles.cardIcon}>
                <Ionicons name="location-outline" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{a.rue}</Text>
                <Text style={styles.cardDesc}>{a.ville}, {a.pays}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(a.id)}>
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal Google Maps */}
      <Modal visible={showMap} animationType="slide" onRequestClose={() => setShowMap(false)}>
        <View style={styles.modalContainer}>
          <MapView
            style={styles.map}
            region={region}
            onRegionChangeComplete={setRegion}
            onPress={handleMapPress}
            showsUserLocation={true}
          >
            {selectedCoord && (
              <Marker coordinate={selectedCoord} />
            )}
            {/* Si aucun coord sélectionné, afficher le marqueur au centre */}
            {!selectedCoord && (
              <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} />
            )}
          </MapView>

          <View style={styles.mapOverlayTop}>
            <TouchableOpacity style={styles.mapCloseBtn} onPress={() => setShowMap(false)}>
              <Ionicons name="close" size={28} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.mapOverlayTitle}>Déplacez la carte</Text>
            <View style={{ width: 44 }} />
          </View>

          <View style={styles.mapOverlayBottom}>
            <TouchableOpacity style={styles.mapConfirmBtn} onPress={confirmLocation}>
              <Text style={styles.mapConfirmText}>Confirmer cette position</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { padding: 4 },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  scroll: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  
  addCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: COLORS.border },
  mapTriggerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 20, borderWidth: 1, borderColor: COLORS.primary, borderStyle: 'dashed', borderRadius: 12, backgroundColor: '#F0FDF4' },
  mapTriggerText: { color: COLORS.primary, fontWeight: '700', fontSize: 15 },
  
  formSection: { gap: 12 },
  coordBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', padding: 12, borderRadius: 8 },
  coordText: { flex: 1, fontSize: 13, color: COLORS.text, marginLeft: 8 },
  changeLink: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  input: { height: 50, backgroundColor: '#F9FAFB', borderRadius: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: COLORS.border, color: COLORS.text },
  saveBtn: { backgroundColor: COLORS.primary, borderRadius: 12, height: 50, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  saveBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },

  emptyText: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', marginTop: 20 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  cardIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  cardDesc: { fontSize: 13, color: COLORS.textMuted, lineHeight: 18 },

  // Map Modal
  modalContainer: { flex: 1 },
  map: { flex: 1 },
  mapOverlayTop: { position: 'absolute', top: 50, left: 20, right: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mapCloseBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4 },
  mapOverlayTitle: { backgroundColor: COLORS.white, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, fontWeight: '700', fontSize: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4 },
  mapOverlayBottom: { position: 'absolute', bottom: 40, left: 20, right: 20 },
  mapConfirmBtn: { backgroundColor: COLORS.primary, borderRadius: 16, height: 56, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 5 },
  mapConfirmText: { color: COLORS.white, fontWeight: '800', fontSize: 16, letterSpacing: 0.5 },
});
