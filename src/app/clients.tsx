import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowDownLeft, ArrowUpRight, Clock, Pencil, Plus, Search, SlidersHorizontal, Trash2 } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { DeleteButton } from '@/components/ConfirmButton';
import {
  Bullet, EmptyState, Field, Hoverable, IconButton, Input, LinkText, PillButton,
  Segmented, StatusBadge, T, webInputReset,
} from '@/components/primitives';
import { Panel } from '@/components/Panel';
import { Screen, useLayout } from '@/components/Screen';
import { Sheet } from '@/components/Sheet';
import type { Client, ClientStatus } from '@/data/mock';
import { useOnChange } from '@/hooks/useOnChange';
import { useCrm } from '@/store/crm';
import { useUi } from '@/store/ui';
import { colors, fonts, radius, spacing } from '@/theme';
import { formatShortDate, formatTime, isWithinDay, relativeDay, timeAgo } from '@/utils/dates';

const FILTERS = ['All', 'Active', 'Lead', 'Inactive'] as const;
type Filter = (typeof FILTERS)[number];

export default function Clients() {
  const params = useLocalSearchParams<{ id?: string }>();
  const { split } = useLayout();
  const { clients, deleteClient } = useCrm();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>(params.id ?? clients[0]?.id);
  const [editing, setEditing] = useState<Client | 'new' | null>(null);

  useOnChange(params.id, (id) => {
    if (id) setSelectedId(id);
  });

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clients.filter(
      (c) =>
        (filter === 'All' || c.status === filter) &&
        (!q || [c.company, c.contactName, c.email, c.industry].some((s) => s.toLowerCase().includes(q))),
    );
  }, [clients, query, filter]);

  const selected = clients.find((c) => c.id === selectedId);

  return (
    <Screen
      title="Clients"
      aiContext="Clients"
      actions={<PillButton icon={Plus} label="New Client" onPress={() => setEditing('new')} />}
    >
      <View style={[styles.columns, !split && { flexDirection: 'column' }]}>
        <Panel style={[styles.listCol, split && { maxWidth: 600 }]}>
          <View style={styles.search}>
            <Search size={18} color={colors.text} strokeWidth={1.6} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search Clients..."
              placeholderTextColor={colors.text}
              style={[styles.searchInput, webInputReset]}
            />
            <IconButton icon={SlidersHorizontal} label="Filters" size={18} onPress={() => setShowFilters((s) => !s)} />
          </View>
          {(showFilters || filter !== 'All') && (
            <View style={{ marginTop: spacing.md }}>
              <Segmented options={FILTERS} value={filter} onChange={setFilter} />
            </View>
          )}

          <View style={styles.list}>
            {visible.length === 0 && <EmptyState title="No clients found" hint="Try a different search or filter" />}
            {visible.map((c) => {
              const active = c.id === selectedId;
              return (
                <Hoverable
                  key={c.id}
                  onPress={() => setSelectedId(c.id)}
                  style={({ hovered }) => [
                    styles.row,
                    { backgroundColor: active ? colors.selected : hovered ? colors.surfaceHover : colors.surface },
                  ]}
                >
                  <T variant="label" style={{ flex: 1 }} numberOfLines={1}>{c.company}</T>
                  <T variant="label" style={{ flex: 1 }} numberOfLines={1}>{c.contactName}</T>
                  <View style={{ width: 80, alignItems: 'flex-end' }}>
                    <StatusBadge status={c.status} />
                  </View>
                </Hoverable>
              );
            })}
          </View>
        </Panel>

        <Panel style={styles.detailCol}>
          {selected ? (
            <ClientDetail
              client={selected}
              onEdit={() => setEditing(selected)}
              onDelete={() => {
                deleteClient(selected.id);
                setSelectedId(clients.find((c) => c.id !== selected.id)?.id);
              }}
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

function ClientDetail({ client, onEdit, onDelete }: { client: Client; onEdit: () => void; onDelete: () => void }) {
  const router = useRouter();
  const { tasks, emails, deleteTask, addNote } = useCrm();
  const { openNewTask } = useUi();
  const [noteDraft, setNoteDraft] = useState<string | null>(null);

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
      <View style={{ gap: spacing.sm }}>
        {history.length === 0 && <T variant="small" color={colors.textMuted}>No emails yet</T>}
        {history.map((e) => (
          <View key={e.id} style={styles.email}>
            {e.direction === 'in' ? (
              <ArrowDownLeft size={16} color={colors.textSecondary} strokeWidth={1.6} />
            ) : (
              <ArrowUpRight size={16} color={colors.textSecondary} strokeWidth={1.6} />
            )}
            <T variant="label" style={{ flex: 1 }} numberOfLines={1}>{e.subject}</T>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Clock size={12} color={colors.textMuted} />
              <T variant="caption" color={colors.textMuted}>
                {isWithinDay(e.at) ? timeAgo(e.at) : formatShortDate(e.at)}
              </T>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const EMPTY: Omit<Client, 'id' | 'notes'> = {
  company: '', industry: '', website: '', contactName: '', contactRole: '', email: '', phone: '', status: 'Lead',
};

function ClientForm({ initial, onClose, onCreated }: {
  initial: Client | 'new' | null; onClose: () => void; onCreated: (c: Client) => void;
}) {
  const { addClient, updateClient } = useCrm();
  const [form, setForm] = useState(EMPTY);

  useOnChange(initial, (next) => {
    if (next === 'new') setForm(EMPTY);
    else if (next) setForm(next);
  });

  const set = (k: keyof typeof EMPTY) => (v: string) => setForm((f) => ({ ...f, [k]: v }));
  const valid = form.company.trim() && form.contactName.trim();

  const save = () => {
    if (!valid) return;
    if (initial === 'new') onCreated(addClient(form));
    else if (initial) updateClient(initial.id, form);
    onClose();
  };

  return (
    <Sheet
      visible={!!initial}
      title={initial === 'new' ? 'New Client' : 'Edit Client'}
      onClose={onClose}
      footer={
        <>
          <PillButton label="Cancel" onPress={onClose} />
          <PillButton label={initial === 'new' ? 'Create Client' : 'Save'} active={!!valid} onPress={save} />
        </>
      }
    >
      <View style={styles.formRow}>
        <View style={{ flex: 1 }}><Field label="Company"><Input value={form.company} onChangeText={set('company')} autoFocus /></Field></View>
        <View style={{ flex: 1 }}><Field label="Industry"><Input value={form.industry} onChangeText={set('industry')} /></Field></View>
      </View>
      <Field label="Website"><Input value={form.website} onChangeText={set('website')} placeholder="www.example.com" /></Field>
      <View style={styles.formRow}>
        <View style={{ flex: 1 }}><Field label="Contact name"><Input value={form.contactName} onChangeText={set('contactName')} /></Field></View>
        <View style={{ flex: 1 }}><Field label="Role"><Input value={form.contactRole} onChangeText={set('contactRole')} /></Field></View>
      </View>
      <View style={styles.formRow}>
        <View style={{ flex: 1 }}><Field label="Email"><Input value={form.email} onChangeText={set('email')} keyboardType="email-address" autoCapitalize="none" /></Field></View>
        <View style={{ flex: 1 }}><Field label="Phone"><Input value={form.phone} onChangeText={set('phone')} keyboardType="phone-pad" /></Field></View>
      </View>
      <Field label="Status">
        <Segmented<ClientStatus> options={['Active', 'Lead', 'Inactive']} value={form.status} onChange={(s) => setForm((f) => ({ ...f, status: s }))} />
      </Field>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  columns: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  listCol: { flex: 1.1 },
  detailCol: { flex: 1, minWidth: 320, padding: spacing.xxl },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    height: 40,
    paddingLeft: spacing.lg + 2,
    paddingRight: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  searchInput: { flex: 1, height: '100%', fontFamily: fonts.regular, fontSize: 14, color: colors.text },
  list: { gap: 10, marginTop: spacing.xl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    gap: spacing.md,
  },
  detailHead: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.lg },
  section: { marginTop: spacing.xxxl - 8, marginBottom: spacing.lg },
  taskLine: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  alignEnd: { alignItems: 'flex-end', marginTop: spacing.xl },
  historyHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  email: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    height: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  formRow: { flexDirection: 'row', gap: spacing.md },
});
