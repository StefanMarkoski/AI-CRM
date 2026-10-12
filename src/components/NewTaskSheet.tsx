import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useOnChange } from '@/hooks/useOnChange';
import { useCrm } from '@/store/crm';
import { useUi } from '@/store/ui';
import { colors, radius, spacing } from '@/theme';
import { addDays, at, formatTime, relativeDay, startOfDay } from '@/utils/dates';

import { Field, Hoverable, Input, PillButton, T } from './primitives';
import { Sheet } from './Sheet';

const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17];

/** Global "New Task" form, opened from Dashboard, Clients, Tasks, Calendar. */
export function NewTaskSheet() {
  const { newTaskFor, closeNewTask } = useUi();
  const { clients, addTask } = useCrm();

  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState('');
  const [day, setDay] = useState(startOfDay(new Date()));
  const [hour, setHour] = useState(10);
  const [notes, setNotes] = useState('');

  useOnChange(newTaskFor, (preset) => {
    if (!preset) return;
    setTitle('');
    setNotes('');
    setClientId(preset.clientId ?? clients[0]?.id ?? '');
    setDay(startOfDay(preset.date ?? new Date()));
    setHour(preset.date && preset.date.getHours() >= 9 ? preset.date.getHours() : 10);
  });

  const days = Array.from({ length: 7 }, (_, i) => addDays(startOfDay(new Date()), i));
  const canSave = title.trim().length > 0 && clientId;

  const save = () => {
    if (!canSave) return;
    addTask({ title: title.trim(), clientId, due: at(day, hour), notes: notes.trim() });
    closeNewTask();
  };

  return (
    <Sheet
      visible={!!newTaskFor}
      title="New Task"
      onClose={closeNewTask}
      footer={
        <>
          <PillButton label="Cancel" onPress={closeNewTask} />
          <PillButton label="Create Task" active={!!canSave} onPress={save} />
        </>
      }
    >
      <Field label="Title">
        <Input value={title} onChangeText={setTitle} placeholder="e.g. Follow up about quotation" autoFocus onSubmitEditing={save} />
      </Field>

      <Field label="Client">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {clients.map((c) => (
            <Chip key={c.id} label={c.company} active={c.id === clientId} onPress={() => setClientId(c.id)} />
          ))}
        </ScrollView>
      </Field>

      <Field label="Day">
        <View style={styles.wrap}>
          {days.map((d) => (
            <Chip
              key={d.toISOString()}
              label={relativeDay(d)}
              active={d.getTime() === day.getTime()}
              onPress={() => setDay(d)}
            />
          ))}
        </View>
      </Field>

      <Field label="Time">
        <View style={styles.wrap}>
          {HOURS.map((h) => (
            <Chip key={h} label={formatTime(at(day, h))} active={h === hour} onPress={() => setHour(h)} />
          ))}
        </View>
      </Field>

      <Field label="Notes">
        <Input value={notes} onChangeText={setNotes} placeholder="Optional" multiline style={{ height: 90 }} />
      </Field>
    </Sheet>
  );
}

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <Hoverable
      onPress={onPress}
      style={({ hovered }) => [
        styles.chip,
        { backgroundColor: active ? colors.selected : hovered ? colors.surfaceHover : colors.surface },
      ]}
    >
      <T variant="small">{label}</T>
    </Hoverable>
  );
}

const styles = StyleSheet.create({
  chips: { gap: spacing.sm },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { height: 32, paddingHorizontal: spacing.md, borderRadius: radius.sm + 2, justifyContent: 'center' },
});
