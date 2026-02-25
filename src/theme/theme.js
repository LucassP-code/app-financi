// Design System - Inspirado no design banking premium escuro com acentos verde neon
export const COLORS = {
  // Backgrounds
  background: '#0A0A0A',
  surface: '#141414',
  surfaceLight: '#1E1E1E',
  card: '#1A1A2E',
  cardGradientStart: '#1A2A1A',
  cardGradientEnd: '#0D1F0D',

  // Primary - Verde Neon (inspiração)
  primary: '#00E676',
  primaryLight: '#69F0AE',
  primaryDark: '#00C853',
  primaryMuted: 'rgba(0, 230, 118, 0.15)',

  // Accent
  accent: '#00BFA5',
  accentLight: '#64FFDA',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textMuted: '#666666',
  textOnPrimary: '#0A0A0A',

  // Status
  income: '#00E676',
  expense: '#FF5252',
  investiment: '#448AFF',
  warning: '#FFD740',

  // Others
  border: '#2A2A2A',
  divider: '#1F1F1F',
  overlay: 'rgba(0, 0, 0, 0.7)',
  shadow: 'rgba(0, 230, 118, 0.1)',
};

export const FONTS = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

export const SIZES = {
  // Font sizes
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  hero: 40,

  // Spacing
  paddingXs: 4,
  paddingSm: 8,
  paddingMd: 12,
  padding: 16,
  paddingLg: 20,
  paddingXl: 24,
  paddingXxl: 32,

  // Border radius
  radiusSm: 8,
  radius: 12,
  radiusLg: 16,
  radiusXl: 24,
  radiusFull: 9999,

  // Icon sizes
  iconSm: 20,
  icon: 24,
  iconLg: 32,
  iconXl: 48,
};

export const SHADOWS = {
  small: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
};
