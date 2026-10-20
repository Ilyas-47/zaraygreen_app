import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RoleBannerProps {
  user: any;
  onPress: (route: string) => void;
}

export default function RoleBanner({ user, onPress }: RoleBannerProps) {
  const role = user?.role?.toUpperCase() || 'USER';
  if (role === 'CLIENT' || role === 'USER') return null;

  let color = '#F59E0B';
  let icon = 'shield-checkmark';
  let title = 'Mode Administrateur';
  let desc = 'Accéder au tableau de bord';
  let route = 'AdminDashboard';

  if (role === 'LIVREUR') {
    color = '#1D4ED8';
    icon = 'bicycle';
    title = 'Espace Livreur';
    desc = 'Gérer vos livraisons';
    route = 'DeliveryTasks';
  } else if (role === 'TECHNICIEN') {
    color = '#059669';
    icon = 'build';
    title = 'Espace Technicien';
    desc = "Vos plannings d'intervention";
    route = 'TechnicianTasks';
  } else if (role !== 'ADMIN') {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => onPress(route)}
        style={[styles.roleBanner, { backgroundColor: color }]}
        activeOpacity={0.85}
      >
        <View style={styles.roleBannerIcon}>
          <Ionicons name={icon as any} size={18} color="white" />
        </View>
        <View style={styles.content}>
          <Text style={styles.roleBannerTitle}>{title}</Text>
          <Text style={styles.roleBannerDesc}>{desc}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  roleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
  },
  roleBannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  roleBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: 'white',
  },
  roleBannerDesc: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 1,
  },
});
