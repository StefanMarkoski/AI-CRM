import { StyleSheet, View } from 'react-native';

import { AIChat } from '@/components/AIChat';
import { Screen } from '@/components/Screen';
import { colors, radius } from '@/theme';

export default function Assistant() {
  return (
    <Screen title="Ai Assistant" scroll={false}>
      <View style={styles.panel}>
        <AIChat context={null} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    maxWidth: 820,
    width: '100%',
    marginTop: -40,
    marginBottom: 40,
    borderRadius: radius.xl,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.divider,
    overflow: 'hidden',
  },
});
