import { useLocalSearchParams } from 'expo-router';
import { Atom, Check, Mail, Pencil, Plus, Trash2, X } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { DeleteButton } from '@/components/ConfirmButton';
import { EmptyState, Field, Hoverable, IconButton, Input, PillButton, T } from '@/components/primitives';
import { ScheduleMailSheet } from '@/components/ScheduleMailSheet';
import { Panel } from '@/components/Panel';
import { Screen, useLayout } from '@/components/Screen';
import { Sheet } from '@/components/Sheet';
import type { Template } from '@/data/mock';
import { useOnChange } from '@/hooks/useOnChange';
import { useCrm } from '@/store/crm';
import { colors, elevation, radius, spacing } from '@/theme';
import { timeAgo } from '@/utils/dates';
import { draftTemplate, thinkingDelay } from '@/utils/mockAI';

// Show the default sample contact in previews so templates read naturally.
const sample = (s: string) => s.replace(/{{firstName}}/g, 'Marko').replace(/{{company}}/g, 'ABC Packaging');

export default function Templates() {
  const params = useLocalSearchParams<{ id?: string }>();
  const { split } = useLayout();
  const { templates, deleteTemplate } = useCrm();
  const [selectedId, setSelectedId] = useState<string | undefined>(params.id ?? templates[0]?.id);
  const [editing, setEditing] = useState<Template | 'new' | null>(null);
  const [sendOpen, setSendOpen] = useState(false);

  useOnChange(params.id, (id) => {
    if (id) setSelectedId(id);
  });

  const selected = templates.find((t) => t.id === selectedId);
  const remove = (id: string) => {
    deleteTemplate(id);
    if (id === selectedId) setSelectedId(templates.find((t) => t.id !== id)?.id);
  };

  return (
    <Screen
      title="Templates"
      aiContext="Templates"
      actions={<PillButton icon={Plus} label="New Template" onPress={() => setEditing('new')} />}
    >
      <View style={[styles.columns, !split && { flexDirection: 'column' }]}>
        <Panel style={styles.gridCol}>
          <T variant="title" weight="regular" style={{ marginBottom: spacing.xl }}>Templates</T>
          <View style={styles.grid}>
            {templates.map((t) => (
              <TemplateCard
                key={t.id}
                template={t}
                active={t.id === selectedId}
                onPress={() => setSelectedId(t.id)}
                onEdit={() => setEditing(t)}
                onDelete={() => remove(t.id)}
                onSend={() => {
                  setSelectedId(t.id);
                  setSendOpen(true);
                }}
              />
            ))}
          </View>
        </Panel>

        <Panel style={styles.detailCol}>
          {selected ? (
            <View style={{ gap: spacing.lg }}>
              <T variant="title" weight="regular">{selected.name}</T>
              <T variant="body" style={{ fontSize: 16, marginTop: spacing.sm }}>Subject: {sample(selected.subject)}</T>
              <T variant="body" style={{ fontSize: 16 }}>Message:</T>
              <T variant="label" style={{ lineHeight: 20, marginTop: -6 }}>{sample(selected.body)}</T>
              <View style={styles.actions}>
                <PillButton icon={Pencil} label="Edit" onPress={() => setEditing(selected)} />
                <DeleteButton onConfirm={() => remove(selected.id)} />
                <PillButton icon={Mail} label="Send Mail" onPress={() => setSendOpen(true)} />
              </View>
              <T variant="caption" color={colors.textMuted}>
                Tip: use {'{{firstName}}'} and {'{{company}}'} — they are filled in per client.
              </T>
            </View>
          ) : (
            <EmptyState title="No template selected" />
          )}
        </Panel>
      </View>

      <TemplateForm initial={editing} onClose={() => setEditing(null)} onCreated={(t) => setSelectedId(t.id)} />
      <ScheduleMailSheet visible={sendOpen} onClose={() => setSendOpen(false)} preset={{ templateId: selectedId }} />
    </Screen>
  );
}

