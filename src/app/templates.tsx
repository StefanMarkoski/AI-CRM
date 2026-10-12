import { useLocalSearchParams } from 'expo-router';
import { Mail, Pencil, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { DeleteButton } from '@/components/ConfirmButton';
import { EmptyState, Field, Hoverable, Input, PillButton, T } from '@/components/primitives';
import { ScheduleMailSheet } from '@/components/ScheduleMailSheet';
import { Screen, useLayout } from '@/components/Screen';
import { Sheet } from '@/components/Sheet';
import type { Template } from '@/data/mock';
import { useOnChange } from '@/hooks/useOnChange';
import { useCrm } from '@/store/crm';
import { colors, radius, spacing } from '@/theme';
import { timeAgo } from '@/utils/dates';

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

  return (
    <Screen
      title="Templates"
      aiContext="Templates"
      actions={<PillButton icon={Plus} label="New Template" onPress={() => setEditing('new')} />}
    >
      <View style={[styles.columns, !split && { flexDirection: 'column' }]}>
        <View style={styles.gridCol}>
          <T variant="title" style={{ marginTop: -spacing.lg, marginBottom: spacing.xxl + 4 }}>Templates</T>
          <View style={styles.grid}>
            {templates.map((t) => {
              const active = t.id === selectedId;
              return (
                <Hoverable key={t.id} onPress={() => setSelectedId(t.id)} style={styles.card}>
                  {({ hovered }) => (
                    <>
                      <T variant="subtitle" weight="regular">{t.name}</T>
                      <T variant="small" color={colors.textSecondary} style={{ marginTop: 6, marginBottom: spacing.md }}>
                        Updated {timeAgo(t.updated)}
                      </T>
                      <View
                        style={[
                          styles.preview,
                          { backgroundColor: active ? colors.selected : hovered ? colors.surfaceHover : colors.surface },
                        ]}
                      >
                        <T variant="caption" numberOfLines={6} style={{ lineHeight: 15 }}>{sample(t.body)}</T>
                      </View>
                    </>
                  )}
                </Hoverable>
              );
            })}
          </View>
        </View>

        <View style={styles.detailCol}>
          {selected ? (
            <View style={{ gap: spacing.lg }}>
              <T variant="title" weight="semibold">{selected.name}</T>
              <T variant="body" style={{ fontSize: 16, marginTop: spacing.sm }}>Subject: {sample(selected.subject)}</T>
              <T variant="body" style={{ fontSize: 16 }}>Message:</T>
              <T variant="label" style={{ lineHeight: 20, marginTop: -6 }}>{sample(selected.body)}</T>
              <View style={styles.actions}>
                <PillButton icon={Pencil} label="Edit" onPress={() => setEditing(selected)} />
                <DeleteButton
                  onConfirm={() => {
                    deleteTemplate(selected.id);
                    setSelectedId(templates.find((t) => t.id !== selected.id)?.id);
                  }}
                />
                <PillButton icon={Mail} label="Send Mail" onPress={() => setSendOpen(true)} />
              </View>
              <T variant="caption" color={colors.textMuted}>
                Tip: use {'{{firstName}}'} and {'{{company}}'} — they are filled in per client.
              </T>
            </View>
          ) : (
            <EmptyState title="No template selected" />
          )}
        </View>
      </View>

      <TemplateForm initial={editing} onClose={() => setEditing(null)} onCreated={(t) => setSelectedId(t.id)} />
      <ScheduleMailSheet visible={sendOpen} onClose={() => setSendOpen(false)} preset={{ templateId: selectedId }} />
    </Screen>
  );
}

function TemplateForm({ initial, onClose, onCreated }: {
  initial: Template | 'new' | null; onClose: () => void; onCreated: (t: Template) => void;
}) {
  const { addTemplate, updateTemplate } = useCrm();
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  useOnChange(initial, (next) => {
    const t = next && next !== 'new' ? next : null;
    setName(t?.name ?? '');
    setSubject(t?.subject ?? '');
    setBody(t?.body ?? 'Hi {{firstName}},\n\n\nBest regards,');
  });

  const valid = name.trim() && subject.trim();
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
      width={620}
      footer={
        <>
          <PillButton label="Cancel" onPress={onClose} />
          <PillButton label="Save Template" active={!!valid} onPress={save} />
        </>
      }
    >
      <Field label="Name"><Input value={name} onChangeText={setName} autoFocus /></Field>
      <Field label="Subject"><Input value={subject} onChangeText={setSubject} /></Field>
      <Field label="Message"><Input value={body} onChangeText={setBody} multiline style={{ height: 220 }} /></Field>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  columns: { flexDirection: 'row', gap: 120 },
  gridCol: { flexShrink: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 24, rowGap: 28, maxWidth: 488 },
  card: { width: 220 },
  preview: { height: 120, borderRadius: radius.lg, paddingHorizontal: spacing.lg, paddingVertical: spacing.lg },
  detailCol: { flex: 1, minWidth: 300, maxWidth: 460, marginTop: 30 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xl, marginTop: spacing.lg },
});
