import { CheckCheck } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Hoverable, PillButton, T } from '@/components/primitives';
import { Screen } from '@/components/Screen';
import { useCrm } from '@/store/crm';
import { colors, radius, spacing } from '@/theme';
import { timeAgo } from '@/utils/dates';

export default function Notifications() {
  const { notifications, markAllNotificationsRead, toggleNotificationRead } = useCrm();

  return (
    <Screen
      title="Notifications"
      actions={<PillButton icon={CheckCheck} label="Mark all read" onPress={markAllNotificationsRead} />}
    >
      <View style={styles.list}>
        {notifications.map((n) => (
          <Hoverable
            key={n.id}
            onPress={() => toggleNotificationRead(n.id)}
            style={({ hovered }) => [styles.row, hovered && { backgroundColor: colors.surfaceHover }]}
          >
            <View style={[styles.dot, n.read && { backgroundColor: 'transparent' }]} />
            <View style={{ flex: 1, gap: 2 }}>
              <T variant="label" weight={n.read ? 'regular' : 'medium'}>{n.title}</T>
              <T variant="small" color={colors.textSecondary}>{n.body}</T>
            </View>
            <T variant="small" color={colors.textMuted}>{timeAgo(n.at)}</T>
          </Hoverable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm, maxWidth: 720, marginTop: -spacing.xl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.text },
});
