import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth.api';

const COLORS = {
  primary: '#2D5016',
  primaryLight: '#4A7C2A',
  bg: '#F8F7F4',
  white: '#FFFFFF',
  text: '#1A1A1A',
  textMuted: '#8A8A8A',
  border: '#DEDDD9',
  inputBg: '#FFFFFF',
  placeholder: '#C0BFB9',
};

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const { login, isLoading, setLoading } = useAuthStore();

  React.useEffect(() => {
    setLoading(false); // Force reset on mount in case it was stuck
  }, []);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Champs requis', 'Veuillez remplir tous les champs.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }
    if (!accepted) {
      Alert.alert('CGU', "Veuillez accepter les conditions d'utilisation.");
      return;
    }
    try {
      setLoading(true);
      const res = await authApi.register({ name, email, password });
      const data: any = res.data;
      if (data && data.success) {
        const { user, token } = data.data;
        login({ id: user.id, name: user.name, email: user.email, role: user.role, token });
        navigation.replace('Home');
      } else if (data && data.token) {
        login({ id: data.user.id, name: data.user.name, email: data.user.email, role: data.user.role, token: data.token });
        navigation.replace('Home');
      } else {
        Alert.alert('Erreur', data?.message || 'Inscription échouée.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Inscription échouée ou erreur réseau.';
      Alert.alert('Erreur', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ── Logo (identique LoginScreen) ── */}
            <View style={styles.logoSection}>
              <Text style={styles.logo}>ZARAY</Text>
              <Text style={styles.logoSub}>GREEN</Text>
            </View>

            {/* ── Hero Text ── */}
            <View style={styles.heroSection}>
              <Text style={styles.title}>Créer un compte</Text>
              <Text style={styles.subtitle}>
                Rejoignez notre boutique botanique{'\n'}exclusive dès aujourd'hui.
              </Text>
            </View>

            {/* ── Form ── */}
            <View style={styles.form}>

              {/* Nom */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Nom complet</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={18} color={COLORS.placeholder} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nom Prenom"
                    placeholderTextColor={COLORS.placeholder}
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>

              {/* Email */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Adresse e-mail</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={18} color={COLORS.placeholder} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Mail"
                    placeholderTextColor={COLORS.placeholder}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              {/* Mot de passe */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Mot de passe</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={18} color={COLORS.placeholder} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="••••••••"
                    placeholderTextColor={COLORS.placeholder}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                    <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={18} color={COLORS.placeholder} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.fieldHint}>Mot de passe 8 car. minimum</Text>
              </View>

              {/* Confirmer */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Confirmer le mot de passe</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={18} color={COLORS.placeholder} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="••••••••"
                    placeholderTextColor={COLORS.placeholder}
                    secureTextEntry={!showConfirm}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                  <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                    <Ionicons name={showConfirm ? 'eye-outline' : 'eye-off-outline'} size={18} color={COLORS.placeholder} />
                  </TouchableOpacity>
                </View>
              </View>

            </View>

            {/* ── Checkbox CGU ── */}
            <TouchableOpacity style={styles.checkboxRow} onPress={() => setAccepted(!accepted)} activeOpacity={0.8}>
              <View style={[styles.checkbox, accepted && styles.checkboxActive]}>
                {accepted && <Ionicons name="checkmark" size={12} color={COLORS.white} />}
              </View>
              <Text style={styles.checkboxText}>
                {"J'accepte les "}
                <Text style={styles.checkboxLink}>conditions d'utilisation</Text>
                {" et la politique de confidentialité."}
              </Text>
            </TouchableOpacity>

            {/* ── CTA Buttons (identique LoginScreen) ── */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.primaryBtn, (!accepted || isLoading) && { opacity: 0.6 }]}
                onPress={handleRegister}
                activeOpacity={0.85}
                disabled={!accepted || isLoading}
              >
                <Text style={styles.primaryBtnText}>
                  {isLoading ? 'Création...' : "S'INSCRIRE"}
                </Text>
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.outlineBtn}
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.85}
              >
                <Text style={styles.outlineBtnText}>DÉJÀ UN COMPTE? SE CONNECTER</Text>
              </TouchableOpacity>
            </View>

            {/* ── Legal ── */}
            <Text style={styles.legal}>
              En continuant, vous acceptez nos{' '}
              <Text style={styles.legalLink}>Conditions d'utilisation</Text>
              {' '}et notre{' '}
              <Text style={styles.legalLink}>Politique de confidentialité</Text>.
            </Text>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 20, paddingBottom: 40 },

  logoSection: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 28, fontWeight: '800', color: COLORS.primary, letterSpacing: 8 },
  logoSub: { fontSize: 10, fontWeight: '600', color: COLORS.primaryLight, letterSpacing: 6, marginTop: -2 },

  heroSection: { marginBottom: 28 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  subtitle: { fontSize: 13, color: COLORS.textMuted, lineHeight: 20, fontWeight: '400' },

  form: { gap: 16, marginBottom: 20 },
  fieldGroup: { gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  fieldHint: { fontSize: 11, color: COLORS.placeholder, marginTop: 2 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.inputBg,
    borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 14, height: 50,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 14, color: COLORS.text, fontWeight: '400' },
  eyeBtn: { padding: 4 },

  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 24 },
  checkbox: {
    width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: COLORS.border,
    backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center',
    marginTop: 1, flexShrink: 0,
  },
  checkboxActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkboxText: { flex: 1, fontSize: 12, color: COLORS.textMuted, lineHeight: 18 },
  checkboxLink: { color: COLORS.primaryLight, fontWeight: '600' },

  actions: { gap: 14, marginBottom: 28 },
  primaryBtn: { height: 52, backgroundColor: COLORS.primary, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { fontSize: 13, fontWeight: '800', color: COLORS.white, letterSpacing: 1.5 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },
  outlineBtn: { height: 52, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white },
  outlineBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.text, letterSpacing: 0.5 },

  legal: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center', lineHeight: 17 },
  legalLink: { color: COLORS.primaryLight, fontWeight: '600' },
});