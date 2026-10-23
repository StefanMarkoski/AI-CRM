import { StyleSheet, View } from 'react-native';

import { colors, elevation, radius, spacing } from '@/theme';

import { Hoverable, T } from './primitives';

/** Square count tile with a two-line caption; `alert` outlines it in red (overdue). */
export function StatTile({ value, label, onPress, alert }: {
  value: number; label: string; onPress?: () => void; alert?: boolean;
}) {
  return (
    <Hoverable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${value} ${label.replace('\n', ' ')}`}
      style={{ alignItems: 'center', gap: spacing.lg, minWidth: 90 }}
    >
      {({ hovered }) => (
        <>
          <View style={[styles.box, hovered && { backgroundColor: colors.surfaceHover }, alert && styles.alert]}>
            <T variant="title" weight="regular" color={alert ? colors.danger : colors.text}>{value}</T>
          </View>
          <T variant="body" style={styles.label}>{label}</T>
        </>
      )}
    </Hoverable>
  );
}

const styles = StyleSheet.create({
  box: {
    ...elevation.raised,
    width: 78,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: colors.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alert: { borderWidth: 1, borderColor: colors.danger },
  label: { textAlign: 'center', fontSize: 16, lineHeight: 19 },
});
