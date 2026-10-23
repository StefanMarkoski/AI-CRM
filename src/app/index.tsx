import { useRouter } from 'expo-router';
import { Atom } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Panel } from '@/components/Panel';
import { EmptyState, Hoverable, LinkText, Segmented, T } from '@/components/primitives';
import { Screen, useLayout } from '@/components/Screen';
import { StatTile } from '@/components/StatTile';
import { TaskColumns, TaskRow } from '@/components/TaskRow';
import { AI_USAGE, NEW_EMAIL_COUNT } from '@/data/mock';
import { useCrm } from '@/store/crm';
import { useUi } from '@/store/ui';
import { colors, elevation, radius, spacing } from '@/theme';
import { isSameDay, timeAgo } from '@/utils/dates';

const TABS = ['Today', 'Upcoming', 'Completed'] as const;
type Tab = (typeof TABS)[number];

export default function Dashboard() {
  const router = useRouter();
  const { split } = useLayout();
  const { tasks, emails, activities, clients, clientById } = useCrm();
  const { openAI } = useUi();
  const [tab, setTab] = useState<Tab>('Today');
  const now = new Date();

  const today = tasks.filter((t) => isSameDay(t.due, now)).sort((a, b) => +a.due - +b.due);
  const upcoming = tasks
    .filter((t) => !t.completed && t.due > now && !isSameDay(t.due, now))
    .sort((a, b) => +a.due - +b.due);
  const completed = tasks.filter((t) => t.completed).sort((a, b) => +b.due - +a.due);
  const overdue = tasks.filter((t) => !t.completed && t.due < now && !isSameDay(t.due, now));
  const openToday = today.filter((t) => !t.completed).length;
  const scheduled = emails.filter((e) => e.scheduled).length;
  const leads = clients.filter((c) => c.status === 'Lead').length;
  const openTask = (id: string) => router.navigate({ pathname: '/tasks', params: { id } });

  const list = (tab === 'Today' ? today : tab === 'Upcoming' ? upcoming : completed).slice(0, 6);
  const showDate = tab !== 'Today';

  return (
    <Screen title="Dashboard">
      <View style={[styles.columns, !split && { flexDirection: 'column' }]}>
        <View style={styles.main}>
          <Panel style={styles.pills}>
            <StatPill label={`${leads} Open Leads`} onPress={() => router.navigate('/clients')} />
            <StatPill label={`${scheduled} Scheduled Emails`} onPress={() => router.navigate('/calendar')} />
            <StatPill label={`${NEW_EMAIL_COUNT} New Emails`} onPress={() => router.navigate('/notifications')} />
          </Panel>

          <Panel style={styles.tiles}>
            <StatTile value={openToday} label={'Tasks\nToday'} onPress={() => setTab('Today')} />
            <StatTile value={completed.length} label={'Tasks\nCompleted'} onPress={() => setTab('Completed')} />
            <StatTile value={overdue.length} label={'Tasks\nOverdue'} alert={overdue.length > 0} onPress={() => router.navigate('/tasks')} />
          </Panel>

          <Panel>
            <View style={styles.tasksHead}>
              <T variant="title" weight="regular">Tasks</T>
              <LinkText label="View All Tasks" onPress={() => router.navigate('/tasks')} />
              <LinkText label="View Calendar" onPress={() => router.navigate('/calendar')} />
            </View>

            <Segmented tabs options={TABS} value={tab} onChange={setTab} />

            <View style={{ marginTop: spacing.xl }}>
              <TaskColumns showContact showDate={showDate} withCheck />
            </View>
            <View style={styles.list}>
              {list.length === 0 && (
                <EmptyState title={tab === 'Today' ? 'Nothing due today' : tab === 'Upcoming' ? 'Nothing coming up' : 'Nothing completed yet'} />
              )}
              {list.map((t) => (
                <TaskRow key={t.id} task={t} showContact showDate={showDate} withCheck onPress={() => openTask(t.id)} />
              ))}
            </View>
          </Panel>
        </View>

        <View style={[styles.side, split && { width: 280 }]}>
          <Panel style={styles.insight}>
            <Hoverable onPress={() => openAI('Dashboard')} style={{ flex: 1, gap: spacing.sm }}>
              {({ hovered }) => (
                <>
                  <View style={styles.row}>
                    <Atom size={16} color={colors.text} strokeWidth={1.5} />
                    <T variant="caption" color={colors.textSecondary}>AI insight</T>
                  </View>
                  <T variant="label" style={{ lineHeight: 20 }}>
                    {leads} leads haven&apos;t heard from you this week.
                  </T>
                  <T variant="small" color={hovered ? colors.text : colors.textMuted}>Ask AI to draft follow-ups →</T>
                </>
              )}
            </Hoverable>
          </Panel>

          <Panel>
            <T variant="title" weight="regular" style={{ marginBottom: spacing.xl }}>Recent Activities</T>
            <View style={{ gap: spacing.lg }}>
              {activities.slice(0, 3).map((a) => {
                const client = clientById(a.clientId);
                return (
                  <Hoverable
                    key={a.id}
                    onPress={() => router.navigate({ pathname: '/clients', params: { id: a.clientId } })}
                    style={({ hovered }) => [styles.activity, hovered && { backgroundColor: 'rgba(255,255,255,0.45)' }]}
                  >
                    <View style={styles.row}>
                      <T variant="small" numberOfLines={1} style={{ flex: 1 }}>{client?.contactName}</T>
                      <View style={styles.dot} />
                      <T variant="caption" color={colors.textMuted} style={{ fontSize: 10 }}>{timeAgo(a.at, now)}</T>
                    </View>
                    <T variant="caption" color={colors.textMuted} style={{ fontSize: 11 }}>{client?.company}</T>
                    <View style={styles.row}>
                      <View style={styles.dot} />
                      <T variant="caption" color={colors.textMuted} style={{ fontSize: 11 }}>{a.kind}</T>
                    </View>
                  </Hoverable>
                );
              })}
            </View>
          </Panel>

          <Panel style={{ flex: split ? 1 : undefined }}>
            <T variant="title" weight="regular" style={{ marginBottom: spacing.xl }}>AI Usage</T>
            <AiUsage />
          </Panel>
        </View>
      </View>
    </Screen>
  );
}

