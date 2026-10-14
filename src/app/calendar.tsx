import { useRouter } from 'expo-router';
import { CalendarDays, ChevronLeft, ChevronRight, Mail, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Hoverable, IconButton, PillButton, T } from '@/components/primitives';
import { ScheduleMailSheet } from '@/components/ScheduleMailSheet';
import { Panel } from '@/components/Panel';
import { Screen } from '@/components/Screen';
import { useCrm } from '@/store/crm';
import { useUi } from '@/store/ui';
import { colors, elevation, radius, spacing } from '@/theme';
import { addDays, at, formatDayName, formatShortDate, formatWeekRange, isSameDay, startOfDay, startOfWeek } from '@/utils/dates';

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

export default function Calendar() {
  const router = useRouter();
  const { tasks, emails } = useCrm();
  const { openNewTask } = useUi();
  const today = startOfDay(new Date());
  const [weekStart, setWeekStart] = useState(startOfWeek(today));
  const [day, setDay] = useState(today);
  const [mailOpen, setMailOpen] = useState(false);

  const week = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const dayTasks = tasks.filter((t) => isSameDay(t.due, day));
  const dayMails = emails.filter((e) => e.scheduled && isSameDay(e.at, day));
  const countFor = (d: Date) =>
    tasks.filter((t) => isSameDay(t.due, d) && !t.completed).length + emails.filter((e) => e.scheduled && isSameDay(e.at, d)).length;

  const shiftWeek = (n: number) => {
    const next = addDays(weekStart, n * 7);
    setWeekStart(next);
    setDay(n === 0 ? today : next);
  };

  return (
    <Screen
      title="Calendar"
      aiContext="Calendar"
      actions={
        <>
          <PillButton icon={CalendarDays} label="Schedule Mail" onPress={() => setMailOpen(true)} />
          <PillButton icon={Plus} label="New Task" onPress={() => openNewTask({ date: at(day, 10) })} />
        </>
      }
    >
      <Panel style={styles.panel}>
      <View style={styles.weekHead}>
        <T variant="title">{formatWeekRange(weekStart)}</T>
        <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
          <IconButton icon={ChevronLeft} label="Previous week" onPress={() => shiftWeek(-1)} />
          <Hoverable onPress={() => { setWeekStart(startOfWeek(today)); setDay(today); }} style={styles.todayBtn}>
            <T variant="small">Today</T>
          </Hoverable>
          <IconButton icon={ChevronRight} label="Next week" onPress={() => shiftWeek(1)} />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.days}>
        {week.map((d) => {
          const active = isSameDay(d, day);
          const count = countFor(d);
          return (
            <Hoverable
              key={d.toISOString()}
              onPress={() => setDay(d)}
              style={({ hovered }) => [
                styles.day,
                { backgroundColor: active ? colors.selected : hovered ? colors.tileHover : colors.tile },
              ]}
            >
              <T variant="body" style={{ fontSize: 16 }}>{formatDayName(d)}</T>
              <T variant="body" style={{ fontSize: 16 }}>{formatShortDate(d)}</T>
              <View style={styles.dots}>
                {isSameDay(d, today) && <View style={[styles.dot, styles.todayDot]} />}
                {Array.from({ length: Math.min(count, 3) }, (_, i) => <View key={i} style={styles.dot} />)}
              </View>
            </Hoverable>
          );
        })}
      </ScrollView>

      <View style={styles.grid}>
        {HOURS.map((h) => {
          const hourTasks = dayTasks.filter((t) => t.due.getHours() === h);
          const hourMails = dayMails.filter((e) => e.at.getHours() === h);
          return (
            <Hoverable
              key={h}
              onPress={() => openNewTask({ date: at(day, h) })}
              style={({ hovered }) => [styles.hourRow, hovered && { backgroundColor: 'rgba(255,255,255,0.35)' }]}
            >
              {({ hovered }) => (
                <>
                  <T variant="body" style={styles.hourLabel}>{`${String(h).padStart(2, '0')}:00`}</T>
                  <View style={styles.events}>
                    {hourTasks.map((t) => (
                      <Hoverable
                        key={t.id}
                        onPress={() => router.navigate({ pathname: '/tasks', params: { id: t.id } })}
                        style={({ hovered: hv }) => [
                          styles.event,
                          hv && { backgroundColor: colors.surfaceHover },
                          t.completed && { opacity: 0.55 },
                        ]}
                      >
                        <T variant="small" style={t.completed && { textDecorationLine: 'line-through' }}>{t.title}</T>
                      </Hoverable>
                    ))}
                    {hourMails.map((e) => (
                      <View key={e.id} style={[styles.event, styles.mailEvent]}>
                        <Mail size={13} color={colors.textSecondary} strokeWidth={1.6} />
                        <T variant="small" color={colors.textSecondary}>{e.subject}</T>
                      </View>
                    ))}
                    {hovered && hourTasks.length + hourMails.length === 0 && (
                      <T variant="small" color={colors.textMuted}>+ Add task</T>
                    )}
                  </View>
                </>
              )}
            </Hoverable>
          );
        })}
      </View>
      </Panel>

      <ScheduleMailSheet visible={mailOpen} onClose={() => setMailOpen(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  panel: { padding: spacing.xxl },
  weekHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    marginBottom: spacing.xl,
  },
  todayBtn: { ...elevation.raised, paddingHorizontal: spacing.md, height: 30, justifyContent: 'center', borderRadius: radius.sm, backgroundColor: colors.surface },
  days: { gap: 32, paddingBottom: spacing.xxl },
  day: {
    width: 90,
    height: 78,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  dots: { flexDirection: 'row', gap: 3, height: 4, position: 'absolute', bottom: 8 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.textSecondary },
  todayDot: { backgroundColor: colors.text, width: 10 },
  grid: { marginLeft: -3 },
  hourRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 83,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  hourLabel: { width: 90, fontSize: 16, paddingLeft: 3 },
  events: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 24, alignItems: 'center' },
  event: {
    ...elevation.raised,
    height: 40,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  mailEvent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.selected,
    borderStyle: 'dashed',
  },
});
