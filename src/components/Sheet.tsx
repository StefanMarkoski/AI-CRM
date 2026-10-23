import { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { colors, elevation, radius, spacing } from '@/theme';

import { T } from './primitives';

interface SheetProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Left-aligned action row; push an item right with `<View style={{ flex: 1 }} />`. */
  footer?: ReactNode;
  width?: number;
}

/** Centered modal card used for create / edit forms. Backdrop tap and Esc close it. */
export function Sheet({ visible, title, onClose, children, footer, width = 640 }: SheetProps) {
  const { width: screenW, height: screenH } = useWindowDimensions();
  const narrow = screenW < 640;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        <View style={[styles.card, { width: Math.min(width, screenW - 32), maxHeight: screenH - 64 }]}>
          <ScrollView
            contentContainerStyle={[styles.body, narrow && { padding: spacing.xl }]}
            keyboardShouldPersistTaps="handled"
          >
            <T variant="title" weight="regular" style={styles.title}>{title}</T>
            {children}
            {footer && <View style={styles.footer}>{footer}</View>}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    ...elevation.overlay,
    backgroundColor: colors.panel,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  title: { fontSize: 26, letterSpacing: -0.3, marginBottom: spacing.sm },
  body: { padding: spacing.xxl, gap: spacing.lg },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xl,
    marginTop: spacing.lg,
  },
});
