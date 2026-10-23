// Frontend-only MVP: all data lives here and is generated relative to "now"
// so the demo always looks current when presented.
import { addDays, at, startOfDay } from '@/utils/dates';

export type ClientStatus = 'Active' | 'Lead' | 'Inactive';

export interface Client {
  id: string;
  company: string;
  industry: string;
  website: string;
  contactName: string;
  contactRole: string;
  email: string;
  phone: string;
  status: ClientStatus;
  notes: string[];
}

export interface Task {
  id: string;
  title: string;
  clientId: string;
  due: Date;
  created: Date;
  notes: string;
  completed: boolean;
}

export interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
  updated: Date;
}

export type ActivityKind = 'Email received' | 'Email sent' | 'Task completed' | 'Note added' | 'Meeting booked';

export interface Activity {
  id: string;
  clientId: string;
  kind: ActivityKind;
  at: Date;
}

export interface Email {
  id: string;
  clientId: string;
  subject: string;
  direction: 'in' | 'out';
  at: Date;
  scheduled?: boolean;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  at: Date;
  read: boolean;
}

const now = new Date();
const today = startOfDay(now);
const minsAgo = (m: number) => new Date(now.getTime() - m * 60_000);

export const clients: Client[] = [
  {
    id: 'c1', company: 'ABC Packaging', industry: 'Beauty Creams', website: 'www.abc.com',
    contactName: 'Marko Horvat', contactRole: 'CEO', email: 'marko@abc.hr', phone: '+385 91 234 5678',
    status: 'Active', notes: ['Client prefers email communication'],
  },
  {
    id: 'c2', company: 'Adriatic Foods', industry: 'Food Distribution', website: 'www.adriaticfoods.hr',
    contactName: 'Ana Kovač', contactRole: 'Procurement Lead', email: 'ana@adriaticfoods.hr', phone: '+385 98 412 0193',
    status: 'Active', notes: ['Quarterly volume review every January'],
  },
  {
    id: 'c3', company: 'Dalmatia Wines', industry: 'Winery', website: 'www.dalmatiawines.hr',
    contactName: 'Ivan Babić', contactRole: 'Owner', email: 'ivan@dalmatiawines.hr', phone: '+385 91 778 2201',
    status: 'Lead', notes: ['Interested in premium gift boxes for Christmas'],
  },
  {
    id: 'c4', company: 'Zagreb Print Co', industry: 'Printing', website: 'www.zgprint.hr',
    contactName: 'Petra Novak', contactRole: 'Operations Manager', email: 'petra@zgprint.hr', phone: '+385 95 300 4410',
    status: 'Active', notes: [],
  },
  {
    id: 'c5', company: 'Istra Olive Oil', industry: 'Agriculture', website: 'www.istraolive.hr',
    contactName: 'Luka Jurić', contactRole: 'Founder', email: 'luka@istraolive.hr', phone: '+385 92 118 9087',
    status: 'Active', notes: ['Needs glass-safe inserts'],
  },
  {
    id: 'c6', company: 'Kvarner Hotels', industry: 'Hospitality', website: 'www.kvarnerhotels.com',
    contactName: 'Maja Perić', contactRole: 'Purchasing', email: 'maja@kvarnerhotels.com', phone: '+385 91 502 3366',
    status: 'Inactive', notes: ['Paused orders until next season'],
  },
  {
    id: 'c7', company: 'Split Marine Supply', industry: 'Marine Equipment', website: 'www.splitmarine.hr',
    contactName: 'Tomislav Knežević', contactRole: 'Sales Director', email: 'tomislav@splitmarine.hr', phone: '+385 99 640 7720',
    status: 'Lead', notes: [],
  },
  {
    id: 'c8', company: 'Lux Cosmetics', industry: 'Cosmetics', website: 'www.luxcosmetics.eu',
    contactName: 'Ema Vuković', contactRole: 'Brand Manager', email: 'ema@luxcosmetics.eu', phone: '+385 91 880 1452',
    status: 'Active', notes: ['Sample approval takes ~1 week'],
  },
  {
    id: 'c9', company: 'Pannonia Logistics', industry: 'Logistics', website: 'www.pannonia-log.hr',
    contactName: 'Josip Marić', contactRole: 'COO', email: 'josip@pannonia-log.hr', phone: '+385 98 220 6634',
    status: 'Active', notes: [],
  },
  {
    id: 'c10', company: 'Velebit Outdoor', industry: 'Outdoor Gear', website: 'www.velebit.shop',
    contactName: 'Nikolina Tomić', contactRole: 'E-commerce Lead', email: 'nikolina@velebit.shop', phone: '+385 95 774 3018',
    status: 'Lead', notes: [],
  },
  {
    id: 'c11', company: 'Mediteran Ceramics', industry: 'Ceramics', website: 'www.mediteranceramics.hr',
    contactName: 'Filip Pavlović', contactRole: 'Owner', email: 'filip@mediteranceramics.hr', phone: '+385 91 309 5512',
    status: 'Inactive', notes: [],
  },
  {
    id: 'c12', company: 'Plitvice Water', industry: 'Beverages', website: 'www.plitvicewater.hr',
    contactName: 'Sara Božić', contactRole: 'Supply Chain', email: 'sara@plitvicewater.hr', phone: '+385 99 115 8840',
    status: 'Active', notes: ['Very price sensitive'],
  },
  {
    id: 'c13', company: 'Slavonia Grain', industry: 'Agriculture', website: 'www.slavoniagrain.hr',
    contactName: 'Dario Šarić', contactRole: 'Director', email: 'dario@slavoniagrain.hr', phone: '+385 92 667 2290',
    status: 'Active', notes: [],
  },
  {
    id: 'c14', company: 'Nordic Textiles', industry: 'Textiles', website: 'www.nordictextiles.eu',
    contactName: 'Lea Jovanović', contactRole: 'Buyer', email: 'lea@nordictextiles.eu', phone: '+385 91 450 7781',
    status: 'Lead', notes: [],
  },
];

