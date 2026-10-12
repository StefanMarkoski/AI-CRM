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
        accessibilityLabel={item.label}
        style={({ hovered }) => [
          styles.item,
          collapsed && styles.itemCollapsed,
          active
            ? { backgroundColor: colors.selected }
            : hovered && { backgroundColor: 'rgba(0,0,0,0.05)' },
        ]}
      >
        <View>
          <item.icon size={19} color={colors.text} strokeWidth={1.5} />
          {badge > 0 && collapsed && <View style={styles.badgeDot} />}
        </View>
        {!collapsed && <T variant="label" style={{ flex: 1 }}>{item.label}</T>}
        {!collapsed && badge > 0 && (
          <View style={styles.badge}>
            <T variant="caption" color={colors.white} weight="medium">{badge}</T>
          </View>
        )}
      </Hoverable>
    );
  };

  return (
    <View style={[styles.rail, collapsed && styles.railCollapsed]}>
      <View style={[styles.brand, collapsed && { alignItems: 'center', paddingLeft: 0 }]}>
        <View style={styles.logo}>
          <Atom size={16} color={colors.background} strokeWidth={1.8} />
        </View>
        {!collapsed && <T variant="subtitle" weight="semibold">CRM AI</T>}
      </View>
      <View style={styles.group}>{MAIN.map(renderItem)}</View>
      <View style={[styles.group, { marginTop: 'auto' }]}>{FOOTER.map(renderItem)}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    width: 187,
    backgroundColor: colors.sidebar,
    borderTopRightRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    paddingHorizontal: 23,
    paddingTop: 32,
    paddingBottom: 24,
  },
  railCollapsed: { width: 72, paddingHorizontal: 12 },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    height: 40,
    paddingLeft: spacing.md,
    marginBottom: 44,
  },
  logo: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  group: { gap: 16 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    height: 40,
    paddingHorizontal: spacing.md + 4,
    marginHorizontal: 0,
    borderRadius: radius.md,
  },
  itemCollapsed: { justifyContent: 'center', paddingHorizontal: 0 },
  badge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDot: {
    position: 'absolute',
    top: -2,
    right: -3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.text,
    borderWidth: 1.5,
    borderColor: colors.sidebar,
  },
});
