import { Check } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import type { Task } from '@/data/mock';
import { useCrm } from '@/store/crm';
import { colors, elevation, radius, spacing } from '@/theme';
import { formatShortDate, formatTime } from '@/utils/dates';

import { Hoverable, T } from './primitives';

interface TaskRowProps {
  task: Task;
  showDate?: boolean;
  /** Show the client's contact person column. */
  showContact?: boolean;
  selected?: boolean;
  onPress?: () => void;
  /** Square completion toggle to the right of the row (dashboard style). */
  withCheck?: boolean;
}

export function TaskRow({ task, showDate, showContact, selected, onPress, withCheck }: TaskRowProps) {
  const { clientById, toggleTask } = useCrm();
  const client = clientById(task.clientId);
  const done = task.completed;
  const tone = done ? colors.textMuted : colors.text;

  return (
    <View style={styles.wrap}>
      <Hoverable
        onPress={onPress}
        style={({ hovered }) => [
          styles.row,
          {
            backgroundColor: selected
              ? colors.selected
              : hovered
                ? colors.surfaceHover
                : colors.surface,
          },
        ]}
      >
        <T variant="label" numberOfLines={1} style={[styles.col, done && styles.done]} color={tone}>
          {task.title}
        </T>
        <T variant="label" numberOfLines={1} style={styles.col} color={tone}>
          {client?.company ?? '—'}
        </T>
        {showContact && (
          <T variant="label" numberOfLines={1} style={styles.col} color={tone}>
            {client?.contactName ?? '—'}
          </T>
        )}
        <View style={styles.when}>
          {showDate && <T variant="label" color={tone}>{formatShortDate(task.due)}</T>}
          <T variant="label" color={tone}>{formatTime(task.due)}</T>
        </View>
      </Hoverable>
      {withCheck && (
        <Hoverable
          onPress={() => toggleTask(task.id)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: done }}
          accessibilityLabel={`Mark "${task.title}" ${done ? 'not done' : 'done'}`}
          style={({ hovered }) => [
            styles.check,
            { backgroundColor: done ? colors.selected : hovered ? colors.surfaceHover : colors.surface },
          ]}
        >
          {({ hovered }) =>
            (done || hovered) && <Check size={18} color={done ? colors.text : colors.textMuted} strokeWidth={2} />
          }
        </Hoverable>
      )}
    </View>
  );
}

/** Small bulleted column labels shown above a list of TaskRows. */
export function TaskColumns({ showContact, showDate, withCheck }: {
  showContact?: boolean; showDate?: boolean; withCheck?: boolean;
}) {
  const label = (text: string, style?: object) => (
    <View style={[styles.headCell, style]}>
      <View style={styles.dot} />
      <T variant="caption" color={colors.textSecondary} style={{ fontSize: 11 }}>{text}</T>
    </View>
  );
  return (
    <View style={styles.wrap}>
      <View style={[styles.head, { flex: 1 }]}>
        {label('Task Title', styles.col)}
        {label('Company', styles.col)}
        {showContact && label('Contact', styles.col)}
        {label(showDate ? 'Date · Time' : 'Time', styles.whenHead)}
      </View>
      {withCheck && <View style={{ width: CHECK }} />}
    </View>
  );
}

const CHECK = 44;

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', gap: spacing.md + 2 },
  row: {
    ...elevation.raised,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 49,
    paddingHorizontal: spacing.lg - 2,
    borderRadius: radius.md - 2,
    gap: spacing.md,
  },
  col: { flex: 1 },
  when: { flexDirection: 'row', gap: spacing.lg, justifyContent: 'flex-end', minWidth: 44 },
  done: { textDecorationLine: 'line-through' },
  check: {
    ...elevation.raised,
    width: CHECK,
    height: 49,
    borderRadius: radius.md - 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  head: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg - 2, gap: spacing.md },
  headCell: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  whenHead: { minWidth: 44, justifyContent: 'flex-end' },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.textSecondary },
});
