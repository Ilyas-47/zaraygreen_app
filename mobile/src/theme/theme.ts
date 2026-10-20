export interface Theme {
  colors: {
    primary: string;
    primaryLight: string;
    onPrimary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    onSurface: string;
    onSurfaceVariant: string;
    outline: string;
    pillBg: string;
    tag: string;
    error: string;
  };
  fonts: {
    headline: string;
    body: string;
    bodyMedium: string;
    label: string;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    screen: number;
  };
}

export const theme: Theme = {
  colors: {
    primary: '#2D5016',         // Vert foncé principal (logo, textes, boutons)
    primaryLight: '#4A7C2A',    // Vert moyen (liens, pills actifs)
    onPrimary: '#FFFFFF',       // Texte sur fond vert
    secondary: '#8CB369',       // Accent vert clair (liens blog, highlights)
    accent: '#8CB369',          // Identique secondary — pour compatibilité
    background: '#F8F7F4',      // Fond général crème/blanc cassé
    surface: '#FFFFFF',         // Cartes, inputs, modals
    onSurface: '#1A1A1A',       // Texte principal
    onSurfaceVariant: '#8A8A8A',// Texte secondaire / placeholders
    outline: '#EBEBEB',         // Bordures légères
    pillBg: '#EEF4E8',          // Fond des pills catégories non sélectionnées
    tag: '#F0F5EB',             // Fond placeholder images produits
    error: '#EF4444',           // Rouge erreurs / cœur favoris
  },
  fonts: {
    headline: 'PlayfairDisplay_700Bold',
    body: 'Inter_400Regular',
    bodyMedium: 'Inter_500Medium',
    label: 'Inter_600SemiBold',
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 32,
    screen: 20,
  },
};