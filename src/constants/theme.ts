export const colors = {
  // primary palette
  primary: '#7C5CBF',        // deep purple — buttons, CTAs
  primaryLight: '#9B7FD4',   // lighter purple — hover states
  primarySoft: '#E8E0F5',    // very soft purple — card backgrounds
  primaryPale: '#F3EFFC',    // almost white purple — screen backgrounds

  // lavender shades
  lavender: '#B09FD8',       // mid lavender — accents
  lavenderLight: '#D4CAF0',  // light lavender — borders, dividers
  lavenderPale: '#EDE8F9',   // pale lavender — tags, chips

  // text
  textPrimary: '#1E1433',    // near black with purple tint
  textSecondary: '#6B5E8A',  // muted purple-grey
  textTertiary: '#A99BC0',   // very muted — placeholders, hints

  // status
  success: '#6DB88A',        // soft green — goal achieved
  warning: '#C9A84C',        // soft amber — goal paused
  error: '#C96B6B',          // soft red — errors

  // neutrals
  white: '#FFFFFF',
  background: '#F8F5FF',     // app background — very pale purple
  card: '#FFFFFF',           // card background
  border: '#E2DAF2',         // borders and dividers
  shadow: 'rgba(124, 92, 191, 0.12)', // purple tinted shadow
}

export const typography = {
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  }
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
}

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
}

export const shadows = {
  sm: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  md: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
  }
}
