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

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, setLoading } = useAuthStore();

  React.useEffect(() => {
    setLoading(false); // Force reset on mount in case it was stuck
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Champs requis', 'Veuillez saisir votre email et votre mot de passe.');
      return;
    }
    try {
      setLoading(true);
      const res = await authApi.login({ email, password });
      const data: any = res.data;
      if (data && data.success) {
        login({ ...data.data.user, token: data.data.token });
        navigation.replace('Home');
      } else if (res.data && (res.data as any).token) {
         login({ ...(res.data as any).user, token: (res.data as any).token });
         navigation.replace('Home');
      } else {
        Alert.alert('Erreur', data.message || 'Identifiants incorrects');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Identifiants invalides ou erreur réseau.';
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
            {/* ── Logo ── */}
            <View style={styles.logoSection}>
              <Text style={styles.logo}>ZARAY</Text>
              <Text style={styles.logoSub}>GREEN</Text>
            </View>

            {/* ── Hero Text ── */}
            <View style={styles.heroSection}>
              <Text style={styles.title}>Bienvenue</Text>
              <Text style={styles.subtitle}>
                Connectez-vous pour accéder à votre jardin{'\n'}personnel.
              </Text>
            </View>

            {/* ── Form ── */}
            <View style={styles.form}>

              {/* Email */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Email</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={18} color={COLORS.placeholder} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="votre@gmail.com"
                    placeholderTextColor={COLORS.placeholder}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.fieldGroup}>
                <View style={styles.passwordLabelRow}>
                  <Text style={styles.fieldLabel}>Mot de passe</Text>
                  <TouchableOpacity>
                    <Text style={styles.forgotLink}>Mot de passe oublié?</Text>
                  </TouchableOpacity>
                </View>
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
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={18}
                      color={COLORS.placeholder}
                    />
                  </TouchableOpacity>
                </View>
              </View>

            </View>

            {/* ── CTA Buttons ── */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.primaryBtn, isLoading && { opacity: 0.7 }]}
                onPress={handleLogin}
                activeOpacity={0.85}
                disabled={isLoading}
              >
                <Text style={styles.primaryBtnText}>
                  {isLoading ? 'Connexion...' : 'SE CONNECTER'}
                </Text>
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.outlineBtn}
                onPress={() => navigation.navigate('Register')}
                activeOpacity={0.85}
              >
                <Text style={styles.outlineBtnText}>PAS DE COMPTE? S'INSCRIRE</Text>
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
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 40,
  },

  // Logo
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 8,
  },
  logoSub: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.primaryLight,
    letterSpacing: 6,
    marginTop: -2,
  },

  // Hero
  heroSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 20,
    fontWeight: '400',
  },

  // Form
  form: {
    gap: 16,
    marginBottom: 28,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotLink: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryLight,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '400',
  },
  eyeBtn: {
    padding: 4,
  },

  // Actions
  actions: {
    gap: 14,
    marginBottom: 28,
  },
  primaryBtn: {
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 1.5,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  outlineBtn: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  outlineBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 0.5,
  },

  // Legal
  legal: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 17,
  },
  legalLink: {
    color: COLORS.primaryLight,
    fontWeight: '600',
  },
});