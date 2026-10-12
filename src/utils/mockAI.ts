// Scripted "AI" for the frontend-only demo. Replace with a real backend call later
// (same signature: prompt + CRM snapshot in, text out).
import type { Client, Task, Template } from '@/data/mock';

import { formatShortDate, formatTime, isSameDay } from './dates';

interface Snapshot {
  clients: Client[];
  tasks: Task[];
  templates: Template[];
}

/** Simulated "thinking" time so replies feel natural in the demo. */
export const thinkingDelay = () => 700 + Math.random() * 600;

const firstName = (full: string) => full.split(' ')[0];

export function suggestionsFor(context: string | null): string[] {
  switch (context) {
    case 'Clients':
      return ['Summarize ABC Packaging', 'Which clients need attention?', 'Find leads to follow up'];
    case 'Tasks':
      return ["What's on my plate today?", 'Any overdue tasks?', 'Plan my week'];
    case 'Calendar':
      return ['Plan my week', 'When am I free tomorrow?', "What's on my plate today?"];
    case 'Templates':
      return ['Draft a follow-up for ABC Packaging', 'Make the payment reminder friendlier', 'Write an intro email'];
    default:
      return ["What's on my plate today?", 'Which clients need attention?', 'Draft a follow-up for ABC Packaging'];
  }
}

export function respond(prompt: string, data: Snapshot): string {
  const p = prompt.toLowerCase();
  const now = new Date();
  const open = data.tasks.filter((t) => !t.completed);
  const company = (id: string) => data.clients.find((c) => c.id === id)?.company ?? 'Unknown';
  const mentioned = data.clients.find((c) => p.includes(c.company.toLowerCase()) || p.includes(c.company.split(' ')[0].toLowerCase()));

  if (/(draft|write|compose).*(follow|email|mail)|follow-up for|intro email/.test(p)) {
    const client = mentioned ?? data.clients[0];
    const intro = /intro/.test(p);
    const tpl = data.templates.find((t) => (intro ? /intro/i.test(t.name) : /follow/i.test(t.name))) ?? data.templates[0];
    const body = tpl.body.replace(/{{firstName}}/g, firstName(client.contactName)).replace(/{{company}}/g, client.company);
    return `Here's a draft for ${client.contactName} at ${client.company}, based on your "${tpl.name}" template:\n\nSubject: ${tpl.subject.replace(/{{company}}/g, client.company)}\n\n${body}\n\nWant me to schedule it for tomorrow at 09:00?`;
  }

  if (/friendlier|rewrite|tone/.test(p)) {
    return "Here's a warmer version:\n\nHi {{firstName}},\nHope your week is going well! Just a gentle nudge that the invoice for your recent order is now due. If it's already on its way — thank you, please ignore this. If you need anything from us (a copy of the invoice, different payment terms), just reply and I'll sort it out.\nWarm regards,";
  }

  if (/today|plate|agenda/.test(p)) {
    const todays = open.filter((t) => isSameDay(t.due, now)).sort((a, b) => +a.due - +b.due);
    if (!todays.length) return 'Nothing left for today — nice work. 🎉';
    const lines = todays.map((t) => `• ${formatTime(t.due)} — ${t.title} (${company(t.clientId)})`).join('\n');
    return `You have ${todays.length} open task${todays.length === 1 ? '' : 's'} today:\n\n${lines}\n\nI'd start with ${company(todays[0].clientId)} — they replied 12 minutes ago.`;
  }

  if (/overdue/.test(p)) {
    const overdue = open.filter((t) => t.due < now);
    if (!overdue.length) return "No overdue tasks. You're fully on track.";
    return `${overdue.length} task${overdue.length === 1 ? ' is' : 's are'} past due:\n\n${overdue
      .map((t) => `• ${t.title} — ${company(t.clientId)}, due ${formatShortDate(t.due)} ${formatTime(t.due)}`)
      .join('\n')}`;
  }

  if (/week|plan/.test(p)) {
    const byDay = new Map<string, Task[]>();
    open
      .filter((t) => t.due >= now && +t.due - +now < 7 * 86_400_000)
      .sort((a, b) => +a.due - +b.due)
      .forEach((t) => {
        const k = formatShortDate(t.due);
        byDay.set(k, [...(byDay.get(k) ?? []), t]);
      });
    const lines = [...byDay.entries()].map(([d, ts]) => `${d}: ${ts.map((t) => `${t.title} (${company(t.clientId)})`).join(', ')}`);
    return `Your week at a glance:\n\n${lines.join('\n')}\n\nTip: batch the follow-ups on the same morning — they share the same template.`;
  }

  if (/free|availability/.test(p)) {
    return 'Tomorrow you are free 11:00–13:00 and after 14:00. Want me to block 11:00 for focused follow-ups?';
  }

  if (/attention|need|leads|neglect/.test(p)) {
    const leads = data.clients.filter((c) => c.status === 'Lead');
    return `A few clients could use a touchpoint:\n\n${leads
      .slice(0, 4)
      .map((c) => `• ${c.company} — lead, ${c.contactName} hasn't heard from you in over a week`)
      .join('\n')}\n• Plitvice Water — invoice 7 days overdue\n\nShall I create follow-up tasks for these?`;
  }

  if (/summar|about|tell me/.test(p) && mentioned) {
    const c = mentioned;
    const ct = open.filter((t) => t.clientId === c.id);
    return `${c.company} (${c.industry}) — ${c.status}.\nMain contact: ${c.contactName}, ${c.contactRole} · ${c.email}\n\n${
      ct.length ? `Open tasks:\n${ct.map((t) => `• ${t.title} — ${formatShortDate(t.due)} ${formatTime(t.due)}`).join('\n')}` : 'No open tasks.'
    }${c.notes.length ? `\n\nNotes: ${c.notes.join('; ')}` : ''}\n\nLatest: they replied to quotation #2026-091 12 minutes ago.`;
  }

  return "I can help you plan your day, summarize a client, find overdue work, or draft emails from your templates. Try: “Draft a follow-up for ABC Packaging”.";
}
