import type { LucideIcon } from 'lucide-react-native';
import { ReactNode } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
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
  /** Red tint, used by armed destructive buttons. */
  danger?: boolean;
  disabled?: boolean;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function PillButton({
  label, icon: Icon, onPress, active, danger, disabled, compact, style, accessibilityLabel,
}: PillButtonProps) {
  const tint = danger ? colors.danger : colors.text;
  return (
    <Hoverable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      style={({ hovered, pressed }) => [
        styles.pill,
        compact && styles.pillCompact,
        !label && styles.pillIconOnly,
        {
          backgroundColor: danger
            ? colors.dangerSoft
            : active
              ? hovered ? colors.selectedHover : colors.selected
              : hovered || pressed
                ? colors.surfaceHover
                : colors.surface,
        },
        disabled && { opacity: 0.5 },
        pressed && { transform: [{ scale: 0.98 }] },
        style,
      ]}
    >
      {Icon && <Icon size={compact ? 16 : 20} color={tint} strokeWidth={1.5} />}
      {label && <T variant="label" color={tint} style={{ fontSize: compact ? 13 : 14.5 }}>{label}</T>}
    </Hoverable>
  );
}

export function IconButton({ icon: Icon, onPress, label, size = 20, color = colors.text }: {
  icon: LucideIcon; onPress?: () => void; label: string; size?: number; color?: string;
}) {
  return (
    <Hoverable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={({ hovered }) => [styles.iconBtn, hovered && { backgroundColor: 'rgba(255,255,255,0.6)' }]}
    >
      <Icon size={size} color={color} strokeWidth={1.5} />
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
        <T variant="label" color={hovered ? colors.text : colors.textMuted}>
          {label}{'   '}→
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

export function StatusBadge({ status }: { status: 'Active' | 'Lead' | 'Inactive' }) {
  return (
    <T variant="label" color={status === 'Inactive' ? colors.textMuted : colors.text}>
      {status}
    </T>
  );
}

/** Round avatar with initials (mockups show a solid gray disc). */
export function Avatar({ name, size = 80 }: { name: string; size?: number }) {
  const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <T variant="title" color={colors.white} style={{ fontSize: size * 0.3 }}>{initials}</T>
    </View>
  );
}

/** Small dotted line used for secondary details and column headers. */
export function DotLine({ children, color = colors.textSecondary }: { children: ReactNode; color?: string }) {
  return (
    <View style={styles.dotLine}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <T variant="caption" color={color} numberOfLines={1} style={{ flexShrink: 1 }}>{children}</T>
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

export function Field({ label, children, style }: { label: string; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ gap: spacing.sm }, style]}>
      <T variant="caption" color={colors.textMuted}>{label}</T>
      {children}
    </View>
  );
}

/**
 * Single-choice pill track. `tabs` is the large raised variant (dashboard
 * Today / Upcoming / Completed); the default is the compact form variant.
 */
export function Segmented<V extends string>({ options, value, onChange, tabs }: {
  options: readonly V[]; value: V; onChange: (v: V) => void; tabs?: boolean;
}) {
  return (
    <View style={[styles.segmented, tabs && styles.tabs]}>
      {options.map((o) => {
        const on = o === value;
        return (
          <Hoverable
            key={o}
            onPress={() => onChange(o)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            style={({ hovered }) => [
              styles.segment,
              tabs && styles.tab,
              on
                ? { backgroundColor: tabs ? colors.selected : colors.accent }
                : hovered && { backgroundColor: tabs ? colors.surfaceHover : 'rgba(255,255,255,0.35)' },
            ]}
          >
            <T variant={tabs ? 'body' : 'caption'} style={tabs && { fontSize: 16 }}>{o}</T>
          </Hoverable>
        );
      })}
    </View>
  );
}

export interface ChipOption {
  key: string;
  label: string;
}

/** Scrollable track of toggleable chips (client / template pickers in forms). */
export function ChipGroup({ options, isActive, onToggle, empty = 'No matches' }: {
  options: ChipOption[];
  isActive: (key: string) => boolean;
  onToggle: (key: string) => void;
  empty?: string;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.chipTrack}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      {options.length === 0 && (
        <View style={styles.chip}><T variant="caption" color={colors.textMuted}>{empty}</T></View>
      )}
      {options.map((o) => (
        <Hoverable
          key={o.key}
          onPress={() => onToggle(o.key)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isActive(o.key) }}
          style={({ hovered }) => [
            styles.chip,
            isActive(o.key)
              ? { backgroundColor: hovered ? colors.accentHover : colors.accent }
              : hovered && { backgroundColor: 'rgba(255,255,255,0.35)' },
          ]}
        >
          <T variant="caption">{o.label}</T>
        </Hoverable>
      ))}
    </ScrollView>
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
    borderRadius: radius.lg,
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
  avatar: { backgroundColor: colors.avatar, alignItems: 'center', justifyContent: 'center' },
  dotLine: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  dot: { width: 3.5, height: 3.5, borderRadius: 2 },
  input: {
    ...elevation.raised,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    height: 40,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.text,
  },
  inputMultiline: { height: 200, paddingTop: spacing.md, textAlignVertical: 'top' },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.track,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  segment: { paddingHorizontal: spacing.lg, height: 31, justifyContent: 'center', borderRadius: radius.pill },
  tabs: { ...elevation.raised, backgroundColor: colors.surface },
  tab: { height: 35, paddingHorizontal: spacing.lg },
  chipTrack: { flexGrow: 0, backgroundColor: colors.track, borderRadius: radius.pill },
  chip: { height: 31, paddingHorizontal: spacing.lg, justifyContent: 'center', borderRadius: radius.pill },
});
