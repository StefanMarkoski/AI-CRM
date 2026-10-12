import { useLocalSearchParams } from 'expo-router';
import { Check, Pencil, Plus, RotateCcw } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { DeleteButton } from '@/components/ConfirmButton';
import { EmptyState, Field, Hoverable, Input, PillButton, T } from '@/components/primitives';
import { Screen, useLayout } from '@/components/Screen';
import { Sheet } from '@/components/Sheet';
import { TaskRow } from '@/components/TaskRow';
import type { Task } from '@/data/mock';
import { useOnChange } from '@/hooks/useOnChange';
import { useCrm } from '@/store/crm';
import { useUi } from '@/store/ui';
import { colors, radius, spacing } from '@/theme';
import { formatLongDate, formatTime, isSameDay } from '@/utils/dates';

export default function Tasks() {
  const params = useLocalSearchParams<{ id?: string }>();
  const { split } = useLayout();
  const { tasks } = useCrm();
  const { openNewTask } = useUi();
  const now = new Date();

  const byDue = (a: Task, b: Task) => +a.due - +b.due;
  const todays = tasks.filter((t) => isSameDay(t.due, now) && !t.completed).sort(byDue);
  const upcoming = tasks.filter((t) => !t.completed && t.due > now && !isSameDay(t.due, now)).sort(byDue);
  const overdue = tasks.filter((t) => !t.completed && t.due < now && !isSameDay(t.due, now));
  const completed = tasks.filter((t) => t.completed).sort((a, b) => +b.due - +a.due);

  const [selectedId, setSelectedId] = useState<string | undefined>(params.id ?? todays[0]?.id);
  const [showCompleted, setShowCompleted] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  useOnChange(params.id, (id) => {
    if (id) setSelectedId(id);
  });

  const selected = tasks.find((t) => t.id === selectedId);

  const renderList = (list: Task[]) =>
    list.map((t) => (
      <TaskRow key={t.id} task={t} showDate selected={t.id === selectedId} onPress={() => setSelectedId(t.id)} />
    ));

  return (
    <Screen
      title="Tasks"
      aiContext="Tasks"
      actions={<PillButton icon={Plus} label="New Task" onPress={() => openNewTask()} />}
    >
      <View style={[styles.columns, !split && { flexDirection: 'column' }]}>
        <View style={[styles.listCol, split && { maxWidth: 566 }]}>
          <View style={styles.stats}>
            <Stat value={todays.length} label={'Tasks\nToday'} />
            <Stat value={completed.length} label={'Tasks\nCompleted'} onPress={() => setShowCompleted((s) => !s)} />
            <Stat value={overdue.length} label={'Tasks\nOverdue'} />
          </View>

          {overdue.length > 0 && (
            <>
              <T variant="subtitle" weight="regular" style={styles.group}>Overdue</T>
              <View style={styles.list}>{renderList(overdue)}</View>
            </>
          )}

          <T variant="subtitle" weight="regular" style={styles.group}>Tasks Today</T>
          <View style={styles.list}>
            {todays.length === 0 && <EmptyState title="All done for today" />}
            {renderList(todays)}
          </View>

          <T variant="subtitle" weight="regular" style={[styles.group, { marginTop: spacing.xxxl - 8 }]}>Upcoming Tasks</T>
          <View style={styles.list}>{renderList(upcoming)}</View>

          <Hoverable onPress={() => setShowCompleted((s) => !s)} style={{ marginTop: spacing.xxxl - 8 }}>
            <T variant="subtitle" weight="regular" color={colors.textSecondary}>
              Completed ({completed.length}) {showCompleted ? '▾' : '▸'}
            </T>
          </Hoverable>
          {showCompleted && <View style={[styles.list, { marginTop: spacing.lg }]}>{renderList(completed)}</View>}
        </View>

        <View style={styles.detailCol}>
          {selected ? (
            <TaskDetail task={selected} onEdit={() => setEditing(selected)} onDeleted={() => setSelectedId(todays[0]?.id)} />
          ) : (
            <EmptyState title="Select a task" />
          )}
        </View>
      </View>
      <TaskEditSheet task={editing} onClose={() => setEditing(null)} />
    </Screen>
  );
}

