import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useOnChange } from '@/hooks/useOnChange';
import { useCrm } from '@/store/crm';
import { colors, radius, spacing } from '@/theme';
import { addDays, at, formatTime, relativeDay, startOfDay } from '@/utils/dates';

import { Chip } from './NewTaskSheet';
import { Field, PillButton, T } from './primitives';
import { Sheet } from './Sheet';

const HOURS = [8, 9, 10, 11, 13, 15, 17];

export function ScheduleMailSheet({ visible, onClose, preset }: {
  visible: boolean;
  onClose: () => void;
  preset?: { templateId?: string; clientId?: string };
}) {
  const { clients, templates, scheduleEmail } = useCrm();
  const [clientId, setClientId] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [day, setDay] = useState(addDays(startOfDay(new Date()), 1));
  const [hour, setHour] = useState(9);

  useOnChange(visible, (open) => {
    if (!open) return;
    setClientId(preset?.clientId ?? clients[0]?.id ?? '');
    setTemplateId(preset?.templateId ?? templates[0]?.id ?? '');
    setDay(addDays(startOfDay(new Date()), 1));
    setHour(9);
  });

  const client = clients.find((c) => c.id === clientId);
  const template = templates.find((t) => t.id === templateId);
  const days = Array.from({ length: 7 }, (_, i) => addDays(startOfDay(new Date()), i));

  const preview = template && client
    ? template.body.replace(/{{firstName}}/g, client.contactName.split(' ')[0]).replace(/{{company}}/g, client.company)
    : '';

  const save = () => {
    if (!client || !template) return;
    scheduleEmail({ clientId, subject: template.subject.replace(/{{company}}/g, client.company), at: at(day, hour) });
    onClose();
  };

  return (
    <Sheet
      visible={visible}
      title="Schedule Mail"
      onClose={onClose}
      width={600}
      footer={
        <>
          <PillButton label="Cancel" onPress={onClose} />
          <PillButton label={`Schedule · ${relativeDay(day)} ${formatTime(at(day, hour))}`} active onPress={save} />
        </>
      }
    >
      <Field label="To">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {clients.map((c) => (
            <Chip key={c.id} label={c.company} active={c.id === clientId} onPress={() => setClientId(c.id)} />
          ))}
        </ScrollView>
      </Field>
      <Field label="Template">
        <View style={styles.wrap}>
          {templates.map((t) => (
            <Chip key={t.id} label={t.name} active={t.id === templateId} onPress={() => setTemplateId(t.id)} />
          ))}
        </View>
      </Field>
      <Field label="Send on">
        <View style={styles.wrap}>
          {days.map((d) => (
            <Chip key={d.toISOString()} label={relativeDay(d)} active={+d === +day} onPress={() => setDay(d)} />
          ))}
        </View>
        <View style={[styles.wrap, { marginTop: spacing.sm }]}>
          {HOURS.map((h) => (
            <Chip key={h} label={formatTime(at(day, h))} active={h === hour} onPress={() => setHour(h)} />
          ))}
        </View>
      </Field>
      {template && client && (
        <View style={styles.preview}>
          <T variant="small" color={colors.textSecondary}>To: {client.email}</T>
          <T variant="label" weight="medium">Subject: {template.subject.replace(/{{company}}/g, client.company)}</T>
          <T variant="small" style={{ lineHeight: 20 }}>{preview}</T>
        </View>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  preview: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm },
});
