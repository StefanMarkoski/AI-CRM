import { useLocalSearchParams } from 'expo-router';
import { Check, Mail, Pencil, Plus, RotateCcw, X } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { DeleteButton } from '@/components/ConfirmButton';
import { EmptyState, Field, Hoverable, Input, PillButton, T } from '@/components/primitives';
import { ScheduleMailSheet } from '@/components/ScheduleMailSheet';
import { Panel } from '@/components/Panel';
import { Screen, useLayout } from '@/components/Screen';
import { Sheet } from '@/components/Sheet';
import { StatTile } from '@/components/StatTile';
import { TaskColumns, TaskRow } from '@/components/TaskRow';
import type { Task } from '@/data/mock';
import { useOnChange } from '@/hooks/useOnChange';
import { useCrm } from '@/store/crm';
import { useUi } from '@/store/ui';
import { colors, spacing } from '@/theme';
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

  const renderList = (list: Task[], showDate = true) => (
    <>
      <TaskColumns showContact showDate={showDate} />
      <View style={styles.list}>
        {list.map((t) => (
          <TaskRow
            key={t.id}
            task={t}
            showContact
            showDate={showDate}
            selected={t.id === selectedId}
            onPress={() => setSelectedId(t.id)}
          />
        ))}
      </View>
    </>
  );

  return (
    <Screen
      title="Tasks"
      aiContext="Tasks"
      actions={<PillButton icon={Plus} label="New Task" onPress={() => openNewTask()} />}
    >
      <View style={[styles.columns, !split && { flexDirection: 'column' }]}>
        <Panel style={[styles.listCol, split && { maxWidth: 780 }]}>
          <View style={styles.stats}>
            <StatTile value={todays.length} label={'Tasks\nToday'} />
            <StatTile value={completed.length} label={'Tasks\nCompleted'} onPress={() => setShowCompleted((s) => !s)} />
            <StatTile value={overdue.length} label={'Tasks\nOverdue'} alert={overdue.length > 0} />
          </View>

          {overdue.length > 0 && (
            <View style={styles.section}>
              <T variant="body" color={colors.danger} style={styles.group}>Overdue</T>
              {renderList(overdue)}
            </View>
          )}

          <View style={styles.section}>
            <T variant="body" style={styles.group}>Today</T>
            {todays.length === 0 ? <EmptyState title="All done for today" /> : renderList(todays, false)}
          </View>

          <View style={styles.section}>
            <T variant="body" style={styles.group}>Upcoming</T>
            {upcoming.length === 0 ? <EmptyState title="Nothing coming up" /> : renderList(upcoming)}
          </View>

          <Hoverable onPress={() => setShowCompleted((s) => !s)} style={styles.section}>
            <T variant="body" color={colors.textSecondary}>
              Completed ({completed.length}) {showCompleted ? '▾' : '▸'}
            </T>
          </Hoverable>
          {showCompleted && <View style={{ marginTop: spacing.lg }}>{renderList(completed)}</View>}
        </Panel>

        <Panel style={styles.detailCol}>
          {selected ? (
            <TaskDetail task={selected} onEdit={() => setEditing(selected)} onDeleted={() => setSelectedId(todays[0]?.id)} />
          ) : (
            <EmptyState title="Select a task" />
          )}
        </Panel>
      </View>
      <TaskEditSheet task={editing} onClose={() => setEditing(null)} />
    </Screen>
  );
}

function TaskDetail({ task, onEdit, onDeleted }: { task: Task; onEdit: () => void; onDeleted: () => void }) {
  const { clientById, toggleTask, deleteTask } = useCrm();
  const [mailOpen, setMailOpen] = useState(false);
  const client = clientById(task.clientId);

  return (
    <View style={{ paddingTop: spacing.md }}>
      <DetailBlock label="Task Title" value={task.title} />
      <DetailBlock label="Company" value={client?.company ?? '—'} />
      <DetailBlock label="Contact" value={client?.contactName ?? '—'} />
      <DetailBlock label="Due" value={`${formatLongDate(task.due)} · ${formatTime(task.due)}`} />
      <DetailBlock label="Notes" value={task.notes || '—'} />
      <DetailBlock label="Created" value={`${formatLongDate(task.created)} · ${formatTime(task.created)}`} />

      <View style={styles.actions}>
        <PillButton
          icon={task.completed ? RotateCcw : Check}
          label={task.completed ? 'Mark as Open' : 'Mark as Completed'}
          active={task.completed}
          onPress={() => toggleTask(task.id)}
        />
        <PillButton icon={Mail} label="Send Mail" onPress={() => setMailOpen(true)} />
        <View style={styles.actionRow}>
          <DeleteButton
            onConfirm={() => {
              deleteTask(task.id);
              onDeleted();
            }}
          />
          <PillButton icon={Pencil} label="Edit" onPress={onEdit} />
        </View>
      </View>
      <ScheduleMailSheet visible={mailOpen} onClose={() => setMailOpen(false)} preset={{ clientId: task.clientId }} />
    </View>
  );
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ marginBottom: spacing.xl + 4 }}>
      <T variant="title" weight="regular">{label}</T>
      <T variant="body" color={colors.textMuted} style={{ marginTop: spacing.sm, fontSize: 16 }}>{value}</T>
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
          <PillButton icon={Check} label="Save Changes" disabled={!title.trim()} onPress={save} />
          <PillButton icon={X} label="Cancel" onPress={onClose} />
        </>
      }
    >
      <Field label="Task Title:"><Input value={title} onChangeText={setTitle} autoFocus /></Field>
      <Field label="Notes"><Input value={notes} onChangeText={setNotes} multiline style={{ height: 110 }} /></Field>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  columns: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  listCol: { flex: 1.25 },
  detailCol: { flex: 1, minWidth: 300, padding: spacing.xl, alignSelf: 'stretch' },
  stats: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 70, marginBottom: spacing.md },
  section: { marginTop: spacing.xxl },
  group: { fontSize: 16, marginBottom: spacing.lg },
  list: { gap: 16, marginTop: spacing.md },
  actions: { alignItems: 'flex-start', gap: spacing.lg, marginTop: spacing.xxl },
  actionRow: { flexDirection: 'row', gap: spacing.lg },
});
