import { Check } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import type { Task } from '@/data/mock';
import { useCrm } from '@/store/crm';
import { colors, radius, spacing } from '@/theme';
import { formatShortDate, formatTime } from '@/utils/dates';

import { Hoverable, T } from './primitives';

interface TaskRowProps {
  task: Task;
  showDate?: boolean;
  selected?: boolean;
  onPress?: () => void;
  /** Square completion toggle to the right of the row (dashboard style). */
  withCheck?: boolean;
}

export function TaskRow({ task, showDate, selected, onPress, withCheck }: TaskRowProps) {
  const { clientById, toggleTask } = useCrm();
  const client = clientById(task.clientId);
  const done = task.completed;

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
        <T
          variant="small"
          numberOfLines={1}
          style={[styles.title, done && styles.done]}
          color={done ? colors.textMuted : colors.text}
        >
          {task.title}
        </T>
        <T variant="label" numberOfLines={1} style={styles.company} color={done ? colors.textMuted : colors.text}>
          {client?.company ?? '—'}
        </T>
        <View style={styles.when}>
          {showDate && <T variant="small">{formatShortDate(task.due)}</T>}
          <T variant="small">{formatTime(task.due)}</T>
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

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', gap: spacing.lg },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    gap: spacing.md,
  },
  title: { flex: 1.1 },
  company: { flex: 1 },
  when: { flexDirection: 'row', gap: spacing.lg, justifyContent: 'flex-end' },
  done: { textDecorationLine: 'line-through' },
  check: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
