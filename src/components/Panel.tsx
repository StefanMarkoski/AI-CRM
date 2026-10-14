import { ReactNode } from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { colors, elevation, radius, spacing } from '@/theme';

// Frosted glass: real backdrop blur on web, translucent fill everywhere.
export const glassBlur = Platform.OS === 'web' ? ({ backdropFilter: 'blur(24px)' } as ViewStyle) : null;

/** Frosted glass container used for every content block. */
export function Panel({ children, style, padded = true }: {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
}) {
  return <View style={[styles.panel, glassBlur, padded && styles.padded, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.glass,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...elevation.panel,
  },
  padded: { padding: spacing.xl - 2 },
});
