const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function startOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

export function addDays(d: Date, n: number) {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}

export function at(d: Date, hours: number, minutes = 0) {
  const c = startOfDay(d);
  c.setHours(hours, minutes);
  return c;
}

export function startOfWeek(d: Date) {
  // Monday-based week
  const c = startOfDay(d);
  const offset = (c.getDay() + 6) % 7;
  return addDays(c, -offset);
}

export function isSameDay(a: Date, b: Date) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export const isWithinDay = (d: Date, now = new Date()) => now.getTime() - d.getTime() < 86_400_000;

export const pad = (n: number) => String(n).padStart(2, '0');

export const formatTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
export const formatShortDate = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getDate()}`;
export const formatLongDate = (d: Date) => `${MONTHS_LONG[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
export const formatDayName = (d: Date) => DAYS[d.getDay()];

export function formatWeekRange(weekStart: Date) {
  const end = addDays(weekStart, 6);
  if (weekStart.getMonth() === end.getMonth()) {
    return `${MONTHS_LONG[weekStart.getMonth()]} ${weekStart.getDate()} – ${end.getDate()}, ${end.getFullYear()}`;
  }
  return `${formatShortDate(weekStart)} – ${formatShortDate(end)}, ${end.getFullYear()}`;
}

export function relativeDay(d: Date, now = new Date()) {
  const diff = Math.round((startOfDay(d).getTime() - startOfDay(now).getTime()) / 86_400_000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  return formatShortDate(d);
}

export function timeAgo(d: Date, now = new Date()) {
  const mins = Math.max(1, Math.round((now.getTime() - d.getTime()) / 60_000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}
