import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowRight, Check, Clock, Mail, Pencil, Plus, SlidersHorizontal, Trash2, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { DeleteButton } from '@/components/ConfirmButton';
import {
  Avatar, Bullet, DotLine, EmptyState, Field, Hoverable, IconButton, Input, LinkText, PillButton,
  Segmented, StatusBadge, T,
} from '@/components/primitives';
import { ScheduleMailSheet } from '@/components/ScheduleMailSheet';
import { Panel } from '@/components/Panel';
import { Screen, useLayout } from '@/components/Screen';
import { Sheet } from '@/components/Sheet';
import type { Client, ClientStatus } from '@/data/mock';
import { useOnChange } from '@/hooks/useOnChange';
import { useCrm } from '@/store/crm';
import { useUi } from '@/store/ui';
import { colors, elevation, radius, spacing } from '@/theme';
import { formatShortDate, formatTime, isWithinDay, relativeDay, timeAgo } from '@/utils/dates';

const FILTERS = ['All', 'Active', 'Lead', 'Inactive'] as const;
type Filter = (typeof FILTERS)[number];

export default function Clients() {
  const params = useLocalSearchParams<{ id?: string }>();
  const { split, narrow } = useLayout();
  const { clients, deleteClient } = useCrm();
  const [filter, setFilter] = useState<Filter>('All');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>(params.id ?? clients[0]?.id);
  const [editing, setEditing] = useState<Client | 'new' | null>(null);

  useOnChange(params.id, (id) => {
    if (id) setSelectedId(id);
  });

  const visible = useMemo(() => {
    return clients.filter((c) => filter === 'All' || c.status === filter);
  }, [clients, filter]);

  const selected = clients.find((c) => c.id === selectedId);
  const remove = (id: string) => {
    deleteClient(id);
    if (id === selectedId) setSelectedId(clients.find((c) => c.id !== id)?.id);
  };

  return (
    <Screen
      title="Clients"
      aiContext="Clients"
      actions={<PillButton icon={Plus} label="New Client" onPress={() => setEditing('new')} />}
    >
      <View style={[styles.columns, !split && { flexDirection: 'column' }]}>
        <Panel style={[styles.listCol, split && { maxWidth: 600 }]} padded={false}>
          <View style={styles.listTools}>
            {showFilters || filter !== 'All' ? (
              <Segmented options={FILTERS} value={filter} onChange={setFilter} />
            ) : (
              <T variant="small" color={colors.textMuted}>{visible.length} clients</T>
            )}
            <IconButton icon={SlidersHorizontal} label="Filters" size={18} onPress={() => setShowFilters((s) => !s)} />
          </View>

          <View style={styles.list}>
            {visible.length === 0 && <EmptyState title="No clients found" hint="Try a different filter" />}
            {visible.map((c) => (
              <ClientCard
                key={c.id}
                client={c}
                active={c.id === selectedId}
                compact={narrow}
                onPress={() => setSelectedId(c.id)}
                onEdit={() => setEditing(c)}
                onDelete={() => remove(c.id)}
              />
            ))}
          </View>
        </Panel>

        <Panel style={styles.detailCol}>
          {selected ? (
            <ClientDetail
              client={selected}
              onEdit={() => setEditing(selected)}
              onDelete={() => remove(selected.id)}
            />
          ) : (
            <EmptyState title="Select a client" hint="Details, tasks and emails appear here" />
          )}
        </Panel>
      </View>

      <ClientForm
        initial={editing}
        onClose={() => setEditing(null)}
        onCreated={(c) => setSelectedId(c.id)}
      />
    </Screen>
  );
}

function ClientCard({ client: c, active, compact, onPress, onEdit, onDelete }: {
  client: Client; active: boolean; compact: boolean;
  onPress: () => void; onEdit: () => void; onDelete: () => void;
}) {
  const [armed, setArmed] = useState(false);
  return (
    <Hoverable
      onPress={onPress}
      accessibilityLabel={`${c.contactName}, ${c.company}`}
      style={({ hovered }) => [
        styles.card,
        { backgroundColor: active ? colors.selected : hovered ? colors.surfaceHover : colors.surface },
      ]}
    >
      {!compact && <Avatar name={c.contactName} />}
      <View style={styles.cardCol}>
        <T variant="label" numberOfLines={1}>{c.contactName}</T>
        <DotLine>{c.contactRole}</DotLine>
        <DotLine>{c.email}</DotLine>
        <DotLine>{c.phone}</DotLine>
      </View>
      <View style={styles.cardCol}>
        <T variant="label" numberOfLines={1}>{c.company}</T>
        <DotLine>{c.industry}</DotLine>
        <DotLine>{c.website}</DotLine>
      </View>
      <View style={styles.cardSide}>
        <StatusBadge status={c.status} />
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <IconButton
            icon={armed ? Check : Trash2}
            color={armed ? colors.danger : colors.text}
            label={armed ? `Confirm delete ${c.company}` : `Delete ${c.company}`}
            onPress={() => (armed ? onDelete() : setArmed(true))}
          />
          <IconButton icon={Pencil} label={`Edit ${c.company}`} onPress={onEdit} />
        </View>
      </View>
    </Hoverable>
  );
}