function AiUsage() {
  const used = AI_USAGE.breakdown.reduce((n, b) => n + b.count, 0);
  const max = Math.max(...AI_USAGE.breakdown.map((b) => b.count));
  return (
    <View style={{ gap: spacing.lg }}>
      <View style={{ gap: spacing.sm }}>
        <View style={[styles.row, { justifyContent: 'space-between' }]}>
          <T variant="display" weight="medium" style={{ fontSize: 26 }}>{used}</T>
          <T variant="small" color={colors.textMuted}>of {AI_USAGE.limit} this month</T>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${(used / AI_USAGE.limit) * 100}%` }]} />
        </View>
      </View>
      {AI_USAGE.breakdown.map((b) => (
        <View key={b.label} style={{ gap: 6 }}>
          <View style={[styles.row, { justifyContent: 'space-between' }]}>
            <T variant="small" color={colors.textSecondary}>{b.label}</T>
            <T variant="small">{b.count}</T>
          </View>
          <View style={[styles.track, { height: 4 }]}>
            <View style={[styles.fill, { width: `${(b.count / max) * 100}%`, backgroundColor: colors.selected }]} />
          </View>
        </View>
      ))}
    </View>
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
  columns: { flexDirection: 'row', gap: 16, alignItems: 'stretch' },
  main: { flex: 1, gap: 16 },
  side: { gap: 16 },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.xl,
    minHeight: 120,
    alignItems: 'center',
  },
  stat: {
    ...elevation.raised,
    height: 72,
    minWidth: 190,
    paddingHorizontal: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.tile,
  },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 70 },
  insight: { minHeight: 120 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tasksHead: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 60, rowGap: spacing.sm, marginBottom: spacing.xxl },
  list: { gap: 16, marginTop: spacing.md },
  activity: {
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: radius.md - 2,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    gap: 4,
  },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.textMuted },
  track: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.7)', overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4, backgroundColor: colors.accent },
});
