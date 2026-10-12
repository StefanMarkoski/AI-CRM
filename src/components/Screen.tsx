import { Atom, Search } from 'lucide-react-native';
import { ReactNode } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { useUi } from '@/store/ui';
import { breakpoints, colors, spacing } from '@/theme';

import { PillButton, T } from './primitives';

export function useLayout() {
  const { width } = useWindowDimensions();
  return {
    width,
    railCollapsed: width < breakpoints.railCollapsed,
    split: width >= breakpoints.splitPane,
    narrow: width < 640,
  };
}

interface ScreenProps {
  title: string;
  actions?: ReactNode;
  aiContext?: string;
  children: ReactNode;
  scroll?: boolean;
}

/** Page chrome shared by every screen: title, search pill, actions, Ask AI. */
export function Screen({ title, actions, aiContext, children, scroll = true }: ScreenProps) {
  const { openAI, openSearch } = useUi();
  const { narrow } = useLayout();
  const pad = narrow ? spacing.lg : 80;

  const header = (
    <View style={[styles.header, narrow && { flexWrap: 'wrap', rowGap: spacing.md }]}>
      <View style={styles.titleGroup}>
        <T variant="display">{title}</T>
        <PillButton icon={Search} label={narrow ? undefined : 'Search'} accessibilityLabel="Search" onPress={openSearch} />
      </View>
      <View style={styles.actions}>
        {actions}
        <PillButton icon={Atom} label="Ask AI" onPress={() => openAI(aiContext ?? title)} />
      </View>
    </View>
  );

  if (!scroll) {
    return (
      <View style={[styles.root, { paddingHorizontal: pad }]}>
        {header}
        <View style={{ flex: 1 }}>{children}</View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingHorizontal: pad }]}
    >
      {header}
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 64, maxWidth: 1440, width: '100%' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 80,
    paddingBottom: 77,
    gap: spacing.lg,
  },
  titleGroup: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl, flexWrap: 'wrap' },
});