function TemplateCard({ template: t, active, onPress, onEdit, onDelete, onSend }: {
  template: Template; active: boolean;
  onPress: () => void; onEdit: () => void; onDelete: () => void; onSend: () => void;
}) {
  const [armed, setArmed] = useState(false);
  return (
    <Hoverable
      onPress={onPress}
      accessibilityLabel={t.name}
      style={({ hovered }) => [
        styles.card,
        { backgroundColor: active ? colors.selected : hovered ? colors.surfaceHover : colors.surface },
      ]}
    >
      <T variant="subtitle" weight="regular" style={{ fontSize: 16 }}>{t.name}</T>
      <T variant="small" color={colors.textMuted} style={{ marginTop: 6, marginBottom: spacing.xl }}>
        Updated {timeAgo(t.updated)}
      </T>
      <View style={styles.cardBody}>
        <T variant="caption" style={{ fontSize: 10.5, lineHeight: 15 }}>{sample(t.body)}</T>
      </View>
      <View style={styles.cardActions}>
        <IconButton icon={Pencil} label={`Edit ${t.name}`} onPress={onEdit} />
        <IconButton
          icon={armed ? Check : Trash2}
          color={armed ? colors.danger : colors.text}
          label={armed ? `Confirm delete ${t.name}` : `Delete ${t.name}`}
          onPress={() => (armed ? onDelete() : setArmed(true))}
        />
        <IconButton icon={Mail} label={`Send ${t.name}`} onPress={onSend} />
      </View>
    </Hoverable>
  );
}

function TemplateForm({ initial, onClose, onCreated }: {
  initial: Template | 'new' | null; onClose: () => void; onCreated: (t: Template) => void;
}) {
  const { addTemplate, updateTemplate } = useCrm();
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [drafting, setDrafting] = useState(false);

  useOnChange(initial, (next) => {
    const t = next && next !== 'new' ? next : null;
    setName(t?.name ?? '');
    setSubject(t?.subject ?? '');
    setBody(t?.body ?? 'Hi {{firstName}},\n\n\nBest regards,');
  });

  const valid = name.trim() && subject.trim();
  const aiDraft = () => {
    if (drafting) return;
    setDrafting(true);
    setTimeout(() => {
      setBody(draftTemplate(name, subject));
      setDrafting(false);
    }, thinkingDelay());
  };
  const save = () => {
    if (!valid) return;
    if (initial === 'new') onCreated(addTemplate({ name, subject, body }));
    else if (initial) updateTemplate(initial.id, { name, subject, body });
    onClose();
  };

  return (
    <Sheet
      visible={!!initial}
      title={initial === 'new' ? 'New Template' : 'Edit Template'}
      onClose={onClose}
      footer={
        <>
          <PillButton icon={Check} label={initial === 'new' ? 'Create New Template' : 'Save Changes'} disabled={!valid} onPress={save} />
          <PillButton icon={X} label="Cancel" onPress={onClose} />
          <View style={{ flex: 1 }} />
          <PillButton icon={Atom} label={drafting ? 'Drafting…' : 'Ai Draft'} onPress={aiDraft} />
        </>
      }
    >
      <Field label="Name:"><Input value={name} onChangeText={setName} autoFocus /></Field>
      <Field label="Subject:"><Input value={subject} onChangeText={setSubject} /></Field>
      <Field label="Message:"><Input value={body} onChangeText={setBody} multiline style={{ height: 204 }} /></Field>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  columns: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  gridCol: { flexShrink: 1, padding: spacing.xl, alignSelf: 'stretch' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, maxWidth: 616 },
  card: {
    ...elevation.raised,
    width: 300,
    maxWidth: '100%',
    height: 249,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl + 4,
    paddingBottom: spacing.lg,
  },
  cardBody: { height: 75, overflow: 'hidden', marginBottom: 'auto' },
  cardActions: { flexDirection: 'row', gap: spacing.xl, marginTop: spacing.md },
  detailCol: { flex: 1, minWidth: 300, padding: spacing.xl, alignSelf: 'stretch' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xl, marginTop: spacing.lg },
});
