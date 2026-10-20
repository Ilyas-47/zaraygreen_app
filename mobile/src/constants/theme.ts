// src/constants/theme.ts

export const theme = {
  colors: {
    // Brand
    primary:          '#2D5016',
    primaryLight:     '#4A7C2A',
    primaryDark:      '#1A3009',
    accent:           '#8CB369',

    // UI
    background:       '#F8F7F4',
    surface:          '#FFFFFF',
    border:           '#EBEBEB',
    pillBg:           '#EEF4E8',

    // Text
    text:             '#1A1A1A',
    textMuted:        '#8A8A8A',
    textLight:        '#C0BFB9',
    onPrimary:        '#FFFFFF',

    // Status
    success:          '#4ADE80',
    error:            '#EF4444',
    errorLight:       '#FEF2F2',
    warning:          '#F59E0B',
    info:             '#3B82F6',

    // Roles
    admin:            '#F59E0B',
    livreur:          '#1D4ED8',
    technicien:       '#059669',

    // Hero
    heroBg:           '#1A3009',
    heroDark:         '#0F1A0A',
  },

  fonts: {
    headline:         'PlayfairDisplay_700Bold',
    body:             'Inter_400Regular',
    bodyMedium:       'Inter_500Medium',
    label:            'Inter_600SemiBold',
  },

  radius: {
    xs:   6,
    sm:   8,
    md:   12,
    lg:   16,
    xl:   20,
    xxl:  28,
    full: 9999,
  },

  spacing: {
    xs:     4,
    sm:     8,
    md:     12,
    lg:     16,
    xl:     20,
    xxl:    32,
    screen: 20,   // padding horizontal des screens
  },

  shadow: {
    sm: {
      shadowColor:   '#000',
      shadowOffset:  { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius:  4,
      elevation:     2,
    },
    md: {
      shadowColor:   '#000',
      shadowOffset:  { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius:  8,
      elevation:     4,
    },
  },
} as const;

// Type helper
export type ThemeColors  = typeof theme.colors;
export type ThemeSpacing = typeof theme.spacing;
export type ThemeRadius  = typeof theme.radius;