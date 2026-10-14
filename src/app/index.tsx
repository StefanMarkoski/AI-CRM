import { useRouter } from 'expo-router';
import { Atom, Plus } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Panel } from '@/components/Panel';
import { EmptyState, Hoverable, LinkText, PillButton, T } from '@/components/primitives';
import { Screen, useLayout } from '@/components/Screen';
import { TaskColumns, TaskRow } from '@/components/TaskRow';
import { NEW_EMAIL_COUNT } from '@/data/mock';
import { useCrm } from '@/store/crm';
import { useUi } from '@/store/ui';
import { colors, radius, spacing } from '@/theme';
import { isSameDay, timeAgo } from '@/utils/dates';

export default function Dashboard() {
  const router = useRouter();
  const { split } = useLayout();
  const { tasks, emails, activities, clients, clientById } = useCrm();
  const { openNewTask, openAI } = useUi();
  const now = new Date();

  const today = tasks.filter((t) => isSameDay(t.due, now)).sort((a, b) => +a.due - +b.due);
  const upcoming = tasks
    .filter((t) => !t.completed && t.due > now && !isSameDay(t.due, now))
    .sort((a, b) => +a.due - +b.due)
    .slice(0, 4);
  const openToday = today.filter((t) => !t.completed).length;
  const scheduled = emails.filter((e) => e.scheduled).length;
  const leads = clients.filter((c) => c.status === 'Lead').length;
  const openTask = (id: string) => router.navigate({ pathname: '/tasks', params: { id } });

  return (
    <Screen title="Dashboard" actions={<PillButton icon={Plus} label="New Task" onPress={() => openNewTask()} />}>
      <View style={[styles.columns, !split && { flexDirection: 'column' }]}>
        <View style={styles.main}>
          <Panel style={styles.statsPanel}>
            <StatPill label={`${openToday} Tasks Today`} onPress={() => router.navigate('/tasks')} />
            <StatPill label={`${scheduled} Scheduled Emails`} onPress={() => router.navigate('/calendar')} />
            <StatPill label={`${NEW_EMAIL_COUNT} New Emails`} onPress={() => router.navigate('/notifications')} />
          </Panel>

          <Panel>
            <View style={styles.tasksHead}>
              <T variant="title">Tasks</T>
              <LinkText label="View All Tasks" onPress={() => router.navigate('/tasks')} />
              <LinkText label="View Calendar" onPress={() => router.navigate('/calendar')} />
            </View>

            <T variant="subtitle" weight="regular" style={styles.groupLabel}>Today</T>
            <TaskColumns showContact withCheck />
            <View style={styles.list}>
              {today.length === 0 && <EmptyState title="Nothing due today" />}
              {today.map((t) => (
                <TaskRow key={t.id} task={t} showContact withCheck onPress={() => openTask(t.id)} />
              ))}
            </View>

            <T variant="subtitle" weight="regular" style={[styles.groupLabel, { marginTop: spacing.xxl }]}>Upcoming</T>
            <TaskColumns showContact showDate withCheck />
            <View style={styles.list}>
              {upcoming.map((t) => (
                <TaskRow key={t.id} task={t} showContact showDate withCheck onPress={() => openTask(t.id)} />
              ))}
            </View>
          </Panel>
        </View>

        <View style={[styles.side, split && { width: 254 }]}>
          <Panel style={styles.insight}>
            <Hoverable onPress={() => openAI('Dashboard')} style={{ flex: 1, gap: spacing.sm }}>
              {({ hovered }) => (
                <>
                  <View style={styles.insightHead}>
                    <Atom size={16} color={colors.text} strokeWidth={1.6} />
                    <T variant="caption" color={colors.textSecondary}>AI insight</T>
                  </View>
                  <T variant="label" style={{ lineHeight: 20 }}>
                    {leads} leads haven&apos;t heard from you this week.
                  </T>
                  <T variant="small" color={hovered ? colors.text : colors.textSecondary}>Ask AI to draft follow-ups →</T>
                </>
              )}
            </Hoverable>
          </Panel>

          <Panel style={{ flex: split ? 1 : undefined }}>
            <T variant="title" style={{ marginBottom: spacing.xl }}>Recent Activities</T>
            <View style={{ gap: spacing.md + 2 }}>
              {activities.map((a) => {
                const client = clientById(a.clientId);
                return (
                  <Hoverable
                    key={a.id}
                    onPress={() => router.navigate({ pathname: '/clients', params: { id: a.clientId } })}
                    style={({ hovered }) => [styles.activity, hovered && { backgroundColor: 'rgba(255,255,255,0.45)' }]}
                  >
                    <View style={styles.activityTop}>
                      <T variant="small" numberOfLines={1} style={{ flex: 1 }}>{client?.contactName}</T>
                      <View style={styles.dot} />
                      <T variant="caption" color={colors.textSecondary} style={{ fontSize: 11 }}>{timeAgo(a.at, now)}</T>
                    </View>
                    <T variant="caption" color={colors.textSecondary} style={{ fontSize: 11 }}>{client?.company}</T>
                    <View style={styles.kind}>
                      <View style={styles.dot} />
                      <T variant="caption" color={colors.textSecondary} style={{ fontSize: 11 }}>{a.kind}</T>
                    </View>
                  </Hoverable>
                );
              })}
            </View>
          </Panel>
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
        hovered && { backgroundColor: colors.tileHover },
        pressed && { transform: [{ scale: 0.98 }] },
      ]}
    >
      <T variant="title" weight="regular" style={{ fontSize: 19 }}>{label}</T>
    </Hoverable>
  );
}

const styles = StyleSheet.create({
  columns: { flexDirection: 'row', gap: 14, alignItems: 'stretch' },
  main: { flex: 1, gap: 14 },
  side: { gap: 14 },
  statsPanel: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xl + 4,
    paddingVertical: spacing.xl - 2,
    paddingHorizontal: 60,
    minHeight: 110,
    alignItems: 'center',
  },
  stat: {
    height: 64,
    paddingHorizontal: spacing.xxl - 4,
    justifyContent: 'center',
    borderRadius: radius.md + 2,
    backgroundColor: colors.tile,
  },
  insight: { minHeight: 110 },
  insightHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  tasksHead: { flexDirection: 'row', alignItems: 'center', gap: 58, marginBottom: spacing.xl },
  groupLabel: { marginBottom: spacing.lg },
  list: { gap: 13, marginTop: spacing.md },
  activity: {
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: radius.md - 2,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.md,
    gap: 3,
  },
  activityTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  kind: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.textSecondary },
});
