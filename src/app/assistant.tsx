import { StyleSheet } from 'react-native';

import { AIChat } from '@/components/AIChat';
import { Panel } from '@/components/Panel';
import { Screen } from '@/components/Screen';

export default function Assistant() {
  return (
    <Screen title="Ai Assistant" scroll={false}>
      <Panel padded={false} style={styles.panel}>
        <AIChat context={null} />
      </Panel>
    </Screen>
  );
}

const styles = StyleSheet.create({
  panel: {
    flex: 1,
    maxWidth: 820,
    width: '100%',
    marginBottom: 40,
    overflow: 'hidden',
  },
});
