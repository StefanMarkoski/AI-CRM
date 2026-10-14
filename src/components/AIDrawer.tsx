import { Atom, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { useUi } from '@/store/ui';
import { colors, radius, spacing } from '@/theme';

import { AIChat } from './AIChat';
import { IconButton, T } from './primitives';

/** Right-hand slide-over opened by every "Ask AI" button. */
export function AIDrawer() {
  const { aiOpen, aiContext, closeAI } = useUi();
  const { width } = useWindowDimensions();
  const panelW = Math.min(440, width);
  const [x] = useState(() => new Animated.Value(panelW));

  useEffect(() => {
    if (!aiOpen) return;
    x.setValue(panelW);
    Animated.timing(x, { toValue: 0, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [aiOpen, panelW, x]);

  return (
    <Modal visible={aiOpen} transparent animationType="fade" onRequestClose={closeAI}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={closeAI} accessibilityLabel="Close assistant" />
        <Animated.View style={[styles.panel, { width: panelW, transform: [{ translateX: x }] }]}>
          <View style={styles.head}>
            <View style={styles.headTitle}>
              <Atom size={20} color={colors.text} strokeWidth={1.5} />
              <T variant="subtitle">Ask AI</T>
              {aiContext && (
                <View style={styles.ctx}>
                  <T variant="caption" color={colors.textSecondary}>{aiContext}</T>
                </View>
              )}
            </View>
            <IconButton icon={X} label="Close" onPress={closeAI} />
          </View>
          <AIChat key={aiContext ?? 'none'} context={aiContext} />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay, alignItems: 'flex-end' },
  panel: {
    flex: 1,
    backgroundColor: colors.panel,
    borderTopLeftRadius: radius.xl,
    borderBottomLeftRadius: radius.xl,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 40,
    elevation: 12,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  headTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 2 },
  ctx: { backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
});
