import { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { Field, Input, Segmented, T } from '@/components/primitives';
import { Panel } from '@/components/Panel';
import { Screen } from '@/components/Screen';
import { colors, elevation, radius, spacing } from '@/theme';

export default function Settings() {
  const [name, setName] = useState('Stefan Markoski');
  const [email, setEmail] = useState('stefan@company.com');
  const [digest, setDigest] = useState(true);
  const [aiDrafts, setAiDrafts] = useState(true);
  const [reminders, setReminders] = useState(false);
  const [weekStart, setWeekStart] = useState<'Monday' | 'Sunday'>('Monday');

  return (
    <Screen title="Settings">
      <View style={styles.wrap}>
        <Section title="Profile">
          <Field label="Full name"><Input value={name} onChangeText={setName} /></Field>
          <Field label="Email"><Input value={email} onChangeText={setEmail} autoCapitalize="none" /></Field>
        </Section>

        <Section title="Preferences">
          <Toggle label="Daily email digest" hint="A summary of today's tasks every morning at 08:00" value={digest} onChange={setDigest} />
          <Toggle label="AI drafted replies" hint="Let the assistant prepare replies to incoming emails" value={aiDrafts} onChange={setAiDrafts} />
          <Toggle label="Task reminders" hint="Notify 15 minutes before a task is due" value={reminders} onChange={setReminders} />
          <Field label="Week starts on">
            <Segmented options={['Monday', 'Sunday'] as const} value={weekStart} onChange={setWeekStart} />
          </Field>
        </Section>

        <Section title="Integrations">
          {['Gmail', 'Outlook', 'Google Calendar'].map((s) => (
            <View key={s} style={styles.integration}>
              <T variant="label">{s}</T>
              <T variant="small" color={colors.textMuted}>Coming soon</T>
            </View>
          ))}
        </Section>
      </View>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Panel style={{ gap: spacing.lg }}>
      <T variant="title">{title}</T>
      {children}
    </Panel>
  );
}

function Toggle({ label, hint, value, onChange }: { label: string; hint: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.toggle}>
      <View style={{ flex: 1, gap: 2 }}>
        <T variant="label">{label}</T>
        <T variant="small" color={colors.textMuted}>{hint}</T>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.tile, true: colors.selected }}
        thumbColor={value ? colors.text : colors.white}
        {...({ activeThumbColor: colors.text } as object)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { maxWidth: 640, gap: 14 },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  integration: {
    ...elevation.raised,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
});
