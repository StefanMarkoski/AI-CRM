import { Href, useRouter } from 'expo-router';
import { CopyCheck, Folder, LucideIcon, Search, Users } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';

import { useOnChange } from '@/hooks/useOnChange';
import { useCrm } from '@/store/crm';
import { useUi } from '@/store/ui';
import { colors, elevation, fonts, radius, spacing } from '@/theme';
import { formatShortDate } from '@/utils/dates';

import { Hoverable, T, webInputReset } from './primitives';

interface Result {
  key: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  href: Href;
}

/** Global search (⌘K / Ctrl+K on web) across clients, tasks and templates. */
export function SearchPalette() {
  const { searchOpen, closeSearch, openSearch } = useUi();
  const { clients, tasks, templates, clientById } = useCrm();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [q, setQ] = useState('');
  const inputRef = useRef<TextInput>(null);

  useOnChange(searchOpen, (open) => {
    if (open) setQ('');
  });

  useEffect(() => {
    if (!searchOpen) return;
    // autoFocus is unreliable inside a fading Modal on web
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [searchOpen]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        openSearch();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openSearch]);

  const results = useMemo<Result[]>(() => {
    const term = q.trim().toLowerCase();
    const match = (...s: string[]) => !term || s.some((x) => x.toLowerCase().includes(term));
    const out: Result[] = [];
    clients
      .filter((c) => match(c.company, c.contactName, c.email, c.industry))
      .slice(0, 5)
      .forEach((c) =>
        out.push({
          key: c.id, icon: Users, title: c.company, subtitle: `${c.contactName} · ${c.status}`,
          href: { pathname: '/clients', params: { id: c.id } },
        }),
      );
    tasks
      .filter((t) => !t.completed && match(t.title, clientById(t.clientId)?.company ?? ''))
      .slice(0, 5)
      .forEach((t) =>
        out.push({
          key: t.id, icon: CopyCheck, title: t.title,
          subtitle: `${clientById(t.clientId)?.company ?? ''} · ${formatShortDate(t.due)}`,
          href: { pathname: '/tasks', params: { id: t.id } },
        }),
      );
    templates
      .filter((t) => match(t.name, t.subject, t.body))
      .slice(0, 4)
      .forEach((t) =>
        out.push({
          key: t.id, icon: Folder, title: t.name, subtitle: `Template · ${t.subject}`,
          href: { pathname: '/templates', params: { id: t.id } },
        }),
      );
    return out;
  }, [q, clients, tasks, templates, clientById]);

  const go = (r: Result) => {
    closeSearch();
    router.navigate(r.href);
  };

  return (
    <Modal visible={searchOpen} transparent animationType="fade" onRequestClose={closeSearch}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={closeSearch} />
        <View style={[styles.card, { width: Math.min(620, width - 32) }]}>
          <View style={styles.inputRow}>
            <Search size={18} color={colors.textSecondary} strokeWidth={1.6} />
            <TextInput
              ref={inputRef}
              value={q}
              onChangeText={setQ}
              autoFocus
              placeholder="Search clients, tasks, templates…"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, webInputReset]}
              onSubmitEditing={() => results[0] && go(results[0])}
            />
            <View style={styles.kbd}><T variant="caption" color={colors.textSecondary}>Esc</T></View>
          </View>
          <ScrollView style={{ maxHeight: 420 }} contentContainerStyle={{ padding: spacing.sm }}>
            {results.length === 0 && (
              <T variant="label" color={colors.textMuted} style={{ padding: spacing.lg }}>
                No results for “{q}”
              </T>
            )}
            {results.map((r) => (
              <Hoverable
                key={r.key}
                onPress={() => go(r)}
                style={({ hovered }) => [styles.result, hovered && { backgroundColor: colors.surface }, hovered && elevation.raised]}
              >
                <r.icon size={18} color={colors.textSecondary} strokeWidth={1.5} />
                <View style={{ flex: 1 }}>
                  <T variant="label">{r.title}</T>
                  <T variant="caption" color={colors.textMuted}>{r.subtitle}</T>
                </View>
              </Hoverable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay, alignItems: 'center', paddingTop: 120 },
  card: {
    backgroundColor: colors.panel,
    borderRadius: radius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 16 },
    elevation: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    height: 60,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  input: { flex: 1, fontFamily: fonts.regular, fontSize: 16, color: colors.text, height: '100%' },
  kbd: { backgroundColor: colors.surface, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  result: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
  },
});
