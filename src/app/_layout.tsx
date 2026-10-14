import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, useFonts } from '@expo-google-fonts/inter';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { AIDrawer } from '@/components/AIDrawer';
import { Backdrop } from '@/components/Backdrop';
import { NewTaskSheet } from '@/components/NewTaskSheet';
import { useLayout } from '@/components/Screen';
import { SearchPalette } from '@/components/SearchPalette';
import { Sidebar } from '@/components/Sidebar';
import { CrmProvider } from '@/store/crm';
import { UiProvider } from '@/store/ui';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <CrmProvider>
        <UiProvider>
          <Shell />
        </UiProvider>
      </CrmProvider>
    </SafeAreaProvider>
  );
}

function Shell() {
  const { railCollapsed } = useLayout();
  return (
    <SafeAreaView style={styles.app} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <Backdrop />
      <View style={styles.row}>
        <Sidebar collapsed={railCollapsed} />
        <View style={styles.main}>
          <Slot />
        </View>
      </View>
      <AIDrawer />
      <SearchPalette />
      <NewTaskSheet />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: colors.background },
  row: { flex: 1, flexDirection: 'row' },
  main: { flex: 1 },
});
