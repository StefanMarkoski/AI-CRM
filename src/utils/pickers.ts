import { addDays, at, formatShortDate, formatTime, relativeDay, startOfDay } from './dates';

export const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

/** Next two weeks as dropdown options ("Today", "Tomorrow · Oct 24", "Oct 26"…). */
export function dayOptions(count = 14) {
  return Array.from({ length: count }, (_, i) => {
    const d = addDays(startOfDay(new Date()), i);
    const rel = relativeDay(d);
    return { value: d.getTime(), label: rel === formatShortDate(d) ? rel : `${rel} · ${formatShortDate(d)}` };
  });
}

export const hourOptions = HOURS.map((h) => ({ value: h, label: formatTime(at(new Date(), h)) }));

/** Case-insensitive free-text match against a few string fields. */
export function matches(q: string, ...fields: string[]) {
  const term = q.trim().toLowerCase();
  return !term || fields.some((f) => f.toLowerCase().includes(term));
}
