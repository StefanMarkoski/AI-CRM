import { Atom, CalendarDays, Clock, Mail, X } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useOnChange } from '@/hooks/useOnChange';
import { useCrm } from '@/store/crm';
import { colors, elevation, radius, spacing } from '@/theme';
import { addDays, at, startOfDay } from '@/utils/dates';
import { personalize, thinkingDelay } from '@/utils/mockAI';
import { dayOptions, hourOptions, matches } from '@/utils/pickers';

import { ChipGroup, Field, Input, PillButton, T } from './primitives';
import { SelectField } from './SelectField';
import { Sheet } from './Sheet';

const fill = (s: string, firstName: string, company: string) =>
  s.replace(/{{firstName}}/g, firstName).replace(/{{company}}/g, company);

/**
 * "Send Email" form: one template to one or more clients, now or scheduled.
 * Leaving Date empty sends immediately.
 */
export function ScheduleMailSheet({ visible, onClose, preset }: {
  visible: boolean;
  onClose: () => void;
  preset?: { templateId?: string; clientId?: string; schedule?: boolean };
}) {
  const { clients, templates, scheduleEmail, sendEmail } = useCrm();
  const [toQuery, setToQuery] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [templateQuery, setTemplateQuery] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [day, setDay] = useState<number | null>(null);
  const [hour, setHour] = useState<number | null>(null);
  const [personalized, setPersonalized] = useState(false);
  const [thinking, setThinking] = useState(false);

  useOnChange(visible, (open) => {
    if (!open) return;
    setToQuery('');
    setTemplateQuery('');
    setRecipients(preset?.clientId ? [preset.clientId] : []);
    setTemplateId(preset?.templateId ?? templates[0]?.id ?? '');
    setDay(preset?.schedule ? addDays(startOfDay(new Date()), 1).getTime() : null);
    setHour(preset?.schedule ? 9 : null);
    setPersonalized(false);
  });

  const chosen = clients.filter((c) => recipients.includes(c.id));
  const first = chosen[0];
  const template = templates.find((t) => t.id === templateId);

  const clientOptions = clients
    .filter((c) => recipients.includes(c.id) || matches(toQuery, c.company, c.contactName, c.email))
    .map((c) => ({ key: c.id, label: c.company }));
  const templateOptions = templates
    .filter((t) => t.id === templateId || matches(templateQuery, t.name, t.subject))
    .map((t) => ({ key: t.id, label: t.name }));

  const toggleRecipient = (id: string) =>
    setRecipients((r) => (r.includes(id) ? r.filter((x) => x !== id) : [...r, id]));

  let preview = '';
  if (template && first) {
    preview = fill(template.body, first.contactName.split(' ')[0], first.company);
    if (personalized) preview = personalize(preview, first);
  }

  const canSend = chosen.length > 0 && !!template;
  const send = () => {
    if (!canSend) return;
    const when = day !== null ? at(new Date(day), hour ?? 9) : null;
    chosen.forEach((c) => {
      const subject = fill(template.subject, c.contactName.split(' ')[0], c.company);
      if (when) scheduleEmail({ clientId: c.id, subject, at: when });
      else sendEmail({ clientId: c.id, subject });
    });
    onClose();
  };

  const runPersonalize = () => {
    if (!first || thinking) return;
    setThinking(true);
    setTimeout(() => {
      setPersonalized((p) => !p);
      setThinking(false);
    }, personalized ? 0 : thinkingDelay());
  };

  return (
    <Sheet
      visible={visible}
      title="Send Email"
      onClose={onClose}
      footer={
        <>
          <PillButton
            icon={Mail}
            label={day !== null ? 'Schedule Mail' : 'Send Mail'}
            disabled={!canSend}
            onPress={send}
          />
          <PillButton icon={X} label="Cancel" onPress={onClose} />
          <View style={{ flex: 1 }} />
          <PillButton
            icon={Atom}
            label={thinking ? 'Personalizing…' : 'Ai Personalize'}
            active={personalized}
            disabled={!first}
            onPress={runPersonalize}
          />
        </>
      }
    >
      <Field label="To:">
        <Input value={toQuery} onChangeText={setToQuery} placeholder="Search clients…" />
        <ChipGroup options={clientOptions} isActive={(k) => recipients.includes(k)} onToggle={toggleRecipient} />
        <T variant="small" color={colors.textMuted} style={{ marginLeft: 3 }}>Recipients {chosen.length}</T>
      </Field>

      <Field label="Template:">
        <Input value={templateQuery} onChangeText={setTemplateQuery} placeholder="Search templates…" />
        <ChipGroup options={templateOptions} isActive={(k) => k === templateId} onToggle={setTemplateId} />
      </Field>

      <Field label="Schedule">
        <View style={styles.row}>
          <SelectField icon={CalendarDays} placeholder="Date" chevron options={dayOptions()} value={day} onChange={setDay} />
          <SelectField icon={Clock} placeholder="Time" options={hourOptions} value={hour} onChange={setHour} />
        </View>
      </Field>

      <View style={styles.preview}>
        <T variant="caption" color={colors.textMuted}>
          To: {chosen.length === 0 ? '' : first.email}
          {chosen.length > 1 ? `  +${chosen.length - 1} more` : ''}
        </T>
        <T variant="subtitle" weight="regular">
          Subject: {template && first ? fill(template.subject, first.contactName.split(' ')[0], first.company) : template?.subject ?? ''}
        </T>
        <T variant="caption" numberOfLines={personalized ? undefined : 4} style={{ lineHeight: 16 }}>
          {preview || 'Pick at least one recipient to preview the email.'}
        </T>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg, alignItems: 'flex-start' },
  preview: {
    ...elevation.raised,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
});