function ClientDetail({ client, onEdit, onDelete }: { client: Client; onEdit: () => void; onDelete: () => void }) {
  const router = useRouter();
  const { tasks, emails, deleteTask, addNote } = useCrm();
  const { openNewTask } = useUi();
  const [noteDraft, setNoteDraft] = useState<string | null>(null);
  const [mailOpen, setMailOpen] = useState(false);

  const openTasks = tasks.filter((t) => t.clientId === client.id && !t.completed).sort((a, b) => +a.due - +b.due);
  const history = emails.filter((e) => e.clientId === client.id && !e.scheduled).sort((a, b) => +b.at - +a.at);

  const saveNote = () => {
    if (noteDraft?.trim()) addNote(client.id, noteDraft.trim());
    setNoteDraft(null);
  };

  return (
    <View>
      <View style={styles.detailHead}>
        <View style={{ flex: 1, gap: spacing.lg }}>
          <T variant="title">{client.company}</T>
          <T variant="title">{client.industry}</T>
        </View>
        <View style={{ gap: spacing.lg, alignItems: 'flex-end' }}>
          <PillButton icon={Pencil} label="Edit" onPress={onEdit} />
          <DeleteButton onConfirm={onDelete} />
        </View>
      </View>

      <View style={{ gap: spacing.xl, marginTop: spacing.sm }}>
        <T variant="body" style={{ fontSize: 16 }}>{client.website}</T>
        <View style={{ gap: 4 }}>
          <T variant="body" style={{ fontSize: 16 }}>{client.contactName} ({client.contactRole})</T>
          <T variant="body" style={{ fontSize: 16 }}>{client.email}</T>
          <T variant="body" style={{ fontSize: 16 }}>{client.phone}</T>
        </View>
      </View>

      <T variant="title" style={styles.section}>Open Tasks</T>
      <View style={{ gap: spacing.md }}>
        {openTasks.length === 0 && <T variant="small" color={colors.textMuted}>No open tasks</T>}
        {openTasks.map((t) => (
          <View key={t.id} style={styles.taskLine}>
            <Hoverable style={{ flex: 1 }} onPress={() => router.navigate({ pathname: '/tasks', params: { id: t.id } })}>
              <Bullet>
                <T variant="label">{t.title}</T>
                <T variant="caption" color={colors.textSecondary} style={{ marginTop: 4 }}>
                  {relativeDay(t.due)} - {formatTime(t.due)}
                </T>
              </Bullet>
            </Hoverable>
            <IconButton icon={Trash2} label={`Delete ${t.title}`} onPress={() => deleteTask(t.id)} />
          </View>
        ))}
      </View>
      <View style={styles.alignEnd}>
        <PillButton icon={Plus} label="New Task" onPress={() => openNewTask({ clientId: client.id })} />
      </View>

      <T variant="title" style={styles.section}>Notes</T>
      <View style={{ gap: spacing.sm }}>
        {client.notes.length === 0 && noteDraft === null && <T variant="small" color={colors.textMuted}>No notes yet</T>}
        {client.notes.map((n, i) => (
          <Bullet key={i}><T variant="label">{n}</T></Bullet>
        ))}
        {noteDraft !== null && (
          <Input
            value={noteDraft}
            onChangeText={setNoteDraft}
            placeholder="Write a note and press Enter"
            autoFocus
            onSubmitEditing={saveNote}
            onBlur={saveNote}
          />
        )}
      </View>
      <View style={styles.alignEnd}>
        <PillButton icon={Plus} label="New Note" onPress={() => setNoteDraft('')} />
      </View>

      <View style={[styles.section, styles.historyHead]}>
        <T variant="title">Email History</T>
        <LinkText label="View All Emails" />
      </View>
      <View style={{ alignItems: 'flex-start', marginBottom: spacing.xl }}>
        <PillButton icon={Mail} label="Send Mail" onPress={() => setMailOpen(true)} />
      </View>
      <View style={{ gap: spacing.lg }}>
        {history.length === 0 && <T variant="small" color={colors.textMuted}>No emails yet</T>}
        {history.map((e) => {
          const [from, to] = e.direction === 'in' ? [client.contactName, 'You'] : ['You', client.contactName];
          return (
            <View key={e.id} style={{ gap: 4 }}>
              <View style={styles.emailHead}>
                <T variant="body" style={{ fontSize: 16 }}>{from}</T>
                <ArrowRight size={14} color={colors.text} strokeWidth={1.6} />
                <T variant="body" style={{ fontSize: 16, flex: 1 }} numberOfLines={1}>{to}</T>
                <Clock size={12} color={colors.textMuted} />
                <T variant="caption" color={colors.textMuted}>
                  {isWithinDay(e.at) ? timeAgo(e.at) : formatShortDate(e.at)}
                </T>
              </View>
              <T variant="small" color={colors.textSecondary} numberOfLines={1}>{e.subject}</T>
            </View>
          );
        })}
      </View>
      <ScheduleMailSheet visible={mailOpen} onClose={() => setMailOpen(false)} preset={{ clientId: client.id }} />
    </View>
  );
}

