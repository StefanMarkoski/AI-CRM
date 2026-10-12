import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { PillButton, T } from '@/components/primitives';
import { colors } from '@/theme';

export default function NotFound() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: colors.background }}>
      <T variant="display">Page not found</T>
      <PillButton label="Back to Dashboard" onPress={() => router.navigate('/')} />
    </View>
  );
}
