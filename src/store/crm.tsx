import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import * as mock from '@/data/mock';
import type { Client, Email, Notification, Task, Template } from '@/data/mock';

type NewTask = Omit<Task, 'id' | 'created' | 'completed'>;
type NewClient = Omit<Client, 'id' | 'notes'>;
type NewTemplate = Omit<Template, 'id' | 'updated'>;

interface CrmState {
  clients: Client[];
  tasks: Task[];
  templates: Template[];
  activities: typeof mock.activities;
  emails: Email[];
  notifications: Notification[];
  clientById: (id: string) => Client | undefined;
  addClient: (c: NewClient) => Client;
  updateClient: (id: string, patch: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addNote: (clientId: string, note: string) => void;
  addTask: (t: NewTask) => Task;
  updateTask: (id: string, patch: Partial<Task>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  addTemplate: (t: NewTemplate) => Template;
  updateTemplate: (id: string, patch: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;
  scheduleEmail: (e: Pick<Email, 'clientId' | 'subject' | 'at'>) => void;
  sendEmail: (e: Pick<Email, 'clientId' | 'subject'>) => void;
  markAllNotificationsRead: () => void;
  toggleNotificationRead: (id: string) => void;
}

const CrmContext = createContext<CrmState | null>(null);

const uid = (prefix: string) => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function CrmProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState(mock.clients);
  const [tasks, setTasks] = useState(mock.tasks);
  const [templates, setTemplates] = useState(mock.templates);
  const [notifications, setNotifications] = useState(mock.notifications);
  const [emails, setEmails] = useState(mock.emails);

  const clientById = useCallback((id: string) => clients.find((c) => c.id === id), [clients]);

  const addClient = useCallback((c: NewClient) => {
    const client: Client = { ...c, id: uid('c'), notes: [] };
    setClients((prev) => [client, ...prev]);
    return client;
  }, []);

  const updateClient = useCallback((id: string, patch: Partial<Client>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const deleteClient = useCallback((id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
    setTasks((prev) => prev.filter((t) => t.clientId !== id));
  }, []);

  const addNote = useCallback((clientId: string, note: string) => {
    setClients((prev) => prev.map((c) => (c.id === clientId ? { ...c, notes: [...c.notes, note] } : c)));
  }, []);

  const addTask = useCallback((t: NewTask) => {
    const created: Task = { ...t, id: uid('t'), created: new Date(), completed: false };
    setTasks((prev) => [...prev, created]);
    return created;
  }, []);

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addTemplate = useCallback((t: NewTemplate) => {
    const created: Template = { ...t, id: uid('tp'), updated: new Date() };
    setTemplates((prev) => [...prev, created]);
    return created;
  }, []);

  const updateTemplate = useCallback((id: string, patch: Partial<Template>) => {
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch, updated: new Date() } : t)));
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const scheduleEmail = useCallback((e: Pick<Email, 'clientId' | 'subject' | 'at'>) => {
    setEmails((prev) => [...prev, { ...e, id: uid('e'), direction: 'out', scheduled: true }]);
  }, []);

  const sendEmail = useCallback((e: Pick<Email, 'clientId' | 'subject'>) => {
    setEmails((prev) => [...prev, { ...e, id: uid('e'), direction: 'out', at: new Date() }]);
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const toggleNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));
  }, []);

  const value = useMemo<CrmState>(
    () => ({
      clients, tasks, templates, notifications, emails,
      activities: mock.activities,
      clientById, addClient, updateClient, deleteClient, addNote,
      addTask, updateTask, toggleTask, deleteTask,
      addTemplate, updateTemplate, deleteTemplate,
      scheduleEmail, sendEmail, markAllNotificationsRead, toggleNotificationRead,
    }),
    [
      clients, tasks, templates, notifications, emails,
      clientById, addClient, updateClient, deleteClient, addNote,
      addTask, updateTask, toggleTask, deleteTask,
      addTemplate, updateTemplate, deleteTemplate,
      scheduleEmail, sendEmail, markAllNotificationsRead, toggleNotificationRead,
    ],
  );

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function useCrm() {
  const ctx = useContext(CrmContext);
  if (!ctx) throw new Error('useCrm must be used inside <CrmProvider>');
  return ctx;
}
