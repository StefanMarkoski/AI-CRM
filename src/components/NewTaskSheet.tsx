import { CalendarDays, Check, Clock, X } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useOnChange } from '@/hooks/useOnChange';
import { useCrm } from '@/store/crm';
import { useUi } from '@/store/ui';
import { spacing } from '@/theme';
import { at, startOfDay } from '@/utils/dates';
import { dayOptions, hourOptions, HOURS, matches } from '@/utils/pickers';

import { ChipGroup, Field, Input, PillButton } from './primitives';
import { SelectField } from './SelectField';
import { Sheet } from './Sheet';

/** Global "New Task" form, opened from Dashboard, Clients, Tasks, Calendar. */
export function NewTaskSheet() {
  const { newTaskFor, closeNewTask } = useUi();
  const { clients, addTask } = useCrm();

  const [title, setTitle] = useState('');
  const [clientQuery, setClientQuery] = useState('');
  const [clientId, setClientId] = useState('');
  const [day, setDay] = useState<number | null>(null);
  const [hour, setHour] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  useOnChange(newTaskFor, (preset) => {
    if (!preset) return;
    setTitle('');
    setNotes('');
    setClientQuery('');
    setClientId(preset.clientId ?? '');
    setDay(startOfDay(preset.date ?? new Date()).getTime());
    setHour(preset.date && HOURS.includes(preset.date.getHours()) ? preset.date.getHours() : 10);
  });

  const options = clients
    .filter((c) => c.id === clientId || matches(clientQuery, c.company, c.contactName))
    .map((c) => ({ key: c.id, label: c.company }));
  const canSave = title.trim().length > 0 && !!clientId && day !== null && hour !== null;

  const save = () => {
    if (!canSave) return;
    addTask({ title: title.trim(), clientId, due: at(new Date(day), hour), notes: notes.trim() });
    closeNewTask();
  };

  return (
    <Sheet
      visible={!!newTaskFor}
      title="New Task"
      onClose={closeNewTask}
      footer={
        <>
          <PillButton icon={Check} label="Create New Task" disabled={!canSave} onPress={save} />
          <PillButton icon={X} label="Cancel" onPress={closeNewTask} />
        </>
      }
    >
      <Field label="Task Title:">
        <Input value={title} onChangeText={setTitle} placeholder="e.g. Follow up about quotation" autoFocus onSubmitEditing={save} />
      </Field>

      <Field label="Client">
        <Input value={clientQuery} onChangeText={setClientQuery} placeholder="Search clients…" />
        <ChipGroup options={options} isActive={(k) => k === clientId} onToggle={setClientId} />
      </Field>

      <Field label="Schedule">
        <View style={styles.row}>
          <SelectField icon={CalendarDays} placeholder="Date" chevron options={dayOptions()} value={day} onChange={setDay} />
          <SelectField icon={Clock} placeholder="Time" options={hourOptions} value={hour} onChange={setHour} />
        </View>
      </Field>

      <Field label="Notes">
        <Input value={notes} onChangeText={setNotes} placeholder="Optional" />
      </Field>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg, alignItems: 'flex-start' },
});
