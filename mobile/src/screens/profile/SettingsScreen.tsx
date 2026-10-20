import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = {
  primary: '#2D5016',
  bg: '#F8F7F4',
  white: '#FFFFFF',
  text: '#1A1A1A',
  textMuted: '#8A8A8A',
  border: '#EBEBEB',
};

export default function SettingsScreen({ navigation }: any) {
  const { i18n } = useTranslation();
  const [notifications, setNotifications] = useState(true);
  const [newsletter, setNewsletter] = useState(false);

  const toggleLanguage = async () => {
    const newLang = i18n.language === 'en' ? 'fr' : 'en';
    await i18n.changeLanguage(newLang);
    await AsyncStorage.setItem('settings.lang', newLang);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Paramètres</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scroll}>
        <Text style={styles.sectionTitle}>Préférences de l'application</Text>
        
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Notifications Push</Text>
              <Text style={styles.settingDesc}>Recevoir des alertes sur vos commandes</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#D1D5DB', true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Newsletter</Text>
              <Text style={styles.settingDesc}>Offres et nouveautés Zaray Green</Text>
            </View>
            <Switch
              value={newsletter}
              onValueChange={setNewsletter}
              trackColor={{ false: '#D1D5DB', true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Langue</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.settingRow} onPress={toggleLanguage} activeOpacity={0.7}>
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Changer la langue</Text>
              <Text style={styles.settingDesc}>Actuellement : {i18n.language.toUpperCase()}</Text>
            </View>
            <Ionicons name="language-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { padding: 4 },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  scroll: { padding: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textMuted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  card: { backgroundColor: COLORS.white, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 24, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  settingText: { flex: 1, paddingRight: 16 },
  settingLabel: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  settingDesc: { fontSize: 12, color: COLORS.textMuted },
  divider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 16 },
});
