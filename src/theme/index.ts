// Palette sampled directly from the approved mockups (AI-CRM-1..5).
// Keep everything grayscale until the palette is revisited.
export const colors = {
  background: '#F8F8F6', // main canvas
  sidebar: '#D9D9D6', // navigation rail
  surface: '#E8E8E8', // pills, rows, cards
  surfaceHover: '#DEDEDC',
  selected: '#A4A4A4', // active nav item / selected row
  selectedHover: '#999999',
  text: '#171717',
  textSecondary: '#4F4F4F',
  textMuted: '#808080',
  divider: '#D6D6D3',
  overlay: 'rgba(23, 23, 23, 0.28)',
  white: '#FFFFFF',
} as const;

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const type = {
  display: { fontFamily: fonts.semibold, fontSize: 28, letterSpacing: -0.4 },
  title: { fontFamily: fonts.medium, fontSize: 20, letterSpacing: -0.2 },
  subtitle: { fontFamily: fonts.medium, fontSize: 16 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  label: { fontFamily: fonts.regular, fontSize: 14 },
  small: { fontFamily: fonts.regular, fontSize: 13 },
  caption: { fontFamily: fonts.regular, fontSize: 12 },
} as const;

export type TypeVariant = keyof typeof type;

// Responsive breakpoints. The mockups are desktop-first.
export const breakpoints = {
  railCollapsed: 900, // below: icon-only sidebar
  splitPane: 1100, // below: detail panels stack under lists
} as const;
