import { Href, usePathname, useRouter } from 'expo-router';
import {
  Atom,
  Bell,
  CalendarDays,
  CopyCheck,
  Folder,
  LayoutPanelLeft,
  LucideIcon,
  Settings,
  Users,
} from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { useCrm } from '@/store/crm';
import { colors, radius, spacing } from '@/theme';

import { glassBlur } from './Panel';
import { Hoverable, T } from './primitives';

interface NavItem {
  label: string;
  href: Href;
  icon: LucideIcon;
}

const MAIN: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutPanelLeft },
  { label: 'Clients', href: '/clients', icon: Users },
  { label: 'Tasks', href: '/tasks', icon: CopyCheck },
  { label: 'Calendar', href: '/calendar', icon: CalendarDays },
  { label: 'Templates', href: '/templates', icon: Folder },
];

const FOOTER: NavItem[] = [
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Ai Assistant', href: '/assistant', icon: Atom },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { notifications } = useCrm();
  const unread = notifications.filter((n) => !n.read).length;

  const renderItem = (item: NavItem) => {
    const active = pathname === item.href;
    const badge = item.href === '/notifications' && unread > 0 ? unread : 0;
    return (
      <Hoverable
        key={item.label}
        onPress={() => router.navigate(item.href)}
        accessibilityRole="link"
        accessibilityLabel={badge > 0 ? `${item.label}, ${badge} unread` : item.label}
        style={({ hovered }) => [
          styles.item,
          collapsed && styles.itemCollapsed,
          active
            ? { backgroundColor: colors.accent }
            : hovered && { backgroundColor: 'rgba(191, 164, 244, 0.25)' },
        ]}
      >
        <View>
          <item.icon size={20} color={colors.text} strokeWidth={1.4} />
          {badge > 0 && <View style={styles.badgeDot} />}
        </View>
        {!collapsed && <T variant="label" numberOfLines={1} style={{ fontSize: 14.5 }}>{item.label}</T>}
      </Hoverable>
    );
  };

  return (
    <View style={[styles.rail, glassBlur, collapsed && styles.railCollapsed]}>
      <View style={styles.group}>{MAIN.map(renderItem)}</View>
      <View style={[styles.group, { marginTop: 'auto' }]}>{FOOTER.map(renderItem)}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    width: 188,
    backgroundColor: colors.sidebar,
    boxShadow: '4px 0px 24px rgba(70, 50, 130, 0.14)',
    borderTopRightRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    paddingHorizontal: 22,
    paddingTop: 120,
    paddingBottom: 120,
  },
  railCollapsed: { width: 72, paddingHorizontal: 12, paddingTop: 40, paddingBottom: 24 },
  group: { gap: 16 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    height: 40,
    paddingHorizontal: spacing.md + 2,
    alignSelf: 'flex-start',
    borderRadius: radius.lg,
  },
  itemCollapsed: { justifyContent: 'center', paddingHorizontal: 0, alignSelf: 'stretch' },
  badgeDot: {
    position: 'absolute',
    top: -2,
    right: -3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
    borderWidth: 1.5,
    borderColor: colors.panel,
  },
});
