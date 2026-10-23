// Palette sampled from the "CRM AI" lavender mockups (Desktop 1–13):
// frosted panels over a soft gray→lavender gradient, lavender for selection.
export const colors = {
  background: '#E6E4EA', // fallback canvas
  panel: '#E9E6F0', // opaque glass tone (modals, drawers)
  glass: 'rgba(238, 236, 243, 0.72)', // translucent panels
  glassBorder: 'rgba(255, 255, 255, 0.55)',
  sidebar: 'rgba(236, 233, 241, 0.92)', // navigation rail
  surface: '#F6F6F6', // raised rows, buttons, inputs, tiles
  surfaceHover: '#EEECF2',
  tile: '#F6F6F6', // stat tiles, day buttons
  tileHover: '#EEECF2',
  track: '#D9D9D9', // chip / segmented track inside forms
  accent: '#BFA4F4', // active nav item, chosen chips
  accentHover: '#B396F0',
  selected: '#D9CBFB', // selected row / card / tab
  selectedHover: '#CFBDF8',
  outline: 'rgba(150, 128, 205, 0.35)', // card outlines
  danger: '#E5383B',
  dangerSoft: '#FCE4E4',
  avatar: '#6B6B6B',
  text: '#1A1A1A',
  textSecondary: '#4F4F4F',
  textMuted: '#7E7C84',
  divider: 'rgba(80, 70, 100, 0.28)',
  overlay: 'rgba(40, 30, 70, 0.22)',
  white: '#FFFFFF',
} as const;

// Background gradient: light gray top-left → lavender, with a pale glow top-right.
export const gradient = {
  base: ['#E3E2E6', '#D9CAF8', '#CDB8F3'] as const,
  glow: ['rgba(246, 245, 248, 0.75)', 'rgba(246, 245, 248, 0)'] as const,
};

export const elevation = {
  raised: { boxShadow: '0px 2px 4px rgba(40, 30, 70, 0.10), 0px 4px 12px rgba(40, 30, 70, 0.06)' },
  panel: { boxShadow: '0px 10px 30px rgba(70, 50, 130, 0.08)' },
  overlay: { boxShadow: '0px 18px 50px rgba(40, 30, 70, 0.20)' },
} as const;

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 14,
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
