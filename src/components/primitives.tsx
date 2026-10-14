import type { LucideIcon } from 'lucide-react-native';
import { ReactNode } from 'react';
import {
  Platform,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text as RNText,
  TextInput,
  TextInputProps,
  TextProps,
  View,
  ViewStyle,
} from 'react-native';

import { colors, elevation, fonts, radius, spacing, type, TypeVariant } from '@/theme';

// ---------- Text ----------

interface TProps extends TextProps {
  variant?: TypeVariant;
  color?: string;
  weight?: keyof typeof fonts;
}

export function T({ variant = 'label', color = colors.text, weight, style, ...rest }: TProps) {
  return (
    <RNText
      {...rest}
      style={[type[variant], { color }, weight && { fontFamily: fonts[weight] }, style]}
    />
  );
}

// ---------- Hoverable pressable ----------
// react-native-web reports `hovered` in the style/children callback; native ignores it.

type InteractionState = { pressed: boolean; hovered?: boolean };

interface HoverableProps extends Omit<PressableProps, 'style' | 'children'> {
  style?: StyleProp<ViewStyle> | ((s: InteractionState) => StyleProp<ViewStyle>);
  children?: ReactNode | ((s: InteractionState) => ReactNode);
}

export function Hoverable({ style, children, ...rest }: HoverableProps) {
  return (
    <Pressable
      {...rest}
      style={(s) => (typeof style === 'function' ? style(s as InteractionState) : style)}
    >
      {(s) => (typeof children === 'function' ? children(s as InteractionState) : children)}
    </Pressable>
  );
}

// ---------- Buttons ----------

interface PillButtonProps {
  label?: string;
  icon?: LucideIcon;
  onPress?: () => void;
  active?: boolean;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function PillButton({ label, icon: Icon, onPress, active, compact, style, accessibilityLabel }: PillButtonProps) {
  return (
    <Hoverable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ hovered, pressed }) => [
        styles.pill,
        compact && styles.pillCompact,
        !label && styles.pillIconOnly,
        {
          backgroundColor: active
            ? colors.selected
            : hovered || pressed
              ? colors.surfaceHover
              : colors.surface,
        },
        pressed && { transform: [{ scale: 0.98 }] },
        style,
      ]}
    >
      {Icon && <Icon size={compact ? 16 : 18} color={colors.text} strokeWidth={1.6} />}
      {label && <T variant="label">{label}</T>}
    </Hoverable>
  );
}

export function IconButton({ icon: Icon, onPress, label, size = 20 }: {
  icon: LucideIcon; onPress?: () => void; label: string; size?: number;
}) {
  return (
    <Hoverable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={({ hovered }) => [styles.iconBtn, hovered && { backgroundColor: colors.surface }]}
    >
      <Icon size={size} color={colors.text} strokeWidth={1.6} />
    </Hoverable>
  );
}

// ---------- Layout bits ----------

export function SectionTitle({ children, right, style }: { children: ReactNode; right?: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.sectionTitle, style]}>
      <T variant="title">{children}</T>
      {right}
    </View>
  );
}

export function LinkText({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Hoverable onPress={onPress} accessibilityRole="link">
      {({ hovered }) => (
        <T variant="label" color={hovered ? colors.text : colors.textSecondary}>
          {label} →
        </T>
      )}
    </Hoverable>
  );
}

export function Bullet({ children }: { children: ReactNode }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.bullet} />
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <View style={styles.empty}>
      <T variant="subtitle" color={colors.textSecondary}>{title}</T>
      {hint && <T variant="small" color={colors.textMuted}>{hint}</T>}
    </View>
  );
}

// Grayscale status indicator (palette is locked to grays for now).
export function StatusBadge({ status }: { status: 'Active' | 'Lead' | 'Inactive' }) {
  const dot: ViewStyle =
    status === 'Active'
      ? { backgroundColor: colors.text }
      : status === 'Lead'
        ? { borderWidth: 1.5, borderColor: colors.text }
        : { backgroundColor: colors.selected };
  return (
    <View style={styles.status}>
      <View style={[styles.statusDot, dot]} />
      <T variant="small">{status}</T>
    </View>
  );
}

// ---------- Inputs ----------

const webNoOutline = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null;

export function Input({ style, ...rest }: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.textMuted}
      {...rest}
      style={[styles.input, rest.multiline && styles.inputMultiline, webNoOutline, style]}
    />
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={{ gap: spacing.xs + 2 }}>
      <T variant="small" color={colors.textSecondary}>{label}</T>
      {children}
    </View>
  );
}

export function Segmented<V extends string>({ options, value, onChange }: {
  options: readonly V[]; value: V; onChange: (v: V) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((o) => (
        <Hoverable
          key={o}
          onPress={() => onChange(o)}
          style={({ hovered }) => [
            styles.segment,
            o === value ? { backgroundColor: colors.selected } : hovered && { backgroundColor: colors.tileHover },
          ]}
        >
          <T variant="small">{o}</T>
        </Hoverable>
      ))}
    </View>
  );
}

export const webInputReset = webNoOutline;

const styles = StyleSheet.create({
  pill: {
    ...elevation.raised,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    height: 40,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  pillCompact: { height: 34, paddingHorizontal: spacing.md, gap: spacing.sm },
  pillIconOnly: { paddingHorizontal: 0, width: 40, justifyContent: 'center' },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxl + spacing.xxl,
    marginBottom: spacing.lg,
  },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm + 2 },
  bullet: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.text, marginTop: 9 },
  empty: { paddingVertical: spacing.xxl, alignItems: 'center', gap: spacing.xs },
  status: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  input: {
    ...elevation.raised,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    height: 42,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
  },
  inputMultiline: { height: 140, paddingTop: spacing.md, textAlignVertical: 'top' },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.tile,
    borderRadius: radius.md,
    padding: 3,
    gap: 2,
    alignSelf: 'flex-start',
  },
  segment: { paddingHorizontal: spacing.md, height: 30, justifyContent: 'center', borderRadius: radius.sm + 1 },
});
