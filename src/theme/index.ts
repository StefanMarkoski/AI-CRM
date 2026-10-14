// Palette sampled from the mockups: AI-CRM-1..5 (structure) and
// CRM-AI-NEW-LOOK (frosted glass panels over a soft gray→mint gradient).
export const colors = {
  background: '#F8F8F6', // fallback canvas
  panel: '#EEF3F1', // opaque glass tone (modals, drawers)
  glass: 'rgba(243, 246, 244, 0.78)', // translucent panels
  glassBorder: 'rgba(255, 255, 255, 0.7)',
  sidebar: 'rgba(242, 246, 245, 0.88)', // navigation rail
  surface: '#F6F6F6', // raised rows, buttons, inputs, chips
  surfaceHover: '#ECEEEC',
  tile: '#E8E8E8', // stat tiles, day buttons
  tileHover: '#DEDEDC',
  selected: '#A4A4A4', // active nav item / selected row
  selectedHover: '#999999',
  outline: '#CBD0CF', // card outlines
  text: '#171717',
  textSecondary: '#4F4F4F',
  textMuted: '#808080',
  divider: '#D6DAD8',
  overlay: 'rgba(23, 35, 33, 0.25)',
  white: '#FFFFFF',
} as const;

// Background gradient: gray top-left → mint bottom-right, with a light glow top-right.
export const gradient = {
  base: ['#DADFDE', '#C6E9E5', '#B4EFE7'] as const,
  glow: ['rgba(246, 249, 247, 0.9)', 'rgba(246, 249, 247, 0)'] as const,
};

export const elevation = {
  raised: { boxShadow: '0px 1px 2px rgba(23, 23, 23, 0.06), 0px 3px 10px rgba(23, 23, 23, 0.04)' },
  panel: { boxShadow: '0px 10px 30px rgba(30, 70, 65, 0.08)' },
  overlay: { boxShadow: '0px 18px 50px rgba(23, 35, 33, 0.18)' },
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
