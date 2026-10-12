import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Bullet, EmptyState, Hoverable, LinkText, PillButton, SectionTitle, T } from '@/components/primitives';
import { Screen, useLayout } from '@/components/Screen';
import { TaskRow } from '@/components/TaskRow';
import { NEW_EMAIL_COUNT } from '@/data/mock';
import { useCrm } from '@/store/crm';
import { useUi } from '@/store/ui';
import { colors, radius, spacing } from '@/theme';
import { isSameDay, timeAgo } from '@/utils/dates';

export default function Dashboard() {
  const router = useRouter();
  const { split } = useLayout();
  const { tasks, emails, activities, clientById } = useCrm();
  const { openNewTask } = useUi();
  const now = new Date();

  const today = tasks.filter((t) => isSameDay(t.due, now)).sort((a, b) => +a.due - +b.due);
  const upcoming = tasks
    .filter((t) => !t.completed && t.due > now && !isSameDay(t.due, now))
    .sort((a, b) => +a.due - +b.due)
    .slice(0, 4);
  const openToday = today.filter((t) => !t.completed).length;
  const scheduled = emails.filter((e) => e.scheduled).length;

  return (
    <Screen title="Dashboard" actions={<PillButton icon={Plus} label="New Task" onPress={() => openNewTask()} />}>
      <View style={styles.stats}>
        <StatPill label={`${openToday} Tasks Today`} onPress={() => router.navigate('/tasks')} />
        <StatPill label={`${scheduled} Scheduled Emails`} onPress={() => router.navigate('/calendar')} />
        <StatPill label={`${NEW_EMAIL_COUNT} New Emails`} onPress={() => router.navigate('/notifications')} />
      </View>

      <View style={[styles.columns, !split && { flexDirection: 'column' }]}>
        <View style={[styles.tasksCol, split && { maxWidth: 590 }]}>
          <SectionTitle right={<LinkText label="View All Tasks" onPress={() => router.navigate('/tasks')} />}>
            Tasks
          </SectionTitle>

          <T variant="subtitle" weight="regular" style={styles.groupLabel}>Today</T>
          <View style={styles.list}>
            {today.length === 0 && <EmptyState title="Nothing due today" />}
            {today.map((t) => (
              <TaskRow key={t.id} task={t} withCheck onPress={() => router.navigate({ pathname: '/tasks', params: { id: t.id } })} />
            ))}
          </View>

          <T variant="subtitle" weight="regular" style={[styles.groupLabel, { marginTop: spacing.xxl + 4 }]}>Upcoming</T>
          <View style={styles.list}>
            {upcoming.map((t) => (
              <TaskRow key={t.id} task={t} showDate onPress={() => router.navigate({ pathname: '/tasks', params: { id: t.id } })} />
            ))}
          </View>
        </View>

        <View style={styles.activityCol}>
          <SectionTitle>Recent Activities</SectionTitle>
          <View style={{ gap: 6 }}>
            {activities.map((a) => (
              <Hoverable
                key={a.id}
                onPress={() => router.navigate({ pathname: '/clients', params: { id: a.clientId } })}
                style={({ hovered }) => [styles.activity, hovered && { backgroundColor: colors.surface }]}
              >
                <Bullet>
                  <View style={styles.activityRow}>
                    <T variant="small" style={{ flex: 1 }} numberOfLines={1}>{clientById(a.clientId)?.company}</T>
                    <T variant="small" style={{ flex: 1 }} color={colors.textSecondary}>{a.kind}</T>
                    <T variant="small" color={colors.textMuted} style={{ width: 64, textAlign: 'right' }}>{timeAgo(a.at, now)}</T>
                  </View>
                </Bullet>
              </Hoverable>
            ))}
          </View>
        </View>
      </View>
    </Screen>
  );
}

function StatPill({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Hoverable
      onPress={onPress}
      style={({ hovered, pressed }) => [
        styles.stat,
        hovered && { backgroundColor: colors.surfaceHover },
        pressed && { transform: [{ scale: 0.98 }] },
      ]}
    >
      <T variant="title" weight="regular" style={{ fontSize: 20 }}>{label}</T>
    </Hoverable>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xl, marginBottom: 64 },
  stat: {
    height: 72,
    paddingHorizontal: spacing.xxl,
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  columns: { flexDirection: 'row', gap: 80 },
  tasksCol: { flex: 1.3, paddingLeft: spacing.xl },
  activityCol: { flex: 1, minWidth: 300 },
  groupLabel: { marginBottom: spacing.xl, marginTop: spacing.lg },
  list: { gap: 10 },
  activity: { paddingVertical: 4, paddingHorizontal: 6, marginHorizontal: -6, borderRadius: radius.sm },
  activityRow: { flexDirection: 'row', gap: spacing.md },
});
