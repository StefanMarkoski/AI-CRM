import type { LucideIcon } from 'lucide-react-native';
import { ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, elevation, radius, spacing } from '@/theme';

import { Hoverable, T } from './primitives';

export interface SelectOption<V> {
  value: V;
  label: string;
}

/** Raised dropdown field (Date / Time in the mockups); options open inline below it. */
export function SelectField<V>({ icon: Icon, placeholder, options, value, onChange, chevron }: {
  icon: LucideIcon;
  placeholder: string;
  options: SelectOption<V>[];
  value: V | null;
  onChange: (v: V) => void;
  chevron?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);

  return (
    <View style={{ flex: 1, minWidth: 180 }}>
      <Hoverable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityLabel={placeholder}
        accessibilityState={{ expanded: open }}
        style={({ hovered }) => [styles.field, hovered && { backgroundColor: colors.surfaceHover }]}
      >
        <Icon size={20} color={colors.textSecondary} strokeWidth={1.4} />
        <T variant="caption" color={current ? colors.text : colors.textMuted} style={{ flex: 1 }}>
          {current?.label ?? placeholder}
        </T>
        {chevron && (
          <ChevronDown
            size={18}
            color={colors.textSecondary}
            strokeWidth={1.8}
            style={open ? { transform: [{ rotate: '180deg' }] } : undefined}
          />
        )}
      </Hoverable>
      {open && (
        <View style={styles.menu}>
          {options.map((o) => {
            const on = o.value === value;
            return (
              <Hoverable
                key={o.label}
                onPress={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                style={({ hovered }) => [
                  styles.option,
                  on ? { backgroundColor: colors.accent } : hovered && { backgroundColor: colors.surfaceHover },
                ]}
              >
                <T variant="caption">{o.label}</T>
              </Hoverable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    ...elevation.raised,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md + 2,
    height: 40,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  menu: {
    ...elevation.raised,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: spacing.sm,
    padding: 6,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  option: { height: 30, paddingHorizontal: spacing.md, justifyContent: 'center', borderRadius: radius.pill },
});