let taskSeq = 0;
const task = (
  title: string, clientId: string, dayOffset: number, hour: number, minute = 0,
  notes = '', completed = false,
): Task => ({
  id: `t${++taskSeq}`,
  title,
  clientId,
  due: at(addDays(today, dayOffset), hour, minute),
  created: at(addDays(today, dayOffset - 3), 10),
  notes,
  completed,
});

export const tasks: Task[] = [
  // Today
  task('Follow up on quotation', 'c1', 0, 10, 0, 'Ask about quotation and delivery time.'),
  task('Send revised samples', 'c8', 0, 12, 0, 'Matte finish version of the 50ml jar.'),
  task('Call about Q4 volumes', 'c2', 0, 13, 30, 'Confirm pallet count for November.'),
  task('Prepare contract draft', 'c9', 0, 16, 0, 'Use the 2026 framework agreement.'),
  // Upcoming
  task('Follow up with ABC', 'c1', 1, 10, 0, 'Check if they reviewed the options.'),
  task('Intro call', 'c3', 1, 13, 0, 'Gift box ideas, bring catalogue.'),
  task('Pricing proposal', 'c7', 2, 11, 0, ''),
  task('Check delivery status', 'c5', 2, 13, 0, 'Shipment #4471 to Poreč.'),
  task('Send payment reminder', 'c12', 3, 10, 0, 'Invoice 2026-118 is 7 days overdue.'),
  task('Demo new eco line', 'c10', 4, 15, 0, ''),
  task('Re-engagement email', 'c6', 6, 9, 0, 'Pre-season offer.'),
  // Earlier this week (completed)
  task('Kick-off meeting', 'c4', -1, 10, 0, '', true),
  task('Send catalogue', 'c14', -1, 14, 0, '', true),
  task('Update pricing sheet', 'c1', -2, 11, 0, '', true),
  task('Confirm artwork', 'c8', -2, 15, 0, '', true),
  task('Call Josip', 'c9', -3, 13, 0, '', true),
];