const EMPTY: Omit<Client, 'id' | 'notes'> = {
  company: '', industry: '', website: '', contactName: '', contactRole: '', email: '', phone: '', status: 'Active',
};

function ClientForm({ initial, onClose, onCreated }: {
  initial: Client | 'new' | null; onClose: () => void; onCreated: (c: Client) => void;
}) {
  const { addClient, updateClient, addNote } = useCrm();
  const [form, setForm] = useState(EMPTY);
  const [note, setNote] = useState('');

  useOnChange(initial, (next) => {
    setNote('');
    if (next === 'new') setForm(EMPTY);
    else if (next) setForm(next);
  });

  const set = (k: keyof typeof EMPTY) => (v: string) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form.company.trim() && form.contactName.trim();

  const save = () => {
    if (!valid) return;
    let id = initial === 'new' ? undefined : initial?.id;
    if (initial === 'new') {
      const created = addClient(form);
      onCreated(created);
      id = created.id;
    } else if (initial) {
      updateClient(initial.id, form);
    }
    if (id && note.trim()) addNote(id, note.trim());
    onClose();
  };

  return (
    <Sheet
      visible={!!initial}
      title={initial === 'new' ? 'New Client' : 'Edit Client'}
      onClose={onClose}
      footer={
        <>
          <PillButton icon={Check} label={initial === 'new' ? 'Create New Client' : 'Save Changes'} disabled={!valid} onPress={save} />
          <PillButton icon={X} label="Cancel" onPress={onClose} />
        </>
      }
    >
      <View style={styles.formRow}>
        <View style={{ flex: 1, minWidth: 200 }}><Field label="Company"><Input value={form.company} onChangeText={set('company')} autoFocus /></Field></View>
        <View style={{ flex: 1, minWidth: 200 }}><Field label="Industry"><Input value={form.industry} onChangeText={set('industry')} /></Field></View>
      </View>
      <Field label="Website"><Input value={form.website} onChangeText={set('website')} placeholder="www.example.com" /></Field>
      <View style={styles.formRow}>
        <View style={{ flex: 1, minWidth: 200 }}><Field label="Contact Name"><Input value={form.contactName} onChangeText={set('contactName')} /></Field></View>
        <View style={{ flex: 1, minWidth: 200 }}><Field label="Role"><Input value={form.contactRole} onChangeText={set('contactRole')} /></Field></View>
      </View>
      <View style={styles.formRow}>
        <View style={{ flex: 1, minWidth: 200 }}><Field label="Email"><Input value={form.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" /></Field></View>
        <View style={{ flex: 1, minWidth: 200 }}><Field label="Phone"><Input value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" /></Field></View>
      </View>
      <Field label="Notes"><Input value={note} onChangeText={setNote} placeholder={initial === 'new' ? 'Optional' : 'Add a note (optional)'} /></Field>
      <Field label="Status">
        <Segmented<ClientStatus> options={['Active', 'Lead', 'Inactive']} value={form.status} onChange={(s) => setForm((f) => ({ ...f, status: s }))} />
      </Field>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  columns: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  listCol: { flex: 1.1, padding: spacing.lg },
  listTools: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },
  list: { gap: 18 },
  card: {
    ...elevation.raised,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    minHeight: 126,
    paddingLeft: spacing.xl,
    paddingRight: spacing.lg,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
  },
  cardCol: { flex: 1, gap: 4, alignSelf: 'flex-start', paddingTop: spacing.xs },
  cardSide: { alignSelf: 'stretch', alignItems: 'flex-end', justifyContent: 'space-between', paddingTop: spacing.xs },
  detailCol: { flex: 1, minWidth: 320, padding: spacing.xl },
  detailHead: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.lg },
  section: { marginTop: spacing.xxxl - 8, marginBottom: spacing.lg },
  taskLine: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  alignEnd: { alignItems: 'flex-end', marginTop: spacing.xl },
  historyHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  emailHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  formRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg },
});