function Stat({ value, label, onPress }: { value: number; label: string; onPress?: () => void }) {
  return (
    <Hoverable onPress={onPress} disabled={!onPress} style={{ alignItems: 'center', gap: spacing.lg }}>
      {({ hovered }) => (
        <>
          <View style={[styles.statBox, hovered && { backgroundColor: colors.surfaceHover }]}>
            <T variant="title" weight="regular">{value}</T>
          </View>
          <T variant="body" style={{ textAlign: 'center', fontSize: 16, lineHeight: 19 }}>{label}</T>
        </>
      )}
    </Hoverable>
  );
}

function TaskDetail({ task, onEdit, onDeleted }: { task: Task; onEdit: () => void; onDeleted: () => void }) {
  const { clientById, toggleTask, deleteTask } = useCrm();
  const client = clientById(task.clientId);

  return (
    <View style={{ paddingTop: spacing.xxxl - 8 }}>
      <View style={styles.detailHead}>
        <View style={{ flex: 1 }}>
          <DetailBlock label="Task Title" value={task.title} />
          <DetailBlock label="Company" value={client?.company ?? '—'} />
        </View>
        <View style={{ gap: spacing.lg, alignItems: 'flex-end' }}>
          <PillButton icon={Pencil} label="Edit" onPress={onEdit} />
          <DeleteButton
            onConfirm={() => {
              deleteTask(task.id);
              onDeleted();
            }}
          />
        </View>
      </View>
      <DetailBlock label="Due" value={`${formatLongDate(task.due)} · ${formatTime(task.due)}`} />
      <DetailBlock label="Notes" value={task.notes || '—'} />
      <DetailBlock label="Created" value={`${formatLongDate(task.created)} · ${formatTime(task.created)}`} />
      <View style={{ alignItems: 'flex-start', marginTop: spacing.sm }}>
        <PillButton
          icon={task.completed ? RotateCcw : Check}
          label={task.completed ? 'Mark as Open' : 'Mark as Completed'}
          active={task.completed}
          onPress={() => toggleTask(task.id)}
        />
      </View>
    </View>
  );
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ marginBottom: spacing.xxl - 2 }}>
      <T variant="title">{label}</T>
      <T variant="body" color={colors.textSecondary} style={{ marginTop: spacing.md, fontSize: 16 }}>{value}</T>
    </View>
  );
}

function TaskEditSheet({ task, onClose }: { task: Task | null; onClose: () => void }) {
  const { updateTask } = useCrm();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');

  useOnChange(task, (next) => {
    if (next) {
      setTitle(next.title);
      setNotes(next.notes);
    }
  });

  const save = () => {
    if (task && title.trim()) updateTask(task.id, { title: title.trim(), notes: notes.trim() });
    onClose();
  };

  return (
    <Sheet
      visible={!!task}
      title="Edit Task"
      onClose={onClose}
      footer={
        <>
          <PillButton label="Cancel" onPress={onClose} />
          <PillButton label="Save" active onPress={save} />
        </>
      }
    >
      <Field label="Title"><Input value={title} onChangeText={setTitle} autoFocus /></Field>
      <Field label="Notes"><Input value={notes} onChangeText={setNotes} multiline style={{ height: 100 }} /></Field>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  columns: { flexDirection: 'row', gap: 150, marginTop: -spacing.sm },
  listCol: { flex: 1.1 },
  detailCol: { flex: 1, minWidth: 300 },
  stats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xxxl - 8 },
  statBox: {
    width: 78,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  group: { marginBottom: spacing.lg },
  list: { gap: 8 },
  detailHead: { flexDirection: 'row', gap: spacing.lg },
});
