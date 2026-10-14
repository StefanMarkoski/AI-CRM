import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

import { gradient } from '@/theme';

/** Full-screen gray→mint gradient that sits behind the glass UI. */
export function Backdrop() {
  return (
    <>
      <LinearGradient
        colors={gradient.base}
        locations={[0, 0.4, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={gradient.glow}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.7, y: 0.35 }}
        style={StyleSheet.absoluteFill}
      />
    </>
  );
}
