import { Atom, ArrowUp } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { useCrm } from '@/store/crm';
import { colors, elevation, fonts, radius, spacing } from '@/theme';
import { respond, suggestionsFor, thinkingDelay } from '@/utils/mockAI';

import { Hoverable, T, webInputReset } from './primitives';

interface Message {
  id: number;
  role: 'user' | 'ai';
  text: string;
}

export function AIChat({ context }: { context: string | null }) {
  const crm = useCrm();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const seq = useRef(0);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, thinking]);

  const send = (text: string) => {
    const prompt = text.trim();
    if (!prompt || thinking) return;
    setMessages((m) => [...m, { id: ++seq.current, role: 'user', text: prompt }]);
    setInput('');
    setThinking(true);
    setTimeout(() => {
      const reply = respond(prompt, crm);
      setMessages((m) => [...m, { id: ++seq.current, role: 'ai', text: reply }]);
      setThinking(false);
    }, thinkingDelay());
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={styles.thread}>
        {messages.length === 0 && (
          <View style={styles.hero}>
            <View style={styles.heroIcon}>
              <Atom size={22} color={colors.text} strokeWidth={1.5} />
            </View>
            <T variant="title">How can I help?</T>
            <T variant="small" color={colors.textSecondary} style={{ textAlign: 'center', maxWidth: 300 }}>
              I know your clients, tasks and templates. Ask me to plan, summarize or draft.
            </T>
          </View>
        )}
        {messages.map((m) => (
          <View key={m.id} style={[styles.bubble, m.role === 'user' ? styles.user : styles.ai]}>
            <T variant="label" style={{ lineHeight: 21 }}>{m.text}</T>
          </View>
        ))}
        {thinking && (
          <View style={[styles.bubble, styles.ai]}>
            <T variant="label" color={colors.textMuted}>Thinking…</T>
          </View>
        )}
      </ScrollView>

      <View style={styles.suggestions}>
        {suggestionsFor(context).map((s) => (
          <Hoverable
            key={s}
            onPress={() => send(s)}
            style={({ hovered }) => [styles.suggestion, hovered && { backgroundColor: colors.surfaceHover }]}
          >
            <T variant="caption">{s}</T>
          </Hoverable>
        ))}
      </View>

      <View style={styles.composer}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask anything about your CRM…"
          placeholderTextColor={colors.textMuted}
          onSubmitEditing={() => send(input)}
          style={[styles.input, webInputReset]}
        />
        <Hoverable
          onPress={() => send(input)}
          accessibilityLabel="Send"
          style={[styles.send, { opacity: input.trim() ? 1 : 0.4 }]}
        >
          <ArrowUp size={18} color={colors.background} strokeWidth={2} />
        </Hoverable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  thread: { padding: spacing.xl, gap: spacing.md, flexGrow: 1 },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.xxxl },
  heroIcon: {
    width: 48, height: 48, borderRadius: radius.lg, backgroundColor: colors.tile,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm,
  },
  bubble: { maxWidth: '88%', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.lg },
  user: { alignSelf: 'flex-end', backgroundColor: colors.selected, borderBottomRightRadius: 6 },
  ai: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderBottomLeftRadius: 6, ...elevation.raised },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
  suggestion: { ...elevation.raised, backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 7 },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    margin: spacing.xl,
    marginTop: 0,
    paddingLeft: spacing.lg,
    paddingRight: 6,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    ...elevation.raised,
  },
  input: { flex: 1, fontFamily: fonts.regular, fontSize: 14, color: colors.text, height: '100%' },
  send: {
    width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.text,
    alignItems: 'center', justifyContent: 'center',
  },
});