export const templates: Template[] = [
  {
    id: 'tp1', name: 'Quotation Follow-up', subject: 'Follow up',
    updated: addDays(now, -5),
    body:
      "Hi {{firstName}},\nJust following up on the quotation we sent over last week regarding the packaging order.\nI wanted to check whether you had a chance to review the options and if you have any questions or changes you'd like us to make.\nHappy to adjust the quantities or specifications if needed.\nBest regards,",
  },
  {
    id: 'tp2', name: 'Initial Introduction', subject: 'Packaging solutions for {{company}}',
    updated: addDays(now, -5),
    body:
      "Hi {{firstName}},\nI'm reaching out from our packaging team — we help brands like yours ship products that look great and arrive safely.\nI'd love to learn more about your current setup and share a few ideas that could save you time and cost.\nWould you be open to a short call next week?\nBest regards,",
  },
  {
    id: 'tp3', name: 'Delivery Update', subject: 'Your order is on its way',
    updated: addDays(now, -5),
    body:
      "Hi {{firstName}},\nQuick update on your order: everything has been packed and handed over to our logistics partner.\nExpected delivery is within 3–4 business days. I'll share the tracking number as soon as it's available.\nLet me know if anything changes on your side.\nBest regards,",
  },
  {
    id: 'tp4', name: 'Payment Reminder', subject: 'Friendly reminder: invoice due',
    updated: addDays(now, -5),
    body:
      "Hi {{firstName}},\nThis is a friendly reminder that the invoice for your recent order is now due.\nIf the payment has already been made, please disregard this message — and thank you!\nOtherwise, let me know if you need another copy of the invoice.\nBest regards,",
  },
];

export const activities: Activity[] = [
  { id: 'a1', clientId: 'c1', kind: 'Email received', at: minsAgo(12) },
  { id: 'a2', clientId: 'c8', kind: 'Email sent', at: minsAgo(34) },
  { id: 'a3', clientId: 'c2', kind: 'Meeting booked', at: minsAgo(58) },
  { id: 'a4', clientId: 'c4', kind: 'Task completed', at: minsAgo(95) },
  { id: 'a5', clientId: 'c3', kind: 'Email received', at: minsAgo(140) },
  { id: 'a6', clientId: 'c9', kind: 'Note added', at: minsAgo(260) },
  { id: 'a7', clientId: 'c12', kind: 'Email received', at: minsAgo(410) },
];

export const emails: Email[] = [
  { id: 'e1', clientId: 'c1', subject: 'Re: Quotation #2026-091', direction: 'in', at: minsAgo(12) },
  { id: 'e2', clientId: 'c1', subject: 'Quotation #2026-091', direction: 'out', at: addDays(now, -6) },
  { id: 'e3', clientId: 'c1', subject: 'Sample box dimensions', direction: 'in', at: addDays(now, -9) },
  { id: 'e4', clientId: 'c8', subject: 'Revised artwork v3', direction: 'out', at: minsAgo(34) },
  { id: 'e5', clientId: 'c3', subject: 'Christmas gift boxes', direction: 'in', at: minsAgo(140) },
  { id: 'e6', clientId: 'c12', subject: 'Invoice question', direction: 'in', at: minsAgo(410) },
  { id: 'e7', clientId: 'c2', subject: 'November volumes', direction: 'in', at: addDays(now, -1) },
  { id: 'e8', clientId: 'c5', subject: 'Shipment #4471', direction: 'in', at: addDays(now, -1) },
  // scheduled
  { id: 'e9', clientId: 'c1', subject: 'Follow up', direction: 'out', at: at(addDays(today, 1), 9), scheduled: true },
  { id: 'e10', clientId: 'c12', subject: 'Friendly reminder: invoice due', direction: 'out', at: at(addDays(today, 3), 9), scheduled: true },
  { id: 'e11', clientId: 'c6', subject: 'Pre-season offer', direction: 'out', at: at(addDays(today, 6), 9), scheduled: true },
];

export const notifications: Notification[] = [
  { id: 'n1', title: 'New email from ABC Packaging', body: 'Re: Quotation #2026-091', at: minsAgo(12), read: false },
  { id: 'n2', title: 'Task due at 10:00', body: 'Follow up on quotation · ABC Packaging', at: minsAgo(30), read: false },
  { id: 'n3', title: 'Meeting booked', body: 'Adriatic Foods accepted your invite', at: minsAgo(58), read: false },
  { id: 'n4', title: 'Invoice overdue', body: 'Plitvice Water · 7 days overdue', at: minsAgo(400), read: true },
  { id: 'n5', title: 'AI suggestion', body: 'Dalmatia Wines has not been contacted in 14 days', at: addDays(now, -1), read: true },
];

// Number of unread inbox emails shown on the dashboard
export const NEW_EMAIL_COUNT = 5;

// AI usage this billing period, shown on the dashboard
export const AI_USAGE = {
  limit: 500,
  breakdown: [
    { label: 'Email drafts', count: 142 },
    { label: 'Personalizations', count: 87 },
    { label: 'Chat questions', count: 64 },
  ],
};
